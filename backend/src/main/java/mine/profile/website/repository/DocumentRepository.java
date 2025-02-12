// DocumentRepository.java
package mine.profile.website.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByPatientId(Long patientId, Pageable pageable);

}