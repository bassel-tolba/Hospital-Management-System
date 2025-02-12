package mine.profile.website.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.exception.InsufficientStockException;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "product_id", unique = true)
    private Product product;

    private int stock;

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
                throw new InsufficientStockException("Not enough stock for product: " + this.product.getName());
            }
        } else {
            throw new IllegalArgumentException("Quantity must be positive to decrease stock");
        }
    }
}