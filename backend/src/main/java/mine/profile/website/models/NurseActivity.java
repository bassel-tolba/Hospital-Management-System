package mine.profile.website.models;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class NurseActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nurse_id")
    private Nurse nurse;

    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient; // Optional

    private String notes;

    public NurseActivity(Nurse nurse, ActivityType activityType, LocalDateTime timestamp, Patient patient,
            String notes) {
        this.nurse = nurse;
        this.activityType = activityType;
        this.timestamp = timestamp;
        this.patient = patient;
        this.notes = notes;
    }

}