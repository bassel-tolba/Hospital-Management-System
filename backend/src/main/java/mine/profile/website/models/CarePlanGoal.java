package mine.profile.website.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class CarePlanGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private String targetOutcome;

    @ManyToOne
    @JoinColumn(name = "nursing_care_plan_id")
    private NursingCarePlan nursingCarePlan;

    public CarePlanGoal(String description, String targetOutcome, NursingCarePlan nursingCarePlan) {
        this.description = description;
        this.targetOutcome = targetOutcome;
        this.nursingCarePlan = nursingCarePlan;
    }
}