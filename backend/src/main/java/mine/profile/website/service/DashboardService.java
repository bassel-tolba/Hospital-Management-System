// backend/src/main/java/mine/profile/website/service/DashboardService.java
package mine.profile.website.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import mine.profile.website.dtos.dashboard.admissions.ChartDataDTO;
import mine.profile.website.dtos.dashboard.bed.BedAvailabilityDTO;
import mine.profile.website.dtos.dashboard.bed.BedOccupancyDTO;
import mine.profile.website.dtos.dashboard.bed.CriticalCapacityAlertDTO;
import mine.profile.website.dtos.dashboard.patientstatus.PatientStatusOverviewDTO;
import mine.profile.website.dtos.dashboard.payments.PaymentStatisticsDTO;
import mine.profile.website.dtos.dashboard.payments.PaymentTrendDTO;
import mine.profile.website.service.dashboard.AdmissionDashboardService;
import mine.profile.website.service.dashboard.BedAvailabilityService;
import mine.profile.website.service.dashboard.PatientStatusDashboardService;
import mine.profile.website.service.dashboard.PaymentDashboardService;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AdmissionDashboardService admissionDashboardService;
    private final PaymentDashboardService paymentDashboardService;
    private final BedAvailabilityService bedAvailabilityService;
    private final PatientStatusDashboardService patientStatusDashboardService;

    public Long getAdmissionCounts(boolean includeOpen, boolean includeFuture, boolean includePast,
            LocalDateTime startDate, LocalDateTime endDate) {
        return admissionDashboardService.getAdmissionsBetweenDates(startDate, endDate, includeOpen, includeFuture,
                includePast);
    }

    public List<ChartDataDTO> getAdmissionTrendData(boolean includeOpen, boolean includeFuture, boolean includePast,
            LocalDateTime startDate, LocalDateTime endDate) {
        List<ChartDataDTO> chartData = new ArrayList<>();

        // Determine granularity
        long years = ChronoUnit.YEARS.between(startDate, endDate);
        long months = ChronoUnit.MONTHS.between(startDate, endDate);
        long days = ChronoUnit.DAYS.between(startDate, endDate);

        String dateFormat;
        ChronoUnit unit;

        if (years >= 1) {
            dateFormat = "yyyy-MM";
            unit = ChronoUnit.MONTHS;
            startDate = startDate.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        } else if (months >= 1) {
            dateFormat = "yyyy-MM-dd";
            unit = ChronoUnit.DAYS;
            startDate = startDate.truncatedTo(ChronoUnit.DAYS);
        } else if (days >= 1) {
            dateFormat = "yyyy-MM-dd";
            unit = ChronoUnit.DAYS;
            startDate = startDate.truncatedTo(ChronoUnit.DAYS);
        } else {
            dateFormat = "yyyy-MM-dd HH:mm";
            unit = ChronoUnit.HOURS;
            startDate = startDate.truncatedTo(ChronoUnit.HOURS);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat);
        LocalDateTime current = startDate;

        while (current.isBefore(endDate)) {
            LocalDateTime next = current.plus(1, unit);
            if (next.isAfter(endDate)) {
                next = endDate;
            }

            long count = admissionDashboardService.getAdmissionsBetweenDates(current, next, includeOpen, includeFuture,
                    includePast);
            chartData.add(new ChartDataDTO(current.format(formatter), count));

            current = next;
        }

        return chartData;
    }

    public PaymentStatisticsDTO getPaymentStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentDashboardService.getPaymentStatistics(startDate, endDate);
    }

    public List<List<PaymentTrendDTO>> getPaymentTrendData(LocalDateTime startDate, LocalDateTime endDate) {
        long years = ChronoUnit.YEARS.between(startDate, endDate);
        long months = ChronoUnit.MONTHS.between(startDate, endDate);
        long days = ChronoUnit.DAYS.between(startDate, endDate);

        String dateFormat;
        ChronoUnit unit;
        if (years >= 1) {
            dateFormat = "yyyy-MM";
            unit = ChronoUnit.MONTHS;
            startDate = startDate.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        } else if (months >= 1) {
            dateFormat = "yyyy-MM-dd";
            unit = ChronoUnit.DAYS;
            startDate = startDate.truncatedTo(ChronoUnit.DAYS);
        } else if (days >= 1) {
            dateFormat = "yyyy-MM-dd";
            unit = ChronoUnit.DAYS;
            startDate = startDate.truncatedTo(ChronoUnit.DAYS);
        } else {
            dateFormat = "yyyy-MM-dd HH:mm";
            unit = ChronoUnit.HOURS;
            startDate = startDate.truncatedTo(ChronoUnit.HOURS);
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat);

        List<List<PaymentTrendDTO>> allTrendData = new ArrayList<>();
        LocalDateTime current = startDate;

        while (current.isBefore(endDate)) {
            LocalDateTime next = current.plus(1, unit);
            if (next.isAfter(endDate)) {
                next = endDate;
            }

            final LocalDateTime currentForLambda = current;
            final DateTimeFormatter formatterForLambda = formatter;

            List<PaymentTrendDTO> intervalData = paymentDashboardService.getPaymentTrend(current, next, unit,
                    formatter);
            List<PaymentTrendDTO> groupedIntervalData = new ArrayList<>();

            intervalData.stream()
                    .collect(Collectors.groupingBy(PaymentTrendDTO::getCategory))
                    .forEach((category, payments) -> {
                        String formattedDate = currentForLambda.format(formatterForLambda);
                        double totalAmount = payments.stream().mapToDouble(PaymentTrendDTO::getAmount).sum();
                        double totalCount = payments.stream().mapToDouble(PaymentTrendDTO::getCount).sum();
                        groupedIntervalData.add(new PaymentTrendDTO(formattedDate, category, totalAmount, totalCount));
                    });

            if (groupedIntervalData.isEmpty()) {
                groupedIntervalData
                        .add(new PaymentTrendDTO(currentForLambda.format(formatterForLambda), "N/A", 0.0, 0.0));
            }

            allTrendData.add(groupedIntervalData);
            current = next;
        }

        return allTrendData;
    }

    public BedAvailabilityDTO getBedAvailability() {
        return bedAvailabilityService.getBedAvailability();
    }

    public List<BedOccupancyDTO> getOccupancyByUnit() {
        return bedAvailabilityService.getOccupancyByUnit();
    }

    public List<CriticalCapacityAlertDTO> getCriticalCapacityAlerts() {
        return bedAvailabilityService.getCriticalCapacityAlerts();
    }

    public Map<String, Map<String, Long>> getBedCountsByRoomTypeAndUnit() {
        return bedAvailabilityService.getBedCountsByRoomTypeAndUnit();
    }

    public PatientStatusOverviewDTO getPatientStatusOverview() {
        return patientStatusDashboardService.getPatientStatusOverview();
    }
}