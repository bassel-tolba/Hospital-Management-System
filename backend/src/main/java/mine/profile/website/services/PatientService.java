package mine.profile.website.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.mapper.EntityMapper;
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
    private EntityMapper entityMapper;

    @Autowired
    private FileHandler fileHandler;

    @Transactional
    public PatientDTO createPatient(PatientDTO patientDTO, MultipartFile profilePictureFile) {
        Patient patient = entityMapper.toEntity(patientDTO);

        if (profilePictureFile != null && !profilePictureFile.isEmpty()) {
            try {
                String imageUrl = fileHandler.saveFile(profilePictureFile);
                patient.setProfilePictureURL(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save image: " + e.getMessage(), e);
                // Handle the exception, log it, or rethrow it as a runtime exception
                // You could also return a DTO with an error message.
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

    @Transactional
    public PatientDTO updatePatient(Long id, PatientDTO patientDTO, MultipartFile profilePictureFile,
            String removedProfilePictureUrl) {
        return patientRepository.findById(id)
                .map(existingPatient -> {

                    existingPatient.setFirstName(patientDTO.getFirstName());
                    existingPatient.setLastName(patientDTO.getLastName());
                    existingPatient.setDateOfBirth(patientDTO.getDateOfBirth());
                    existingPatient.setGender(patientDTO.getGender());
                    existingPatient.setAddress(patientDTO.getAddress());
                    existingPatient.setPhoneNumber(patientDTO.getPhoneNumber());
                    existingPatient.setEmail(patientDTO.getEmail());
                    existingPatient.setMedicalRecordNumber(patientDTO.getMedicalRecordNumber());
                    existingPatient.setBloodType(patientDTO.getBloodType());
                    existingPatient.setAllergies(patientDTO.getAllergies());
                    existingPatient.setMedicalHistory(patientDTO.getMedicalHistory());

                    // Update or Remove Image
                    if (removedProfilePictureUrl != null && existingPatient.getProfilePictureURL() != null
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

                    Patient savedPatient = patientRepository.save(existingPatient); // Persist the changes to
                                                                                    // existingPatient
                    return PatientDTO.toDto(savedPatient); // Convert to DTO
                }).orElse(null); // Handle case where patient is not found
    }

    @Transactional
    public PatientDTO getPatientById(Long id) {
        return patientRepository.findById(id)
                .map(PatientDTO::toDto)
                .orElse(null);
    }

    @Transactional
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(PatientDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Page<PatientDTO> getPatients(Pageable pageable) {
        Page<Patient> patientPage = patientRepository.findAll(pageable);
        return patientPage.map(PatientDTO::toDto);
    }

    @Transactional
    public boolean deletePatient(Long id) {
        return patientRepository.findById(id)
                .map(patient -> {
                    // Handle Admissions and Beds
                    List<Admission> admissions = admissionRepository.findByPatientId(patient.getId());
                    for (Admission admission : admissions) {
                        Bed bed = admission.getBed();
                        if (bed != null) {
                            bed.setOccupied(false);
                            bedRepository.save(bed);

                            // Remove the association with the admission
                            admission.setBed(null);
                            admissionRepository.save(admission);
                        }
                    }

                    patient.setDeleted(true);
                    patientRepository.save(patient);
                    return true;
                }).orElse(false);
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

    private String handleFileUpload(MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            try {
                return fileHandler.saveFile(file);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file", e);
            }
        }
        return null;
    }
}