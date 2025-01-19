// ActivityTargetRepository.java
package mine.profile.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.ActivityTarget;

@Repository
public interface ActivityTargetRepository extends JpaRepository<ActivityTarget, Long> {
}