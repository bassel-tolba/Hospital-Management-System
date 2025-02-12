package mine.profile.website.dtos;

import java.util.List;
import java.util.stream.Collectors;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Unit;
import mine.profile.website.models.UnitType;

@Getter
@Setter
@NoArgsConstructor
public class UnitDTO {
    private Long id;
    private String name;
    private UnitType unitType;
    private String location;
    private String description;
    private List<Long> roomIds;
    private Long departmentId;

    // Constructor that create Dto from Entity
    public UnitDTO(Unit unit) {
        this.id = unit.getId();
        this.name = unit.getName();
        this.unitType = unit.getUnitType();
        this.location = unit.getLocation();
        this.description = unit.getDescription();
        this.roomIds = unit.getRooms() != null
                ? unit.getRooms().stream().map(r -> r.getId()).collect(Collectors.toList())
                : null;
    }

    // Method to convert UnitDTO to a Unit entity
    public Unit toEntity() {
        Unit unit = new Unit();
        unit.setId(this.id);
        unit.setName(this.name);
        unit.setUnitType(this.unitType);
        unit.setLocation(this.location);
        unit.setDescription(this.description);
        // Note: We're not handling room mapping or departmentId mapping here
        // due to the limitations of the context, however you can add more mapping.
        return unit;
    }
}