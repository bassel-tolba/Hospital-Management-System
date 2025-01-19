package mine.profile.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.PrescribedMedication;

public interface PrescribedMedicationRepository extends JpaRepository<PrescribedMedication, Long> {

}