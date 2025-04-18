package mine.profile.website.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.AssessmentType;

@Repository
public interface AssessmentTypeRepository extends JpaRepository<AssessmentType, Long> {
    Optional<AssessmentType> findByName(String name);

    boolean existsByName(String name);
}