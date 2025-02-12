// DocumentDTO.java
package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Document;
import mine.profile.website.models.DocumentType;
import mine.profile.website.models.Patient;
import mine.profile.website.models.User;

@Getter
@Setter
@NoArgsConstructor
public class DocumentDTO {
    private Long id;
    private String documentName;
    private String documentPath;
    private LocalDateTime uploadDate;
    private Long documentTypeId;
    private Long patientId;
    private Long uploadedById;
    private String uploadedByName;

    public Document toEntity(DocumentType documentType, Patient patient, User user) {
        Document document = new Document();
        document.setId(this.id);
        document.setDocumentName(this.documentName);
        document.setDocumentPath(this.documentPath);
        document.setUploadDate(this.uploadDate);
        document.setDocumentType(documentType);
        document.setPatient(patient);
        document.setUploadedBy(user);
        return document;
    }

    public static DocumentDTO toDto(Document document) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId());
        dto.setDocumentName(document.getDocumentName());
        dto.setDocumentPath(document.getDocumentPath());
        dto.setUploadDate(document.getUploadDate());
        dto.setDocumentTypeId(document.getDocumentType().getId());
        dto.setPatientId(document.getPatient().getId());
        dto.setUploadedById(document.getUploadedBy().getId());
        dto.setUploadedByName(document.getUploadedBy().getFirstName() + " " + document.getUploadedBy().getLastName());
        return dto;
    }
}