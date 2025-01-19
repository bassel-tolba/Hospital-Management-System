// UserDTO.java
package mine.profile.website.dtos;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Role;
import mine.profile.website.models.User;

@Getter
@Setter
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String role;
    private String firstName;
    private String lastName;
    private String specialty;
    private String token;
    private List<Long> unitIds;
    private List<Long> roomIds;
    private List<Long> patientIds;

    public static UserDTO fromEntity(User entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setPassword(entity.getPassword());
        dto.setRole(entity.getRole().name());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setSpecialty(entity.getSpecialty());
        if (entity.getUnits() != null) {
            dto.setUnitIds(entity.getUnits().stream().map(unit -> unit.getId()).toList());
        }
        if (entity.getRooms() != null) {
            dto.setRoomIds(entity.getRooms().stream().map(room -> room.getId()).toList());
        }
        if (entity.getPatients() != null) {
            dto.setPatientIds(entity.getPatients().stream().map(patient -> patient.getId()).toList());
        }
        return dto;
    }

    public User toEntity() {
        User entity = new User();
        if (this.id != null) {
            entity.setId(this.id);
        }
        entity.setUsername(this.username);
        entity.setPassword(this.password);
        try {
            entity.setRole(Role.valueOf(this.role));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role name: " + this.role);
        }
        entity.setFirstName(this.firstName);
        entity.setLastName(this.lastName);
        entity.setSpecialty(this.specialty);
        return entity;
    }
}