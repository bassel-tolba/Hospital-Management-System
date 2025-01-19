
package mine.profile.website.dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NursingCarePlanDTO {
    private Long id;
    private LocalDateTime startDate;
    private String notes;
    private Long patientId;
    private List<Long> carePlanGoalIds;
}