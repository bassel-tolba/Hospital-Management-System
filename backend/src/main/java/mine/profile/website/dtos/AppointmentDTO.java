
package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentDTO {
    private Long id;
    private LocalDateTime appointmentDateTime;
    private Long patientId;
    private Long userId;
}