package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Procedure;
import mine.profile.website.models.ProcedureLog;
import mine.profile.website.models.User;

@Getter
@Setter
@NoArgsConstructor
public class ProcedureLogDTO {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String notes;
    private Long userId;
    private Long procedureId;
    private Long billingId; // Keep billingId
    private Long patientId; // Add patientId

    public static ProcedureLog toEntity(ProcedureLogDTO dto, User user, Procedure procedure, Billing billing,
            Patient patient) {
        ProcedureLog procedureLog = new ProcedureLog();
        procedureLog.setId(dto.getId());
        procedureLog.setStartTime(dto.getStartTime());
        procedureLog.setEndTime(dto.getEndTime());
        procedureLog.setNotes(dto.getNotes());
        procedureLog.setUser(user);
        procedureLog.setProcedure(procedure);
        procedureLog.setBilling(billing);
        procedureLog.setPatient(patient); // Set the patient
        return procedureLog;
    }

    public static ProcedureLogDTO toDto(ProcedureLog entity) {
        ProcedureLogDTO dto = new ProcedureLogDTO();
        dto.setId(entity.getId());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setNotes(entity.getNotes());
        dto.setUserId(entity.getUser().getId());
        dto.setProcedureId(entity.getProcedure().getId());
        if (entity.getBilling() != null) {
            dto.setBillingId(entity.getBilling().getId());
        }
        dto.setPatientId(entity.getPatient().getId()); // Set the patientId in the DTO
        return dto;
    }
}