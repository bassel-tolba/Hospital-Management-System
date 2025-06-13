package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.MedicationBatch;

public interface MedicationBatchRepository extends JpaRepository<MedicationBatch, Long> {

    /**
     * Finds all batches for a specific medication, ordered by purchase date.
     * This is used when no date filtering is applied.
     */
    List<MedicationBatch> findByMedicationIdOrderByPurchaseDateAsc(Long medicationId);

    /**
     * Finds all batches for a medication that were purchased between the given
     * start and end dates (inclusive).
     */
    List<MedicationBatch> findByMedicationIdAndPurchaseDateBetweenOrderByPurchaseDateAsc(Long medicationId,
            LocalDateTime start, LocalDateTime end);

    /**
     * Finds all batches for a medication purchased on or after the given start
     * date.
     */
    List<MedicationBatch> findByMedicationIdAndPurchaseDateGreaterThanEqualOrderByPurchaseDateAsc(Long medicationId,
            LocalDateTime start);

    /**
     * Finds all batches for a medication purchased on or before the given end date.
     */
    List<MedicationBatch> findByMedicationIdAndPurchaseDateLessThanEqualOrderByPurchaseDateAsc(Long medicationId,
            LocalDateTime end);

}