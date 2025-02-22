package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import mine.profile.website.dtos.PatientProductUsageDTO;
import mine.profile.website.dtos.history.ProductHistoryDTO;
import mine.profile.website.exception.InsufficientStockException;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PatientProductUsage;
import mine.profile.website.models.Product;
import mine.profile.website.models.history.ProductHistory;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.InventoryRepository;
import mine.profile.website.repository.PatientProductUsageRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.ProductRepository;
import mine.profile.website.repository.history.ProductHistoryRepository;

@Service
public class PatientProductUsageService {

    private final PatientProductUsageRepository patientProductUsageRepository;
    private final PatientRepository patientRepository;
    private final ProductRepository productRepository;
    private final BillingRepository billingRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductHistoryRepository productHistoryRepository;
    private final ObjectMapper objectMapper;
    private final ProductService productService;

    public PatientProductUsageService(PatientProductUsageRepository patientProductUsageRepository,
            PatientRepository patientRepository,
            ProductRepository productRepository,
            BillingRepository billingRepository,
            InventoryRepository inventoryRepository,
            ProductHistoryRepository productHistoryRepository,
            ObjectMapper objectMapper,
            ProductService productService) {
        this.patientProductUsageRepository = patientProductUsageRepository;
        this.patientRepository = patientRepository;
        this.productRepository = productRepository;
        this.billingRepository = billingRepository;
        this.inventoryRepository = inventoryRepository;
        this.productHistoryRepository = productHistoryRepository;
        this.objectMapper = objectMapper;
        this.productService = productService;
    }

    @Transactional
    public PatientProductUsageDTO createPatientProductUsage(PatientProductUsageDTO dto) {
        Objects.requireNonNull(dto, "PatientProductUsageDTO cannot be null");
        Objects.requireNonNull(dto.getPatientId(), "Patient ID cannot be null");
        Objects.requireNonNull(dto.getProductId(), "Product ID cannot be null");

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + dto.getPatientId()));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Product ID: " + dto.getProductId()));

        if (product.getPricingModel() == Product.PricingModel.PER_TIME) {
            if (dto.getStartTime() == null || dto.getEndTime() == null) {
                throw new IllegalArgumentException("Start and End times are required for PER_TIME pricing model");
            }
            if (dto.getEndTime().isBefore(dto.getStartTime())) {
                throw new IllegalArgumentException("End time cannot be before start time");
            }
        }
        if (product.getPricingModel() == Product.PricingModel.PER_UNIT && dto.getQuantity() == null) {
            throw new IllegalArgumentException("Quantity must be specified for PER_UNIT pricing");
        }
        if ((product.getPricingModel() == Product.PricingModel.PER_USE
                || product.getPricingModel() == Product.PricingModel.FIXED) && dto.getQuantity() != null) {
            throw new IllegalArgumentException("Quantity must not be specified for PER_USE or FIXED pricing");
        }

        PatientProductUsage usage = PatientProductUsageDTO.toEntity(dto);
        usage.setPatient(patient);
        usage.setProduct(product);

        Billing billing = null;
        List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
        if (!bills.isEmpty()) {
            billing = bills.get(0); // Get the most recent bill
        }
        usage.setBilling(billing);

        if (dto.getStartTime() != null) {
            usage.setStartTime(dto.getStartTime());
        } else {
            usage.setStartTime(LocalDateTime.now());
        }

        if (dto.getEndTime() != null) {
            usage.setEndTime(dto.getEndTime());
        }

        if (dto.getQuantity() != null) {
            usage.setQuantity(dto.getQuantity());
        }

        // Adjust stock *ONLY* for PER_UNIT
        if (product.getPricingModel() == Product.PricingModel.PER_UNIT) {
            try {
                productService.decreaseStock(product.getId(), usage.getQuantity().intValue(), "Product Usage");
            } catch (InsufficientStockException e) {
                throw e;
            }
        }

        PatientProductUsage savedUsage = patientProductUsageRepository.save(usage);
        createProductHistoryFromUsage(savedUsage, "PRODUCT_USAGE");
        return PatientProductUsageDTO.toDto(savedUsage);
    }

    private void createProductHistoryFromUsage(PatientProductUsage usage, String action) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "system";
        String changes = "";

        try {
            Map<String, Object> usageDetails = new HashMap<>();
            usageDetails.put("patientId", usage.getPatient().getId());
            usageDetails.put("productId", usage.getProduct().getId());
            usageDetails.put("startTime", usage.getStartTime());
            usageDetails.put("endTime", usage.getEndTime());
            usageDetails.put("quantity", usage.getQuantity());

            changes = objectMapper.writeValueAsString(usageDetails);
        } catch (Exception e) {
            changes = "Could not map usage details";
        }

        ProductHistory history = new ProductHistory();
        history.setProduct(usage.getProduct());
        history.setAction(action);
        history.setTimestamp(LocalDateTime.now());
        history.setUserName(username);
        history.setChanges(changes);

        productHistoryRepository.save(history);
    }

    @Transactional
    public Page<PatientProductUsageDTO> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientProductUsage> patientProductUsagePage = patientProductUsageRepository.findAll(pageable);
        return patientProductUsagePage.map(PatientProductUsageDTO::toDto);
    }

    @Transactional
    public Page<PatientProductUsageDTO> findAllByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientProductUsage> patientProductUsagePage = patientProductUsageRepository.findByPatientId(patientId,
                pageable);
        return patientProductUsagePage.map(PatientProductUsageDTO::toDto);
    }

    @Transactional
    public PatientProductUsageDTO findById(Long id) {
        return patientProductUsageRepository.findById(id)
                .map(PatientProductUsageDTO::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid PatientProductUsage ID: " + id));
    }

    @Transactional
    public void deleteById(Long id) {
        PatientProductUsage usage = patientProductUsageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid PatientProductUsage ID: " + id));

        Product product = usage.getProduct();

        // Increase stock *ONLY* for PER_UNIT
        if (product.getPricingModel() == Product.PricingModel.PER_UNIT) {
            productService.increaseStock(product.getId(), usage.getQuantity().intValue(), "Reverted Product Usage");
        }

        createProductHistoryFromUsage(usage, "PRODUCT_USAGE_REVERTED");
        patientProductUsageRepository.delete(usage);
    }

    @Transactional
    public List<ProductHistoryDTO> getAllProductHistory() {
        return productHistoryRepository.findAll().stream().map(ProductHistoryDTO::toDto)
                .collect(Collectors.toList());
    }
}