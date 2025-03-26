// repository/QuickNoteRepository.java (Create this repository)
package mine.profile.website.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.QuickNote;

@Repository
public interface QuickNoteRepository extends JpaRepository<QuickNote, Long> {
    Page<QuickNote> findByPatientId(Long patientId, Pageable pageable);

    // Sort by createdAt, latest first
    Page<QuickNote> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
}