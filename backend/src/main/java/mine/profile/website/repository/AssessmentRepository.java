package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Assessment;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByPatientId(Long patientId);

    Page<Assessment> findByPatientId(Long patientId, Pageable pageable);

    Page<Assessment> findByPatientIdOrderByAssessmentDateTimeDesc(Long patientId, Pageable pageable);

    @Query("SELECT a FROM Assessment a WHERE a.patient.id = :patientId AND a.assessmentDateTime >= :admissionDate ORDER BY a.assessmentDateTime DESC")
    Page<Assessment> findByPatientIdAndAssessmentDateTimeAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);
}