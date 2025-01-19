package mine.profile.website.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.ImageReport;

@Repository
public interface ImageReportRepository extends JpaRepository<ImageReport, Long> {
    Page<ImageReport> findByPatientId(Long patientId, Pageable pageable);
}