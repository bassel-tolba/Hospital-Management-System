// In MedicationHistory.java
package mine.profile.website.models.history;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Medication;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class MedicationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;
    private String action;
    private LocalDateTime timestamp;
    @Column(name = "user_name")
    private String userName; // Renamed column
    @Column(columnDefinition = "TEXT")
    private String changes; // Store changes as JSON,
}