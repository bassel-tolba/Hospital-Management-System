package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.MedicationBatch;

public interface MedicationBatchRepository extends JpaRepository<MedicationBatch, Long> {
    List<MedicationBatch> findByMedicationIdOrderByPurchaseDateAsc(Long medicationId);
}