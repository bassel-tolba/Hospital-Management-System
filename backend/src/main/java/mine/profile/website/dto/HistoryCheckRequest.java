package mine.profile.website.dto;

import java.util.List;

import jakarta.validation.Valid; // Use Jakarta validation
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class HistoryCheckRequest {

    @NotEmpty(message = "Medication names cannot be empty.")
    private List<String> medicationNames;

    @NotNull(message = "Patient information is required.")
    @Valid // Enable validation of nested PatientInfo fields
    private PatientInfo patientInfo;

    // --- Nested PatientInfo DTO ---
    public static class PatientInfo {
        private String allergies; // Can be null or empty string if none
        private String medicalHistory; // Can be null or empty string if none

        // Getters and Setters for PatientInfo
        public String getAllergies() {
            // Return empty string if null to avoid "null" in prompts
            return allergies == null ? "" : allergies;
        }

        public void setAllergies(String allergies) {
            this.allergies = allergies;
        }

        public String getMedicalHistory() {
            // Return empty string if null
            return medicalHistory == null ? "" : medicalHistory;
        }

        public void setMedicalHistory(String medicalHistory) {
            this.medicalHistory = medicalHistory;
        }
    }
    // --- End of Nested PatientInfo DTO ---

    // Getters and Setters for HistoryCheckRequest
    public List<String> getMedicationNames() {
        return medicationNames;
    }

    public void setMedicationNames(List<String> medicationNames) {
        this.medicationNames = medicationNames;
    }

    public PatientInfo getPatientInfo() {
        return patientInfo;
    }

    public void setPatientInfo(PatientInfo patientInfo) {
        this.patientInfo = patientInfo;
    }
}