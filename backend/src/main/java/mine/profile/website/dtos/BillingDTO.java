package mine.profile.website.dtos;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Billing;
import mine.profile.website.models.ImageReport;
import mine.profile.website.models.LabResult;
import mine.profile.website.models.MedicationAdministration;
import mine.profile.website.models.PatientProductUsage;
import mine.profile.website.models.Payment;
import mine.profile.website.models.ProcedureLog;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.ImageReportRepository;
import mine.profile.website.repository.LabResultRepository;
import mine.profile.website.repository.MedicationAdministrationRepository;
import mine.profile.website.repository.PatientProductUsageRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PaymentRepository;
import mine.profile.website.repository.ProcedureLogRepository;
import mine.profile.website.repository.ProcedureRepository;
import mine.profile.website.repository.ProductRepository;

@Getter
@Setter
@NoArgsConstructor
public class BillingDTO {
    private Long id;
    private LocalDateTime billDate;
    private double totalAmount;
    private boolean isPaid;
    private Long patientId;
    private List<Long> paymentIds;
    private List<Long> procedureLogIds;
    private List<Long> patientProductUsageIds;
    private List<Long> labResultIds;
    private List<Long> imageReportIds;
    private List<Long> medicationAdministrationIds;
    private String bill;

    @Autowired
    @JsonIgnore
    private AdmissionRepository admissionRepository;
    @Autowired
    @JsonIgnore
    private PaymentRepository paymentRepository;
    @Autowired
    @JsonIgnore
    private ProcedureLogRepository procedureLogRepository;
    @Autowired
    @JsonIgnore
    private PatientProductUsageRepository patientProductUsageRepository;
    @Autowired
    @JsonIgnore
    private LabResultRepository labResultRepository;
    @Autowired
    @JsonIgnore
    private ImageReportRepository imageReportRepository;
    @Autowired
    @JsonIgnore
    private ProductRepository productRepository;
    @Autowired
    @JsonIgnore
    private ProcedureRepository procedureRepository;

    @Autowired
    @JsonIgnore
    private PatientRepository patientRepository;

    @Autowired
    @JsonIgnore
    private MedicationAdministrationRepository medicationAdministrationRepository;

    @Autowired
    @JsonIgnore
    private BedRepository bedRepository;

    public BillingDTO(Long id, LocalDateTime billDate, double totalAmount, boolean isPaid, Long patientId,
            List<Long> paymentIds, List<Long> procedureLogIds, List<Long> patientProductUsageIds,
            List<Long> labResultIds, List<Long> imageReportIds, List<Long> medicationAdministrationIds) {
        this.id = id;
        this.billDate = billDate;
        this.totalAmount = totalAmount;
        this.isPaid = isPaid;
        this.patientId = patientId;
        this.paymentIds = paymentIds;
        this.procedureLogIds = procedureLogIds;
        this.patientProductUsageIds = patientProductUsageIds;
        this.labResultIds = labResultIds;
        this.imageReportIds = imageReportIds;
        this.medicationAdministrationIds = medicationAdministrationIds;
    }

    public Billing toEntity() {
        Billing billing = new Billing();
        billing.setId(this.id);
        billing.setBillDate(this.billDate);
        billing.setTotalAmount(this.totalAmount);
        billing.setPaid(this.isPaid);

        return billing;
    }

