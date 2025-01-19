package mine.profile.website.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Nurse;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {

    Optional<Nurse> findByUser_Id(Long userId);
}