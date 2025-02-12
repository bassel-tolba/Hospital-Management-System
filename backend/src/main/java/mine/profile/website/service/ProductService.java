package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.ProductDTO;
import mine.profile.website.exception.InsufficientStockException;
import mine.profile.website.models.Inventory;
import mine.profile.website.models.Product;
import mine.profile.website.repository.InventoryRepository;
import mine.profile.website.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = ProductDTO.toEntity(dto);
        Product savedProduct = productRepository.save(product);

        // Create initial inventory
        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setStock(dto.getStock() != null ? dto.getStock() : 0); // Use DTO stock or default to 0
        inventoryRepository.save(inventory);

        savedProduct.setInventory(inventory); // Link inventory to product
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
        Product updatedProduct = ProductDTO.toEntity(dto);
        product.setCode(updatedProduct.getCode());
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPricingModel(updatedProduct.getPricingModel());
        product.setType(updatedProduct.getType());
        product.setUnitPrice(updatedProduct.getUnitPrice());
        product.setUnit(updatedProduct.getUnit());
        Product savedProduct = productRepository.save(product);
        return ProductDTO.toDto(savedProduct);
    }

    @Transactional
    public void deleteById(Long id) {
        productRepository.deleteById(id);
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
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product id: " + productId));

        inventory.increaseStock(quantity);
        inventoryRepository.save(inventory);

        return ProductDTO.toDto(inventory.getProduct());
    }

    @Transactional
    public ProductDTO decreaseStock(Long productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product id: " + productId));

        try {
            inventory.decreaseStock(quantity);
            inventoryRepository.save(inventory);
        } catch (InsufficientStockException e) {
            throw e; // Re-throw the exception to be handled by a controller advice or similar
        }

        return ProductDTO.toDto(inventory.getProduct());
    }
}