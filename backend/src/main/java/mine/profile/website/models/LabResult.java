package mine.profile.website.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lab_result")
@Getter
@Setter
@NoArgsConstructor
public class LabResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime resultDateTime;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Object resultData;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User performedBy;

    @ManyToOne
    @JoinColumn(name = "lab_test_id")
    private LabTest labTest;

    @ManyToOne
    @JoinColumn(name = "billing_id", nullable = false)
    private Billing billing;

    public LabResult(LocalDateTime resultDateTime, String notes, Patient patient,
            User performedBy, LabTest labTest, Billing billing) {
        this.resultDateTime = resultDateTime;
        this.notes = notes;
        this.patient = patient;
        this.performedBy = performedBy;
        this.labTest = labTest;
        this.billing = billing;
    }
}