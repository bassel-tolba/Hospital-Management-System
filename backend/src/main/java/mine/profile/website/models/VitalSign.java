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
    private Double heartRate; // Changed to Double
    private Double bloodPressureSystolic; // Changed to Double
    private Double bloodPressureDiastolic; // Changed to Double
    private Double temperature; // Changed to Double
    private Double respiratoryRate; // Changed to Double
    private Double oxygenSaturation; // Changed to Double
    private Integer painLevel; // Changed to Integer
    private Double height; // Changed to Double
    private String heightUnit;
    private Double weight; // Changed to Double
    private String weightUnit;
    private Double glucose; // Changed to Double
    private String glucoseUnit;
    private String posture;
    private Double capillaryRefillTime; // Changed to Double
    private String notes;
    private String method;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    public VitalSign(LocalDateTime timestamp, Double heartRate, Double bloodPressureSystolic,
            Double bloodPressureDiastolic,
            Double temperature, Double respiratoryRate, Double oxygenSaturation, Integer painLevel, Double height,
            String heightUnit,
            Double weight, String weightUnit, Double glucose, String glucoseUnit, String posture,
            Double capillaryRefillTime, String method, Patient patient) {
        this.timestamp = timestamp;
        this.heartRate = heartRate;
        this.bloodPressureSystolic = bloodPressureSystolic;
        this.bloodPressureDiastolic = bloodPressureDiastolic;
        this.temperature = temperature;
        this.respiratoryRate = respiratoryRate;
        this.oxygenSaturation = oxygenSaturation;
        this.painLevel = painLevel;
        this.height = height;
        this.heightUnit = heightUnit;
        this.weight = weight;
        this.weightUnit = weightUnit;
        this.glucose = glucose;
        this.glucoseUnit = glucoseUnit;
        this.posture = posture;
        this.capillaryRefillTime = capillaryRefillTime;
        this.method = method;
        this.patient = patient;
    }
}