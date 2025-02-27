// backend/src/main/java/mine/profile/website/service/dashboard/BedAvailabilityService.java
package mine.profile.website.service.dashboard;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mine.profile.website.dtos.dashboard.bed.BedAvailabilityDTO;
import mine.profile.website.dtos.dashboard.bed.BedOccupancyDTO;
import mine.profile.website.dtos.dashboard.bed.CriticalCapacityAlertDTO;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.RoomRepository;
import mine.profile.website.repository.UnitRepository;

@Service
@RequiredArgsConstructor
public class BedAvailabilityService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;
    private final UnitRepository unitRepository;

    // Configuration for critical capacity thresholds (from application.properties)
    @Value("${hospital.capacity.critical.threshold.percentage:85}") // Default to 85%
    private double criticalCapacityThresholdPercentage;

    @Transactional(readOnly = true)
    public BedAvailabilityDTO getBedAvailability() {
        List<Bed> allBeds = bedRepository.findAll();
        long totalBeds = allBeds.size();
        long occupiedBeds = allBeds.stream().filter(Bed::isOccupied).count();
        long availableBeds = totalBeds - occupiedBeds;

        return new BedAvailabilityDTO(totalBeds, occupiedBeds, availableBeds);
    }

    @Transactional(readOnly = true)
    public List<BedOccupancyDTO> getOccupancyByUnit() {
        List<Unit> units = unitRepository.findAll();

        return units.stream().map(unit -> {
            List<Room> rooms = unit.getRooms(); // Efficient, as rooms are eagerly loaded
            long totalBedsInUnit = rooms.stream().mapToLong(room -> room.getBeds().size()).sum();
            long occupiedBedsInUnit = rooms.stream()
                    .flatMap(room -> room.getBeds().stream())
                    .filter(Bed::isOccupied)
                    .count();

            double occupancyRate = (totalBedsInUnit > 0) ? ((double) occupiedBedsInUnit / totalBedsInUnit) * 100 : 0;

            return new BedOccupancyDTO(unit.getId(), unit.getName(), totalBedsInUnit, occupiedBedsInUnit,
                    occupancyRate);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CriticalCapacityAlertDTO> getCriticalCapacityAlerts() {
        List<BedOccupancyDTO> occupancyByUnit = getOccupancyByUnit(); // Reuse existing method

        return occupancyByUnit.stream()
                .filter(occupancy -> occupancy.getOccupancyRate() >= criticalCapacityThresholdPercentage)
                .map(occupancy -> new CriticalCapacityAlertDTO(
                        occupancy.getUnitId(),
                        occupancy.getUnitName(),
                        occupancy.getOccupancyRate()))
                .collect(Collectors.toList());
    }

    // Helper method to calculate occupancy rate (avoid duplication)
    private double calculateOccupancyRate(long totalBeds, long occupiedBeds) {
        return (totalBeds > 0) ? ((double) occupiedBeds / totalBeds) * 100 : 0;
    }

    @Transactional(readOnly = true)
    public Map<String, Map<String, Long>> getBedCountsByRoomTypeAndUnit() {
        List<Unit> units = unitRepository.findAll();
        Map<String, Map<String, Long>> result = new HashMap<>();

        for (Unit unit : units) {
            Map<String, Long> roomTypeCounts = new HashMap<>();
            for (Room room : unit.getRooms()) {
                String roomType = room.getRoomType();
                long availableBedsInRoom = room.getBeds().stream().filter(bed -> !bed.isOccupied()).count();
                roomTypeCounts.put(roomType, roomTypeCounts.getOrDefault(roomType, 0L) + availableBedsInRoom);
            }
            result.put(unit.getName(), roomTypeCounts);
        }
        return result;
    }
}