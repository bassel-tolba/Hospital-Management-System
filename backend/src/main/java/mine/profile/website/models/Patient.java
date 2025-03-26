// models/Patient.java (Modified)
package mine.profile.website.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
@Where(clause = "deleted = false")
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

    private String profilePictureURL;

    @Column(unique = true)
    private String medicalRecordNumber;

    private String bloodType;

    private String allergies;

    @Lob
    private String medicalHistory;

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

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuickNote> quickNotes = new ArrayList<>(); // Initialize the list

    private boolean deleted = false;

    public Unit getUnit() {
        return getCurrentAdmission()
                .map(admission -> admission.getBed().getRoom().getUnit())
                .orElse(null);
    }

    public Room getRoom() {
        return getCurrentAdmission().map(admission -> admission.getBed().getRoom()).orElse(null);
    }

    public Optional<Admission> getCurrentAdmission() {
        if (admissions == null || admissions.isEmpty()) {
            return Optional.empty();
        }

        return admissions.stream()
                .filter(admission -> admission.getDischargeDate() == null
                        || admission.getDischargeDate().isAfter(LocalDateTime.now()))
                .max(Comparator.comparing(Admission::getAdmissionDate));
    }

    // Add helper methods for QuickNotes
    public void addQuickNote(QuickNote quickNote) {
        quickNotes.add(quickNote);
        quickNote.setPatient(this); // Set the bidirectional relationship
    }

    public void removeQuickNote(QuickNote quickNote) {
        quickNotes.remove(quickNote);
        quickNote.setPatient(null); // Important for orphan removal
    }
}