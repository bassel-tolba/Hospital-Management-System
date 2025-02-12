// backend/src/main/java/mine/profile/website/dtos/UserDTO.java
package mine.profile.website.dtos;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.User;

@Getter
@Setter
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private Long roleId;
    private String roleName; // Added to hold the role name
    private String firstName;
    private String lastName;
    private String specialty;
    private String token;

    // NEW: Profile Picture
    private String profilePictureURL;
    private MultipartFile profilePictureFile; // For file uploads

    private List<Long> unitIds;
    private List<Long> roomIds;
    private List<Long> patientIds;
    private List<String> authorities; // Add authorities

    public static UserDTO fromEntity(User entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setPassword(entity.getPassword());
        if (entity.getRole() != null) {
            dto.setRoleId(entity.getRole().getId());
            dto.setRoleName(entity.getRole().getName()); // Set the role name
        }
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setSpecialty(entity.getSpecialty());
        dto.setProfilePictureURL(entity.getProfilePictureURL()); // Set the profile picture URL

        if (entity.getUnits() != null) {
            dto.setUnitIds(entity.getUnits().stream().map(unit -> unit.getId()).toList());
        }
        if (entity.getRooms() != null) {
            dto.setRoomIds(entity.getRooms().stream().map(room -> room.getId()).toList());
        }
        if (entity.getPatients() != null) {
            dto.setPatientIds(entity.getPatients().stream().map(patient -> patient.getId()).toList());
        }

        // DO NOT populate authorities here. It should be populated *after*
        // authentication, in the AuthController. fromEntity is used in other
        // places where we don't want/need the authorities.
        return dto;
    }

    public User toEntity() {
        User entity = new User();
        if (this.id != null) {
            entity.setId(this.id);
        }
        entity.setUsername(this.username);
        entity.setPassword(this.password);
        entity.setFirstName(this.firstName);
        entity.setLastName(this.lastName);
        entity.setSpecialty(this.specialty);
        entity.setProfilePictureURL(this.profilePictureURL); // Set the URL (will be handled by the service)
        return entity;
    }
}