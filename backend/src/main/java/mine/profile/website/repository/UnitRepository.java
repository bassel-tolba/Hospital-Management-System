package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Unit;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {

    @Query("SELECT u FROM Unit u WHERE CAST(u.unitType AS string) LIKE %:searchTerm%")
    List<Unit> findByUnitTypeContaining(@Param("searchTerm") String searchTerm);

}
