package mine.profile.website.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.PatientProductUsage;

@Getter
@Setter
@NoArgsConstructor
public class PatientProductUsageDTO {
    private Long id;
    private Long patientId;
    private Long productId;
    private String productName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal quantity;
    private BigDecimal price;
    private Long billingId;

    public static PatientProductUsageDTO toDto(PatientProductUsage usage) {
        PatientProductUsageDTO dto = new PatientProductUsageDTO();
        dto.setId(usage.getId());
        dto.setPatientId(usage.getPatient().getId());
        dto.setProductId(usage.getProduct().getId());
        dto.setProductName(usage.getProduct().getName());
        dto.setStartTime(usage.getStartTime());
        dto.setEndTime(usage.getEndTime());
        dto.setQuantity(usage.getQuantity());
        dto.setPrice(usage.getPrice());
        if (usage.getBilling() != null) {
            dto.setBillingId(usage.getBilling().getId());
        }
        return dto;
    }

    public static PatientProductUsage toEntity(PatientProductUsageDTO dto) {
        PatientProductUsage usage = new PatientProductUsage();
        usage.setId(dto.getId());
        usage.setStartTime(dto.getStartTime());
        usage.setEndTime(dto.getEndTime());
        usage.setQuantity(dto.getQuantity());
        return usage;
    }
}