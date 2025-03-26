package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mine.profile.website.models.VitalSign;

public interface VitalSignRepository extends JpaRepository<VitalSign, Long> {
    List<VitalSign> findByPatientId(Long patientId);

    Page<VitalSign> findByPatientId(Long patientId, Pageable pageable);

    List<VitalSign> findByPatientIdAndTimestampBetween(Long patientId, LocalDateTime startTime, LocalDateTime endTime);

    // Dashboard Queries
    @Query("SELECT COUNT(vs) FROM VitalSign vs")
    long countAllVitalSigns();

    // Sort by timestamp, latest first
    Page<VitalSign> findByPatientIdOrderByTimestampDesc(Long patientId, Pageable pageable);

    @Query("SELECT v FROM VitalSign v WHERE v.patient.id = :patientId AND v.timestamp >= :admissionDate ORDER BY v.timestamp DESC")
    Page<VitalSign> findByPatientIdAndTimestampAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);
}