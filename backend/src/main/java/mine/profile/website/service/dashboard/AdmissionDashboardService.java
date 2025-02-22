package mine.profile.website.service.dashboard;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import mine.profile.website.repository.dashboard.AdmissionDashboardRepository;

@Service
@RequiredArgsConstructor
public class AdmissionDashboardService {

    private final AdmissionDashboardRepository admissionDashboardRepository;

    public Long getAdmissionsBetweenDates(LocalDateTime startDate, LocalDateTime endDate,
            boolean includeOpen, boolean includeFuture, boolean includePast) {

        LocalDateTime now = LocalDateTime.now();
        long totalCount = 0;

        if (includeOpen) {
            totalCount += admissionDashboardRepository.countOpenAdmissionsBetweenDates(startDate, endDate);
        }
        if (includeFuture) {
            totalCount += admissionDashboardRepository.countFutureAdmissionsBetweenDates(startDate, endDate, now);
        }
        if (includePast) {
            totalCount += admissionDashboardRepository.countPastAdmissionsBetweenDates(startDate, endDate, now);
        }

        return totalCount;
    }
}