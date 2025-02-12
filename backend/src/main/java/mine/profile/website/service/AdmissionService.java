package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.AdmissionDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.models.Admission;
import mine.profile.website.models.AdmissionType;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.AdmissionTypeRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.PatientRepository;

@Service
public class AdmissionService {

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private AdmissionTypeRepository admissionTypeRepository;

    @Transactional
    public AdmissionDTO createAdmission(AdmissionDTO admissionDTO) {
        Patient patient = patientRepository.findById(admissionDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + admissionDTO.getPatientId()));

        // Check if the patient has an open admission
        if (hasOpenAdmission(patient.getId())) {
            throw new IllegalStateException(
                    "Patient with id " + patient.getId() + " has an open admission. Close it first.");
        }

        Bed bed = bedRepository.findById(admissionDTO.getBedId())
                .orElseThrow(() -> new EntityNotFoundException("Bed not found with id: " + admissionDTO.getBedId()));

        if (bed.isOccupied()) {
            throw new IllegalStateException("Bed with id " + bed.getId() + " is already occupied.");
        }

        bed.setOccupied(true);
        bedRepository.save(bed);

        AdmissionType admissionType = admissionTypeRepository.findById(admissionDTO.getAdmissionTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Admission type not found with id: " + admissionDTO.getAdmissionTypeId()));

        Admission admission = admissionDTO.toEntity(patient, bed, admissionType);
        Admission savedAdmission = admissionRepository.save(admission);
        return AdmissionDTO.toDto(savedAdmission);
    }

    private boolean hasOpenAdmission(Long patientId) {
        List<Admission> openAdmissions = admissionRepository.findByPatientIdAndDischargeDateIsNull(patientId);
        return !openAdmissions.isEmpty();
    }

    @Transactional
    public AdmissionDTO getAdmissionById(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found with id: " + id));
        return AdmissionDTO.toDto(admission);
    }

    @Transactional
    public List<AdmissionDTO> searchAdmissions(Long patientId, Long bedId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Admission> admissionPage;
        if (patientId != null && bedId != null) {
            admissionPage = admissionRepository.findByPatientIdAndBedId(patientId, bedId, pageable);
        } else if (patientId != null) {
            admissionPage = admissionRepository.findByPatientId(patientId, pageable);
        } else if (bedId != null) {
            admissionPage = admissionRepository.findByBedId(bedId, pageable);
        } else {
            admissionPage = admissionRepository.findAll(pageable);
        }
        return admissionPage.getContent().stream()
                .map(AdmissionDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AdmissionDTO> findOpenAdmissions() {
        List<Admission> admissions = admissionRepository.findByDischargeDateIsNull();
        return admissions.stream()
                .map(AdmissionDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdmissionDTO updateAdmission(Long id, AdmissionDTO admissionDTO) {
        Admission existingAdmission = admissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found with id: " + id));

        Patient patient = patientRepository.findById(admissionDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + admissionDTO.getPatientId()));
        Bed bed = bedRepository.findById(admissionDTO.getBedId())
                .orElseThrow(() -> new EntityNotFoundException("Bed not found with id: " + admissionDTO.getBedId()));

        AdmissionType admissionType = admissionTypeRepository.findById(admissionDTO.getAdmissionTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Admission type not found with id: " + admissionDTO.getAdmissionTypeId()));

        existingAdmission.setAdmissionDate(admissionDTO.getAdmissionDate());
        existingAdmission.setAdmissionType(admissionType);
        existingAdmission.setBed(bed);
        existingAdmission.setPatient(patient);

        if (admissionDTO.getDischargeDate() != null) {
            dischargePatient(existingAdmission, bed);
        }
        Admission updatedAdmission = admissionRepository.save(existingAdmission);
        return AdmissionDTO.toDto(updatedAdmission);
    }

    private void dischargePatient(Admission existingAdmission, Bed bed) {
        existingAdmission.setDischargeDate(LocalDateTime.now());
        bed.setOccupied(false);
        bedRepository.save(bed);
    }

    @Transactional
    public void deleteAdmission(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admission not found with id: " + id));

        if (admission.getBed() != null) {
            Bed bed = bedRepository.findById(admission.getBed().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Bed not found"));
            bed.setOccupied(false);
            bedRepository.save(bed);
        }
        admissionRepository.delete(admission);
    }

    @Transactional
    public PatientDTO getPatientByBedId(Long bedId) {
        Admission admission = admissionRepository.findByBedId(bedId);
        if (admission == null) {
            return null;
        }
        return PatientDTO.toDto(admission.getPatient());
    }
}