package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.ActivityType;
import mine.profile.website.models.NurseActivity;

@Getter
@Setter
@NoArgsConstructor
public class NurseActivityDTO {

    private Long id;

    private Long nurseId;

    private ActivityType activityType;

    private LocalDateTime timestamp;

    private Long patientId;

    private String notes;

    public NurseActivityDTO(Long id, Long nurseId, ActivityType activityType, LocalDateTime timestamp, Long patientId,
            String notes) {
        this.id = id;
        this.nurseId = nurseId;
        this.activityType = activityType;
        this.timestamp = timestamp;
        this.patientId = patientId;
        this.notes = notes;
    }

    public static NurseActivityDTO toDto(NurseActivity nurseActivity) {
        NurseActivityDTO nurseActivityDTO = new NurseActivityDTO();
        nurseActivityDTO.setId(nurseActivity.getId());
        nurseActivityDTO.setNurseId(nurseActivity.getNurse().getId());
        nurseActivityDTO.setActivityType(nurseActivity.getActivityType());
        nurseActivityDTO.setTimestamp(nurseActivity.getTimestamp());
        if (nurseActivity.getPatient() != null) {
            nurseActivityDTO.setPatientId(nurseActivity.getPatient().getId());
        }
        nurseActivityDTO.setNotes(nurseActivity.getNotes());
        return nurseActivityDTO;
    }
}