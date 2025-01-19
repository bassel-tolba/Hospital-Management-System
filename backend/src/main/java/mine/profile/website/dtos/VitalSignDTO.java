
package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VitalSignDTO {
    private Long id;
    private LocalDateTime timestamp;
    private double heartRate;
    private double bloodPressureSystolic;
    private double bloodPressureDiastolic;
    private double temperature;
    private double respiratoryRate;
    private Long patientId;
}