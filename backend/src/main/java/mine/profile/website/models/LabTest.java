package mine.profile.website.models;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lab_test")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String testName;
    private String testCode;
    private Double price;
    private String description;
    private String referenceRange;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structure_data", columnDefinition = "jsonb")
    private Object structureData;
}