    public static BillingDTO toDto(Billing billing, PaymentRepository paymentRepository,
            ProcedureLogRepository procedureLogRepository,
            PatientProductUsageRepository patientProductUsageRepository, LabResultRepository labResultRepository,
            ImageReportRepository imageReportRepository, ProductRepository productRepository,
            ProcedureRepository procedureRepository, AdmissionRepository admissionRepository,
            PatientRepository patientRepository,
            MedicationAdministrationRepository medicationAdministrationRepository,
            BedRepository bedRepository) {
        BillingDTO billingDTO = new BillingDTO();
        billingDTO.setId(billing.getId());
        billingDTO.setBillDate(billing.getBillDate());
        billingDTO.setTotalAmount(billing.getTotalAmount());
        billingDTO.setPaid(billing.isPaid());
        if (billing.getPatient() != null) {
            billingDTO.setPatientId(billing.getPatient().getId());
        }
        if (billing.getPayments() != null) {
            billingDTO.setPaymentIds(
                    billing.getPayments().stream().map(payment -> payment.getId()).collect(Collectors.toList()));
        }
        if (billing.getProcedureLogs() != null) {
            billingDTO.setProcedureLogIds(
                    billing.getProcedureLogs().stream().map(log -> log.getId()).collect(Collectors.toList()));
        }
        if (billing.getPatientProductUsages() != null) {
            billingDTO.setPatientProductUsageIds(
                    billing.getPatientProductUsages().stream().map(usage -> usage.getId())
                            .collect(Collectors.toList()));
        }
        if (billing.getLabResults() != null) {
            billingDTO.setLabResultIds(
                    billing.getLabResults().stream().map(result -> result.getId()).collect(Collectors.toList()));
        }
        if (billing.getImageReports() != null) {
            billingDTO.setImageReportIds(
                    billing.getImageReports().stream().map(report -> report.getId()).collect(Collectors.toList()));
        }

        if (billing.getMedicationAdministrations() != null) {
            billingDTO.setMedicationAdministrationIds(
                    billing.getMedicationAdministrations().stream().map(report -> report.getId())
                            .collect(Collectors.toList()));
        }

        billingDTO.paymentRepository = paymentRepository;
        billingDTO.procedureLogRepository = procedureLogRepository;
        billingDTO.patientProductUsageRepository = patientProductUsageRepository;
        billingDTO.labResultRepository = labResultRepository;
        billingDTO.imageReportRepository = imageReportRepository;
        billingDTO.productRepository = productRepository;
        billingDTO.procedureRepository = procedureRepository;
        billingDTO.admissionRepository = admissionRepository;
        billingDTO.patientRepository = patientRepository;
        billingDTO.medicationAdministrationRepository = medicationAdministrationRepository;
        billingDTO.bedRepository = bedRepository;
        billingDTO.setBill(billingDTO.generateBillHtml());

        return billingDTO;
    }

