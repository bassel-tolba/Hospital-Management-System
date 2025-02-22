package mine.profile.website.repository.history;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.history.MedicationHistory;

public interface MedicationHistoryRepository extends JpaRepository<MedicationHistory, Long> {
    Page<MedicationHistory> findAllByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<MedicationHistory> findAllByMedicationIdAndTimestampBetween(Long medicationId, LocalDateTime start,
            LocalDateTime end, Pageable pageable);

    void deleteAll();
}