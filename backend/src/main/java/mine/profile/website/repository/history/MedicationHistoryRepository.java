package mine.profile.website.repository.history;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.history.MedicationHistory;

public interface MedicationHistoryRepository extends JpaRepository<MedicationHistory, Long> {

}