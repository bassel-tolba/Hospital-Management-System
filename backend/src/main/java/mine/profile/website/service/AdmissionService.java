package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.AdmissionDTO;
import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.models.Admission;
import mine.profile.website.models.AdmissionType;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.AdmissionTypeRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.ImageReportRepository;
import mine.profile.website.repository.LabResultRepository;
import mine.profile.website.repository.MedicationAdministrationRepository;
import mine.profile.website.repository.PatientProductUsageRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PaymentRepository;
import mine.profile.website.repository.ProcedureLogRepository;
import mine.profile.website.repository.ProcedureRepository;
import mine.profile.website.repository.ProductRepository;

@Service
public class AdmissionService {

    // --- NEW EXCEPTION CLASS DEFINED INSIDE THIS FILE ---
    /**
     * Custom exception for the business rule that a patient cannot be discharged
     * with an unpaid bill. The @ResponseStatus annotation tells Spring Boot to
     * automatically return a 409 Conflict HTTP status when this is thrown.
     * This follows your existing pattern for handling exceptions.
     */
    @ResponseStatus(HttpStatus.CONFLICT)
    public static class UnpaidBillException extends RuntimeException {
        public UnpaidBillException(String message) {
            super(message);
        }
    }

    @Autowired
    private AdmissionRepository admissionRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private AdmissionTypeRepository admissionTypeRepository;
    @Autowired
    private BillingService billingService;
    @Autowired
    private BillingRepository billingRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ProcedureLogRepository procedureLogRepository;
    @Autowired
    private PatientProductUsageRepository patientProductUsageRepository;
    @Autowired
    private LabResultRepository labResultRepository;
    @Autowired
    private ImageReportRepository imageReportRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProcedureRepository procedureRepository;
    @Autowired
    private MedicationAdministrationRepository medicationAdministrationRepository;
    @Autowired
    private PaymentService paymentService;

    @Transactional
    public AdmissionDTO createAdmission(AdmissionDTO admissionDTO) {
        Patient patient = patientRepository.findById(admissionDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + admissionDTO.getPatientId()));

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

        BillingDTO newBillingDTO = new BillingDTO();
        newBillingDTO.setPatientId(patient.getId());
        newBillingDTO.setBillDate(LocalDateTime.now());
        billingService.createBilling(newBillingDTO);

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

        // Case 1: Handle patient discharge.
        if (admissionDTO.getDischargeDate() != null && existingAdmission.getDischargeDate() == null) {
            Bed bedToFree = existingAdmission.getBed();
            if (bedToFree == null) {
                throw new IllegalStateException("Cannot discharge: Admission " + id + " has no associated bed.");
            }
            dischargePatient(existingAdmission, bedToFree);
            Admission dischargedAdmission = admissionRepository.save(existingAdmission);
            return AdmissionDTO.toDto(dischargedAdmission);
        }

        // Case 2: Handle regular updates.
        Patient patient = patientRepository.findById(admissionDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + admissionDTO.getPatientId()));
        Bed newBed = bedRepository.findById(admissionDTO.getBedId())
                .orElseThrow(() -> new EntityNotFoundException("Bed not found with id: " + admissionDTO.getBedId()));
        AdmissionType admissionType = admissionTypeRepository.findById(admissionDTO.getAdmissionTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Admission type not found with id: " + admissionDTO.getAdmissionTypeId()));

        Bed oldBed = existingAdmission.getBed();
        if (oldBed != null && !oldBed.getId().equals(newBed.getId())) {
            if (newBed.isOccupied()) {
                throw new IllegalStateException(
                        "Cannot move to Bed with id " + newBed.getId() + ". It is already occupied.");
            }
            oldBed.setOccupied(false);
            bedRepository.save(oldBed);
            newBed.setOccupied(true);
            bedRepository.save(newBed);
        }

        existingAdmission.setPatient(patient);
        existingAdmission.setBed(newBed);
        existingAdmission.setAdmissionType(admissionType);
        existingAdmission.setAdmissionDate(admissionDTO.getAdmissionDate());

        Admission updatedAdmission = admissionRepository.save(existingAdmission);
        return AdmissionDTO.toDto(updatedAdmission);
    }

    private void dischargePatient(Admission existingAdmission, Bed bed) {
        Billing billing = billingRepository
                .findByPatientId(existingAdmission.getPatient().getId(), PageRequest.of(0, 1))
                .getContent().stream().findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "Billing record not found for patient id: " + existingAdmission.getPatient().getId()));

        billingService.updateBillingTotal(billing.getId());

        Billing updatedBilling = billingRepository.findById(billing.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Billing record disappeared after update for id: " + billing.getId()));

        // --- KEY CHANGE IS HERE ---
        // Instead of IllegalStateException, we throw our new custom exception.
        // Spring Boot will see the @ResponseStatus(HttpStatus.CONFLICT) and
        // automatically
        // return a 409 status code.
        if (!paymentService.isBillFullyPaid(updatedBilling)) {
            throw new UnpaidBillException("Cannot discharge patient. Bill is not fully paid.");
        }

        existingAdmission.setDischargeDate(LocalDateTime.now());
        bed.setOccupied(false);
        bedRepository.save(bed);

        updatedBilling.setPaid(true);
        updatedBilling.setPaidDate(LocalDateTime.now());

        BillingDTO billingDTO = BillingDTO.toDto(updatedBilling, paymentRepository, procedureLogRepository,
                patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                bedRepository);
        updatedBilling.setPaidBillHtml(billingDTO.generateBillHtml());
        billingRepository.save(updatedBilling);
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