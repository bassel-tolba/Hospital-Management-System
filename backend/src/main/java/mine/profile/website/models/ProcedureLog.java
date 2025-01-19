package mine.profile.website.models;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
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
public class ProcedureLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String notes;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "procedure_id")
    private Procedure procedure;

    @ManyToOne
    @JoinColumn(name = "billing_id")
    private Billing billing;

    public ProcedureLog(LocalDateTime startTime, LocalDateTime endTime, String notes, User user, Procedure procedure,
            Billing billing) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
        this.user = user;
        this.procedure = procedure;
        this.billing = billing;
    }
}