package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Patient;
import mine.profile.website.models.PatientProductUsage;
import mine.profile.website.models.Product;

@Repository
public interface PatientProductUsageRepository extends JpaRepository<PatientProductUsage, Long> {
    Page<PatientProductUsage> findByPatientId(Long patientId, Pageable pageable);

    // Override findAll to exclude deleted patients
    @Override
    @Query("SELECT ppu FROM PatientProductUsage ppu WHERE ppu.patient.deleted = false")
    List<PatientProductUsage> findAll();

    @Override
    @Query("SELECT ppu FROM PatientProductUsage ppu WHERE ppu.patient.deleted = false")
    Page<PatientProductUsage> findAll(Pageable pageable);

    Page<PatientProductUsage> findByPatientIdOrderByStartTimeDesc(Long patientId, Pageable pageable);

    @Query("SELECT p FROM PatientProductUsage p WHERE p.patient.id = :patientId AND p.startTime >= :admissionDate ORDER BY p.startTime DESC")
    Page<PatientProductUsage> findByPatientIdAndStartTimeAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);

    Optional<PatientProductUsage> findFirstByPatientAndStartTimeAndEndTimeAndProduct_TypeOrderByStartTimeDesc(
            Patient patient,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Product.ProductType productType);
}