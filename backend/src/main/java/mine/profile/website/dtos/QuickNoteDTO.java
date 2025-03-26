// QuickNoteDTO.java  (Create this DTO)
package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.QuickNote;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuickNoteDTO {
    private Long id;
    private String noteText;
    private LocalDateTime createdAt;
    private Long patientId; // Include patientId for easier association in frontend
    private String addedByUser;

    public static QuickNoteDTO toDto(QuickNote quickNote) {
        QuickNoteDTO dto = new QuickNoteDTO();
        dto.setId(quickNote.getId());
        dto.setNoteText(quickNote.getNoteText());
        dto.setCreatedAt(quickNote.getCreatedAt());
        dto.setPatientId(quickNote.getPatient().getId()); // Get the patient ID
        dto.setAddedByUser(quickNote.getAddedByUser());
        return dto;
    }
}