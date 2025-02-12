// PermissionRepository.java
package mine.profile.website.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByName(String name);
}