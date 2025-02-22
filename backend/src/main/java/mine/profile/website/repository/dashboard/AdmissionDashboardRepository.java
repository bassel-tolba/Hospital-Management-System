// AdmissionDashboardRepository.java
package mine.profile.website.repository.dashboard;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mine.profile.website.models.Admission;

public interface AdmissionDashboardRepository extends JpaRepository<Admission, Long> {

    // Count admissions within a specific date range
    long countByAdmissionDateBetween(LocalDateTime start, LocalDateTime end);

    // Count admissions with discharge date within a specific date range
    long countByDischargeDateBetween(LocalDateTime start, LocalDateTime end);

    // Count open admissions (dischargeDate is null)
    long countByDischargeDateIsNull();

    // Count open admissions within a specific date range
    long countByAdmissionDateBetweenAndDischargeDateIsNull(LocalDateTime admissionStart, LocalDateTime admissionEnd);

    // Count open admissions within a specific date range
    @Query("SELECT COUNT(a) FROM Admission a WHERE a.admissionDate BETWEEN :start AND :end AND a.dischargeDate IS NULL")
    long countOpenAdmissionsBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Count future admissions within a specific date range
    @Query("SELECT COUNT(a) FROM Admission a WHERE a.admissionDate BETWEEN :start AND :end AND a.dischargeDate > :now")
    long countFutureAdmissionsBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end,
            @Param("now") LocalDateTime now);

    // Count past admissions within a specific date range
    @Query("SELECT COUNT(a) FROM Admission a WHERE a.admissionDate BETWEEN :start AND :end AND a.dischargeDate IS NOT NULL AND a.dischargeDate <= :now")
    long countPastAdmissionsBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end,
            @Param("now") LocalDateTime now);

}
