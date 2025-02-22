package mine.profile.website.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class MedicationBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    private LocalDateTime purchaseDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal purchasePrice; // Price *per unit* at the time of purchase

    private int quantity;

    private int remainingQuantity; // Crucial for FIFO tracking

    // You *could* add a supplier reference here if needed:
    // @ManyToOne
    // @JoinColumn(name = "supplier_id")
    // private Supplier supplier;
}