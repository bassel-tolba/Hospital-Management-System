package mine.profile.website.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "assessment_types", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "name" }) // Ensure template names are unique
})
@Getter
@Setter
@NoArgsConstructor
public class AssessmentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "childAssessment", used as identifier

    @Column(nullable = false)
    private String displayName; // e.g., "Child Assessment", for UI display

    @Lob // Large Object for potentially long HTML content
    @Column(nullable = false, columnDefinition = "TEXT")
    private String templateContent; // The actual HTML template string

    public AssessmentType(String name, String displayName, String templateContent) {
        this.name = name;
        this.displayName = displayName;
        this.templateContent = templateContent;
    }
}