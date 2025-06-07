// AppointmentService.java (UPDATED)
package mine.profile.website.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.AppointmentDTO;
import mine.profile.website.models.Appointment;
import mine.profile.website.models.Appointment.AppointmentStatus;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PatientProductUsage;
import mine.profile.website.models.Product;
import mine.profile.website.models.User;
import mine.profile.website.repository.AppointmentRepository;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.PatientProductUsageRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.ProductRepository;
import mine.profile.website.repository.UserRepository;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final BillingRepository billingRepository;
    private final PatientProductUsageRepository patientProductUsageRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            BillingRepository billingRepository,
            PatientProductUsageRepository patientProductUsageRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.billingRepository = billingRepository;
        this.patientProductUsageRepository = patientProductUsageRepository;
    }

    @Transactional
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        // ... existing createAppointment logic ...
        // No changes needed here
        Objects.requireNonNull(appointmentDTO, "AppointmentDTO cannot be null");
        Objects.requireNonNull(appointmentDTO.getPatientId(), "Patient ID cannot be null");
        Objects.requireNonNull(appointmentDTO.getUserId(), "User ID cannot be null");
        Objects.requireNonNull(appointmentDTO.getProductId(), "Product ID cannot be null");

        logger.info("Creating appointment for patientId: {}, userId: {}, productId: {}",
                appointmentDTO.getPatientId(), appointmentDTO.getUserId(), appointmentDTO.getProductId());

        Patient patient = patientRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Invalid Patient ID: " + appointmentDTO.getPatientId()));

        if (patient.isDeleted()) {
            logger.warn("Attempt to create appointment for deleted patient: {}", appointmentDTO.getPatientId());
            throw new IllegalArgumentException(
                    "Cannot create appointment for deleted patient: " + appointmentDTO.getPatientId());
        }

        User user = userRepository.findById(appointmentDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid User ID: " + appointmentDTO.getUserId()));

        Product product = productRepository.findById(appointmentDTO.getProductId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Invalid Product ID: " + appointmentDTO.getProductId()));

        logger.info("Product found for appointment creation: ID={}, Name={}, Type={}", product.getId(),
                product.getName(), product.getType());

        if (product.getType() != Product.ProductType.APPOINTMENT) {
            logger.error("Invalid Product Type for appointment. Expected APPOINTMENT, got {}. Product ID: {}",
                    product.getType(), product.getId());
            throw new IllegalArgumentException("Invalid Product Type: " + product.getType() + ". Must be APPOINTMENT.");
        }

        Appointment appointment = AppointmentDTO.toEntity(appointmentDTO);
        appointment.setPatient(patient);
        appointment.setUser(user);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setStartTime(appointmentDTO.getStartTime());
        appointment.setEndTime(appointmentDTO.getEndTime());
        appointment.setAppointmentDateTime(appointmentDTO.getAppointmentDateTime());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        logger.info("Appointment saved with ID: {}, StartTime: {}, EndTime: {}", savedAppointment.getId(),
                savedAppointment.getStartTime(), savedAppointment.getEndTime());

        Billing billing = null;
        List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
        if (!bills.isEmpty() && !bills.get(0).isPaid()) {
            billing = bills.get(0);
            logger.info("Using existing unpaid bill ID: {} for patient ID: {}", billing.getId(), patient.getId());
        } else {
            billing = new Billing();
            billing.setPatient(patient);
            billing.setBillDate(LocalDateTime.now());
            billing.setTotalAmount(0.0);
            billing.setPaid(false);
            billing = billingRepository.save(billing);
            logger.info("Created new bill ID: {} for patient ID: {}", billing.getId(), patient.getId());
        }

        PatientProductUsage productUsage = new PatientProductUsage();
        productUsage.setPatient(patient);
        productUsage.setProduct(product);
        productUsage.setBilling(billing);
        productUsage.setStartTime(savedAppointment.getStartTime());
        productUsage.setEndTime(savedAppointment.getEndTime());

        if (product.getPricingModel() == Product.PricingModel.PER_TIME) {
            if (savedAppointment.getStartTime() == null || savedAppointment.getEndTime() == null) {
                logger.error("Start and End times are required for PER_TIME pricing model for appointment ID: {}",
                        savedAppointment.getId());
                throw new IllegalArgumentException(
                        "Start and End times are required for PER_TIME pricing model for appointments.");
            }
            if (savedAppointment.getEndTime().isBefore(savedAppointment.getStartTime())) {
                logger.error("End time cannot be before start time for appointment ID: {}", savedAppointment.getId());
                throw new IllegalArgumentException("End time cannot be before start time for appointments.");
            }
            productUsage.setQuantity(BigDecimal.ONE);
        } else {
            productUsage.setQuantity(BigDecimal.ONE);
        }

        PatientProductUsage savedPPU = patientProductUsageRepository.save(productUsage);
        logger.info(
                "PatientProductUsage saved: ID={}, PatientID={}, ProductID={}, StartTime={}, EndTime={}, BillingID={}",
                savedPPU.getId(), savedPPU.getPatient().getId(), savedPPU.getProduct().getId(),
                savedPPU.getStartTime(), savedPPU.getEndTime(), savedPPU.getBilling().getId());

        appointmentDTO.setId(savedAppointment.getId());
        appointmentDTO.setProductCode(product.getCode());
        appointmentDTO.setProductName(product.getName());
        appointmentDTO.setProductType(product.getType());
        appointmentDTO.setStatus(savedAppointment.getStatus());
        appointmentDTO.setAppointmentDateTime(savedAppointment.getAppointmentDateTime());
        appointmentDTO.setStartTime(savedAppointment.getStartTime());
        appointmentDTO.setEndTime(savedAppointment.getEndTime());
        appointmentDTO.setPatientFirstName(patient.getFirstName());
        appointmentDTO.setPatientLastName(patient.getLastName());
        appointmentDTO.setUserFirstName(user.getFirstName());
        appointmentDTO.setUserLastName(user.getLastName());

        return appointmentDTO;
    }

    // --- NEW METHOD TO HANDLE UPDATE LOGIC ---
    @Transactional
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        logger.info("Updating appointment with ID: {}", id);
        Appointment existingAppointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Appointment ID: " + id));

        // This handles partial updates gracefully. If a field in the DTO is null, it's
        // ignored.
        // If it has a value, it's used for the update.

        // Update status if provided
        if (appointmentDTO.getStatus() != null) {
            logger.info("Updating status for appointment {} to {}", id, appointmentDTO.getStatus());
            existingAppointment.setStatus(appointmentDTO.getStatus());
        }

        // Update date/time fields if provided
        if (appointmentDTO.getAppointmentDateTime() != null) {
            existingAppointment.setAppointmentDateTime(appointmentDTO.getAppointmentDateTime());
        }
        if (appointmentDTO.getStartTime() != null) {
            existingAppointment.setStartTime(appointmentDTO.getStartTime());
        }
        if (appointmentDTO.getEndTime() != null) {
            existingAppointment.setEndTime(appointmentDTO.getEndTime());
        }

        // Update related patient if ID is provided and different
        if (appointmentDTO.getPatientId() != null
                && !appointmentDTO.getPatientId().equals(existingAppointment.getPatient().getId())) {
            Patient patient = patientRepository.findById(appointmentDTO.getPatientId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Invalid Patient ID for update: " + appointmentDTO.getPatientId()));
            existingAppointment.setPatient(patient);
        }

        // Update related user if ID is provided and different
        if (appointmentDTO.getUserId() != null
                && !appointmentDTO.getUserId().equals(existingAppointment.getUser().getId())) {
            User user = userRepository.findById(appointmentDTO.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Invalid User ID for update: " + appointmentDTO.getUserId()));
            existingAppointment.setUser(user);
        }

        // Note: Updating the product is more complex as it's linked via
        // PatientProductUsage.
        // For now, this logic focuses on updating the core Appointment details.
        // If the product needs to change, the old PatientProductUsage might need to be
        // deleted and a new one created.

        Appointment savedAppointment = appointmentRepository.save(existingAppointment);
        logger.info("Successfully updated appointment with ID: {}", id);

        // Return a fully-populated DTO
        return mapToDtoWithProductDetails(savedAppointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(this::mapToDtoWithProductDetails);
    }

    // ... all other existing service methods ...
    // No changes needed for the rest of the file
    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientId(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId, pageable)
                .map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientIdAndAppointmentDateTimeAfter(Long patientId,
            LocalDateTime afterDateTime, Pageable pageable) {
        return appointmentRepository.findByPatientIdAndAppointmentDateTimeAfter(patientId, afterDateTime, pageable)
                .map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientIdAndNotDeleted(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientIdAndNotDeleted(patientId, pageable)
                .map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByUserId(Long userId, Pageable pageable) {
        return appointmentRepository.findByUserId(userId, pageable).map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientIdAndUserId(Long patientId, Long userId, Pageable pageable) {
        return appointmentRepository.findByPatientIdAndUserId(patientId, userId, pageable)
                .map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> searchAppointments(String searchTerm, Pageable pageable) {
        return appointmentRepository.searchAppointments(searchTerm, pageable).map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .map(this::mapToDtoWithProductDetails)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Appointment ID: " + id));
    }

    private AppointmentDTO mapToDtoWithProductDetails(Appointment appointment) {
        AppointmentDTO dto = AppointmentDTO.toDto(appointment);
        logger.debug("Mapping Appointment ID: {} to DTO. Initial DTO: {}", appointment.getId(), dto);

        if (appointment.getPatient() != null && appointment.getStartTime() != null
                && appointment.getEndTime() != null) {
            logger.debug(
                    "Attempting to find PPU for Appointment ID: {}. Patient ID: {}, StartTime: {}, EndTime: {}, ProductType: {}",
                    appointment.getId(),
                    appointment.getPatient().getId(),
                    appointment.getStartTime(),
                    appointment.getEndTime(),
                    Product.ProductType.APPOINTMENT);

            Optional<PatientProductUsage> usageOpt = patientProductUsageRepository
                    .findFirstByPatientAndStartTimeAndEndTimeAndProduct_TypeOrderByStartTimeDesc(
                            appointment.getPatient(),
                            appointment.getStartTime(),
                            appointment.getEndTime(),
                            Product.ProductType.APPOINTMENT);

            if (usageOpt.isPresent()) {
                PatientProductUsage usage = usageOpt.get();
                logger.debug("PPU found for Appointment ID: {}. PPU ID: {}. Product ID on PPU: {}",
                        appointment.getId(), usage.getId(),
                        (usage.getProduct() != null ? usage.getProduct().getId() : "null"));
                Product product = usage.getProduct();
                if (product != null) {
                    logger.debug("Product details for Appointment ID: {}: ProductID={}, Code={}, Name={}, Type={}",
                            appointment.getId(), product.getId(), product.getCode(), product.getName(),
                            product.getType());
                    dto.setProductId(product.getId());
                    dto.setProductCode(product.getCode());
                    dto.setProductName(product.getName());
                    dto.setProductType(product.getType());
                } else {
                    logger.warn("PPU ID: {} found for Appointment ID: {}, but its associated Product is null.",
                            usage.getId(), appointment.getId());
                }
            } else {
                logger.warn(
                        "No PatientProductUsage found for Appointment ID: {} (Patient ID: {}, StartTime: {}, EndTime: {}, Type: APPOINTMENT)",
                        appointment.getId(), appointment.getPatient().getId(), appointment.getStartTime(),
                        appointment.getEndTime());
            }
        } else {
            logger.warn("Skipping PPU lookup for Appointment ID: {} due to missing Patient, StartTime, or EndTime.",
                    appointment.getId());
            if (appointment.getPatient() == null)
                logger.warn("  - Patient is null for Appointment ID: {}", appointment.getId());
            if (appointment.getStartTime() == null)
                logger.warn("  - StartTime is null for Appointment ID: {}", appointment.getId());
            if (appointment.getEndTime() == null)
                logger.warn("  - EndTime is null for Appointment ID: {}", appointment.getId());
        }
        logger.debug("Final DTO for Appointment ID: {}: {}", appointment.getId(), dto);
        return dto;
    }

    @Transactional
    public AppointmentDTO endAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Appointment ID: " + id));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED
                || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Appointment is already completed or cancelled.");
        }

        if (appointment.getEndTime() != null && LocalDateTime.now().isAfter(appointment.getEndTime())
                && appointment.getStatus() != AppointmentStatus.COMPLETED
                && appointment.getStatus() != AppointmentStatus.MISSED) {
            appointment.setStatus(AppointmentStatus.MISSED);
        } else if (appointment.getStatus() != AppointmentStatus.MISSED) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        logger.info("Ended/Updated status for Appointment ID: {} to {}", savedAppointment.getId(),
                savedAppointment.getStatus());
        return mapToDtoWithProductDetails(savedAppointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Appointment ID: " + id));

        if (appointment.getPatient().isDeleted()) {
            logger.warn("Attempt to delete appointment for a deleted patient. Appointment ID: {}, Patient ID: {}", id,
                    appointment.getPatient().getId());
            throw new IllegalArgumentException("Cannot delete appointment for a deleted patient.");
        }

        boolean isLinked = patientProductUsageRepository
                .findFirstByPatientAndStartTimeAndEndTimeAndProduct_TypeOrderByStartTimeDesc(
                        appointment.getPatient(),
                        appointment.getStartTime(),
                        appointment.getEndTime(),
                        Product.ProductType.APPOINTMENT)
                .isPresent();

        if (isLinked) {
            logger.warn("Attempt to delete appointment ID: {} which is linked to a product usage.", id);
            throw new IllegalArgumentException(
                    "Cannot delete appointment because it is linked to a product usage. Consider cancelling it instead.");
        }

        appointmentRepository.delete(appointment);
        logger.info("Deleted Appointment ID: {}", id);
    }
}