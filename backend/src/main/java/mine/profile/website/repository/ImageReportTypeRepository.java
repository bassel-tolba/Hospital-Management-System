package mine.profile.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.ImageReportType;

@Repository
public interface ImageReportTypeRepository extends JpaRepository<ImageReportType, Long> {

}