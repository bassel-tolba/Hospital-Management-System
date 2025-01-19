package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    // Dashboard Queries
    @Query("SELECT COUNT(a) FROM Appointment a")
    long countAllAppointments();

    @Query(value = "SELECT DATE(appointment_date_time) as date, count(*) from appointment group by date", nativeQuery = true)
    List<Object[]> countAppointmentsByDate();
}