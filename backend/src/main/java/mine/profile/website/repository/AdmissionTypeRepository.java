package mine.profile.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.AdmissionType;

public interface AdmissionTypeRepository extends JpaRepository<AdmissionType, Long> {
}