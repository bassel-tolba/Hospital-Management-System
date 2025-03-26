package mine.profile.website.rest.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // If using method security
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mine.profile.website.dto.AiCheckResponse;
import mine.profile.website.dto.ConflictCheckRequest;
import mine.profile.website.dto.HistoryCheckRequest;
import mine.profile.website.services.AiService; // Use the new AiService

@RestController
@RequestMapping("/api/ai") // Base path for AI endpoints
public class AiController {

    private static final Logger logger = LoggerFactory.getLogger(AiController.class);

    @Autowired
    private AiService aiService;

    // Endpoint for checking medication conflicts
    @PostMapping("/check-conflicts")
    // Add security annotation if needed, e.g., only allow doctors
    @PreAuthorize("hasAuthority('CREATE_PRESCRIPTION') or hasAuthority('READ_PRESCRIPTION')") // Example
    public ResponseEntity<AiCheckResponse> checkConflicts(@Valid @RequestBody ConflictCheckRequest request) {
        logger.info("Received request to check medication conflicts for {} medications.",
                request.getMedicationNames().size());
        try {
            AiCheckResponse response = aiService.checkMedicationConflicts(request.getMedicationNames());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Catching unexpected service-level exceptions (API call/parsing errors handled
            // within service)
            logger.error("Unexpected error in /check-conflicts endpoint: {}", e.getMessage(), e);
            // Return the error response structure
            return ResponseEntity.internalServerError()
                    .body(AiCheckResponse.errorResponse("An internal server error occurred."));
        }
    }

    // Endpoint for checking against patient history
    @PostMapping("/check-history")
    @PreAuthorize("hasAuthority('CREATE_PRESCRIPTION') or hasAuthority('READ_PRESCRIPTION')") // Example
    public ResponseEntity<AiCheckResponse> checkHistory(@Valid @RequestBody HistoryCheckRequest request) {
        logger.info("Received request to check medication history for patient.");
        try {
            HistoryCheckRequest.PatientInfo patientInfo = request.getPatientInfo();
            AiCheckResponse response = aiService.checkPatientHistory(
                    request.getMedicationNames(),
                    patientInfo.getAllergies(),
                    patientInfo.getMedicalHistory());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Unexpected error in /check-history endpoint: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(AiCheckResponse.errorResponse("An internal server error occurred."));
        }
    }

    // Keep your existing /soundtotext endpoint if needed, but adapt it to use
    // AiService
    /*
     * @Autowired
     * private GeminiRestService oldGeminiService; // Keep old one if needed
     * temporarily
     * 
     * @PostMapping(value = "/soundtotext", consumes =
     * MediaType.MULTIPART_FORM_DATA_VALUE)
     * public ResponseEntity<?> soundToText(@RequestPart("audio") MultipartFile
     * audioFile) {
     * // ... adapt this to use AiService or keep separate if logic differs
     * significantly ...
     * logger.info("Received soundToText request (keeping old logic for now)");
     * // Example using old service:
     * // try {
     * // String transcribedText = oldGeminiService.transcribeAudio(audioFile);
     * // ... rest of your existing logic ...
     * // } catch ...
     * return
     * ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(Map.of("message",
     * "Sound-to-text endpoint needs adaptation."));
     * }
     */
}