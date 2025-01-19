package mine.profile.website.dtos;

import org.springframework.beans.factory.annotation.Autowired;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Medication;
import mine.profile.website.models.PrescribedMedication;
import mine.profile.website.models.Prescription;
import mine.profile.website.repository.MedicationRepository;

@Getter
@Setter
@NoArgsConstructor
public class PrescribedMedicationDTO {

    @Autowired
    private MedicationRepository medicationRepository;

    private Long id;
    private Long prescriptionId;
    private Long medicationId;
    private String medicationName;
    private String dosage;
    private String route;
    private double amount;
    private boolean expired;

    public static PrescribedMedicationDTO toDto(PrescribedMedication prescribedMedication) {

        if (prescribedMedication == null) {
            return null;
        }

        PrescribedMedicationDTO dto = new PrescribedMedicationDTO();
        dto.setId(prescribedMedication.getId());
        dto.setMedicationName(prescribedMedication.getMedication().getName());
        dto.setPrescriptionId(prescribedMedication.getPrescription().getId());
        dto.setMedicationId(prescribedMedication.getMedication().getId());
        dto.setDosage(prescribedMedication.getDosage());
        dto.setRoute(prescribedMedication.getRoute());
        dto.setAmount(prescribedMedication.getAmount());
        dto.setExpired(prescribedMedication.isExpired());
        return dto;
    }

    public static PrescribedMedication toEntity(PrescribedMedicationDTO dto, Prescription prescription,
            Medication medication) {
        if (dto == null) {
            return null;
        }

        PrescribedMedication entity = new PrescribedMedication();
        entity.setId(dto.getId());
        entity.setPrescription(prescription);
        entity.setMedication(medication);
        entity.setDosage(dto.getDosage());
        entity.setRoute(dto.getRoute());
        entity.setAmount(dto.getAmount());
        entity.setExpired(dto.isExpired());
        return entity;
    }
}