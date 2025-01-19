package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import mine.profile.website.dtos.ProcedureLogDTO;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Procedure;
import mine.profile.website.models.ProcedureLog;
import mine.profile.website.models.User;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.ProcedureLogRepository;
import mine.profile.website.repository.ProcedureRepository;
import mine.profile.website.repository.UserRepository;

@Service
public class ProcedureLogService {

    private final ProcedureLogRepository procedureLogRepository;
    private final UserRepository userRepository;
    private final ProcedureRepository procedureRepository;
    private final BillingRepository billingRepository;
    private final PatientRepository patientRepository;

    @Autowired
    public ProcedureLogService(ProcedureLogRepository procedureLogRepository, UserRepository userRepository,
            ProcedureRepository procedureRepository,
            BillingRepository billingRepository, PatientRepository patientRepository) {
        this.procedureLogRepository = procedureLogRepository;
        this.userRepository = userRepository;
        this.procedureRepository = procedureRepository;
        this.billingRepository = billingRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public ProcedureLogDTO createProcedureLog(ProcedureLogDTO dto) {

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid User ID: " + dto.getUserId()));
        Procedure procedure = procedureRepository.findById(dto.getProcedureId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Procedure ID: " + dto.getProcedureId()));

        Billing billing = null;
        if (dto.getBillingId() == null) {

        } else {
            Patient patient = patientRepository.findById(dto.getBillingId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + dto.getBillingId()));
            List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
            if (!bills.isEmpty()) {
                billing = bills.get(0); // Get the most recent bill
            }
        }

        ProcedureLog log = ProcedureLogDTO.toEntity(dto, user, procedure, billing);
        log.setStartTime(LocalDateTime.now());

        ProcedureLog savedLog = procedureLogRepository.save(log);
        return ProcedureLogDTO.toDto(savedLog);
    }

    @Transactional
    public List<ProcedureLog> findByBillingId(Long billingId) {
        return procedureLogRepository.findByBillingId(billingId);
    }

    @Transactional
    public List<ProcedureLogDTO> findAll() {
        return procedureLogRepository.findAll().stream()
                .map(ProcedureLogDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProcedureLogDTO findById(Long id) {
        return ProcedureLogDTO.toDto(procedureLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid ProcedureLog ID: " + id)));
    }

    @Transactional
    public void deleteById(Long id) {
        procedureLogRepository.deleteById(id);
    }
}