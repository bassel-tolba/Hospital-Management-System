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
    // private int stock; // REMOVE THIS

    @Column(precision = 10, scale = 2)
    private BigDecimal price; // This is now the *selling* price

    private double amountPerUnit;

    @Enumerated(EnumType.STRING)
    private PricingUnit pricingUnit;

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescribedMedication> prescribedMedications;

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true) // Add this relationship
    private List<MedicationBatch> batches;

    public BigDecimal calculatePrice(double amount) {
        return this.price.multiply(BigDecimal.valueOf(amount * this.amountPerUnit));
    }

    // Calculate total stock dynamically
    public int getTotalStock() {
        return batches.stream()
                .mapToInt(MedicationBatch::getRemainingQuantity)
                .sum();
    }

    // No longer needed, handled by MedicationBatch
    // public void increaseStock(int quantity) { ... }
    // public void decreaseStock(int quantity) { ... }
}