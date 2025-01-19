package mine.profile.website.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.RoomDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.repository.RoomRepository;
import mine.profile.website.repository.UnitRepository;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Transactional
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Unit unit = unitRepository.findById(roomDTO.getUnitId())
                .orElseThrow(() -> new EntityNotFoundException("Unit not found with id: " + roomDTO.getUnitId()));
        Room room = entityMapper.toEntity(roomDTO, unit);
        Room savedRoom = roomRepository.save(room);
        return entityMapper.toDto(savedRoom);
    }

    @Transactional
    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + id));
        return entityMapper.toDto(room);
    }

    @Transactional
    public Page<RoomDTO> searchRooms(String searchTerm, Long unitId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Room> roomPage;

        if (searchTerm != null && unitId != null) {
            roomPage = roomRepository.findByRoomNumberContainingIgnoreCaseOrRoomTypeContainingIgnoreCaseAndUnitId(
                    searchTerm, searchTerm, unitId, pageable);
        } else if (searchTerm != null) {
            roomPage = roomRepository.findByRoomNumberContainingIgnoreCaseOrRoomTypeContainingIgnoreCase(searchTerm,
                    searchTerm, pageable);

        } else if (unitId != null) {
            roomPage = roomRepository.findByUnitId(unitId, pageable);
        } else {
            roomPage = roomRepository.findAll(pageable);
        }
        return roomPage.map(entityMapper::toDto);
    }

    @Transactional
    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + id));

        Unit unit = unitRepository.findById(roomDTO.getUnitId())
                .orElseThrow(() -> new EntityNotFoundException("Unit not found with id: " + roomDTO.getUnitId()));

        existingRoom.setRoomNumber(roomDTO.getRoomNumber());
        existingRoom.setRoomType(roomDTO.getRoomType());
        existingRoom.setUnit(unit);

        Room updatedRoom = roomRepository.save(existingRoom);
        return entityMapper.toDto(updatedRoom);

    }

    @Transactional
    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new EntityNotFoundException("Room not found with id: " + id);
        }
        roomRepository.deleteById(id);
    }
}