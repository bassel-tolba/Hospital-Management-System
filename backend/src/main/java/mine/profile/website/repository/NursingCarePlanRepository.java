package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.NursingCarePlan;

@Repository
public interface NursingCarePlanRepository extends JpaRepository<NursingCarePlan, Long> {
    List<NursingCarePlan> findByPatientId(Long patientId);

    Page<NursingCarePlan> findByPatientId(Long patientId, Pageable pageable);

    // Sort by startDate, latest first
    Page<NursingCarePlan> findByPatientIdOrderByStartDateDesc(Long patientId, Pageable pageable);

    @Query("SELECT n FROM NursingCarePlan n WHERE n.patient.id = :patientId AND n.startDate >= :admissionDate ORDER BY n.startDate DESC")
    Page<NursingCarePlan> findByPatientIdAndStartDateAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);
}