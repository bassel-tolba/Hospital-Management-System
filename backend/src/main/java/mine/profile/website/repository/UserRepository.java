package mine.profile.website.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Role;
import mine.profile.website.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    List<User> findByRole(Role role);

    List<User> findByFirstNameContainingIgnoreCase(String firstName);

    List<User> findByLastNameContainingIgnoreCase(String lastName);

    @Query("SELECT u FROM User u WHERE u.specialty = ?1")
    List<User> findBySpecialty(String specialty);

    @Query("SELECT u FROM User u JOIN u.units unit WHERE unit.id = ?1")
    List<User> findByUnitId(Long unitId);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
            "LOWER(u.specialty) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
            "LOWER(u.role.name) LIKE LOWER(CONCAT('%',:search,'%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);
}