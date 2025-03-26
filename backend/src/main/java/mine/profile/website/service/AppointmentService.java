// AppointmentService.java (Corrected)
package mine.profile.website.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

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
        Objects.requireNonNull(appointmentDTO, "AppointmentDTO cannot be null");
        Objects.requireNonNull(appointmentDTO.getPatientId(), "Patient ID cannot be null");
        Objects.requireNonNull(appointmentDTO.getUserId(), "User ID cannot be null");
        Objects.requireNonNull(appointmentDTO.getProductId(), "Product ID cannot be null"); // Now using Product ID

        Patient patient = patientRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Invalid Patient ID: " + appointmentDTO.getPatientId()));

        if (patient.isDeleted()) {
            throw new IllegalArgumentException(
                    "Cannot create appointment for deleted patient: " + appointmentDTO.getPatientId());
        }

        User user = userRepository.findById(appointmentDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid User ID: " + appointmentDTO.getUserId()));

        Product product = productRepository.findById(appointmentDTO.getProductId()) // Use findById
                .orElseThrow(
                        () -> new IllegalArgumentException("Invalid Product ID: " + appointmentDTO.getProductId()));

        if (product.getType() != Product.ProductType.APPOINTMENT) {
            throw new IllegalArgumentException("Invalid Product Type: " + product.getType());
        }

        Appointment appointment = AppointmentDTO.toEntity(appointmentDTO);
        appointment.setPatient(patient);
        appointment.setUser(user);
        appointment.setStatus(AppointmentStatus.SCHEDULED); // Set initial status
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Billing integration using PatientProductUsage
        Billing billing = null;
        List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
        if (!bills.isEmpty()) {
            billing = bills.get(0); // Get the most recent bill
        }
        if (billing == null) {
            billing = new Billing();
            billing.setPatient(patient);
            billing.setBillDate(LocalDateTime.now());
            billing.setTotalAmount(0.0); // Set an initial value, it will be updated
            billing.setPaid(false);
            billing = billingRepository.save(billing); // Save the new billing record
        }

        PatientProductUsage productUsage = new PatientProductUsage();
        productUsage.setPatient(patient);
        productUsage.setProduct(product);
        productUsage.setBilling(billing);
        productUsage.setStartTime(appointment.getStartTime());
        productUsage.setEndTime(appointment.getEndTime());

        // Calculate quantity based on pricing model
        if (product.getPricingModel() == Product.PricingModel.PER_TIME) {
            if (appointment.getStartTime() == null || appointment.getEndTime() == null) {
                throw new IllegalArgumentException("Start and End times are required for PER_TIME pricing model");
            }
            if (appointment.getEndTime().isBefore(appointment.getStartTime())) {
                throw new IllegalArgumentException("End time cannot be before start time");
            }
            // Calculate quantity based on duration, as you did in PatientProductUsage
            productUsage.setQuantity(BigDecimal.ONE); // Placeholder, PatientProductUsage calculates the actual price
        } else {
            productUsage.setQuantity(BigDecimal.ONE); // For FIXED or PER_USE
        }

        patientProductUsageRepository.save(productUsage);
        appointmentDTO.setId(savedAppointment.getId()); // Set the ID for the response. *CRITICAL*
        appointmentDTO.setProductCode(product.getCode());
        appointmentDTO.setProductName(product.getName());
        appointmentDTO.setStatus(savedAppointment.getStatus());
        return appointmentDTO; // Return the DTO, not the entity

    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(AppointmentDTO::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientId(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable).map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientIdAndNotDeleted(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientIdAndNotDeleted(patientId, pageable)
                .map(this::mapToDtoWithProductDetails);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByUserId(Long userId, Pageable pageable) {
        // CORRECTED: Use findByUserId to get ALL appointments for the user.
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

    // Helper method to map to DTO and include product details
    private AppointmentDTO mapToDtoWithProductDetails(Appointment appointment) {
        AppointmentDTO dto = AppointmentDTO.toDto(appointment);
        // Find the associated PatientProductUsage to get the product details
        List<PatientProductUsage> usages = patientProductUsageRepository.findAll(); // Potentially inefficient, see
                                                                                    // optimization note below
        for (PatientProductUsage usage : usages) {
            if (usage.getProduct().getType() == Product.ProductType.APPOINTMENT &&
                    usage.getStartTime().equals(appointment.getStartTime()) &&
                    usage.getEndTime().equals(appointment.getEndTime()) &&
                    usage.getPatient().getId().equals(appointment.getPatient().getId())) {

                dto.setProductId(usage.getProduct().getId());
                dto.setProductCode(usage.getProduct().getCode());
                dto.setProductName(usage.getProduct().getName());
                break; // Assuming only one matching usage
            }
        }
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

        // Check if it's past the appointment time and not completed. If so, mark as
        // MISSED.
        if (appointment.getEndTime() != null && LocalDateTime.now().isAfter(appointment.getEndTime())
                && appointment.getStatus() != AppointmentStatus.COMPLETED) {
            appointment.setStatus(AppointmentStatus.MISSED);
        } else {
            appointment.setStatus(AppointmentStatus.COMPLETED); // Mark as completed
        }

        return mapToDtoWithProductDetails(appointmentRepository.save(appointment));
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Appointment ID: " + id));

        // Check if the associated patient is deleted.
        if (appointment.getPatient().isDeleted()) {
            throw new IllegalArgumentException("Cannot delete appointment for a deleted patient.");
        }

        // Check if the appointment is linked to any PatientProductUsage
        if (appointmentRepository.isAppointmentLinkedToProductUsage(appointment.getStartTime(),
                appointment.getEndTime(), appointment.getPatient().getId())) {
            throw new IllegalArgumentException("Cannot delete appointment because it is linked to a product usage.");
        }

        appointmentRepository.delete(appointment);
    }
}