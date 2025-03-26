// PaymentService.java (Revised)
package mine.profile.website.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ValidationException; // Import for input validation
import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.PaymentDTO;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Billing;
import mine.profile.website.models.ImageReport;
import mine.profile.website.models.LabResult;
import mine.profile.website.models.MedicationAdministration;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PatientProductUsage;
import mine.profile.website.models.Payment;
import mine.profile.website.models.ProcedureLog;
import mine.profile.website.repository.AdmissionRepository;
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
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private BillingRepository billingRepository;
    @Autowired
    private BillingService billingService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AdmissionRepository admissionRepository;
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
    private BedRepository bedRepository;

    @Transactional
    public PaymentDTO createPayment(Long billingId, PaymentDTO paymentDTO) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Billing ID: " + billingId));
        Patient patient = patientRepository.findById(billing.getPatient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + billing.getPatient().getId()));

        // Validate paymentDTO
        if (paymentDTO.getPaymentDate() == null) {
            throw new ValidationException("Payment date cannot be null.");
        }
        if (paymentDTO.getPaymentDate().isAfter(LocalDateTime.now())) {
            throw new ValidationException("Payment date cannot be in the future.");
        }

        String statisticsJson = createStatistics(billing); // Calculate statistics *here*
        paymentDTO.setStatistics(statisticsJson);

        Payment payment = paymentDTO.toEntity(billing);
        Payment savedPayment = paymentRepository.save(payment);

        // REMOVED: Fully paid check and related logic.

        return PaymentDTO.toDto(savedPayment);
    }

    public boolean isBillFullyPaid(Billing billing) {

        return BillingDTO.toDto(billing, paymentRepository, procedureLogRepository, patientProductUsageRepository,
                labResultRepository, imageReportRepository, productRepository, procedureRepository, admissionRepository,
                patientRepository, medicationAdministrationRepository, bedRepository).calculatePendingAmount() <= 0;
    }

    private String createStatistics(Billing billing) {
        BillingDTO billingDTO = BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                bedRepository);
        Map<String, Object> statisticsMap = generateBillJson(billingDTO);
        try {
            return objectMapper.writeValueAsString(statisticsMap);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting statistics to JSON", e);
        }
    }

    private Map<String, Object> generateBillJson(BillingDTO billingDTO) {
        Map<String, Object> billInfo = new LinkedHashMap<>(); // Preserve insertion order
        billInfo.put("billId", billingDTO.getId());
        billInfo.put("billDate", billingDTO.getBillDate());
        if (billingDTO.getPatientId() != null) {
            billInfo.put("patientName", patientRepository.findById(billingDTO.getPatientId()).get().getFirstName() + " "
                    + patientRepository.findById(billingDTO.getPatientId()).get().getLastName());
        }

        double totalBill = 0;

        // --- Admission Section ---
        List<Map<String, Object>> admissionDetails = new ArrayList<>();
        if (billingDTO.getPatientId() != null) {
            List<Admission> admissions = admissionRepository.findByPatientId(billingDTO.getPatientId());
            if (admissions != null && !admissions.isEmpty()) {
                for (Admission admission : admissions) {
                    if (admission.getAdmissionDate() != null) {
                        LocalDateTime admissionTime = admission.getAdmissionDate();
                        LocalDateTime dischargeTime = admission.getDischargeDate();
                        double admissionTypePrice = 0;
                        String admissionTypeName = "";

                        if (admission.getAdmissionType() != null) {
                            admissionTypePrice = admission.getAdmissionType().getPrice();
                            admissionTypeName = admission.getAdmissionType().getName();
                        }

                        long days;
                        if (dischargeTime == null || dischargeTime.isAfter(billingDTO.getBillDate())) {

                            days = Math.round(Duration.between(admissionTime, billingDTO.getBillDate()).toDays());
                            days = days <= 0 ? 1 : days;
                            double admissionCost = days * admissionTypePrice;
                            Map<String, Object> admissionEntry = new LinkedHashMap<>();
                            admissionEntry.put("type", admissionTypeName);
                            admissionEntry.put("days", days);
                            admissionEntry.put("amount", String.format("%.2f", admissionCost));
                            admissionDetails.add(admissionEntry);
                            totalBill += admissionCost;

                        }
                    }
                }
            }
        }
        billInfo.put("admissions", admissionDetails);

        // --- Procedure Logs Section ---
        List<Map<String, Object>> procedureDetails = new ArrayList<>();
        if (billingDTO.getProcedureLogIds() != null && !billingDTO.getProcedureLogIds().isEmpty()) {
            Map<Long, Long> procedureCountMap = billingDTO.getProcedureLogIds().stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

            List<ProcedureLog> procedureLogs = procedureLogRepository.findAllById(billingDTO.getProcedureLogIds());

            for (Map.Entry<Long, Long> entry : procedureCountMap.entrySet()) {
                Long procedureId = entry.getKey();
                Long count = entry.getValue();

                ProcedureLog log = procedureLogs.stream()
                        .filter(procedureLog -> procedureLog.getId().equals(procedureId))
                        .findFirst()
                        .orElse(null);

                if (log != null && log.getProcedure() != null) {
                    double procedurePrice = procedureRepository.findById(log.getProcedure().getId()).orElseThrow()
                            .getPrice();
                    double totalPriceForProcedure = procedurePrice * count;

                    Map<String, Object> procedureEntry = new LinkedHashMap<>();
                    procedureEntry.put("procedureName", log.getProcedure().getName());
                    procedureEntry.put("count", count);
                    procedureEntry.put("amount", String.format("%.2f", totalPriceForProcedure));
                    procedureDetails.add(procedureEntry);
                    totalBill += totalPriceForProcedure;
                }
            }
        }
        billInfo.put("procedures", procedureDetails);

        // --- Patient Product Usages Section ---
        List<Map<String, Object>> productDetails = new ArrayList<>();
        if (billingDTO.getPatientProductUsageIds() != null && !billingDTO.getPatientProductUsageIds().isEmpty()) {
            List<PatientProductUsage> patientProductUsages = patientProductUsageRepository
                    .findAllById(billingDTO.getPatientProductUsageIds());
            for (PatientProductUsage usage : patientProductUsages) {
                if (usage != null && usage.getProduct() != null) {
                    BigDecimal usagePrice = usage.getPrice(); // Use the pre-calculated price
                    BigDecimal quantity = usage.getQuantity() != null ? usage.getQuantity() : BigDecimal.ONE;
                    double totalPriceForUsage = usagePrice.multiply(quantity).doubleValue();
                    Map<String, Object> productEntry = new LinkedHashMap<>();
                    productEntry.put("productName", usage.getProduct().getName());
                    productEntry.put("quantity", quantity);
                    productEntry.put("amount", String.format("%.2f", totalPriceForUsage));
                    productDetails.add(productEntry);
                    totalBill += totalPriceForUsage;
                }
            }
        }
        billInfo.put("products", productDetails);

        // --- Lab Results Section ---
        List<Map<String, Object>> labResultDetails = new ArrayList<>();
        if (billingDTO.getLabResultIds() != null && !billingDTO.getLabResultIds().isEmpty()) {
            Map<Long, Long> labResultCountMap = billingDTO.getLabResultIds().stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

            List<LabResult> labResults = labResultRepository.findAllById(billingDTO.getLabResultIds());
            for (Map.Entry<Long, Long> entry : labResultCountMap.entrySet()) {
                Long labResultId = entry.getKey();
                Long count = entry.getValue();

                LabResult result = labResults.stream()
                        .filter(labResult -> labResult.getId().equals(labResultId))
                        .findFirst()
                        .orElse(null);

                if (result != null && result.getLabTest() != null) {
                    double labTestPrice = result.getLabTest().getPrice();
                    double totalPriceForLabTest = labTestPrice * count;

                    Map<String, Object> labResultEntry = new LinkedHashMap<>();
                    labResultEntry.put("testName", result.getLabTest().getTestName());
                    labResultEntry.put("count", count);
                    labResultEntry.put("amount", String.format("%.2f", totalPriceForLabTest));
                    labResultDetails.add(labResultEntry);
                    totalBill += totalPriceForLabTest;
                }
            }
        }
        billInfo.put("labResults", labResultDetails);

        // --- Image Reports Section ---
        List<Map<String, Object>> imageReportDetails = new ArrayList<>();
        if (billingDTO.getImageReportIds() != null && !billingDTO.getImageReportIds().isEmpty()) {
            Map<Long, Long> imageReportCountMap = billingDTO.getImageReportIds().stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

            List<ImageReport> imageReports = imageReportRepository.findAllById(billingDTO.getImageReportIds());
            for (Map.Entry<Long, Long> entry : imageReportCountMap.entrySet()) {
                Long imageReportId = entry.getKey();
                Long count = entry.getValue();
                ImageReport report = imageReports.stream()
                        .filter(imageReport -> imageReport.getId().equals(imageReportId))
                        .findFirst()
                        .orElse(null);

                if (report != null && report.getImageReportType() != null) {
                    double imageReportPrice = report.getImageReportType().getPrice();
                    double totalPriceForImageReport = imageReportPrice * count;
                    Map<String, Object> imageReportEntry = new LinkedHashMap<>();
                    imageReportEntry.put("reportName", report.getImageReportType().getName());
                    imageReportEntry.put("count", count);
                    imageReportEntry.put("amount", String.format("%.2f", totalPriceForImageReport));
                    imageReportDetails.add(imageReportEntry);
                    totalBill += totalPriceForImageReport;
                }
            }
        }
        billInfo.put("imageReports", imageReportDetails);

        // --- Medication Administrations Section ---
        List<Map<String, Object>> medicationDetails = new ArrayList<>();
        if (billingDTO.getMedicationAdministrationIds() != null
                && !billingDTO.getMedicationAdministrationIds().isEmpty()) {
            List<MedicationAdministration> medicationAdministrations = medicationAdministrationRepository
                    .findAllById(billingDTO.getMedicationAdministrationIds());
            for (MedicationAdministration administration : medicationAdministrations) {
                if (administration != null && administration.getPrescribedMedication() != null) {
                    BigDecimal calculatedPrice = administration.getCalculatedPrice();
                    double totalPriceForMedication = calculatedPrice.doubleValue();
                    // Get the *actual* quantity administered
                    double quantity = administration.getAmount();

                    Map<String, Object> medicationEntry = new LinkedHashMap<>();
                    medicationEntry.put("medicationName",
                            administration.getPrescribedMedication().getMedication().getName());
                    medicationEntry.put("dosage", administration.getPrescribedMedication().getDosage());
                    medicationEntry.put("quantity", String.format("%.2f", quantity)); // Include quantity
                    medicationEntry.put("amount", String.format("%.2f", totalPriceForMedication)); // Price
                    medicationDetails.add(medicationEntry);
                    totalBill += totalPriceForMedication;
                }
            }
        }
        billInfo.put("medications", medicationDetails);

        billInfo.put("totalAmount", String.format("%.2f", totalBill));
        return billInfo;
    }
}