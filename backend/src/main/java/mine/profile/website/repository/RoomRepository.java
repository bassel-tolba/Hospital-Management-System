package mine.profile.website.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Page<Room> findByRoomNumberContainingIgnoreCaseOrRoomTypeContainingIgnoreCase(String roomNumber, String roomType,
            Pageable pageable);

    Page<Room> findByUnitId(Long unitId, Pageable pageable);

    Page<Room> findByRoomNumberContainingIgnoreCaseOrRoomTypeContainingIgnoreCaseAndUnitId(String roomNumber,
            String roomType, Long unitId, Pageable pageable);

}