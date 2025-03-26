// DocumentRepository.java
package mine.profile.website.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByPatientId(Long patientId, Pageable pageable);

    // Add default sorting by uploadDate, latest first
    Page<Document> findByPatientIdOrderByUploadDateDesc(Long patientId, Pageable pageable);

    // Add ordering to the filtered query as well
    @Query("SELECT d FROM Document d WHERE d.patient.id = :patientId AND d.uploadDate >= :admissionDate ORDER BY d.uploadDate DESC")
    Page<Document> findByPatientIdAndUploadDateAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);
}