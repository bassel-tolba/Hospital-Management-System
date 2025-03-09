// UserActivityRepository.java
package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.UserActivity;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    List<UserActivity> findByState(String state);

    @EntityGraph(attributePaths = { "activityTarget.patients" }) // Fetch only patients (IDs)
    List<UserActivity> findByStateIgnoreCaseOrStateIgnoreCase(String state1, String state2);
}