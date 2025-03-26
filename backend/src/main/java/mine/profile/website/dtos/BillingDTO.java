//BillingDTO.java
package mine.profile.website.dtos;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
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
    private String paidBillHtml; // Add the paidBillHtml field
    private LocalDateTime paidDate;

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
        billing.setPaidBillHtml(this.paidBillHtml); // Set the HTML
        billing.setPaidDate(this.paidDate);

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
        billingDTO.setPaidBillHtml(billing.getPaidBillHtml()); // Populate the DTO field
        billingDTO.setPaidDate(billing.getPaidDate());
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
        if (billingDTO.isPaid()) {
            billingDTO.setBill(billingDTO.getPaidBillHtml()); // Use stored HTML if paid

        } else {
            billingDTO.setBill(billingDTO.generateBillHtml()); // Otherwise, generate dynamically

        }

        return billingDTO;
    }

    public double calculatePendingAmount() {
        double totalBill = 0;
        double totalPayment = 0;
        if (isPaid() == true) {
            return 0;
        }
        // --- Admission Calculation ---
        if (patientId != null) {
            List<Admission> admissions = admissionRepository.findByPatientId(patientId);
            if (admissions != null && !admissions.isEmpty()) {
                // Find the latest admission *before* the bill date
                Admission relevantAdmission = admissions.stream()
                        .filter(admission -> admission.getAdmissionDate().isBefore(this.billDate))
                        .max(Comparator.comparing(Admission::getAdmissionDate))
                        .orElse(null); // Handle the case where no admission exists before the bill date

                if (relevantAdmission != null) {
                    LocalDateTime admissionTime = relevantAdmission.getAdmissionDate();
                    double admissionTypePrice = relevantAdmission.getAdmissionType() != null
                            ? relevantAdmission.getAdmissionType().getPrice()
                            : 0;

                    // Calculate days up to the billDate, but only if the bill date is within the
                    // admission.
                    LocalDateTime endTime = this.billDate;
                    if (relevantAdmission.getDischargeDate() != null
                            && relevantAdmission.getDischargeDate().isBefore(endTime)) {
                        endTime = relevantAdmission.getDischargeDate(); // Use discharge date if it's before the bill
                                                                        // date
                    }

                    long days = Duration.between(admissionTime, endTime).toDays();
                    days = days == 0 ? 1 : days; // Always at least one day.
                    totalBill += days * admissionTypePrice;
                }
            }
        }

        // --- (Rest of the calculatePendingAmount method remains the same) ---
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

                    totalBill += usagePrice.doubleValue(); // CORRECT - usage.getPrice() is already the total
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

    private String getStyles() {
        return ":root{" +
                "--font-primary: 'Crimson Pro', 'Cormorant', 'Garamond Premier Pro', Georgia, serif;" +
                "--font-headers: 'Americana Std', 'Orpheus Pro', 'Vendetta', 'Times New Roman', serif;" +
                "--font-secondary: 'Acumin Pro', 'Source Sans Pro', system-ui, sans-serif;" +
                "--font-mono: 'Pitch Sans', 'Input Mono', 'IBM Plex Mono', monospace;" +
                "--color-primary: #2c3e50;" +
                "--color-secondary: #34495e;" +
                "--color-accent: #3498db;" +
                "--color-subtle: #bdc3c7;" +
                "--text-color: #2c3e50;" +
                "--text-muted: #7f8c8d;" +
                "--border-color: #ecf0f1;" +
                "--table-border-color: #dfe6e9;" +
                "--text-xs: 0.75rem;" +
                "--text-sm: 0.875rem;" +
                "--text-base: 1rem;" +
                "--text-lg: 1.125rem;" +
                "--text-xl: 1.375rem;" +
                "--text-2xl: 1.75rem;" +
                "--text-3xl: 2rem;" +
                "--spacing-xs: 0.25rem;" +
                "--spacing-sm: 0.5rem;" +
                "--spacing-md: 0.75rem;" +
                "--spacing-lg: 1rem;" +
                "--spacing-xl: 1.5rem;" +
                "}" +
                "html{font-size:11pt;line-height:1.5;-webkit-text-size-adjust:100%;}" +
                "body{margin:0;font-family:var(--font-primary);color:var(--text-color);background:#fff;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}"
                +
                "h1,h2,h3,h4,h5,h6{font-family:var(--font-headers);line-height:1.2;color:var(--color-primary);margin:0 0 var(--spacing-sm) 0;page-break-after:avoid;font-weight:600;}"
                +
                "h1{font-size:var(--text-3xl); letter-spacing:-0.02em;color:var(--color-primary);border-bottom:2pt solid var(--color-accent);padding-bottom:var(--spacing-xs);}"
                +
                "h2{font-size:var(--text-2xl); color:var(--color-secondary);}" +
                "h3{font-size:var(--text-xl); border-bottom:1pt solid var(--color-subtle);}" +
                ".assessment-container{max-width:100%;margin:0;padding:var(--spacing-lg);position:relative;background-color:#fff;}"
                +
                ".assessment-header{border-bottom:3pt double var(--color-primary);margin-bottom:var(--spacing-lg);padding-bottom:var(--spacing-sm);position:relative;}"
                +
                ".assessment-header::after{content:'';position:absolute;bottom:3pt;left:0;right:0;border-bottom:1pt solid var(--color-accent);margin-bottom:3pt;}"
                +
                ".assessment-title{font-family:var(--font-headers);font-size:var(--text-3xl);font-weight:700;color:var(--color-primary);margin:0;letter-spacing:-0.01em;}"
                +
                ".institution-seal{position:absolute;top:var(--spacing-md);right:var(--spacing-md);width:80px;height:80px;opacity:0.85;}"
                +
                ".section{margin:var(--spacing-sm) 0;break-inside:avoid;position:relative;}" +
                ".section-title{font-family:var(--font-headers);font-size:var(--text-xl);font-weight:600;color:var(--color-secondary);margin-bottom:var(--spacing-sm);padding-bottom:var(--spacing-xs);border-bottom:1pt solid var(--color-accent);}"
                +
                "table{width:100%;border-collapse:collapse;margin:var(--spacing-sm) 0;font-size:var(--text-sm);break-inside:avoid;border:1pt solid var(--table-border-color);}"
                +
                "thead{background-color:var(--color-primary);border-bottom:2pt solid var(--color-accent);}" +
                "th{font-family:var(--font-headers);font-weight:600;text-align:left;padding:var(--spacing-xs) var(--spacing-sm);color:white;border-bottom:1pt solid var(--table-border-color);}"
                +
                "td{padding:var(--spacing-xs) var(--spacing-sm);border-bottom:1pt solid var(--table-border-color);vertical-align:top;}"
                +
                "tbody tr:last-child td{border-bottom:none;}" +
                "@media print{" +
                "@page{margin:1.5cm;size:A4;}" +
                "body{min-width:992px !important;}" +
                "*{-webkit-print-color-adjust:exact !important;color-adjust:exact !important;}" +
                "a{color:var(--color-primary);text-decoration:none;font-weight:500;}" +
                "a[href^=\"http\"]::after{content:\" (\" attr(href) \")\";font-size:90%;color:var(--text-muted);font-style:italic;}"
                +
                "h1,h2,h3,h4,h5,h6,img,table{page-break-inside:avoid;page-break-after:avoid;}" +
                ".section{page-break-inside:avoid;}" +
                "@page{@bottom-right{content:counter(page);font-family:var(--font-primary);font-size:var(--text-sm);}}}"
                +
                ".text-center{text-align:center;}" +
                ".text-right{text-align:right;}" +
                ".font-bold{font-weight:600;}" +
                ".text-muted{color:var(--text-muted);}" +
                ".monospace{font-family:var(--font-mono);}" +
                ".watermark{position:fixed; opacity:0.03; transform:rotate(-45deg); font-size:4rem; color: var(--color-primary); pointer-events: none;}"
                + // Corrected placement
                ".signature-block {margin-top: var(--spacing-lg);border-top: 1pt solid var(--border-color);padding-top: var(--spacing-md);display: grid;grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));gap: var(--spacing-lg);}"
                +
                ".signature-line {border-top: 1pt solid var(--text-color);margin-top: var(--spacing-xs);margin-bottom: var(--spacing-xs);}"
                +

                // Bill-specific styles, adapted for the new theme
                ".bill-container { width: 95%; max-width: 800px; margin: var(--spacing-xl) auto; border: 1pt solid var(--border-color); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: var(--spacing-lg); background-color: #fff; }"
                +
                ".bill-header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-lg); flex-wrap: wrap; }"
                + // Allow wrapping
                ".bill-header p { color: var(--text-muted); margin: var(--spacing-xs) 0; }" +
                ".bill-header p strong { color: var(--color-primary); }" +
                "hr { border-top: 1pt solid var(--border-color); margin-bottom: var(--spacing-lg); }" +
                "h3 { color: var(--color-secondary); margin-bottom: var(--spacing-md); font-size: var(--text-lg); }" +
                "ul { list-style: none; padding: 0; }" +
                "li { padding: var(--spacing-xs) 0; border-bottom: 1pt dotted var(--border-color); display: flex; justify-content: space-between; align-items: center; }"
                +
                "li span { display: block; }" +
                "li span:first-child { flex-grow: 1; color: var(--text-color); }" +
                "li span:last-child { font-weight: 600; color: var(--color-accent); text-align: right; min-width: 80px; }"
                +
                ".payment span:last-child { color: #28a745; /* Keep green for payments */ }" +
                ".total { font-size: var(--text-base); color: var(--color-primary); margin-top: var(--spacing-md); font-weight: 600; }"
                +
                ".balance-due { font-size: var(--text-lg); font-weight: 700; color: var(--color-primary); }" +
                ".paid-message { font-size: var(--text-lg); font-weight: 700; color: green; }"

        ;
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
        billHtml.append("<style>").append(getStyles()).append("</style>"); // Use getStyles()
        billHtml.append("</head>");
        billHtml.append("<body>");
        billHtml.append("<div class=\"bill-container\">");
        billHtml.append("<h2 class=\"assessment-title\">Bill</h2>"); // Use assessment-title class
        billHtml.append("<div class=\"bill-header\">");
        billHtml.append("<p><strong>Bill Date:</strong> " + billDate + "</p>");
        billHtml.append("<p><strong>Patient Name:</strong> "
                + patientRepository.getById(patientId).getFirstName() + " "
                + patientRepository.getById(patientId).getLastName() + "</p>");
        billHtml.append("</div>");
        billHtml.append("<hr/>");

        // Admission Section
        billHtml.append("<h3 class=\"section-title\">Admission</h3>");
        billHtml.append("<ul>");
        if (patientId != null) {
            List<Admission> admissions = admissionRepository.findByPatientId(patientId);
            if (admissions != null && !admissions.isEmpty()) {
                // Find the latest admission *before* the bill date
                Admission relevantAdmission = admissions.stream()
                        .filter(admission -> admission.getAdmissionDate().isBefore(this.billDate))
                        .max(Comparator.comparing(Admission::getAdmissionDate))
                        .orElse(null);

                if (relevantAdmission != null) {
                    LocalDateTime admissionTime = relevantAdmission.getAdmissionDate();
                    double admissionTypePrice = relevantAdmission.getAdmissionType() != null
                            ? relevantAdmission.getAdmissionType().getPrice()
                            : 0;
                    String admissionTypeName = relevantAdmission.getAdmissionType() != null
                            ? relevantAdmission.getAdmissionType().getName()
                            : "Unknown";

                    // Calculate days up to the billDate, but only if the bill date is within the
                    // admission.
                    LocalDateTime endTime = this.billDate;
                    if (relevantAdmission.getDischargeDate() != null
                            && relevantAdmission.getDischargeDate().isBefore(endTime)) {
                        endTime = relevantAdmission.getDischargeDate(); // Use discharge date if it's before bill date
                    }

                    long days = Duration.between(admissionTime, endTime).toDays();
                    days = days <= 0 ? 1 : days; // Ensure at least 1 day.
                    double admissionCost = days * admissionTypePrice;

                    // Remove days left.
                    billHtml.append("<li>");
                    billHtml.append(
                            "<span>" + admissionTypeName + " Stay (" + days + " days)" + "</span>");
                    billHtml.append("<span>$" + String.format("%.2f", admissionCost) + "</span>");
                    billHtml.append("</li>");
                    totalBill += admissionCost;

                }
            }
        }
        billHtml.append("</ul>");

        // --- (Rest of the generateBillHtml method remains largely the same, except
        // where noted below) ---
        // Procedure Logs Section
        billHtml.append("<h3 class=\"section-title\">Procedures</h3>"); // Use section-title
        billHtml.append("<ul>");
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

                    billHtml.append("<li>");
                    billHtml.append("<span>" + log.getProcedure().getName() + " (" + count + " time"
                            + (count > 1 ? "s" : "") + ")</span>");
                    billHtml.append("<span>$" + String.format("%.2f", totalPriceForProcedure) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForProcedure;
                }
            }
        }
        billHtml.append("</ul>");

        // Patient Product Usages Section
        billHtml.append("<h3 class=\"section-title\">Product Usages</h3>"); // Use section-title
        billHtml.append("<ul>");
        if (patientProductUsageIds != null && !patientProductUsageIds.isEmpty()) {

            List<PatientProductUsage> patientProductUsages = patientProductUsageRepository
                    .findAllById(patientProductUsageIds);
            for (PatientProductUsage usage : patientProductUsages) {
                if (usage != null && usage.getProduct() != null) {
                    BigDecimal usagePrice = usage.getPrice();
                    BigDecimal quantity = usage.getQuantity() != null ? usage.getQuantity() : BigDecimal.ONE;
                    // double totalPriceForUsage = usagePrice.multiply(quantity).doubleValue(); //
                    // INCORRECT - Double multiplication
                    double totalPriceForUsage = usagePrice.doubleValue(); // CORRECT - usage.getPrice() is already total

                    billHtml.append("<li>");
                    billHtml.append("<span>" + usage.getProduct().getName() + " (" + quantity
                            + (quantity.compareTo(BigDecimal.ONE) > 0 ? " unit" + "s" : " unit") + ")</span>");
                    billHtml.append("<span>$" + String.format("%.2f", totalPriceForUsage) + "</span>");
                    billHtml.append("</li>");

                    totalBill += totalPriceForUsage;
                }
            }

        }
        billHtml.append("</ul>");

        // Lab Results Section
        billHtml.append("<h3 class=\"section-title\">Lab Results</h3>"); // Use section-title
        billHtml.append("<ul>");
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

                    billHtml.append("<li>");
                    billHtml.append("<span>" + result.getLabTest().getTestName() + " (" + count + " time"
                            + (count > 1 ? "s" : "") + ")</span>");
                    billHtml.append("<span>$" + String.format("%.2f", totalPriceForLabTest) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForLabTest;
                }
            }
        }
        billHtml.append("</ul>");

        // Image Reports Section
        billHtml.append("<h3 class=\"section-title\">Image Reports</h3>"); // Use section-title
        billHtml.append("<ul>");
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
                    billHtml.append("<li>");
                    billHtml.append("<span>" + report.getImageReportType().getName() + " (" + count + " time"
                            + (count > 1 ? "s" : "") + ")</span>");
                    billHtml.append("<span>$" + String.format("%.2f", totalPriceForImageReport) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForImageReport;
                }
            }
        }
        billHtml.append("</ul>");

        // Medication Administrations Section
        billHtml.append("<h3 class=\"section-title\">Medication Administrations</h3>"); // Use section-title
        billHtml.append("<ul>");
        if (medicationAdministrationIds != null && !medicationAdministrationIds.isEmpty()) {
            List<MedicationAdministration> medicationAdministrations = medicationAdministrationRepository
                    .findAllById(medicationAdministrationIds);
            for (MedicationAdministration administration : medicationAdministrations) {
                if (administration != null && administration.getPrescribedMedication() != null) {
                    BigDecimal calculatedPrice = administration.getCalculatedPrice();
                    double totalPriceForMedication = calculatedPrice.doubleValue();
                    billHtml.append("<li>");
                    billHtml.append("<span>" + administration.getPrescribedMedication().getMedication().getName() + " ("
                            + String.format("%.2f", administration.getAmount()) + " units)</span>");
                    billHtml.append("<span>$" + String.format("%.2f", totalPriceForMedication) + "</span>");
                    billHtml.append("</li>");
                    totalBill += totalPriceForMedication;
                }
            }
        }
        billHtml.append("</ul>");
        billHtml.append("<hr/>");

        billHtml.append("<p class=\"total\"><strong>Total Before Payment:</strong>  $"
                + String.format("%.2f", totalBill) + "</p>");

        // Add Payments
        if (paymentIds != null && !paymentIds.isEmpty()) {
            List<Payment> payments = paymentRepository.findAllById(paymentIds);
            billHtml.append("<h3 class=\"section-title\">Payments</h3>"); // Use section-title
            billHtml.append("<ul>");
            for (Payment payment : payments) {
                billHtml.append("<li class=\"payment\">");
                billHtml.append("<span>Payment </span>");
                billHtml.append("<span>-$" + String.format("%.2f", payment.getAmount()) + "</span>");
                billHtml.append("</li>");
                totalPayment += payment.getAmount();
            }

            billHtml.append("</ul>");
            billHtml.append("<hr/>");
            billHtml.append("<p class=\"total\"><strong>Total Payment:</strong>  $"
                    + String.format("%.2f", totalPayment) + "</p>");
        }

        double balance = totalBill - totalPayment;

        if (balance > 0) {
            billHtml.append("<p class=\"balance-due\"><strong>Balance Due:</strong> $"
                    + String.format("%.2f", balance) + "</p>");

        } else {
            billHtml.append("<p class=\"paid-message\"><strong>This bill has been paid</strong></p>");

        }

        billHtml.append("</div>"); // Close bill-container
        billHtml.append("</body>");
        billHtml.append("</html>");
        return billHtml.toString();
    }

    public String getBill() {
        // Return stored HTML if available, otherwise generate dynamically
        return this.isPaid ? this.paidBillHtml : generateBillHtml();
    }
}