package mine.profile.website.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mine.profile.website.models.Procedure;

public interface ProcedureRepository extends JpaRepository<Procedure, Long> {

    @Query("SELECT p FROM Procedure p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Procedure> searchByNameOrCode(@Param("searchTerm") String searchTerm, Pageable pageable);

}