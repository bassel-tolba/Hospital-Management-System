package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mine.profile.website.models.Admission;
import mine.profile.website.models.Patient;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    List<Admission> findByPatientId(Long patientId);

    Page<Admission> findByPatientId(Long patientId, Pageable pageable);

    Page<Admission> findByBedId(Long bedId, Pageable pageable);

    Page<Admission> findByPatientIdAndBedId(Long patientId, Long bedId, Pageable pageable);

    List<Admission> findByDischargeDateIsNull();

    Admission findByBedId(Long bedId);

    Optional<Admission> findFirstByPatientOrderByAdmissionDateAsc(Patient patient);

    List<Admission> findByPatientIdAndDischargeDateIsNull(Long patientId);

    // Dashboard Queries
    @Query("SELECT COUNT(a) FROM Admission a")
    long countAllAdmissions();

    @Query("SELECT COUNT(a) FROM Admission a WHERE a.dischargeDate IS NULL")
    long countCurrentAdmissions();

    @Query(value = "SELECT DATE(admission_date) as date, count(*) from admission group by date", nativeQuery = true)
    List<Object[]> countAdmissionsByDate();

    @Query(value = "SELECT DATE(discharge_date) as date, count(*) from admission where discharge_date is not null group by date", nativeQuery = true)
    List<Object[]> countDischargesByDate();

    // Add OrderByAdmissionDateDesc to sort by admission date, latest first
    Page<Admission> findByPatientIdOrderByAdmissionDateDesc(Long patientId, Pageable pageable);

    // Find the most recent admission for a patient that hasn't been discharged yet.
    @Query("SELECT a FROM Admission a WHERE a.patient.id = :patientId " +
            "AND (a.dischargeDate IS NULL OR a.dischargeDate > :now) " +
            "ORDER BY a.admissionDate DESC")
    Page<Admission> findCurrentAdmission(@Param("patientId") Long patientId, @Param("now") LocalDateTime now,
            Pageable pageable);
}