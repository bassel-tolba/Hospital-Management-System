package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import mine.profile.website.models.Bed;

public interface BedRepository extends JpaRepository<Bed, Long>, JpaSpecificationExecutor<Bed> {

    List<Bed> findByBedNumber(String bedNumber);

    List<Bed> findByIsOccupied(boolean isOccupied);

    Page<Bed> findByRoomId(Long roomId, Pageable pageable);

    @Query("SELECT b FROM Bed b WHERE b.room.unit.id = ?1")
    List<Bed> findByUnitId(Long unitId);

    Page<Bed> findByBedNumberContainingIgnoreCase(String bedNumber, Pageable pageable);

    Page<Bed> findByBedNumberContainingIgnoreCaseAndRoomId(String bedNumber,
            Long roomId, Pageable pageable);

    Page<Bed> findByBedNumberContainingIgnoreCaseAndRoom_UnitId(String bedNumber,
            Long unitId, Pageable pageable);

    Page<Bed> findByBedNumberContainingIgnoreCaseAndRoomIdAndRoom_UnitId(String bedNumber,
            Long roomId, Long unitId, Pageable pageable);

    // Dashboard Queries
    @Query("SELECT COUNT(b) FROM Bed b")
    long countAllBeds();

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.isOccupied = true")
    long countOccupiedBeds();

    @Query("SELECT b.room.unit.unitType, COUNT(b) FROM Bed b GROUP BY b.room.unit.unitType")
    List<Object[]> countBedsByUnitType();

    @Query("SELECT b.room.roomNumber, COUNT(b) FROM Bed b GROUP BY b.room.roomNumber")
    List<Object[]> countBedsByRoomNumber();

}