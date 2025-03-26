package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.MedicationAdministration;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, Long> {

    // Overriding findAll
    @Override
    @Query("SELECT ma FROM MedicationAdministration ma WHERE ma.patient.deleted = false")
    List<MedicationAdministration> findAll();

    @Override
    @Query("SELECT ma FROM MedicationAdministration ma WHERE ma.patient.deleted = false")
    Page<MedicationAdministration> findAll(Pageable pageable);

    Page<MedicationAdministration> findByPatientId(Long patientId, Pageable pageable);

    // Dashboard Queries
    @Query("SELECT COUNT(ma) FROM MedicationAdministration ma")
    long countAllMedicationAdministrations();

    @Query("SELECT ma.prescribedMedication.medication.name, COUNT(ma) FROM MedicationAdministration ma GROUP BY ma.prescribedMedication.medication.name ORDER BY COUNT(ma) DESC")
    List<Object[]> countMedicationAdministrationsByMedication();

    // Sort by administrationTime, latest first
    Page<MedicationAdministration> findByPatientIdOrderByAdministrationTimeDesc(Long patientId, Pageable pageable);

    @Query("SELECT m FROM MedicationAdministration m WHERE m.patient.id = :patientId AND m.administrationTime >= :admissionDate ORDER BY m.administrationTime DESC")
    Page<MedicationAdministration> findByPatientIdAndAdministrationTimeAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);
}