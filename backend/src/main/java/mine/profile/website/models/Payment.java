package mine.profile.website.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_date")
    @NotNull(message = "Payment date cannot be null")
    private LocalDateTime paymentDate;

    private double amount;

    private String paymentMethod;

    @ManyToOne
    @JoinColumn(name = "billing_id")
    private Billing billing;

    @Column(columnDefinition = "TEXT") // Use TEXT for potentially large JSON strings
    private String statistics;

    public Payment(LocalDateTime paymentDate, double amount, String paymentMethod, Billing billing, String statistics) {
        this.paymentDate = paymentDate;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.billing = billing;
        this.statistics = statistics;
    }
}