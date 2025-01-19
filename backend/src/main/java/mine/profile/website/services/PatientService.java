package mine.profile.website.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.PatientRepository;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Transactional
    public PatientDTO createPatient(PatientDTO patientDTO) {
        Patient patient = entityMapper.toEntity(patientDTO);
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
    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        return patientRepository.findById(id)
                .map(existingPatient -> {
                    Patient updatedPatient = patientDTO.toEntity();
                    updatedPatient.setId(id);
                    return PatientDTO.toDto(patientRepository.save(updatedPatient));
                }).orElse(null);
    }

    @Transactional
    public boolean deletePatient(Long id) {
        if (patientRepository.existsById(id)) {
            patientRepository.deleteById(id);
            return true;
        }
        return false;
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
}