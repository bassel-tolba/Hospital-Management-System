package mine.profile.website.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Billing;
import mine.profile.website.models.ImageReport;
import mine.profile.website.models.LabResult;
import mine.profile.website.models.MedicationAdministration;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PatientProductUsage;
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
public class BillingService {

    private final BillingRepository billingRepository;
    private final PatientRepository patientRepository;
    private final EntityMapper entityMapper;
    private final ProcedureLogService procedureLogService;
    private final PaymentRepository paymentRepository;
    private final ProcedureLogRepository procedureLogRepository;
    private final PatientProductUsageRepository patientProductUsageRepository;
    private final LabResultRepository labResultRepository;
    private final ImageReportRepository imageReportRepository;
    private final ProductRepository productRepository;
    private final ProcedureRepository procedureRepository;
    private final AdmissionRepository admissionRepository;
    private final MedicationAdministrationRepository medicationAdministrationRepository;
    private final BedRepository bedRepository;

    public BillingService(BillingRepository billingRepository, PatientRepository patientRepository,
            EntityMapper entityMapper, ProcedureLogService procedureLogService,
            PaymentRepository paymentRepository,
            ProcedureLogRepository procedureLogRepository,
            PatientProductUsageRepository patientProductUsageRepository,
            LabResultRepository labResultRepository,
            ImageReportRepository imageReportRepository, ProductRepository productRepository,
            ProcedureRepository procedureRepository, AdmissionRepository admissionRepository,
            MedicationAdministrationRepository medicationAdministrationRepository, BedRepository bedRepository) {
        this.billingRepository = billingRepository;
        this.patientRepository = patientRepository;
        this.entityMapper = entityMapper;
        this.procedureLogService = procedureLogService;
        this.paymentRepository = paymentRepository;
        this.procedureLogRepository = procedureLogRepository;
        this.patientProductUsageRepository = patientProductUsageRepository;
        this.labResultRepository = labResultRepository;
        this.imageReportRepository = imageReportRepository;
        this.productRepository = productRepository;
        this.procedureRepository = procedureRepository;
        this.admissionRepository = admissionRepository;
        this.medicationAdministrationRepository = medicationAdministrationRepository;
        this.bedRepository = bedRepository;
    }

    @Transactional
    public BillingDTO createBilling(BillingDTO billingDTO) {
        Patient patient = patientRepository.findById(billingDTO.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + billingDTO.getPatientId()));

        Billing billing = entityMapper.toEntity(billingDTO, patient);
        billing.setBillDate(LocalDateTime.now());
        Billing savedBilling = billingRepository.save(billing);
        BillingDTO billingDto = updateBillingTotal(savedBilling.getId());
        billingDto.setBill(billingDto.generateBillHtml()); // Generate bill after updating total

