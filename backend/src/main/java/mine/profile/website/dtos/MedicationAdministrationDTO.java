package mine.profile.website.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Billing;
import mine.profile.website.models.MedicationAdministration;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PrescribedMedication;
import mine.profile.website.models.User;

@Getter
@Setter
@NoArgsConstructor
public class MedicationAdministrationDTO {
    private Long id;
    private Long patientId;
    private Long userId;
    private double amount;
    private BigDecimal calculatedPrice;
    private LocalDateTime administrationTime;
    private Long prescribedMedicationId;
    private String user;
    private String medicationName;
    private Long billingId;

    public static MedicationAdministrationDTO toDto(MedicationAdministration medicationAdministration) {
        if (medicationAdministration == null) {
            return null;
        }
        MedicationAdministrationDTO dto = new MedicationAdministrationDTO();
        dto.setMedicationName(medicationAdministration.getPrescribedMedication().getMedication().getName());
        dto.setUser(medicationAdministration.getUser().getUsername());
        dto.setId(medicationAdministration.getId());
        dto.setPatientId(medicationAdministration.getPatient().getId());
        dto.setUserId(medicationAdministration.getUser().getId());
        dto.setPrescribedMedicationId(medicationAdministration.getPrescribedMedication().getId());
        dto.setAmount(medicationAdministration.getAmount());
        dto.setCalculatedPrice(medicationAdministration.getCalculatedPrice());
        dto.setAdministrationTime(medicationAdministration.getAdministrationTime());
        if (medicationAdministration.getBilling() != null) {
            dto.setBillingId(medicationAdministration.getBilling().getId());
        }

        return dto;
    }

    public static MedicationAdministration toEntity(MedicationAdministrationDTO dto, Patient patient, User user,
            PrescribedMedication prescribedMedication, Billing billing) {
        if (dto == null) {
            return null;
        }
        MedicationAdministration entity = new MedicationAdministration();
        entity.setId(dto.getId());
        entity.setPatient(patient);
        entity.setUser(user);
        entity.setPrescribedMedication(prescribedMedication);
        entity.setAmount(dto.getAmount());
        entity.setCalculatedPrice(dto.getCalculatedPrice());
        entity.setAdministrationTime(dto.getAdministrationTime());
        entity.setBilling(billing);

        return entity;
    }

}