// DepartmentRepository.java
package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByNameContainingIgnoreCase(String name);
}