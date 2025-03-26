// Billing.java (Entity)
package mine.profile.website.models;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.Where;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Where(clause = "deleted = false") // Add this annotation
public class Billing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime billDate;

    private double totalAmount;

    private boolean isPaid;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments;

    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProcedureLog> procedureLogs;

    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PatientProductUsage> patientProductUsages;

    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LabResult> labResults;

    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImageReport> imageReports;

    @OneToMany(mappedBy = "billing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicationAdministration> medicationAdministrations;

    @Lob
    @Column(columnDefinition = "TEXT") // Use TEXT for large HTML content
    private String paidBillHtml;

    private LocalDateTime paidDate;

    private boolean deleted = false; // Add this field

    public Billing(LocalDateTime billDate, double totalAmount, boolean isPaid, Patient patient) {
        this.billDate = billDate;
        this.totalAmount = totalAmount;
        this.isPaid = isPaid;
        this.patient = patient;
    }
}