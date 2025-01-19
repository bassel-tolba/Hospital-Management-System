package mine.profile.website.models;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.exception.InsufficientStockException;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Medication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String dosage;
    private String imageURL;
    private int stock;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    private double amountPerUnit;

    @Enumerated(EnumType.STRING)
    private PricingUnit pricingUnit;

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescribedMedication> prescribedMedications;

    public BigDecimal calculatePrice(double amount) {
        return this.price.multiply(BigDecimal.valueOf(amount * this.amountPerUnit));
    }

    public void increaseStock(int quantity) {
        if (quantity > 0) {
            this.stock += quantity;
        } else {
            throw new IllegalArgumentException("Quantity must be positive to increase stock");
        }
    }

    public void decreaseStock(int quantity) {
        if (quantity > 0) {
            if (this.stock >= quantity) {
                this.stock -= quantity;
            } else {
                throw new InsufficientStockException("Not enough stock for medication: " + this.name);
            }
        } else {
            throw new IllegalArgumentException("Quantity must be positive to decrease stock");
        }
    }
}