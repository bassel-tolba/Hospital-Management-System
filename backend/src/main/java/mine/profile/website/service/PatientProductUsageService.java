package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.PatientProductUsageDTO;
import mine.profile.website.exception.InsufficientStockException;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Inventory;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PatientProductUsage;
import mine.profile.website.models.Product;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.InventoryRepository;
import mine.profile.website.repository.PatientProductUsageRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.ProductRepository;

@Service
public class PatientProductUsageService {

    private final PatientProductUsageRepository patientProductUsageRepository;
    private final PatientRepository patientRepository;
    private final ProductRepository productRepository;
    private final BillingRepository billingRepository;
    private final InventoryRepository inventoryRepository;

    public PatientProductUsageService(PatientProductUsageRepository patientProductUsageRepository,
            PatientRepository patientRepository,
            ProductRepository productRepository,
            BillingRepository billingRepository,
            InventoryRepository inventoryRepository) {
        this.patientProductUsageRepository = patientProductUsageRepository;
        this.patientRepository = patientRepository;
        this.productRepository = productRepository;
        this.billingRepository = billingRepository;
        this.inventoryRepository = inventoryRepository;
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
        if (billing != null) {

            Billing savedBilling = billingRepository.save(billing);
        }
        PatientProductUsage savedUsage = patientProductUsageRepository.save(usage);

        // Decrease stock if applicable and if the usage was saved successfully
        decreaseStockForUsage(savedUsage);

        return PatientProductUsageDTO.toDto(savedUsage);
    }

    private void decreaseStockForUsage(PatientProductUsage usage) {
        Product product = usage.getProduct();
        if (product.getPricingModel() == Product.PricingModel.PER_UNIT) {
            Inventory inventory = inventoryRepository.findByProductId(product.getId())
                    .orElseThrow(
                            () -> new IllegalStateException("Inventory not found for product: " + product.getId()));

            try {
                inventory.decreaseStock(usage.getQuantity().intValue()); // Assuming quantity is the number of units
                inventoryRepository.save(inventory);
            } catch (InsufficientStockException e) {
                throw e; // Re-throw to be handled by a global exception handler
            }
        }
        // No stock reduction for PER_TIME, PER_USE, or FIXED
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
        patientProductUsageRepository.deleteById(id);
    }
}