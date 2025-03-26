package mine.profile.website.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.ImageReport;

@Repository
public interface ImageReportRepository extends JpaRepository<ImageReport, Long> {
    Page<ImageReport> findByPatientId(Long patientId, Pageable pageable);

    // Sort by reportDateTime, latest first
    Page<ImageReport> findByPatientIdOrderByReportDateTimeDesc(Long patientId, Pageable pageable);

    @Query("SELECT i FROM ImageReport i WHERE i.patient.id = :patientId AND i.reportDateTime >= :admissionDate ORDER BY i.reportDateTime DESC")
    Page<ImageReport> findByPatientIdAndReportDateTimeAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);
}