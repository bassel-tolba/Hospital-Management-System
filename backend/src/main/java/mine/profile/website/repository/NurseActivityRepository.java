package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.NurseActivity;

@Repository
public interface NurseActivityRepository extends JpaRepository<NurseActivity, Long> {
    List<NurseActivity> findByNurseId(Long nurseId);

    // Dashboard Queries
    @Query("SELECT na.activityType, COUNT(na) FROM NurseActivity na GROUP BY na.activityType ORDER BY COUNT(na) DESC")
    List<Object[]> countNurseActivitiesByType();
}