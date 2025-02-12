package mine.profile.website.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Prescription;

@Getter
@Setter
@NoArgsConstructor
public class PrescriptionDTO {

    private Long id;
    private LocalDateTime prescriptionDate;
    private String note;
    private Long patientId;
    private String patientName;
    private Integer validityDays;

    private LocalDate expirationDate;
    private List<PrescribedMedicationDTO> prescribedMedications;

    public static PrescriptionDTO toDto(Prescription prescription) {

        if (prescription == null) {
            return null;
        }

        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setPatientName(prescription.getPatient().getFirstName() + " " + prescription.getPatient().getLastName());
        dto.setId(prescription.getId());
        dto.setPrescriptionDate(prescription.getPrescriptionDate());
        dto.setNote(prescription.getNote());
        dto.setPatientId(prescription.getPatient().getId());
        dto.setValidityDays(prescription.getValidityDays());
        dto.setExpirationDate(prescription.getExpirationDate());
        dto.setPrescribedMedications(prescription.getPrescribedMedications().stream()
                .map(PrescribedMedicationDTO::toDto).collect(Collectors.toList()));
        return dto;
    }

    public static Prescription toEntity(PrescriptionDTO dto, Patient patient) {
        if (dto == null) {
            return null;
        }
        Prescription entity = new Prescription();
        entity.setId(dto.getId());
        entity.setPrescriptionDate(dto.getPrescriptionDate());
        entity.setNote(dto.getNote());
        entity.setPatient(patient);
        entity.setValidityDays(dto.getValidityDays());
        return entity;
    }
}