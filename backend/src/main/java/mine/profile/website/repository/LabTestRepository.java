package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.LabTest;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByTestNameContainingIgnoreCase(String testName);

    List<LabTest> findByTestCode(String testCode);

}