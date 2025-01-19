package mine.profile.website.service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.LabResultDTO;
import mine.profile.website.models.Billing;
import mine.profile.website.models.LabResult;
import mine.profile.website.models.LabTest;
import mine.profile.website.models.Patient;
import mine.profile.website.models.User;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.LabResultRepository;
import mine.profile.website.repository.LabTestRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.UserRepository;

@Service
public class LabResultService {

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private LabTestRepository labTestRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Transactional
    public LabResultDTO createLabResult(LabResultDTO labResultDTO) {
        LabResult labResult = labResultDTO.toEntity();

        Patient patient = patientRepository.findById(labResultDTO.getPatientId()).orElse(null);
        User user = userRepository.findById(labResultDTO.getPerformedById()).orElse(null);
        LabTest labTest = labTestRepository.findById(labResultDTO.getLabTestId()).orElse(null);

        if (Objects.isNull(patient) || Objects.isNull(user) || Objects.isNull(labTest)) {
            return null;
        }

        Billing billing = null;
        List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
        if (!bills.isEmpty()) {
            billing = bills.get(0); // Get the most recent bill
        }
        labResult.setPatient(patient);
        labResult.setPerformedBy(user);
        labResult.setLabTest(labTest);
        labResult.setBilling(billing);
        labResult = labResultRepository.save(labResult);
        return LabResultDTO.fromEntity(labResult);
    }

    @Transactional
    public LabResultDTO getLabResultById(Long id) {
        LabResult labResult = labResultRepository.findById(id).orElse(null);
        if (labResult == null) {
            return null;
        }
        return LabResultDTO.fromEntity(labResult);
    }

    @Transactional
    public Page<LabResultDTO> getLabResultsByPatient(Long patientId, Pageable pageable) {
        Page<LabResult> results = labResultRepository.findByPatientId(patientId, pageable);
        return results.map(LabResultDTO::fromEntity);
    }
}