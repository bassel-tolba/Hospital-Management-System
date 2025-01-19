package mine.profile.website.dtos;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Medication;
import mine.profile.website.models.PricingUnit;

@Getter
@Setter
@NoArgsConstructor
public class MedicationDTO {
    private Long id;
    private String name;
    private String dosage;
    private String imageURL;
    private BigDecimal price;
    private double amountPerUnit;
    private PricingUnit pricingUnit;
    private int stock;

    public static MedicationDTO toDto(Medication medication) {
        if (medication == null) {
            return null;
        }
        MedicationDTO dto = new MedicationDTO();
        dto.setId(medication.getId());
        dto.setName(medication.getName());
        dto.setDosage(medication.getDosage());
        dto.setImageURL(medication.getImageURL());
        dto.setPrice(medication.getPrice());
        dto.setAmountPerUnit(medication.getAmountPerUnit());
        dto.setPricingUnit(medication.getPricingUnit());
        dto.setStock(medication.getStock());
        return dto;
    }

    public static Medication toEntity(MedicationDTO dto) {
        if (dto == null) {
            return null;
        }
        Medication entity = new Medication();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDosage(dto.getDosage());
        entity.setImageURL(dto.getImageURL());
        entity.setPrice(dto.getPrice());
        entity.setAmountPerUnit(dto.getAmountPerUnit());
        entity.setPricingUnit(dto.getPricingUnit());
        entity.setStock(dto.getStock());
        return entity;
    }
}