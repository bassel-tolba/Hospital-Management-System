package mine.profile.website.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty; // Use Jakarta validation

public class ConflictCheckRequest {

    @NotEmpty(message = "Medication names cannot be empty.")
    private List<String> medicationNames;

    // Getter and Setter
    public List<String> getMedicationNames() {
        return medicationNames;
    }

    public void setMedicationNames(List<String> medicationNames) {
        this.medicationNames = medicationNames;
    }
}