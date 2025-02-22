package mine.profile.website.dtos.dashboard.payments;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTrendDTO {
    private String date;
    private String category;
    private Double amount; // Double
    private Double count; // Double
}