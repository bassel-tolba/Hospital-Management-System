// services/PatientService.java (Modified)
package mine.profile.website.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.util.FileHandler;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private FileHandler fileHandler;

    @Transactional
    public PatientDTO createPatient(PatientDTO patientDTO, MultipartFile profilePictureFile) {
        Patient patient = patientDTO.toEntity();
        patient.setMedicalRecordNumber(generateUniqueMedicalRecordNumber());

        if (profilePictureFile != null && !profilePictureFile.isEmpty()) {
            try {
                String imageUrl = fileHandler.saveFile(profilePictureFile);
                patient.setProfilePictureURL(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save image: " + e.getMessage(), e);
            }
        }

        Patient savedPatient = patientRepository.save(patient);

        // Create Billing
        BillingDTO billingDTO = new BillingDTO();
        billingDTO.setBillDate(LocalDateTime.now());
        billingDTO.setTotalAmount(0.0);
        billingDTO.setPaid(false);

        Billing billing = billingDTO.toEntity();
        billing.setPatient(savedPatient);
        billingRepository.save(billing);

        return PatientDTO.toDto(savedPatient);
    }

    private String generateUniqueMedicalRecordNumber() {
        Random random = new Random();
        String mrn;
        do {
            mrn = String.format(
                    "%03d-%03d-%04d-%01d",
                    random.nextInt(1000),
                    random.nextInt(1000),
                    random.nextInt(10000),
                    random.nextInt(10));
        } while (patientRepository.existsByMedicalRecordNumber(mrn)); // Check for uniqueness
        return mrn;
    }

    @Transactional
    public PatientDTO updatePatient(
            Long id, PatientDTO patientDTO, MultipartFile profilePictureFile, String removedProfilePictureUrl) {
        return patientRepository
                .findById(id)
                .map(
                        existingPatient -> {
                            existingPatient.setFirstName(patientDTO.getFirstName());
                            existingPatient.setLastName(patientDTO.getLastName());
                            existingPatient.setDateOfBirth(patientDTO.getDateOfBirth());
                            existingPatient.setGender(patientDTO.getGender());
                            existingPatient.setAddress(patientDTO.getAddress());
                            existingPatient.setPhoneNumber(patientDTO.getPhoneNumber());
                            existingPatient.setEmail(patientDTO.getEmail());
                            // DO NOT UPDATE Medical Record Number
                            existingPatient.setBloodType(patientDTO.getBloodType());
                            existingPatient.setAllergies(patientDTO.getAllergies());
                            existingPatient.setMedicalHistory(patientDTO.getMedicalHistory());
                            existingPatient.setSeverityLevel(patientDTO.getSeverityLevel()); // Update severityLevel

                            // Update or Remove Image
                            if (removedProfilePictureUrl != null
                                    && existingPatient.getProfilePictureURL() != null
                                    && existingPatient.getProfilePictureURL().equals(removedProfilePictureUrl)) {
                                existingPatient.setProfilePictureURL(null);
                            }

                            if (profilePictureFile != null && !profilePictureFile.isEmpty()) {
                                try {
                                    String imageUrl = fileHandler.saveFile(profilePictureFile);
                                    existingPatient.setProfilePictureURL(imageUrl);
                                } catch (IOException e) {
                                    throw new RuntimeException("Failed to save image: " + e.getMessage(), e);
                                }
                            }

                            Patient savedPatient = patientRepository.save(existingPatient);
                            return PatientDTO.toDto(savedPatient);
                        })
                .orElse(null);
    }

    @Transactional
    public PatientDTO getPatientById(Long id) {
        return patientRepository.findById(id).map(PatientDTO::toDto).orElse(null);
    }

    @Transactional
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream().map(PatientDTO::toDto).collect(Collectors.toList());
    }

    @Transactional
    public Page<PatientDTO> getPatients(Pageable pageable) {
        Page<Patient> patientPage = patientRepository.findAll(pageable);
        return patientPage.map(PatientDTO::toDto);
    }

    @Transactional
    public boolean deletePatient(Long id) {
        return patientRepository
                .findById(id)
                .map(
                        patient -> {
                            // Handle Admissions and Beds
                            List<Admission> admissions = admissionRepository.findByPatientId(patient.getId());
                            for (Admission admission : admissions) {
                                Bed bed = admission.getBed();
                                if (bed != null) {
                                    bed.setOccupied(false);
                                    bedRepository.save(bed);
                                    admission.setBed(null);
                                    admissionRepository.save(admission);
                                }
                            }

                            patient.setDeleted(true);
                            patientRepository.save(patient);
                            return true;
                        })
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO> searchPatients(String search, Pageable pageable) {
        Page<Patient> patientPage = patientRepository.searchPatients(search, pageable);
        return patientPage.map(PatientDTO::toDto);
    }

    @Transactional
    public List<PatientDTO> searchPatientByFullName(String name) {
        return patientRepository.searchByFullName(name).stream()
                .map(PatientDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO> getPatientsByUnit(Long unitId, Pageable pageable) {
        List<Patient> patients = patientRepository.findPatientsByUnitIdWithFalse(unitId);
        return filterByCurrentAdmissionAndConvertToDTO(patients, pageable);
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO> getPatientsByRoom(Long roomId, Pageable pageable) {
        List<Patient> patients = patientRepository.findPatientsByRoomIdWithFalse(roomId);
        return filterByCurrentAdmissionAndConvertToDTO(patients, pageable);
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO> getPatientsByBed(Long bedId, Pageable pageable) {
        List<Patient> patients = patientRepository.findAll().stream()
                .filter(patient -> patient.getCurrentAdmission().isPresent() &&
                        patient.getCurrentAdmission().get().getBed() != null &&
                        patient.getCurrentAdmission().get().getBed().getId().equals(bedId))
                .collect(Collectors.toList());
        return convertToDTOPage(patients, pageable);
    }

    // Helper method to filter by current admission and convert to DTO Page
    private Page<PatientDTO> filterByCurrentAdmissionAndConvertToDTO(List<Patient> patients, Pageable pageable) {
        List<Patient> filteredPatients = patients.stream()
                .filter(patient -> patient.getCurrentAdmission().isPresent())
                .collect(Collectors.toList());
        return convertToDTOPage(filteredPatients, pageable);
    }

    // Helper method to convert a List<Patient> to Page<PatientDTO>
    private Page<PatientDTO> convertToDTOPage(List<Patient> patients, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), patients.size());
        List<PatientDTO> patientDTOs = patients.subList(start, end).stream()
                .map(PatientDTO::toDto)
                .collect(Collectors.toList());
        return new PageImpl<>(patientDTOs, pageable, patients.size());
    }
}