package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.ProductDTO;
import mine.profile.website.dtos.history.ProductHistoryDTO;
import mine.profile.website.exception.InsufficientStockException;
import mine.profile.website.models.Inventory;
import mine.profile.website.models.Product;
import mine.profile.website.models.history.ProductHistory;
import mine.profile.website.repository.InventoryRepository;
import mine.profile.website.repository.ProductRepository;
import mine.profile.website.repository.history.ProductHistoryRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductHistoryRepository productHistoryRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public ProductService(ProductRepository productRepository, InventoryRepository inventoryRepository,
            ProductHistoryRepository productHistoryRepository, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.productHistoryRepository = productHistoryRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = ProductDTO.toEntity(dto);
        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setStock(dto.getStock() != null ? dto.getStock() : 0);
        inventoryRepository.save(inventory);

        savedProduct.setInventory(inventory);
        createProductHistory(savedProduct, "CREATE", null, dto);
        return ProductDTO.toDto(savedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream()
                .map(ProductDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO findById(Long id) {
        return productRepository.findById(id)
                .map(ProductDTO::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Product ID: " + id));
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Product ID: " + id));
        ProductDTO oldProductDTO = ProductDTO.toDto(product);
        Product updatedProduct = ProductDTO.toEntity(dto);
        product.setCode(updatedProduct.getCode());
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPricingModel(updatedProduct.getPricingModel());
        product.setType(updatedProduct.getType());
        product.setUnitPrice(updatedProduct.getUnitPrice());
        product.setUnit(updatedProduct.getUnit());
        Product savedProduct = productRepository.save(product);
        createProductHistory(savedProduct, "UPDATE", oldProductDTO, dto);

        return ProductDTO.toDto(savedProduct);
    }

    @Transactional
    public void deleteById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Product ID: " + id));

        productRepository.delete(product);
        createProductHistory(product, "DELETE", null, null);
    }

    @Transactional
    public Page<ProductDTO> searchProducts(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (searchTerm == null) {
            searchTerm = new String("");
        }
        Page<Product> productPage = productRepository.searchProducts(searchTerm, pageable);
        return productPage.map(ProductDTO::toDto);
    }

    @Transactional
    public ProductDTO increaseStock(Long productId, int quantity) {
        return increaseStock(productId, quantity, null);
    }

    @Transactional
    public ProductDTO increaseStock(Long productId, int quantity, String reason) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product id: " + productId));

        ProductDTO oldProductDTO = ProductDTO.toDto(inventory.getProduct());
        inventory.increaseStock(quantity);
        inventoryRepository.save(inventory);
        createProductHistory(inventory.getProduct(), "STOCK_INCREASE", oldProductDTO,
                ProductDTO.toDto(inventory.getProduct()), reason);
        return ProductDTO.toDto(inventory.getProduct());
    }

    @Transactional
    public ProductDTO decreaseStock(Long productId, int quantity) {
        return decreaseStock(productId, quantity, null);
    }

    @Transactional
    public ProductDTO decreaseStock(Long productId, int quantity, String reason) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product id: " + productId));

        ProductDTO oldProductDTO = ProductDTO.toDto(inventory.getProduct());

        try {
            inventory.decreaseStock(quantity);
            inventoryRepository.save(inventory);
        } catch (InsufficientStockException e) {
            throw e;
        }
        createProductHistory(inventory.getProduct(), "STOCK_DECREASE", oldProductDTO,
                ProductDTO.toDto(inventory.getProduct()), reason);

        return ProductDTO.toDto(inventory.getProduct());
    }

    private void createProductHistory(Product product, String action, ProductDTO oldData, ProductDTO newData) {
        createProductHistory(product, action, oldData, newData, null);
    }

    private void createProductHistory(Product product, String action, ProductDTO oldData, ProductDTO newData,
            String reason) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "system";
        String changes = "";

        try {
            Map<String, Object> difference = getDifference(oldData, newData);
            if (reason != null)
                difference.put("reason", reason);
            if (difference != null && !difference.isEmpty()) {
                changes = objectMapper.writeValueAsString(difference);
            } else if (oldData == null && newData != null) {
                changes = objectMapper.writeValueAsString(newData);
            } else if (oldData != null && newData == null) {
                changes = objectMapper.writeValueAsString(oldData);
            }
        } catch (Exception e) {
            changes = "could not map the changes";
        }

        ProductHistory history = new ProductHistory();
        history.setProduct(product);
        history.setAction(action);
        history.setTimestamp(LocalDateTime.now());
        history.setUserName(username);
        history.setChanges(changes);

        productHistoryRepository.save(history);
    }

    private Map<String, Object> getDifference(ProductDTO oldData, ProductDTO newData) {
        if (oldData == null && newData == null)
            return null;
        ObjectMapper mapper = new ObjectMapper();
        try {
            String old = mapper.writeValueAsString(oldData);
            String newOne = mapper.writeValueAsString(newData);
            JsonNode oldNode = mapper.readTree(old);
            JsonNode newNode = mapper.readTree(newOne);

            Map<String, Object> differences = new HashMap<>();
            Iterator<String> fieldNames = newNode.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                JsonNode newValue = newNode.get(fieldName);
                if (!oldNode.has(fieldName) || !oldNode.get(fieldName).equals(newValue)) {
                    differences.put(fieldName, newValue);
                }
            }
            return differences;
        } catch (Exception e) {
            return null;
        }

    }

    @Transactional
    public Map<String, Object> getProductHistory(Long productId, LocalDateTime start, LocalDateTime end,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductHistory> historyPage;

        if (productId != null) {
            historyPage = productHistoryRepository.findAllByProductIdAndTimestampBetween(productId, start,
                    end, pageable);
        } else {
            historyPage = productHistoryRepository.findAllByTimestampBetween(start, end, pageable);
        }

        List<ProductHistoryDTO> historyDTOs = historyPage.getContent().stream()
                .map(ProductHistoryDTO::toDto)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("history", historyDTOs);
        result.put("totalPages", historyPage.getTotalPages());
        result.put("totalElements", historyPage.getTotalElements());
        return result;
    }

    @Transactional
    public void clearProductHistory() {
        productHistoryRepository.deleteAll();
    }
}