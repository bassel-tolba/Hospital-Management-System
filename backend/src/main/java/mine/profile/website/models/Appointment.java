package mine.profile.website.models;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime appointmentDateTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status; // New status field

    public enum AppointmentStatus {
        SCHEDULED, // Default, initially scheduled
        COMPLETED, // Manually marked as completed
        MISSED, // Automatically set if past due and not completed. Could also be manually set.
        CANCELLED // Added cancelled state
    }

    public Appointment(LocalDateTime appointmentDateTime, LocalDateTime startTime, LocalDateTime endTime,
            Patient patient, User user) {
        this.appointmentDateTime = appointmentDateTime;
        this.startTime = startTime;
        this.endTime = endTime;
        this.patient = patient;
        this.user = user;
        this.status = AppointmentStatus.SCHEDULED; // Initialize to SCHEDULED
    }
}