    public double calculatePendingAmount() {
        double totalBill = 0;
        double totalPayment = 0;
        if (isPaid() == true) {
            return 0;
        }
        if (patientId != null) {
            List<Admission> admissions = admissionRepository.findByPatientId(patientId);
            if (admissions != null && !admissions.isEmpty()) {
                for (Admission admission : admissions) {
                    if (admission.getAdmissionDate() != null) {
                        LocalDateTime admissionTime = admission.getAdmissionDate();
                        LocalDateTime dischargeTime = admission.getDischargeDate();
                        double admissionTypePrice = 0;

                        if (admission.getAdmissionType() != null) {
                            admissionTypePrice = admission.getAdmissionType().getPrice();

                        }
                        if (dischargeTime == null || dischargeTime.isAfter(this.billDate)) {
                            // Use billDate here to compare with admission dates
                            LocalDateTime currentTime = this.billDate;
                            long days = Duration.between(admissionTime, currentTime).toDays();
                            days = days == 0 ? 1 : days; // always at least one day.
                            totalBill += days * admissionTypePrice;

                        } else if (dischargeTime.isBefore(this.billDate)) {
                            // Free the bed if the admission is completed (discharge date is in the past)
                            if (admission.getBed() != null) {
                                Bed bed = bedRepository.findById(admission.getBed().getId()).orElse(null);
                                if (bed != null && bed.isOccupied()) {
                                    bed.setOccupied(false);
                                    bedRepository.save(bed);
                                    // Set the bedId in the admission record to null
                                    admission.setBed(null);
                                    admissionRepository.save(admission);
                                }
                            }
                        }
                    }
                }
            }
        }

        if (procedureLogIds != null && !procedureLogIds.isEmpty()) {
            Map<Long, Long> procedureCountMap = procedureLogIds.stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

            List<ProcedureLog> procedureLogs = procedureLogRepository.findAllById(procedureLogIds);

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
                    totalBill += procedurePrice * count;
                }
            }
        }
        if (patientProductUsageIds != null && !patientProductUsageIds.isEmpty()) {

            List<PatientProductUsage> patientProductUsages = patientProductUsageRepository
                    .findAllById(patientProductUsageIds);
            for (PatientProductUsage usage : patientProductUsages) {
                if (usage != null && usage.getProduct() != null) {
                    BigDecimal usagePrice = usage.getPrice();
                    BigDecimal quantity = usage.getQuantity() != null ? usage.getQuantity() : BigDecimal.ONE;
                    totalBill += usagePrice.multiply(quantity).doubleValue();
                }
            }

        }
        if (labResultIds != null && !labResultIds.isEmpty()) {
            Map<Long, Long> labResultCountMap = labResultIds.stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
            List<LabResult> labResults = labResultRepository.findAllById(labResultIds);

            for (Map.Entry<Long, Long> entry : labResultCountMap.entrySet()) {
                Long labResultId = entry.getKey();
                Long count = entry.getValue();

                LabResult result = labResults.stream()
                        .filter(labResult -> labResult.getId().equals(labResultId))
                        .findFirst()
                        .orElse(null);
                if (result != null && result.getLabTest() != null) {
                    double labTestPrice = result.getLabTest().getPrice();
                    totalBill += labTestPrice * count;
                }
            }
        }

        if (imageReportIds != null && !imageReportIds.isEmpty()) {
            Map<Long, Long> imageReportCountMap = imageReportIds.stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
            List<ImageReport> imageReports = imageReportRepository.findAllById(imageReportIds);
            for (Map.Entry<Long, Long> entry : imageReportCountMap.entrySet()) {
                Long imageReportId = entry.getKey();
                Long count = entry.getValue();
                ImageReport report = imageReports.stream()
                        .filter(imageReport -> imageReport.getId().equals(imageReportId))
                        .findFirst()
                        .orElse(null);

                if (report != null && report.getImageReportType() != null) {
                    double imageReportPrice = report.getImageReportType().getPrice();
                    totalBill += imageReportPrice * count;
                }
            }
        }

        if (medicationAdministrationIds != null && !medicationAdministrationIds.isEmpty()) {
            List<MedicationAdministration> medicationAdministrations = medicationAdministrationRepository
                    .findAllById(medicationAdministrationIds);
            for (MedicationAdministration administration : medicationAdministrations) {
                if (administration != null && administration.getPrescribedMedication() != null) {
                    BigDecimal calculatedPrice = administration.getCalculatedPrice();
                    totalBill += calculatedPrice.doubleValue();
                }
            }
        }

        if (this.id != null) {
            Billing billing = new Billing();
            billing.setId(this.id);
            if (paymentRepository.findByBillingId(billing.getId()) != null) {
                totalPayment = paymentRepository.findByBillingId(billing.getId()).stream()
                        .mapToDouble(p -> p.getAmount()).sum();
            }
        }

        return totalBill - totalPayment;
    }

    public Map<String, Object> getPendingBillInfo() {
        Map<String, Object> billInfo = new HashMap<>();
        billInfo.put("billId", this.id);
        billInfo.put("billDate", this.billDate);
        if (patientId != null) {
            billInfo.put("patientName", patientRepository.getById(patientId).getFirstName() + " "
                    + patientRepository.getById(patientId).getLastName());
        }

        billInfo.put("totalAmount", this.totalAmount);
        double pendingAmount = calculatePendingAmount();
        billInfo.put("pendingAmount", pendingAmount);
        billInfo.put("isPending", pendingAmount > 0);
        return billInfo;
    }

    public String generateBillHtml() {
        double totalBill = 0;
        double totalPayment = 0;
        LocalDateTime now = LocalDateTime.now();

        StringBuilder billHtml = new StringBuilder();
        billHtml.append("<!DOCTYPE html>");
        billHtml.append("<html lang=\"en\">");
        billHtml.append("<head>");
        billHtml.append("<meta charset=\"UTF-8\">");
        billHtml.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        billHtml.append("<title>Patient Bill</title>");

        billHtml.append("<style>");
        billHtml.append(
                "body { font-family: 'Arial', sans-serif; background-color: #fff; color: #333; margin: 20px; }");
        billHtml.append(
                ".bill-container { width: 80%; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px; background-color: #fff; }");
        billHtml.append("h2 { text-align:center; color: #333; margin-bottom: 20px; }");
        billHtml.append(".bill-header { display: flex; justify-content: space-between; margin-bottom: 15px; }");
        billHtml.append(".bill-header p { color: #555; }");
        billHtml.append("hr { border-top: 1px solid #ddd; margin-bottom: 20px; }");
        billHtml.append("h3 { color: #333; margin-bottom: 15px; }");
        billHtml.append("ul { list-style: none; padding: 0; }");
        billHtml.append(
                "li { padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center; }");
        billHtml.append("li span { display: block; }");
        billHtml.append("li span:first-child { flex-grow: 1; }");
        billHtml.append(
                "li span:last-child { font-weight: bold; color: #007bff; text-align: right; min-width: 80px; }");
        billHtml.append(".payment span:last-child { color: #28a745; }");
        billHtml.append(".total { font-size: 1.1em; color: #333; margin-top: 20px; font-weight:bold; }");
        billHtml.append(".balance-due { font-size: 1.2em; font-weight: bold; color: #333; }");
        billHtml.append(".paid-message { font-size: 1.2em; font-weight: bold; color: green; }");
        billHtml.append("</style>");
        billHtml.append("</head>");
        billHtml.append("<body>");
        billHtml.append("<div class=\"bill-container\">");
        billHtml.append("<h2 style=\"text-align:center; color: #333; margin-bottom: 20px;\">Bill</h2>");
        billHtml.append("<div class=\"bill-header\">");
        billHtml.append("<p style=\"color: #555;\"><strong>Bill Date:</strong> " + billDate + "</p>");
        billHtml.append("<p style=\"color: #555;\"><strong>Patient Name:</strong> "
                + patientRepository.getById(patientId).getFirstName() + " "
                + patientRepository.getById(patientId).getLastName() + "</p>");
        billHtml.append("</div>");
        billHtml.append("<hr style=\"border-top: 1px solid #ddd; margin-bottom: 20px;\"/>");

        // Admission Section
        billHtml.append("<h3 style=\"color: #333; margin-bottom: 15px;\">Admission</h3>");
        billHtml.append("<ul style=\"list-style: none; padding: 0;\">");
        double admissionCost = 0;
        if (patientId != null) {
            List<Admission> admissions = admissionRepository.findByPatientId(patientId);
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
                        String daysLeftText = "";
                        if (dischargeTime == null || dischargeTime.isAfter(billDate)) {

                            days = Math.round(Duration.between(admissionTime, billDate).toDays());
                            days = days <= 0 ? 1 : days;
                            admissionCost = days * admissionTypePrice;
                            if (dischargeTime != null) {
                                long daysLeft = Math.round(Duration.between(now, dischargeTime).toDays());

                                daysLeftText = " (" + daysLeft + " days left)";

                            }
                            billHtml.append(
                                    "<li style=\"padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center;\">");
                            billHtml.append("<span>" + admissionTypeName + " Stay (" + days + " days)" + daysLeftText
                                    + "</span>");
                            billHtml.append("<span style=\"font-weight: bold; color: #007bff;\">$"
                                    + String.format("%.2f", admissionCost) + "</span>");
                            billHtml.append("</li>");
                            totalBill += admissionCost;

                        } else if (dischargeTime != null && dischargeTime.isBefore(this.billDate)) {
                            // Free the bed if the admission is completed (discharge date is in the past).
                            if (admission.getBed() != null) {
                                Bed bed = bedRepository.findById(admission.getBed().getId()).orElse(null);
                                if (bed != null && bed.isOccupied()) {
                                    bed.setOccupied(false);
                                    bedRepository.save(bed);
                                    // Set the bedId in the admission record to null
                                    admission.setBed(null);
                                    admissionRepository.save(admission);
                                }
                            }
                        }
                    }
                }
            }
        }
        billHtml.append("</ul>");

        // Procedure Logs Section
        billHtml.append("<h3 style=\"color: #333; margin-bottom: 15px;\">Procedures</h3>");
        billHtml.append("<ul style=\"list-style: none; padding: 0;\">");
        if (procedureLogIds != null && !procedureLogIds.isEmpty()) {
            Map<Long, Long> procedureCountMap = procedureLogIds.stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

            List<ProcedureLog> procedureLogs = procedureLogRepository.findAllById(procedureLogIds);

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

                    billHtml.append(
                            "<li style=\"padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center;\">");
                    billHtml.append("<span>" + log.getProcedure().getName() + " (" + count + " time"
                            + (count > 1 ? "s" : "") + ")</span>");
                    billHtml.append("<span style=\"font-weight: bold; color: #007bff;\">$"
                            + String.format("%.2f", totalPriceForProcedure) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForProcedure;
                }
            }
        }
        billHtml.append("</ul>");

        // Patient Product Usages Section
        billHtml.append("<h3 style=\"color: #333; margin-bottom: 15px;\">Product Usages</h3>");
        billHtml.append("<ul style=\"list-style: none; padding: 0;\">");
        if (patientProductUsageIds != null && !patientProductUsageIds.isEmpty()) {

            List<PatientProductUsage> patientProductUsages = patientProductUsageRepository
                    .findAllById(patientProductUsageIds);
            for (PatientProductUsage usage : patientProductUsages) {
                if (usage != null && usage.getProduct() != null) {
                    BigDecimal usagePrice = usage.getPrice();
                    BigDecimal quantity = usage.getQuantity() != null ? usage.getQuantity() : BigDecimal.ONE;
                    double totalPriceForUsage = usagePrice.multiply(quantity).doubleValue();

                    billHtml.append(
                            "<li style=\"padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center;\">");
                    billHtml.append("<span>" + usage.getProduct().getName() + " (" + quantity
                            + (quantity.compareTo(BigDecimal.ONE) > 0 ? " unit" + "s" : " unit") + ")</span>");
                    billHtml.append("<span style=\"font-weight: bold; color: #007bff;\">$"
                            + String.format("%.2f", totalPriceForUsage) + "</span>");
                    billHtml.append("</li>");

                    totalBill += totalPriceForUsage;
                }
            }

        }
        billHtml.append("</ul>");

        // Lab Results Section
        billHtml.append("<h3 style=\"color: #333; margin-bottom: 15px;\">Lab Results</h3>");
        billHtml.append("<ul style=\"list-style: none; padding: 0;\">");
        if (labResultIds != null && !labResultIds.isEmpty()) {
            Map<Long, Long> labResultCountMap = labResultIds.stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

            List<LabResult> labResults = labResultRepository.findAllById(labResultIds);

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

                    billHtml.append(
                            "<li style=\"padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center;\">");
                    billHtml.append("<span>" + result.getLabTest().getTestName() + " (" + count + " time"
                            + (count > 1 ? "s" : "") + ")</span>");
                    billHtml.append("<span style=\"font-weight: bold; color: #007bff;\">$"
                            + String.format("%.2f", totalPriceForLabTest) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForLabTest;
                }
            }
        }
        billHtml.append("</ul>");

        // Image Reports Section
        billHtml.append("<h3 style=\"color: #333; margin-bottom: 15px;\">Image Reports</h3>");
        billHtml.append("<ul style=\"list-style: none; padding: 0;\">");
        if (imageReportIds != null && !imageReportIds.isEmpty()) {
            Map<Long, Long> imageReportCountMap = imageReportIds.stream()
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
            List<ImageReport> imageReports = imageReportRepository.findAllById(imageReportIds);

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
                    billHtml.append(
                            "<li style=\"padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center;\">");
                    billHtml.append("<span>" + report.getImageReportType().getName() + " (" + count + " time"
                            + (count > 1 ? "s" : "") + ")</span>");
                    billHtml.append("<span style=\"font-weight: bold; color: #007bff;\">$"
                            + String.format("%.2f", totalPriceForImageReport) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForImageReport;
                }
            }
        }
        billHtml.append("</ul>");

        // Medication Administrations Section
        billHtml.append("<h3 style=\"color: #333; margin-bottom: 15px;\">Medication Administrations</h3>");
        billHtml.append("<ul style=\"list-style: none; padding: 0;\">");
        if (medicationAdministrationIds != null && !medicationAdministrationIds.isEmpty()) {
            List<MedicationAdministration> medicationAdministrations = medicationAdministrationRepository
                    .findAllById(medicationAdministrationIds);
            for (MedicationAdministration administration : medicationAdministrations) {
                if (administration != null && administration.getPrescribedMedication() != null) {
                    BigDecimal calculatedPrice = administration.getCalculatedPrice();
                    double totalPriceForMedication = calculatedPrice.doubleValue();
                    billHtml.append(
                            "<li style=\"padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center;\">");
                    billHtml.append("<span>" + administration.getPrescribedMedication().getMedication().getName() + " ("
                            + String.format("%.2f", administration.getAmount()) + " units)</span>");
                    billHtml.append("<span style=\"font-weight: bold; color: #007bff;\">$"
                            + String.format("%.2f", totalPriceForMedication) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForMedication;
                }
            }
        }
        billHtml.append("</ul>");
        billHtml.append("<hr style=\"border-top: 1px solid #ddd; margin-bottom: 20px;\"/>");

        billHtml.append("<p class=\"total\"><strong>Total Before Payment:</strong>  $"
                + String.format("%.2f", totalBill) + "</p>");

        // Add Payments
        if (paymentIds != null && !paymentIds.isEmpty()) {
            List<Payment> payments = paymentRepository.findAllById(paymentIds);
            billHtml.append("<h3 style=\"color: #333; margin-bottom: 15px;\">Payments</h3>");
            billHtml.append("<ul style=\"list-style: none; padding: 0;\">");
            for (Payment payment : payments) {
                billHtml.append(
                        "<li class=\"payment\" style=\"padding: 10px 0; border-bottom: 1px dotted #eee; display: flex; justify-content: space-between; align-items: center;\">");
                billHtml.append("<span>Payment </span>");
                billHtml.append("<span style=\"font-weight: bold; color: #28a745;\">-$"
                        + String.format("%.2f", payment.getAmount()) + "</span>");
                billHtml.append("</li>");
                totalPayment += payment.getAmount();
            }

            billHtml.append("</ul>");
            billHtml.append("<hr style=\"border-top: 1px solid #ddd; margin-bottom: 20px;\"/>");
            billHtml.append("<p class=\"total\"><strong>Total Payment:</strong>  $"
                    + String.format("%.2f", totalPayment) + "</p>");
        }

        double balance = totalBill - totalPayment;

        if (balance > 0) {
            billHtml.append(
                    "<p class=\"balance-due\"><strong>Balance Due:</strong> $"
                            + String.format("%.2f", balance) + "</p>");

        } else {
            billHtml.append(
                    "<p class=\"paid-message\"><strong>this bill has been paid</strong>"
                            + "</p>");

        }

        billHtml.append("</div>");
        billHtml.append("</body>");
        billHtml.append("</html>");
        return billHtml.toString();
    }
}