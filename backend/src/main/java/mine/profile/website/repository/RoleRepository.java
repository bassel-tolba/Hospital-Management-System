// RoleRepository.java
package mine.profile.website.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}