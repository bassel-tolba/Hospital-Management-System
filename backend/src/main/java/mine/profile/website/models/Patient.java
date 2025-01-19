package mine.profile.website.models;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    private String medicalRecordNumber;

    private String bloodType;

    private String allergies;

    @Lob
    private String medicalHistory;

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

    @ManyToMany(mappedBy = "patients")
    private Set<Nurse> nurses;

    public Unit getUnit() {
        if (this.admissions != null && !this.admissions.isEmpty()) {
            return this.admissions.get(0).getBed().getRoom().getUnit();
        }
        return null;
    }

    public Room getRoom() {
        if (this.admissions != null && !this.admissions.isEmpty()) {
            return this.admissions.get(0).getBed().getRoom();

        }
        return null;
    }

}