        return billingDto;
    }

    @Transactional
    public BillingDTO findById(Long id) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Billing ID: " + id));
        BillingDTO billingDTO = BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                bedRepository);
        billingDTO.setBill(billingDTO.generateBillHtml());
        return billingDTO;
    }

    @Transactional
    public BillingDTO updateBillingTotal(Long billingId) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Billing ID: " + billingId));

        double totalBill = 0;
        final double ADMISSION_DAY_PRICE = 100.00;

        if (billing.getPatient() != null) {
            List<Admission> admissions = admissionRepository.findByPatientId(billing.getPatient().getId());
            if (admissions != null && !admissions.isEmpty()) {
                for (Admission admission : admissions) {
                    if (admission.getAdmissionDate() != null) {
                        if (admission.getDischargeDate() == null
                                || admission.getDischargeDate().isAfter(billing.getBillDate())) {
                            LocalDateTime admissionTime = admission.getAdmissionDate();
                            LocalDateTime currentTime = billing.getBillDate();
                            long days = Duration.between(admissionTime, currentTime).toDays();
                            days = days == 0 ? 1 : days; // always at least one day.
                            totalBill += days * ADMISSION_DAY_PRICE;
                        }
                    }
                }
            }
        }

        if (billing.getProcedureLogs() != null && !billing.getProcedureLogs().isEmpty()) {
            Map<Long, Long> procedureCountMap = billing.getProcedureLogs().stream().map(log -> log.getId())
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

            List<ProcedureLog> procedureLogs = procedureLogRepository.findAllById(
                    billing.getProcedureLogs().stream().map(log -> log.getId()).collect(Collectors.toList()));

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
                    totalBill += totalPriceForProcedure;

                }
            }
        }
        if (billing.getPatientProductUsages() != null && !billing.getPatientProductUsages().isEmpty()) {
            List<PatientProductUsage> patientProductUsages = patientProductUsageRepository
                    .findAllById(
                            billing.getPatientProductUsages().stream().map(usage -> usage.getId())
                                    .collect(Collectors.toList()));
            for (PatientProductUsage usage : patientProductUsages) {
                if (usage != null && usage.getProduct() != null) {
                    BigDecimal usagePrice = usage.getPrice();
                    BigDecimal quantity = usage.getQuantity() != null ? usage.getQuantity() : BigDecimal.ONE;
                    double totalPriceForUsage = usagePrice.multiply(quantity).doubleValue();

                    totalBill += totalPriceForUsage;
                }
            }

        }

        if (billing.getLabResults() != null && !billing.getLabResults().isEmpty()) {

            Map<Long, Long> labResultCountMap = billing.getLabResults().stream().map(result -> result.getId())
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
            List<LabResult> labResults = labResultRepository.findAllById(
                    billing.getLabResults().stream().map(result -> result.getId()).collect(Collectors.toList()));

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
                    totalBill += totalPriceForLabTest;
                }
            }
        }

        if (billing.getImageReports() != null && !billing.getImageReports().isEmpty()) {
            Map<Long, Long> imageReportCountMap = billing.getImageReports().stream().map(report -> report.getId())
                    .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
            List<ImageReport> imageReports = imageReportRepository.findAllById(
                    billing.getImageReports().stream().map(report -> report.getId()).collect(Collectors.toList()));

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
                    totalBill += totalPriceForImageReport;

                }
            }
        }
        if (billing.getMedicationAdministrations() != null && !billing.getMedicationAdministrations().isEmpty()) {
            List<MedicationAdministration> medicationAdministrations = medicationAdministrationRepository
                    .findAllById(
                            billing.getMedicationAdministrations().stream().map(report -> report.getId())
                                    .collect(Collectors.toList()));
            for (MedicationAdministration administration : medicationAdministrations) {
                if (administration != null && administration.getPrescribedMedication() != null) {
                    BigDecimal calculatedPrice = administration.getCalculatedPrice();
                    double totalPriceForMedication = calculatedPrice.doubleValue();
                    totalBill += totalPriceForMedication;
                }
            }
        }

        billing.setTotalAmount(totalBill);
        Billing savedBilling = billingRepository.save(billing);
        BillingDTO billingDTO = BillingDTO.toDto(savedBilling, paymentRepository, procedureLogRepository,
                patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                bedRepository);
        billingDTO.setBill(billingDTO.generateBillHtml()); // Generate bill after updating total

        return billingDTO;
    }

    @Transactional
    public void deleteById(Long id) {
        billingRepository.deleteById(id);
    }

    @Transactional
    public Page<BillingDTO> findByPatientId(Long patientId, Pageable pageable) {
        Page<Billing> billings = billingRepository.findByPatientId(patientId,
                PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("billDate").descending()));
        List<BillingDTO> billingDTOs = billings.getContent().stream()
                .map(billing -> BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                        patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                        procedureRepository, admissionRepository, patientRepository,
                        medicationAdministrationRepository, bedRepository))
                .map(billingDto -> {
                    billingDto.setBill(billingDto.generateBillHtml());
                    return billingDto;
                })
                .collect(Collectors.toList());
        return new PageImpl<>(billingDTOs, pageable, billings.getTotalElements());

    }

    @Transactional
    public Page<BillingDTO> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("billDate").descending());
        Page<Billing> billings = billingRepository.findAll(pageable);
        List<BillingDTO> billingDTOs = billings.getContent().stream()
                .map(billing -> BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                        patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                        procedureRepository, admissionRepository, patientRepository,
                        medicationAdministrationRepository, bedRepository))
                .map(billingDto -> {
                    billingDto.setBill(billingDto.generateBillHtml());
                    return billingDto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(billingDTOs, pageable, billings.getTotalElements());
    }

    @Transactional
    public Page<BillingDTO> findAll(Pageable pageable) {
        // Ensure the Pageable has the correct sort order (descending by billDate)
        if (!pageable.getSort().isSorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by("billDate").descending());
        }
        Page<Billing> billings = billingRepository.findAll(pageable);
        List<BillingDTO> billingDTOs = billings.getContent().stream()
                .map(billing -> BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                        patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                        procedureRepository, admissionRepository, patientRepository,
                        medicationAdministrationRepository, bedRepository))
                .map(billingDto -> {
                    billingDto.setBill(billingDto.generateBillHtml());
                    return billingDto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(billingDTOs, pageable, billings.getTotalElements());
    }

    @Transactional
    public BillingDTO findActiveBillByPatientId(Long patientId) {
        Page<Billing> billings = billingRepository.findByPatientId(patientId,
                PageRequest.of(0, 1, Sort.by("billDate").descending()));
        if (billings != null && !billings.isEmpty()) {
            Billing billing = billings.getContent().get(0);
            BillingDTO billingDTO = BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                    patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                    procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                    bedRepository);
            billingDTO.setBill(billingDTO.generateBillHtml());
            return billingDTO;

        }
        return null;
    }
}