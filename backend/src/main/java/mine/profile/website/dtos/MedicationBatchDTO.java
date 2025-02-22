package mine.profile.website.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.MedicationBatch;

@Getter
@Setter
@NoArgsConstructor
public class MedicationBatchDTO {
    private Long id;
    private Long medicationId; // You might include this for convenience
    private LocalDateTime purchaseDate;
    private BigDecimal purchasePrice;
    private int quantity;
    private int remainingQuantity;

    public static MedicationBatchDTO toDto(MedicationBatch batch) {
        MedicationBatchDTO dto = new MedicationBatchDTO();
        dto.setId(batch.getId());
        dto.setMedicationId(batch.getMedication().getId()); // Set medicationId
        dto.setPurchaseDate(batch.getPurchaseDate());
        dto.setPurchasePrice(batch.getPurchasePrice());
        dto.setQuantity(batch.getQuantity());
        dto.setRemainingQuantity(batch.getRemainingQuantity());
        return dto;
    }

    public static MedicationBatch toEntity(MedicationBatchDTO dto) {
        MedicationBatch batch = new MedicationBatch();
        batch.setId(dto.getId());
        // Don't set medication here; it should be set in the service
        batch.setPurchaseDate(dto.getPurchaseDate());
        batch.setPurchasePrice(dto.getPurchasePrice());
        batch.setQuantity(dto.getQuantity());
        batch.setRemainingQuantity(dto.getRemainingQuantity());
        return batch;
    }
}