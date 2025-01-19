package mine.profile.website.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

}