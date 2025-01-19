package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.NursingCarePlan;

@Repository
public interface NursingCarePlanRepository extends JpaRepository<NursingCarePlan, Long> {
    List<NursingCarePlan> findByPatientId(Long patientId);

    Page<NursingCarePlan> findByPatientId(Long patientId, Pageable pageable);
}