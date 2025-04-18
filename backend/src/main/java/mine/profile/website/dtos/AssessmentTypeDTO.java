package mine.profile.website.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.AssessmentType;

@Getter
@Setter
@NoArgsConstructor
public class AssessmentTypeDTO {
    private Long id;
    private String name;
    private String displayName;
    private String templateContent; // Include content for detail views

    // Constructor for full DTO
    public AssessmentTypeDTO(Long id, String name, String displayName, String templateContent) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.templateContent = templateContent;
    }

    // Constructor for list DTO (without content)
    public AssessmentTypeDTO(Long id, String name, String displayName) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.templateContent = null; // Explicitly null
    }

    // Static helper method to create a DTO from an Entity (including content)
    public static AssessmentTypeDTO fromEntity(AssessmentType entity) {
        if (entity == null) {
            return null;
        }
        return new AssessmentTypeDTO(
                entity.getId(),
                entity.getName(),
                entity.getDisplayName(),
                entity.getTemplateContent());
    }

    // Static helper method to create a DTO from an Entity (excluding content)
    public static AssessmentTypeDTO fromEntityWithoutContent(AssessmentType entity) {
        if (entity == null) {
            return null;
        }
        return new AssessmentTypeDTO(
                entity.getId(),
                entity.getName(),
                entity.getDisplayName(), // Content is null by constructor
                entity.getTemplateContent());
    }
}