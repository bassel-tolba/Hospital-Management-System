package mine.profile.website.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import mine.profile.website.dtos.MedicationAdministrationDTO;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Medication;
import mine.profile.website.models.MedicationAdministration;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PrescribedMedication;
import mine.profile.website.models.User;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.MedicationAdministrationRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PrescribedMedicationRepository;
import mine.profile.website.repository.UserRepository;

@Service
public class MedicationAdministrationService {

    private final MedicationAdministrationRepository medicationAdministrationRepository;
    private final MedicationService medicationService;
    private final PrescribedMedicationRepository prescribedMedicationRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final BillingRepository billingRepository;

    public MedicationAdministrationService(
            MedicationAdministrationRepository medicationAdministrationRepository,
            MedicationService medicationService,
            UserRepository userRepository,
            PrescribedMedicationRepository prescribedMedicationRepository,
            PatientRepository patientRepository,
            BillingRepository billingRepository) {
        this.medicationAdministrationRepository = medicationAdministrationRepository;
        this.medicationService = medicationService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.prescribedMedicationRepository = prescribedMedicationRepository;
        this.billingRepository = billingRepository;
    }

    @Transactional
    public MedicationAdministrationDTO createMedicationAdministration(MedicationAdministrationDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + dto.getPatientId()));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid User ID: " + dto.getUserId()));

        PrescribedMedication prescribedMedication = prescribedMedicationRepository
                .findById(dto.getPrescribedMedicationId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid PrescribedMedication ID: " + dto.getPrescribedMedicationId()));

        if (prescribedMedication.isExpired())
            throw new AccessDeniedException("the prescribedMedication has beed administrated once.");

        Medication medication = prescribedMedication.getMedication();
        double amount = dto.getAmount();

        if (medication.getStock() < amount) {
            throw new IllegalStateException("مفيش دوا كفايه  " + medication.getName());
        }
        if (amount < 0) {

            throw new IllegalStateException("يا سلام ! رقم سالب");
        }
        if (amount == 0) {
            throw new IllegalStateException("طب ازاي فهمني هتديلو 0 من الدوا");
        }

        medicationService.decreaseStock(medication.getId(), (int) amount, "Medication Administration");

        prescribedMedication.setExpired(true);

        Billing billing = null;
        if (dto.getBillingId() == null) {
            List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
            if (!bills.isEmpty()) {
                billing = bills.get(0); // Get the most recent bill
            }
        } else {
            billing = billingRepository.findById(dto.getBillingId())
                    .orElseThrow(() -> new IllegalArgumentException("no billing found with id " + dto.getBillingId()));
        }

        MedicationAdministration administration = MedicationAdministrationDTO.toEntity(dto, patient, user,
                prescribedMedication, billing);
        BigDecimal calculatedPrice = medication.calculatePrice(amount);
        administration.setCalculatedPrice(calculatedPrice);
        administration.setAdministrationTime(LocalDateTime.now());

        MedicationAdministration savedAdmin = medicationAdministrationRepository.save(administration);
        return MedicationAdministrationDTO.toDto(savedAdmin);
    }

    @Transactional
    public Page<MedicationAdministrationDTO> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MedicationAdministration> medicationAdministrationPage = medicationAdministrationRepository
                .findAll(pageable);
        return medicationAdministrationPage.map(MedicationAdministrationDTO::toDto);
    }

    @Transactional
    public Page<MedicationAdministrationDTO> findAllByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MedicationAdministration> medicationAdministrationPage = medicationAdministrationRepository
                .findByPatientId(patientId, pageable);
        return medicationAdministrationPage.map(MedicationAdministrationDTO::toDto);
    }

    @Transactional
    public MedicationAdministrationDTO findById(Long id) {
        return medicationAdministrationRepository.findById(id)
                .map(MedicationAdministrationDTO::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid MedicationAdministration ID: " + id));
    }

    @Transactional
    public void deleteById(Long id) {
        MedicationAdministration administration = medicationAdministrationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid MedicationAdministration ID: " + id));

        PrescribedMedication prescribedMedication = administration.getPrescribedMedication();
        Medication medication = prescribedMedication.getMedication();
        double amount = administration.getAmount();

        medicationService.increaseStock(medication.getId(), (int) amount, "Reverted Medication Administration");
        prescribedMedication.setExpired(false);
        prescribedMedicationRepository.save(prescribedMedication);

        medicationAdministrationRepository.deleteById(id);
    }
}