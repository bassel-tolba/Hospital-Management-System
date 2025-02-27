// models/Patient.java
package mine.profile.website.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.hibernate.annotations.Where;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Where(clause = "deleted = false") // Add this annotation
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    private String gender;

    private String address;

    private String phoneNumber;

    private String email;

    // NEW: Image URL field
    private String profilePictureURL;

    @Column(unique = true) // VERY IMPORTANT: Ensures uniqueness in the database
    private String medicalRecordNumber;

    private String bloodType;

    private String allergies;

    @Lob
    private String medicalHistory;

    // Change severityLevel to Integer and add validation
    @Min(value = 1, message = "Severity level must be at least 1")
    @Max(value = 5, message = "Severity level must be at most 5")
    private Integer severityLevel;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Prescription> prescriptions;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Admission> admissions;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Assessment> assessments;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NursingCarePlan> nursingCarePlans;

    private boolean deleted = false; // Add this field

    public Unit getUnit() {
        return getCurrentAdmission()
                .map(admission -> admission.getBed().getRoom().getUnit())
                .orElse(null);
    }

    public Room getRoom() {
        return getCurrentAdmission().map(admission -> admission.getBed().getRoom()).orElse(null);
    }

    // Helper method to get the *current* (active) admission
    public Optional<Admission> getCurrentAdmission() {
        if (admissions == null || admissions.isEmpty()) {
            return Optional.empty();
        }

        // Find the *latest* admission that is still active
        return admissions.stream()
                .filter(
                        admission -> admission.getDischargeDate() == null
                                || admission.getDischargeDate().isAfter(LocalDateTime.now()))
                .max(Comparator.comparing(Admission::getAdmissionDate)); // Most recent, active admission
    }
}