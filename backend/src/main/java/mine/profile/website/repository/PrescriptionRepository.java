package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Patient;
import mine.profile.website.models.Prescription;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByPatient(Patient patient, Pageable pageable);

    List<Prescription> findByPatientId(Long patientId);
}