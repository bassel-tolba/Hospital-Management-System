package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.ProductDTO;
import mine.profile.website.models.Product;
import mine.profile.website.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = ProductDTO.toEntity(dto);
        Product savedProduct = productRepository.save(product);
        return ProductDTO.toDto(savedProduct);
    }

    @Transactional
    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream()
                .map(ProductDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
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
}