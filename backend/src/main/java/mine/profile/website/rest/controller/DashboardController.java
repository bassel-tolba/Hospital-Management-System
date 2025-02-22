package mine.profile.website.rest.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import mine.profile.website.dtos.dashboard.admissions.ChartDataDTO;
import mine.profile.website.dtos.dashboard.payments.PaymentStatisticsDTO; // Import PaymentStatisticsDTO
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

    // Add payment statistics endpoint, using DashboardService
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
}