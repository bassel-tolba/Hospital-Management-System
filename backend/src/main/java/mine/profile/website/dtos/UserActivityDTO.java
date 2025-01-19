// UserActivityDTO.java
package mine.profile.website.dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.UserActivity;
import mine.profile.website.models.UserActivityType;

@Getter
@Setter
@NoArgsConstructor
public class UserActivityDTO {

    private Long id;

    private String activityType;

    private LocalDateTime timestamp;

    private Long roomId;

    private Long unitId;

    private List<Long> patientIds;
    private String patientName;
    private String description;

    private String state;

    public static UserActivityDTO fromEntity(UserActivity entity) {
        UserActivityDTO dto = new UserActivityDTO();
        dto.setId(entity.getId());
        dto.setActivityType(entity.getActivityType().name());
        dto.setTimestamp(entity.getTimestamp());
        if (entity.getActivityTarget().getRoom() != null) {
            dto.setRoomId(entity.getActivityTarget().getRoom().getId());
        }
        if (entity.getActivityTarget().getUnit() != null) {
            dto.setUnitId(entity.getActivityTarget().getUnit().getId());
        }
        if (entity.getActivityTarget().getPatients() != null) {
            dto.setPatientIds(
                    entity.getActivityTarget().getPatients().stream().map(patient -> patient.getId()).toList());
        }
        if (entity.getActivityTarget().getRoom() == null && entity.getActivityTarget().getUnit() == null
                && entity.getActivityTarget().getPatients().size() == 1) {
            dto.patientName = entity.getActivityTarget().getPatients().get(0).getFirstName()
                    + " " + entity.getActivityTarget().getPatients().get(0).getLastName();
        }
        dto.setDescription(entity.getDescription());
        dto.setState(entity.getState());
        return dto;
    }

    public UserActivity toEntity() {
        UserActivity entity = new UserActivity();
        if (this.id != null) {
            entity.setId(this.id);
        }
        try {
            entity.setActivityType(UserActivityType.valueOf(this.activityType));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid activity type: " + this.activityType);
        }

        entity.setTimestamp(this.timestamp);
        entity.setDescription(this.description);
        entity.setState(this.state);
        return entity;
    }
}