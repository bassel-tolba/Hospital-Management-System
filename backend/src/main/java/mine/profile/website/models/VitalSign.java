package mine.profile.website.models;

import java.time.LocalDateTime;

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
public class VitalSign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    private double heartRate;

    private double bloodPressureSystolic;

    private double bloodPressureDiastolic;

    private double temperature;

    private double respiratoryRate;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    public VitalSign(LocalDateTime timestamp, double heartRate, double bloodPressureSystolic,
            double bloodPressureDiastolic,
            double temperature, double respiratoryRate, Patient patient) {
        this.timestamp = timestamp;
        this.heartRate = heartRate;
        this.bloodPressureSystolic = bloodPressureSystolic;
        this.bloodPressureDiastolic = bloodPressureDiastolic;
        this.temperature = temperature;
        this.respiratoryRate = respiratoryRate;
        this.patient = patient;
    }
}