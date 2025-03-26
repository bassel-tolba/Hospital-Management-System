// AppointmentRepository.java (Corrected and Complete)
package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Dashboard Queries
    @Query("SELECT COUNT(a) FROM Appointment a")
    long countAllAppointments();

    // Find appointments by patient ID, exclude deleted patients, and order by
    // appointment date/time.
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.patient.deleted = false ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    // Find appointments by user ID, and order by appointment date/time. This gets
    // ALL for a user.
    @Query("SELECT a FROM Appointment a WHERE a.user.id = :userId ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // Find appointments by user ID, EXCLUDE COMPLETED AND CANCELLED, order by
    // appointment date/time. For user calendar.
    @Query("SELECT a FROM Appointment a WHERE a.user.id = :userId AND a.status NOT IN ('COMPLETED','CANCELLED') ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByUserIdAndNotCompleted(@Param("userId") Long userId, Pageable pageable);

    // Find appointments by both patient and user IDs, exclude deleted patients,
    // order by appointment date/time.
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.user.id = :userId AND a.patient.deleted = false ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByPatientIdAndUserId(@Param("patientId") Long patientId, @Param("userId") Long userId,
            Pageable pageable);

    // General search (add more fields to the WHERE clause as needed), exclude
    // deleted patients, order by appointment date/time.
    @Query("SELECT a FROM Appointment a WHERE " +
            "(LOWER(a.patient.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.patient.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.user.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.user.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND a.patient.deleted = false " + // Exclude deleted patients
            "ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> searchAppointments(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Override findAll to exclude deleted patients. VERY IMPORTANT, and order by
    // appointment date/time.
    @Override
    @Query("SELECT a FROM Appointment a WHERE a.patient.deleted = false ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findAll(Pageable pageable);

    @Override
    @Query("SELECT a FROM Appointment a WHERE a.patient.deleted = false") // No ordering needed for a simple list
    List<Appointment> findAll();

    // Find appointments by patient ID that are not deleted, and order by
    // appointment date/time
    @Query("SELECT a FROM Appointment a JOIN a.patient p WHERE p.id = :patientId AND p.deleted = false ORDER BY a.appointmentDateTime ASC")
    Page<Appointment> findByPatientIdAndNotDeleted(@Param("patientId") Long patientId, Pageable pageable);

    // Check if an appointment is linked to a PatientProductUsage
    @Query("SELECT COUNT(ppu) > 0 FROM PatientProductUsage ppu WHERE ppu.product.type = 'APPOINTMENT' AND ppu.startTime = :startTime AND ppu.endTime = :endTime AND ppu.patient.id = :patientId")
    boolean isAppointmentLinkedToProductUsage(@Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime, @Param("patientId") Long patientId);

    // Sort by appointmentDateTime, latest first (Used in your original code,
    // keeping it for completeness)
    Page<Appointment> findByPatientIdOrderByAppointmentDateTimeDesc(Long patientId, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.appointmentDateTime >= :admissionDate ORDER BY a.appointmentDateTime DESC")
    Page<Appointment> findByPatientIdAndAppointmentDateTimeAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);

    List<Appointment> findByPatientId(Long patientId); // This was duplicated!
}