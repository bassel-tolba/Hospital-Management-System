
package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AssessmentDTO {
    private Long id;
    private LocalDateTime assessmentDateTime;
    private String notes;
    private Long patientId;
}