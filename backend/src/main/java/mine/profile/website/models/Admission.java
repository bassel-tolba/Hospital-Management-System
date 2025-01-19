package mine.profile.website.models;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Admission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime admissionDate;

    private LocalDateTime dischargeDate;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToOne
    @JoinColumn(name = "bed_id")
    private Bed bed;

    public Admission(LocalDateTime admissionDate, LocalDateTime dischargeDate, Patient patient, Bed bed) {
        this.admissionDate = admissionDate;
        this.dischargeDate = dischargeDate;
        this.patient = patient;
        this.bed = bed;
    }
}