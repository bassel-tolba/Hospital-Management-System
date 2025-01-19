package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.LabResult;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    Page<LabResult> findByPatientId(Long patientId, Pageable pageable);

    Page<LabResult> findByLabTestId(Long labTestId, Pageable pageable);

    Page<LabResult> findByPatientIdAndResultDateTimeBetween(Long patientId, LocalDateTime startDate,
            LocalDateTime endDate, Pageable pageable);

    Page<LabResult> findByPerformedById(Long userId, Pageable pageable);

    // Dashboard Queries
    @Query("SELECT COUNT(lr) FROM LabResult lr")
    long countAllLabResults();

    @Query("SELECT lr.labTest.testName, COUNT(lr) FROM LabResult lr GROUP BY lr.labTest.testName ORDER BY COUNT(lr) DESC")
    List<Object[]> countLabResultsByTest();
}