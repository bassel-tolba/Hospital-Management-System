package mine.profile.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.CarePlanGoal;

@Repository
public interface CarePlanGoalRepository extends JpaRepository<CarePlanGoal, Long> {
}