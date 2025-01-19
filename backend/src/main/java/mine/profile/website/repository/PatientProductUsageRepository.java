package mine.profile.website.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.PatientProductUsage;

@Repository
public interface PatientProductUsageRepository extends JpaRepository<PatientProductUsage, Long> {
    Page<PatientProductUsage> findByPatientId(Long patientId, Pageable pageable);

}