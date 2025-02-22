// In ProductHistoryDTO.java
package mine.profile.website.dtos.history;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Product;
import mine.profile.website.models.history.ProductHistory;

@Getter
@Setter
@NoArgsConstructor
public class ProductHistoryDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String action;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    private String userName;
    private String changes;

    public static ProductHistoryDTO toDto(ProductHistory productHistory) {
        if (productHistory == null) {
            return null;
        }
        ProductHistoryDTO dto = new ProductHistoryDTO();
        dto.setId(productHistory.getId());
        dto.setProductId(productHistory.getProduct().getId());
        dto.setProductName(productHistory.getProduct().getName());
        dto.setAction(productHistory.getAction());
        dto.setTimestamp(productHistory.getTimestamp());
        dto.setUserName(productHistory.getUserName());
        dto.setChanges(productHistory.getChanges());
        return dto;
    }

    public static ProductHistory toEntity(ProductHistoryDTO dto, Product product) {
        if (dto == null) {
            return null;
        }
        ProductHistory entity = new ProductHistory();
        entity.setId(dto.getId());
        entity.setProduct(product);
        entity.setAction(dto.getAction());
        entity.setTimestamp(dto.getTimestamp());
        entity.setUserName(dto.getUserName());
        entity.setChanges(dto.getChanges());
        return entity;
    }
}