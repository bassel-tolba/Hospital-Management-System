package mine.profile.website.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.BedDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Room;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.RoomRepository;

@Service
public class BedService {

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Autowired
    private AdmissionRepository admissionRepository;

    @Transactional
    public BedDTO createBed(BedDTO bedDTO) {
        Room room = roomRepository.findById(bedDTO.getRoomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + bedDTO.getRoomId()));
        Bed bed = entityMapper.toEntity(bedDTO, room);
        Bed savedBed = bedRepository.save(bed);
        return entityMapper.toDto(savedBed);
    }

    @Transactional
    public BedDTO getBedById(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bed not found with id: " + id));
        return entityMapper.toDto(bed);
    }

    @Transactional
    public Page<BedDTO> searchBeds(String searchTerm, Long roomId, Long unitId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bed> bedPage;

        if (searchTerm != null && roomId != null && unitId != null) {
            bedPage = bedRepository.findByBedNumberContainingIgnoreCaseAndRoomIdAndRoom_UnitId(
                    searchTerm, roomId, unitId, pageable);
        } else if (searchTerm != null && roomId != null) {
            bedPage = bedRepository.findByBedNumberContainingIgnoreCaseAndRoomId(
                    searchTerm, roomId, pageable);
        } else if (searchTerm != null && unitId != null) {
            bedPage = bedRepository.findByBedNumberContainingIgnoreCaseAndRoom_UnitId(
                    searchTerm, unitId, pageable);
        } else if (searchTerm != null) {
            bedPage = bedRepository.findByBedNumberContainingIgnoreCase(
                    searchTerm, pageable);
        } else if (roomId != null) {
            bedPage = bedRepository.findByRoomId(roomId, pageable);
        } else {
            bedPage = bedRepository.findAll(pageable);
        }
        return bedPage.map(entityMapper::toDto);
    }

    @Transactional
    public BedDTO updateBed(Long id, BedDTO bedDTO) {
        Bed existingBed = bedRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bed not found with id: " + id));

        Room room = roomRepository.findById(bedDTO.getRoomId())
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + bedDTO.getRoomId()));

        existingBed.setBedNumber(bedDTO.getBedNumber());
        existingBed.setOccupied(bedDTO.isOccupied());
        existingBed.setRoom(room);

        Bed updatedBed = bedRepository.save(existingBed);
        return entityMapper.toDto(updatedBed);

    }

    @Transactional
    public void deleteBed(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bed not found with id: " + id));

        Admission admission = admissionRepository.findByBedId(id);

        if (admission != null) {
            admission.setBed(null);
            admissionRepository.save(admission);
            bed.setOccupied(false);
            bedRepository.save(bed);
        }

        bedRepository.delete(bed);
    }

    @Transactional
    public void freeAllExpiredBeds() {
        bedRepository.findAll().forEach(bed -> {
            Admission admission = admissionRepository.findByBedId(bed.getId());
            if (admission != null && admission.getDischargeDate() != null
                    && admission.getDischargeDate().isBefore(LocalDateTime.now())) {
                bed.setOccupied(false);
                admission.setBed(null);
                admissionRepository.save(admission);
                bedRepository.save(bed);
            }
        });
    }
}