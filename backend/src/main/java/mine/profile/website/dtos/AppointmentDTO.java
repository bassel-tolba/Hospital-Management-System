
// AppointmentDTO.java (DTO - Add status)
package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import mine.profile.website.models.Appointment;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private Long id;
    private LocalDateTime appointmentDateTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long patientId; // Use IDs for DTOs
    private Long userId; // Use IDs for DTOs
    private Long productId; // Add Product Id
    private String patientFirstName; // Include these for convenience
    private String patientLastName;
    private String userFirstName;
    private String userLastName;
    private String productCode; // keep it for other uses.
    private String productName;
    private Appointment.AppointmentStatus status; // Add status to DTO

    // Convert from Entity to DTO
    public static AppointmentDTO toDto(Appointment appointment) {
        if (appointment == null) {
            return null;
        }

        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setUserId(appointment.getUser().getId());
        dto.setPatientFirstName(appointment.getPatient().getFirstName());
        dto.setPatientLastName(appointment.getPatient().getLastName());
        dto.setUserFirstName(appointment.getUser().getFirstName());
        dto.setUserLastName(appointment.getUser().getLastName());
        dto.setStatus(appointment.getStatus()); // Set status

        return dto;
    }

    // Convert from DTO to Entity (used less often, mainly in create/update)
    public static Appointment toEntity(AppointmentDTO dto) {
        if (dto == null) {
            return null;
        }

        Appointment appointment = new Appointment();
        appointment.setId(dto.getId());
        appointment.setAppointmentDateTime(dto.getAppointmentDateTime());
        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());
        appointment.setStatus(dto.getStatus());
        // You'll need to fetch the Patient and User entities
        // from the database based on their IDs in the service layer.
        return appointment;
    }
}
