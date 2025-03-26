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
import mine.profile.website.models.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    // Overriding findAll to exclude deleted patients' prescriptions
    @Override
    @Query("SELECT p FROM Prescription p WHERE p.patient.deleted = false")
    List<Prescription> findAll();

    @Override
    @Query("SELECT p FROM Prescription p WHERE p.patient.deleted = false")
    Page<Prescription> findAll(Pageable pageable);

    Optional<Prescription> findById(Long id);

    Page<Prescription> findByPatient(Patient patient, Pageable pageable);

    List<Prescription> findByPatientId(Long patientId);

    Page<Prescription> findByPatientOrderByPrescriptionDateDesc(Patient patient, Pageable pageable);

    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.prescriptionDate >= :admissionDate ORDER BY p.prescriptionDate DESC")
    Page<Prescription> findByPatientIdAndPrescriptionDateAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);
}