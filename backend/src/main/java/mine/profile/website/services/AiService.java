package mine.profile.website.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
// Removed RestTemplate related imports

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
// Removed RestTemplate and API key/URL values as they are handled by GeminiRestService
import org.springframework.stereotype.Service;

import mine.profile.website.dto.AiCheckResponse;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    // Inject the existing GeminiRestService
    @Autowired
    private GeminiRestService geminiRestService;

    // == Public Methods for Controller ==

    public AiCheckResponse checkMedicationConflicts(List<String> medicationNames) {
        if (medicationNames == null || medicationNames.isEmpty()) {
            return new AiCheckResponse("NONE", "No medications provided for conflict check.", Collections.emptyList());
        }
        String prompt = createConflictPrompt(medicationNames);
        try {
            // Call the new method in GeminiRestService
            String rawResponse = geminiRestService.generateTextContent(prompt);
            logger.debug("Raw Gemini Conflict Response from Service: {}", rawResponse);
            // Parse the raw text response using the logic specific to this use case
            return parseGeminiResponse(rawResponse);
        } catch (Exception e) {
            // Catch exceptions from generateTextContent (API call/parsing errors)
            logger.error("Error during conflict check via GeminiRestService: {}", e.getMessage(), e);
            return AiCheckResponse.errorResponse(e.getMessage());
        }
    }

    public AiCheckResponse checkPatientHistory(List<String> medicationNames, String allergies, String medicalHistory) {
        if (medicationNames == null || medicationNames.isEmpty()) {
            return new AiCheckResponse("NONE", "No medications provided for history check.", Collections.emptyList());
        }
        String prompt = createHistoryPrompt(medicationNames, allergies, medicalHistory);
        try {
            // Call the new method in GeminiRestService
            String rawResponse = geminiRestService.generateTextContent(prompt);
            logger.debug("Raw Gemini History Response from Service: {}", rawResponse);
            // Parse the raw text response
            return parseGeminiResponse(rawResponse);
        } catch (Exception e) {
            logger.error("Error during patient history check via GeminiRestService: {}", e.getMessage(), e);
            return AiCheckResponse.errorResponse(e.getMessage());
        }
    }

    // == Prompt Creation (Keep these here) ==

    private String createConflictPrompt(List<String> medicationNames) {
        String medicationList = String.join(", ", medicationNames);
        return String.format( /* ... keep your prompt format ... */
                """
                        Analyze the potential interactions between the following medications: %s.

                        Provide the response strictly in the following format, using only the specified keywords:

                        Severity: [NONE | MINOR | MODERATE | SEVERE]
                        Explanation: [A brief, clear explanation of the interaction, if any, in a single paragraph.]
                        Warnings: [A concise bulleted list of any warnings, starting each with '- '. If severity is NONE, this section can be omitted or contain '- No significant warnings.']
                        """,
                medicationList);
    }

    private String createHistoryPrompt(List<String> medicationNames, String allergies, String medicalHistory) {
        String medicationList = String.join(", ", medicationNames);
        String safeAllergies = allergies == null || allergies.isBlank() ? "None reported"
                : allergies.replaceAll("[\n\r]", " ");
        String safeHistory = medicalHistory == null || medicalHistory.isBlank() ? "None reported"
                : medicalHistory.replaceAll("[\n\r]", " ");

        return String.format( /* ... keep your prompt format ... */
                """
                        Analyze potential risks of prescribing the following medications: %s
                        To a patient with:
                        Allergies: %s
                        Medical History: %s

                        Provide the response strictly in the following format, using only the specified keywords:

                        Severity: [NONE | MINOR | MODERATE | SEVERE]
                        Explanation: [A brief, clear explanation of potential risks based on the patient's allergies and history, in a single paragraph.]
                        Warnings: [A concise bulleted list of specific warnings related to the patient's profile, starting each with '- '. If severity is NONE, this section can be omitted or contain '- No significant warnings based on history.']
                        """,
                medicationList, safeAllergies, safeHistory);
    }

    // == Gemini API Interaction (REMOVED - Handled by GeminiRestService) ==
    // private String callGeminiApi(String prompt) { ... } // REMOVE THIS

    // == Response Parsing (Keep this logic here as it's specific to the structured
    // response needed) ==
    private AiCheckResponse parseGeminiResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            logger.warn("Parsing blank response received from Gemini service.");
            return AiCheckResponse.parsingErrorResponse("Received blank response.");
        }
        // ... (Keep the exact parsing logic from the previous AiService example) ...
        String severity = "NONE";
        String explanation = "No explanation provided.";
        List<String> warnings = new ArrayList<>();
        String[] lines = rawResponse.split("\\r?\\n");
        boolean inWarningsSection = false;

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty())
                continue;

            if (line.toLowerCase().startsWith("severity:")) {
                severity = line.substring("severity:".length()).trim().toUpperCase();
                if (!List.of("NONE", "MINOR", "MODERATE", "SEVERE").contains(severity)) {
                    logger.warn("Gemini returned unexpected severity: {}", severity);
                    severity = "NONE";
                }
                inWarningsSection = false;
            } else if (line.toLowerCase().startsWith("explanation:")) {
                explanation = line.substring("explanation:".length()).trim();
                inWarningsSection = false;
            } else if (line.toLowerCase().startsWith("warnings:")) {
                inWarningsSection = true;
                if (explanation.equals("No explanation provided.") && !severity.equals("NONE")) {
                    logger.warn("Response format issue: 'Warnings:' found before 'Explanation:'.");
                }
            } else if (inWarningsSection && line.startsWith("-")) {
                warnings.add(line.substring(1).trim());
            } else if (inWarningsSection) {
                logger.debug("Line in warnings section without '-': {}", line);
                if (!warnings.isEmpty()) {
                    warnings.set(warnings.size() - 1, warnings.get(warnings.size() - 1) + " " + line);
                } else {
                    warnings.add(line);
                }
            } else {
                if (explanation.equals("No explanation provided.")) {
                    explanation = line;
                } else {
                    logger.debug("Unexpected line in response: {}", line);
                }
            }
        }

        if (explanation.equals("No explanation provided.") && severity.equals("NONE") && warnings.isEmpty()) {
            explanation = "No significant interactions or risks identified.";
        }
        if (!severity.equals("NONE") && warnings.isEmpty()) {
            warnings.add("General warning: Monitor for potential effects.");
            logger.warn("No specific warnings extracted for {} severity, adding default.", severity);
        }

        return new AiCheckResponse(severity, explanation, warnings);
    }
}