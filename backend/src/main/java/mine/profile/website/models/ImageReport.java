package mine.profile.website.models;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class ImageReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime reportDateTime;
    private String description;
    @Lob
    private String reportText;
    @ElementCollection
    @CollectionTable(name = "image_report_image_urls", joinColumns = @JoinColumn(name = "image_report_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User performedBy;

    @ManyToOne
    @JoinColumn(name = "image_report_type_id")
    private ImageReportType imageReportType;

    @ManyToOne
    @JoinColumn(name = "billing_id", nullable = false)
    private Billing billing;

    public ImageReport(LocalDateTime reportDateTime, String description, String reportText,
            List<String> imageUrls, Patient patient, User performedBy, ImageReportType imageReportType,
            Billing billing) {
        this.reportDateTime = reportDateTime;
        this.description = description;
        this.reportText = reportText;
        this.imageUrls = imageUrls;
        this.patient = patient;
        this.performedBy = performedBy;
        this.imageReportType = imageReportType;
        this.billing = billing;
    }
}