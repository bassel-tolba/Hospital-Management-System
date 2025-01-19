package mine.profile.website.dtos.history;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Medication;
import mine.profile.website.models.history.MedicationHistory;

@Getter
@Setter
@NoArgsConstructor
public class MedicationHistoryDTO {
    private Long id;
    private Long medicationId;
    private String medicationName;
    private String action;
    private LocalDateTime timestamp;
    private String userName;
    private String changes;

    public static MedicationHistoryDTO toDto(MedicationHistory medicationHistory) {
        if (medicationHistory == null) {
            return null;
        }
        MedicationHistoryDTO dto = new MedicationHistoryDTO();
        dto.setId(medicationHistory.getId());
        dto.setMedicationId(medicationHistory.getMedication().getId());
        dto.setMedicationName(medicationHistory.getMedication().getName());
        dto.setAction(medicationHistory.getAction());
        dto.setTimestamp(medicationHistory.getTimestamp());
        dto.setUserName(medicationHistory.getUserName());
        dto.setChanges(medicationHistory.getChanges());
        return dto;
    }

    public static MedicationHistory toEntity(MedicationHistoryDTO dto, Medication medication) {
        if (dto == null) {
            return null;
        }
        MedicationHistory entity = new MedicationHistory();
        entity.setId(dto.getId());
        entity.setMedication(medication);
        entity.setAction(dto.getAction());
        entity.setTimestamp(dto.getTimestamp());
        entity.setUserName(dto.getUserName());
        entity.setChanges(dto.getChanges());
        return entity;
    }
}