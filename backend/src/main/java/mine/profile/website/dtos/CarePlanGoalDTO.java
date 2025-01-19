
package mine.profile.website.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CarePlanGoalDTO {
    private Long id;
    private String description;
    private String targetOutcome;
    private Long nursingCarePlanId;
}