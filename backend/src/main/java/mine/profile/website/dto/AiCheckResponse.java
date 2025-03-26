package mine.profile.website.dto;

import java.util.List;

public class AiCheckResponse {
    private String severity;
    private String explanation;
    private List<String> warnings;

    // Constructors (optional, but good practice)
    public AiCheckResponse() {
    }

    public AiCheckResponse(String severity, String explanation, List<String> warnings) {
        this.severity = severity;
        this.explanation = explanation;
        this.warnings = warnings;
    }

    // Standard Getters and Setters
    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    // Default response for errors or failures
    public static AiCheckResponse errorResponse(String message) {
        return new AiCheckResponse("NONE", "Error performing check: " + message, List.of());
    }

    public static AiCheckResponse parsingErrorResponse(String message) {
        return new AiCheckResponse("NONE", "Error parsing AI response: " + message, List.of());
    }
}