package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Payment;

@Getter
@Setter
@NoArgsConstructor
public class PaymentDTO {
    private Long id;
    private LocalDateTime paymentDate;
    private double amount;
    private String paymentMethod;
    private Long billingId;
    private String statistics; // Add statistics field

    public Payment toEntity(Billing billing) {
        Payment payment = new Payment();
        payment.setId(this.id);
        payment.setPaymentDate(this.paymentDate);
        payment.setAmount(this.amount);
        payment.setPaymentMethod(this.paymentMethod);
        payment.setBilling(billing);
        payment.setStatistics(this.statistics); // Set statistics
        return payment;

    }

    public static PaymentDTO toDto(Payment payment) {
        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setId(payment.getId());
        paymentDTO.setPaymentDate(payment.getPaymentDate());
        paymentDTO.setAmount(payment.getAmount());
        paymentDTO.setPaymentMethod(payment.getPaymentMethod());
        if (payment.getBilling() != null) {
            paymentDTO.setBillingId(payment.getBilling().getId());
        }
        paymentDTO.setStatistics(payment.getStatistics()); // Get statistics

        return paymentDTO;
    }

}