package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Patient;

@Getter
@Setter
@NoArgsConstructor
public class AdmissionDTO {
    private Long id;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private Long patientId;
    private String patientName;
    private Long bedId;
    private Long admissionTypeId;
    private String admissionTypeName;
    private double admissionTypePrice;

    public Admission toEntity(Patient patient, Bed bed, mine.profile.website.models.AdmissionType admissionType) {
        if (this == null) {
            return null;
        }
        Admission entity = new Admission();
        entity.setId(this.getId());
        entity.setAdmissionDate(this.getAdmissionDate());
        entity.setDischargeDate(this.getDischargeDate());
        entity.setPatient(patient);
        entity.setBed(bed);
        entity.setAdmissionType(admissionType);

        return entity;
    }

    public static AdmissionDTO toDto(Admission admission) {
        if (admission == null) {
            return null;
        }
        AdmissionDTO dto = new AdmissionDTO();
        dto.setId(admission.getId());
        dto.setAdmissionDate(admission.getAdmissionDate());
        dto.setDischargeDate(admission.getDischargeDate());
        if (admission.getPatient() != null) {
            dto.setPatientId(admission.getPatient().getId());
            dto.setPatientName(admission.getPatient().getFirstName() + " " + admission.getPatient().getLastName());
        }
        if (admission.getBed() != null) {
            dto.setBedId(admission.getBed().getId());
        }
        if (admission.getAdmissionType() != null) {
            dto.setAdmissionTypeId(admission.getAdmissionType().getId());
            dto.setAdmissionTypeName(admission.getAdmissionType().getName());
            dto.setAdmissionTypePrice(admission.getAdmissionType().getPrice());
        }
        return dto;
    }
}