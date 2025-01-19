package mine.profile.website.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.PaymentDTO;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Payment;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PaymentRepository;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BillingRepository billingRepository;
    private final BillingService billingService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AdmissionRepository admissionRepository;

    public PaymentService(PaymentRepository paymentRepository, BillingRepository billingRepository,
            BillingService billingService, PatientRepository patientRepository,
            AdmissionRepository admissionRepository) {
        this.paymentRepository = paymentRepository;
        this.billingRepository = billingRepository;
        this.billingService = billingService;
        this.patientRepository = patientRepository;
        this.admissionRepository = admissionRepository;
    }

    @Transactional
    public PaymentDTO createPayment(Long billingId, PaymentDTO paymentDTO) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Billing ID: " + billingId));
        Patient patient = patientRepository.findById(billing.getPatient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + billing.getPatient().getId()));
        // Check if patient has an ongoing admission
        Admission latestAdmission = null;

        List<Admission> admissions = admissionRepository.findByPatientId(patient.getId());

        if (admissions != null && !admissions.isEmpty()) {
            latestAdmission = admissions.stream()
                    .max((a1, a2) -> a1.getAdmissionDate().compareTo(a2.getAdmissionDate()))
                    .orElse(null);
        }
        if (latestAdmission != null && latestAdmission.getDischargeDate() == null) {
            throw new IllegalStateException("Cannot process payment until the current admission stay is over.");
        }

        Payment payment = paymentDTO.toEntity(billing);
        Payment savedPayment = paymentRepository.save(payment);

        // Check if the bill is fully paid
        if (isBillFullyPaid(billing)) {
            billing.setPaid(true);
            createRecurringBilling(billing.getPatient());
        }

        return PaymentDTO.toDto(savedPayment);
    }

    private boolean isBillFullyPaid(Billing billing) {
        double totalBill = billing.getTotalAmount();
        double totalPayments = 0;

        List<Payment> payments = paymentRepository.findByBillingId(billing.getId());
        if (payments != null && !payments.isEmpty()) {
            totalPayments = payments.stream().mapToDouble(Payment::getAmount).sum();
        }

        return totalPayments >= totalBill;
    }

    private void createRecurringBilling(Patient patient) {
        // Create a new BillingDTO, you can initialize with default values
        BillingDTO newBillingDTO = new BillingDTO();
        newBillingDTO.setPatientId(patient.getId());

        // Call BillingService to create the new bill
        billingService.createBilling(newBillingDTO);
    }
}