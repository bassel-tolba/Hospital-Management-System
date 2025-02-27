// backend/src/main/java/mine/profile/website/rest/controller/DashboardController.java
package mine.profile.website.rest.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mine.profile.website.dtos.dashboard.admissions.ChartDataDTO;
import mine.profile.website.dtos.dashboard.bed.BedAvailabilityDTO;
import mine.profile.website.dtos.dashboard.bed.BedOccupancyDTO;
import mine.profile.website.dtos.dashboard.bed.CriticalCapacityAlertDTO;
import mine.profile.website.dtos.dashboard.patientstatus.PatientStatusOverviewDTO;
import mine.profile.website.dtos.dashboard.payments.PaymentStatisticsDTO;
import mine.profile.website.dtos.dashboard.payments.PaymentTrendDTO;
import mine.profile.website.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admissions/trend")
    public ResponseEntity<List<ChartDataDTO>> getAdmissionTrend(
            @RequestParam(name = "includeOpen", defaultValue = "true") boolean includeOpen,
            @RequestParam(name = "includeFuture", defaultValue = "false") boolean includeFuture,
            @RequestParam(name = "includePast", defaultValue = "false") boolean includePast,
            @RequestParam(name = "startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(name = "endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<ChartDataDTO> chartData = dashboardService.getAdmissionTrendData(includeOpen, includeFuture,
                includePast, startDate, endDate);
        return new ResponseEntity<>(chartData, HttpStatus.OK);
    }

    @GetMapping("/payments/statistics")
    public ResponseEntity<PaymentStatisticsDTO> getPaymentStatistics(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PaymentStatisticsDTO statistics = dashboardService.getPaymentStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/payments/trend")
    public ResponseEntity<List<List<PaymentTrendDTO>>> getPaymentTrend(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<List<PaymentTrendDTO>> trendData = dashboardService.getPaymentTrendData(startDate, endDate);
        return ResponseEntity.ok(trendData);
    }

    @GetMapping("/beds/availability")
    public ResponseEntity<BedAvailabilityDTO> getBedAvailability() {
        return ResponseEntity.ok(dashboardService.getBedAvailability());
    }

    @GetMapping("/beds/occupancy")
    public ResponseEntity<List<BedOccupancyDTO>> getOccupancyByUnit() {
        return ResponseEntity.ok(dashboardService.getOccupancyByUnit());
    }

    @GetMapping("/beds/alerts/critical-capacity")
    public ResponseEntity<List<CriticalCapacityAlertDTO>> getCriticalCapacityAlerts() {
        return ResponseEntity.ok(dashboardService.getCriticalCapacityAlerts());
    }

    @GetMapping("/beds/availability/by-room-type")
    public ResponseEntity<Map<String, Map<String, Long>>> getBedCountsByRoomTypeAndUnit() {
        return ResponseEntity.ok(dashboardService.getBedCountsByRoomTypeAndUnit());
    }

    @GetMapping("/patients/status")
    public ResponseEntity<PatientStatusOverviewDTO> getPatientStatusOverview() {
        return ResponseEntity.ok(dashboardService.getPatientStatusOverview());
    }
}