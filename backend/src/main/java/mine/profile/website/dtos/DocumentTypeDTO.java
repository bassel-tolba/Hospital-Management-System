// DocumentTypeDTO.java
package mine.profile.website.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.DocumentType;

@Getter
@Setter
@NoArgsConstructor
public class DocumentTypeDTO {
    private Long id;
    private String name;

    public DocumentType toEntity() {
        DocumentType documentType = new DocumentType();
        documentType.setId(this.id);
        documentType.setName(this.name);
        return documentType;
    }

    public static DocumentTypeDTO toDto(DocumentType documentType) {
        DocumentTypeDTO dto = new DocumentTypeDTO();
        dto.setId(documentType.getId());
        dto.setName(documentType.getName());
        return dto;
    }
}