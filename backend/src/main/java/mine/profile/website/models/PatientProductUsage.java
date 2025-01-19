package mine.profile.website.models;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class PatientProductUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "billing_id", nullable = false)
    private Billing billing;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private BigDecimal quantity; // Amount of product used (relevant for PER_UNIT and PER_USE)

    @Transient
    private BigDecimal price; // Total price for this usage

    public PatientProductUsage(Patient patient, Product product, LocalDateTime startTime, LocalDateTime endTime,
            BigDecimal quantity, Billing billing) {
        this.patient = patient;
        this.product = product;
        this.startTime = startTime;
        this.endTime = endTime;
        this.quantity = quantity;
        this.billing = billing;
    }

    public BigDecimal getPrice() {
        if (product == null || product.getUnitPrice() == null) {
            return BigDecimal.ZERO;
        }

        switch (product.getPricingModel()) {
            case PER_UNIT:
                return calculatePricePerUnit();
            case PER_TIME:
                return calculatePricePerTime();
            case PER_USE:
                return calculatePricePerUse();
            case FIXED:
                return calculatePriceFixed();
            default:
                return BigDecimal.ZERO; // Should not happen, but handle the default case
        }
    }

    private BigDecimal calculatePricePerUnit() {
        if (quantity == null)
            return BigDecimal.ZERO;
        return product.getUnitPrice().multiply(quantity);
    }

    private BigDecimal calculatePricePerUse() {
        return product.getUnitPrice(); // Price per use regardless of quantity in one use
    }

    private BigDecimal calculatePricePerTime() {
        if (startTime == null || endTime == null)
            return BigDecimal.ZERO;

        Duration duration = Duration.between(startTime, endTime);
        BigDecimal timeInHours = BigDecimal.valueOf(duration.toMinutes() / 60.0);
        return product.getUnitPrice().multiply(timeInHours);

    }

    private BigDecimal calculatePriceFixed() {
        return product.getUnitPrice(); // fixed price regardless the quantity or the time
    }
}