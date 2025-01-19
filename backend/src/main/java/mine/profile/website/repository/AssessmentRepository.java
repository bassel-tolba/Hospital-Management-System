package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Assessment;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByPatientId(Long patientId);

    Page<Assessment> findByPatientId(Long patientId, Pageable pageable);

}