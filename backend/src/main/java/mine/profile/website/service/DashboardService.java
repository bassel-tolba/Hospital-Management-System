package mine.profile.website.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.formatter.DashboardDataFormatter;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Appointment;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Payment;
import mine.profile.website.models.ProcedureLog;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.AppointmentRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.ImageReportRepository;
import mine.profile.website.repository.LabResultRepository;
import mine.profile.website.repository.MedicationAdministrationRepository;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.repository.NurseActivityRepository;
import mine.profile.website.repository.PatientProductUsageRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PaymentRepository;
import mine.profile.website.repository.ProcedureLogRepository;
import mine.profile.website.repository.ProcedureRepository;
import mine.profile.website.repository.ProductRepository;
import mine.profile.website.repository.UserRepository;
import mine.profile.website.repository.VitalSignRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final PatientRepository patientRepository;
    private final AdmissionRepository admissionRepository;
    private final MedicationAdministrationRepository medicationAdministrationRepository;
    private final ProcedureLogRepository procedureLogRepository;
    private final AppointmentRepository appointmentRepository;
    private final VitalSignRepository vitalSignRepository;
    private final NurseActivityRepository nurseActivityRepository;
    private final LabResultRepository labResultRepository;
    private final BedRepository bedRepository;
    private final ProductRepository productRepository;
    private final MedicationRepository medicationRepository;
    private final PatientProductUsageRepository patientProductUsageRepository;
    private final UserRepository userRepository;
    private final BillingRepository billingRepository;
    private final PaymentRepository paymentRepository;
    private final ProcedureRepository procedureRepository;
    private final ImageReportRepository imageReportRepository;
    private final DashboardDataFormatter dashboardDataFormatter;

    private Map<String, Object> fetchPatientData() {
        Map<String, Object> patientData = new HashMap<>();
        try {
            patientData.put("totalPatients", patientRepository.countAllPatients());
            patientData.put("malePatients", patientRepository.countMalePatients());
            patientData.put("femalePatients", patientRepository.countFemalePatients());
            patientData.put("patientsByBloodType",
                    dashboardDataFormatter.formatBloodTypeData(patientRepository.countPatientsByBloodType()));
            patientData.put("patientsByBirthYear",
                    dashboardDataFormatter.formatBirthYearData(patientRepository.countPatientsByBirthYear()));
        } catch (Exception e) {
            log.error("Error fetching patient data ", e);
        }
        return patientData;
    }

    private Map<String, Object> fetchAdmissionData() {
        Map<String, Object> admissionData = new HashMap<>();
        try {
            admissionData.put("totalAdmissions", admissionRepository.countAllAdmissions());
            admissionData.put("currentAdmissions", admissionRepository.countCurrentAdmissions());
            admissionData.put("admissionsByDate",
                    dashboardDataFormatter.formatAdmissionsByDate(admissionRepository.countAdmissionsByDate()));
            admissionData.put("dischargesByDate",
                    dashboardDataFormatter.formatDischargesByDate(admissionRepository.countDischargesByDate()));
        } catch (Exception e) {
            log.error("Error fetching admission data", e);
        }
        return admissionData;
    }

    private Map<String, Object> fetchMedicationAdministrationData() {
        Map<String, Object> medicationAdministrationData = new HashMap<>();
        try {
            medicationAdministrationData.put("totalMedicationAdministrations",
                    medicationAdministrationRepository.countAllMedicationAdministrations());
            medicationAdministrationData.put("medicationAdministrationsByMedication",
                    dashboardDataFormatter.formatMedicationAdminData(
                            medicationAdministrationRepository.countMedicationAdministrationsByMedication()));
        } catch (Exception e) {
            log.error("Error fetching medication administration data", e);
        }
        return medicationAdministrationData;
    }

    private Map<String, Object> fetchProcedureLogData() {
        Map<String, Object> procedureLogData = new HashMap<>();
        try {
            procedureLogData.put("totalProcedureLogs", procedureLogRepository.countAllProcedureLogs());
            procedureLogData.put("procedureLogsByProcedure",
                    dashboardDataFormatter
                            .formatProcedureLogData(procedureLogRepository.countProcedureLogsByProcedure()));

            procedureLogData.put("proceduresByDate",
                    dashboardDataFormatter.formatProceduresByDate(procedureLogRepository.countProceduresByDate()));

            procedureLogData.put("detailedProceduresByDate", getDetailedProceduresByDate());

        } catch (Exception e) {
            log.error("Error fetching procedure log data", e);
        }

        return procedureLogData;
    }

    private Map<String, Map<String, Object>> getDetailedProceduresByDate() {
        Map<String, Map<String, Object>> detailedProceduresByDate = new HashMap<>();

        // Use the repository method to fetch all procedure logs
        List<ProcedureLog> allProcedureLogs = procedureLogRepository.findAll();

        allProcedureLogs.forEach(procedureLog -> {
            LocalDateTime procedureDate = procedureLog.getStartTime(); // Using start time for date
            if (procedureDate != null && procedureLog.getProcedure() != null) {
                String date = procedureDate.toLocalDate().toString();
                String procedureType = procedureLog.getProcedure().getName();
                detailedProceduresByDate.computeIfAbsent(date, k -> new HashMap<>())
                        .compute(procedureType, (k, v) -> {
                            if (v == null) {
                                return 1;
                            } else {
                                return (Integer) v + 1;
                            }
                        });
            }
        });
        // Find most frequent procedure and format the result
        Map<String, Map<String, Object>> formattedData = new HashMap<>();
        for (Map.Entry<String, Map<String, Object>> entry : detailedProceduresByDate.entrySet()) {
            String date = entry.getKey();
            Map<String, Object> procedureCounts = entry.getValue();

            String mostFrequentProcedure = procedureCounts.entrySet().stream()
                    .max((entry1, entry2) -> Integer.compare((Integer) entry1.getValue(), (Integer) entry2.getValue()))
                    .map(Map.Entry::getKey)
                    .orElse("No Procedures");

            formattedData.computeIfAbsent(date, k -> new HashMap<>())
                    .put("procedureCounts", procedureCounts);

            formattedData.computeIfAbsent(date, k -> new HashMap<>())
                    .put("mostFrequentProcedure", mostFrequentProcedure);
        }

        return formattedData;
    }

    private Map<String, Object> fetchAppointmentData() {
        Map<String, Object> appointmentData = new HashMap<>();
        try {
            appointmentData.put("totalAppointments", appointmentRepository.countAllAppointments());
            appointmentData.put("appointmentsByDate",
                    dashboardDataFormatter.formatAppointmentsByDate(appointmentRepository.countAppointmentsByDate()));
        } catch (Exception e) {
            log.error("Error fetching appointment data", e);
        }

        return appointmentData;
    }

    private Map<String, Object> fetchVitalSignData() {
        Map<String, Object> vitalSignData = new HashMap<>();
        try {
            vitalSignData.put("totalVitalSigns", vitalSignRepository.countAllVitalSigns());
        } catch (Exception e) {
            log.error("Error fetching vital sign data", e);
        }
        return vitalSignData;
    }

    private Map<String, Object> fetchLabResultData() {
        Map<String, Object> labResultData = new HashMap<>();
        try {
            labResultData.put("totalLabResults", labResultRepository.countAllLabResults());
            labResultData.put("labResultsByTest",
                    dashboardDataFormatter.formatLabResultData(labResultRepository.countLabResultsByTest()));
        } catch (Exception e) {
            log.error("Error fetching lab result data", e);
        }
        return labResultData;
    }

    private Map<String, Object> fetchBedData() {
        Map<String, Object> bedData = new HashMap<>();
        try {
            bedData.put("totalBeds", bedRepository.countAllBeds());
            bedData.put("occupiedBeds", bedRepository.countOccupiedBeds());
            bedData.put("bedsByUnitType",
                    dashboardDataFormatter.formatBedsByUnitType(bedRepository.countBedsByUnitType()));
            bedData.put("bedsByRoomNumber",
                    dashboardDataFormatter.formatBedsByRoomNumber(bedRepository.countBedsByRoomNumber()));
        } catch (Exception e) {
            log.error("Error fetching bed data", e);
        }
        return bedData;
    }

    private Map<String, Object> fetchProductUsageData() {
        Map<String, Object> productUsageData = new HashMap<>();
        try {
            productUsageData.put("productUsageByProduct",
                    dashboardDataFormatter.formatProductUsageData(productRepository.countProductUsageByProduct()));
        } catch (Exception e) {
            log.error("Error fetching product usage data", e);
        }
        return productUsageData;
    }

    private Map<String, Object> fetchMedicationPrescribedData() {
        Map<String, Object> medicationPrescribedData = new HashMap<>();
        try {
            medicationPrescribedData.put("medicationPrescribedByMedication",
                    dashboardDataFormatter.formatMedicationPrescribedData(
                            medicationRepository.countPrescribedMedicationByMedication()));
        } catch (Exception e) {
            log.error("Error fetching medication prescribed data", e);
        }
        return medicationPrescribedData;
    }

    private Map<String, Object> fetchPaymentData() {
        Map<String, Object> paymentData = new HashMap<>();
        try {
            paymentData.put("totalPaymentsToday", calculateTotalPaymentsForToday());
            paymentData.put("totalPaymentsThisWeek", calculateTotalPaymentsForWeek());
            paymentData.put("totalPaymentsThisMonth", calculateTotalPaymentsForMonth());
            paymentData.put("totalPaymentsThisYear", calculateTotalPaymentsForYear());

            paymentData.put("yearlyPayments", calculatePaymentsForAllYears());
            paymentData.put("dailyPaymentsLast30Days", calculatePaymentsForLast30Days());

        } catch (Exception e) {
            log.error("Error fetching payment data", e);
        }
        return paymentData;
    }

    private Map<String, Object> fetchManagerialData() {
        Map<String, Object> managerialData = new HashMap<>();
        try {
            // Calculate Average Length of Stay (ALOS) - excluding open discharges
            long totalAdmissionDays = admissionRepository.findAll().stream()
                    .filter(admission -> admission.getDischargeDate() != null)
                    .mapToLong(admission -> Duration.between(admission.getAdmissionDate(), admission.getDischargeDate())
                            .toDays())
                    .sum();

            long totalDischarges = admissionRepository.findAll().stream()
                    .filter(admission -> admission.getDischargeDate() != null)
                    .count();

            double averageLengthOfStay = totalDischarges > 0 ? (double) totalAdmissionDays / totalDischarges : 0;
            managerialData.put("averageLengthOfStay", averageLengthOfStay);

            // Calculate Bed Occupancy Rate
            long totalBeds = bedRepository.count();
            long occupiedBeds = bedRepository.countOccupiedBeds();
            double bedOccupancyRate = totalBeds > 0 ? (double) occupiedBeds / totalBeds : 0;
            managerialData.put("bedOccupancyRate", bedOccupancyRate);
            managerialData.put("averageTimeToSeeADoctor", getAverageTimeFromCheckinToAppointment());

            managerialData.put("totalRevenue", calculateTotalRevenue());
            managerialData.put("pendingBills", calculatePendingBills());
            managerialData.put("staffToPatientRatio", calculateStaffToPatientRatio());

            // Calculate total open admissions
            long openAdmissions = admissionRepository.findAll().stream()
                    .filter(admission -> admission.getDischargeDate() == null)
                    .count();
            managerialData.put("openAdmissions", openAdmissions);

        } catch (Exception e) {
            log.error("Error fetching managerial data", e);
        }
        return managerialData;
    }

    private Map<String, Map<String, Double>> calculatePaymentsForAllYears() {
        Map<String, Map<String, Double>> yearlyPayments = new HashMap<>();
        int currentYear = LocalDate.now().getYear();

        // Include up to six years ago
        for (int year = currentYear - 6; year <= currentYear; year++) {
            String yearString = String.valueOf(year);
            Map<String, Double> monthlyPayments = new HashMap<>();

            for (int month = 1; month <= 12; month++) {
                YearMonth yearMonth = YearMonth.of(year, month);
                double totalPayments = paymentRepository.findAll().stream()
                        .filter(payment -> YearMonth.from(payment.getPaymentDate()).equals(yearMonth))
                        .mapToDouble(Payment::getAmount)
                        .sum();
                monthlyPayments.put(yearMonth.getMonth().toString(), totalPayments);
            }
            yearlyPayments.put(yearString, monthlyPayments);
        }

        return yearlyPayments;
    }

    private Map<String, Double> calculatePaymentsForLast30Days() {
        Map<String, Double> dailyPayments = new HashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 0; i < 30; i++) {
            LocalDate date = today.minusDays(i);
            double dailyTotal = paymentRepository.findAll().stream()
                    .filter(payment -> payment.getPaymentDate().toLocalDate().isEqual(date))
                    .mapToDouble(Payment::getAmount)
                    .sum();

            dailyPayments.put(date.toString(), dailyTotal);
        }
        return dailyPayments;
    }

    private double calculateStaffToPatientRatio() {
        long totalNursesAndDoctors = userRepository.findByRole(mine.profile.website.models.Role.NURSE).size()
                + userRepository.findByRole(mine.profile.website.models.Role.DOCTOR).size();
        long totalPatients = patientRepository.count();
        return totalPatients > 0 ? (double) totalNursesAndDoctors / totalPatients : 0.0;
    }

    private List<Map<String, Object>> calculatePendingBills() {
        List<Billing> allBills = billingRepository.findAllBills();
        List<Map<String, Object>> pendingBills = new ArrayList<>();

        for (Billing bill : allBills) {
            BillingDTO billingDTO = BillingDTO.toDto(bill, paymentRepository, procedureLogRepository,
                    patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                    procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                    bedRepository);

            if (billingDTO.calculatePendingAmount() > 0)
                pendingBills.add(billingDTO.getPendingBillInfo());
        }
        return pendingBills;
    }

    private double calculateTotalPaymentsForToday() {
        LocalDate today = LocalDate.now();
        return paymentRepository.findAll().stream()
                .filter(payment -> payment.getPaymentDate().toLocalDate().equals(today))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    private double calculateTotalPaymentsForWeek() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
        return paymentRepository.findAll().stream()
                .filter(payment -> payment.getPaymentDate().toLocalDate().isAfter(startOfWeek.minusDays(1)) &&
                        payment.getPaymentDate().toLocalDate().isBefore(today.plusDays(1)))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    private double calculateTotalPaymentsForMonth() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        return paymentRepository.findAll().stream()
                .filter(payment -> payment.getPaymentDate().toLocalDate().isAfter(startOfMonth.minusDays(1)) &&
                        payment.getPaymentDate().toLocalDate().isBefore(endOfMonth.plusDays(1)))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    private double calculateTotalPaymentsForYear() {
        LocalDate today = LocalDate.now();
        LocalDate startOfYear = today.withDayOfYear(1);
        return paymentRepository.findAll().stream()
                .filter(payment -> payment.getPaymentDate().toLocalDate().isAfter(startOfYear.minusDays(1)) &&
                        payment.getPaymentDate().toLocalDate().isBefore(today.plusYears(1).withDayOfYear(1)))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    private double calculateTotalRevenue() {
        List<Billing> allBills = billingRepository.findAllBills();
        double totalRevenue = 0.0;

        for (Billing bill : allBills) {
            BillingDTO billingDTO = BillingDTO.toDto(bill, paymentRepository, procedureLogRepository,
                    patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                    procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                    bedRepository);
            totalRevenue += billingDTO.getTotalAmount();
        }
        return totalRevenue;
    }

    private double getAverageTimeFromCheckinToAppointment() {
        List<Appointment> appointments = appointmentRepository.findAll();
        if (appointments.isEmpty()) {
            return 0.0;
        }
        long totalWaitTimeInMinutes = appointments.stream()
                .filter(appointment -> appointment.getAppointmentDateTime() != null && appointment.getPatient() != null)
                .mapToLong(appointment -> {
                    Admission admission = admissionRepository
                            .findFirstByPatientOrderByAdmissionDateAsc(appointment.getPatient()).orElse(null);
                    if (admission != null) {
                        return Duration.between(admission.getAdmissionDate(), appointment.getAppointmentDateTime())
                                .toMinutes();
                    }
                    return 0;
                })
                .sum();

        long validAppointments = appointments.stream()
                .filter(appointment -> appointment.getAppointmentDateTime() != null && appointment.getPatient() != null)
                .count();
        return validAppointments > 0 ? (double) totalWaitTimeInMinutes / validAppointments : 0;
    }

    public Map<String, Object> getDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();

        dashboardData.putAll(fetchPatientData());
        dashboardData.putAll(fetchAdmissionData());
        dashboardData.putAll(fetchMedicationAdministrationData());
        dashboardData.putAll(fetchProcedureLogData());
        dashboardData.putAll(fetchAppointmentData());
        dashboardData.putAll(fetchVitalSignData());

        dashboardData.putAll(fetchLabResultData());
        dashboardData.putAll(fetchBedData());
        dashboardData.putAll(fetchProductUsageData());
        dashboardData.putAll(fetchMedicationPrescribedData());
        dashboardData.putAll(fetchManagerialData());
        dashboardData.putAll(fetchPaymentData());

        return dashboardData;
    }

}