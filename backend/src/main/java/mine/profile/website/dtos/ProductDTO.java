package mine.profile.website.dtos;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Product;
import mine.profile.website.models.Product.PricingModel;
import mine.profile.website.models.Product.ProductType;

@Getter
@Setter
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private ProductType type;
    private PricingModel pricingModel;
    private BigDecimal unitPrice;
    private String unit;
    private Integer stock; // Add stock to the DTO

    public static ProductDTO toDto(Product product) {
        if (product == null) {
            return null;
        }
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setCode(product.getCode());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setUnitPrice(product.getUnitPrice());
        dto.setType(product.getType());
        dto.setPricingModel(product.getPricingModel());
        dto.setUnit(product.getUnit());
        if (product.getInventory() != null) {
            dto.setStock(product.getInventory().getStock());
        }
        return dto;
    }

    public static Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }
        Product entity = new Product();
        entity.setId(dto.getId());
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setUnitPrice(dto.getUnitPrice());
        entity.setType(dto.getType());
        entity.setPricingModel(dto.getPricingModel());
        entity.setUnit(dto.getUnit());
        // Note: We don't set the stock here. Stock is managed through the Inventory
        // entity.
        return entity;
    }
}