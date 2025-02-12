package mine.profile.website.models;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductType type; // e.g., Medication, Device, Consumable, Service

    @Enumerated(EnumType.STRING)
    private PricingModel pricingModel; // e.g., PerUnit, PerTime, PerUse

    private BigDecimal unitPrice; // Price per unit, per time unit or whatever the pricing model defines

    private String unit; // e.g., "liter", "hour" "unit", null if it has a fixed price
    // for a product that has a fixed price like a specific medication for a certain
    // price
    // the product price can be fixed and dont need any unit or quantity for example
    // a pill of paracetamol

    @OneToOne(mappedBy = "product")
    private Inventory inventory;

    public enum ProductType {
        MEDICATION,
        DEVICE,
        CONSUMABLE,
        SERVICE
    }

    public enum PricingModel {
        PER_UNIT,
        PER_TIME,
        PER_USE,
        FIXED
    }

    public static BigDecimal calculatePrice(Product product, BigDecimal quantity) {
        if (product == null || quantity == null || product.getUnitPrice() == null) {
            return BigDecimal.ZERO;
        }
        return product.getUnitPrice().multiply(quantity);
    }
}