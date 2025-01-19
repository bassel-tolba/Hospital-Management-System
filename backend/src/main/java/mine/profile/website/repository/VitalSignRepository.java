package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import mine.profile.website.models.VitalSign;

public interface VitalSignRepository extends JpaRepository<VitalSign, Long> {
    List<VitalSign> findByPatientId(Long patientId);

    Page<VitalSign> findByPatientId(Long patientId, Pageable pageable);

    List<VitalSign> findByPatientIdAndTimestampBetween(Long patientId, LocalDateTime startTime, LocalDateTime endTime);

    // Dashboard Queries
    @Query("SELECT COUNT(vs) FROM VitalSign vs")
    long countAllVitalSigns();

}