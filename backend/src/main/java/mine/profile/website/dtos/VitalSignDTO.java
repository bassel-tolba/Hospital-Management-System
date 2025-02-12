package mine.profile.website.dtos;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Patient;
import mine.profile.website.models.VitalSign;

@Getter
@Setter
@NoArgsConstructor
public class VitalSignDTO {
    private Long id;
    private LocalDateTime timestamp;

    @Min(value = 0, message = "Heart rate must be a positive number")
    private Double heartRate;

    @Min(value = 0, message = "Blood pressure must be a positive number")
    private Double bloodPressureSystolic;

    @Min(value = 0, message = "Blood pressure must be a positive number")
    private Double bloodPressureDiastolic;

    @Min(value = 20, message = "Temperature can't be that low")
    @Max(value = 50, message = "Temperature can't be that high")
    private Double temperature;

    @Min(value = 0, message = "Respiratory rate must be a positive number")
    private Double respiratoryRate;

    @Min(value = 0, message = "Oxygen saturation must be a positive number")
    @Max(value = 100, message = "Oxygen saturation must be less than 100")
    private Double oxygenSaturation;

    @Min(value = 0, message = "Pain level must be a positive number")
    @Max(value = 10, message = "Pain level must be less than 10")
    private Integer painLevel;
    private Double height;
    private String heightUnit;
    private Double weight;
    private String weightUnit;
    private Double glucose;
    private String glucoseUnit;
    private String posture;
    private Double capillaryRefillTime;
    private String notes;
    private Long patientId;
    private String method;

    public VitalSign toEntity(Patient patient) {
        VitalSign entity = new VitalSign();
        entity.setId(this.getId());
        entity.setTimestamp(this.getTimestamp());
        entity.setHeartRate(this.heartRate);
        entity.setBloodPressureSystolic(this.bloodPressureSystolic);
        entity.setBloodPressureDiastolic(this.bloodPressureDiastolic);
        entity.setTemperature(this.temperature);
        entity.setRespiratoryRate(this.respiratoryRate);
        entity.setOxygenSaturation(this.oxygenSaturation);
        entity.setPainLevel(this.painLevel);
        entity.setHeight(this.height);
        entity.setHeightUnit(this.heightUnit);
        entity.setWeight(this.weight);
        entity.setWeightUnit(this.weightUnit);
        entity.setGlucose(this.glucose);
        entity.setGlucoseUnit(this.glucoseUnit);
        entity.setPosture(this.posture);
        entity.setCapillaryRefillTime(this.capillaryRefillTime);
        entity.setNotes(this.notes);
        entity.setMethod(this.getMethod());
        entity.setPatient(patient);
        return entity;
    }

    public static VitalSignDTO toDto(VitalSign vitalSign) {
        if (vitalSign == null)
            return null;

        VitalSignDTO dto = new VitalSignDTO();
        dto.setId(vitalSign.getId());
        dto.setTimestamp(vitalSign.getTimestamp());
        dto.setHeartRate(vitalSign.getHeartRate());
        dto.setBloodPressureSystolic(vitalSign.getBloodPressureSystolic());
        dto.setBloodPressureDiastolic(vitalSign.getBloodPressureDiastolic());
        dto.setTemperature(vitalSign.getTemperature());
        dto.setRespiratoryRate(vitalSign.getRespiratoryRate());
        dto.setOxygenSaturation(vitalSign.getOxygenSaturation());
        dto.setPainLevel(vitalSign.getPainLevel());
        dto.setHeight(vitalSign.getHeight());
        dto.setHeightUnit(vitalSign.getHeightUnit());
        dto.setWeight(vitalSign.getWeight());
        dto.setWeightUnit(vitalSign.getWeightUnit());
        dto.setGlucose(vitalSign.getGlucose());
        dto.setGlucoseUnit(vitalSign.getGlucoseUnit());
        dto.setPosture(vitalSign.getPosture());
        dto.setCapillaryRefillTime(vitalSign.getCapillaryRefillTime());
        dto.setNotes(vitalSign.getNotes());
        dto.setMethod(vitalSign.getMethod());
        if (vitalSign.getPatient() != null) {
            dto.setPatientId(vitalSign.getPatient().getId());
        }
        return dto;
    }
}