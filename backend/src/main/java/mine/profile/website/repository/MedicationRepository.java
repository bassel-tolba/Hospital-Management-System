package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Medication;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    @Query("SELECT m FROM Medication m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Medication> searchMedications(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Dashboard Queries
    @Query("SELECT pm.medication.name, COUNT(pm) FROM PrescribedMedication pm GROUP BY pm.medication.name ORDER BY COUNT(pm) DESC")
    List<Object[]> countPrescribedMedicationByMedication();
}