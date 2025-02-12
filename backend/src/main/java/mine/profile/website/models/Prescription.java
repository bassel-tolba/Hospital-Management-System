package mine.profile.website.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime prescriptionDate;
    private String note;
    private Integer validityDays;

    private LocalDate expirationDate;
    private boolean expired; // You might still need this if you want to explicitly mark a prescription as
                             // expired even if it's within it's validity period

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescribedMedication> prescribedMedications;

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
        if (prescriptionDate != null) {
            this.expirationDate = prescriptionDate.toLocalDate().plusDays(validityDays);
        }
    }
}