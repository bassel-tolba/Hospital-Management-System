package mine.profile.website.dtos.dashboard.payments;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PaymentStatisticsDTO {

    private double totalPaymentAmount;
    private JsonNode aggregatedDetails;

    public PaymentStatisticsDTO(double totalPaymentAmount, JsonNode aggregatedDetails) {
        this.totalPaymentAmount = totalPaymentAmount;
        this.aggregatedDetails = aggregatedDetails;
    }
}