package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping; // <-- Added import
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import mine.profile.website.services.GeminiRestService;
// Import the custom exception from GeminiRestService
import mine.profile.website.services.GeminiRestService.ApiKeyConfigurationException;

@RestController
@RequestMapping("/api/gemini") // Keep the base path
public class GeminiController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiController.class);

    @Autowired
    private GeminiRestService geminiRestService; // Service handles Gemini calls AND key storage now

    // === Endpoint to transcribe audio (existing) ===
    @PostMapping(value = "/soundtotext", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> soundToText(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received soundToText request for file: {}", audioFile.getOriginalFilename());
        if (audioFile == null || audioFile.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Audio file cannot be empty."));
        }
        try {
            String transcribedText = geminiRestService.transcribeAudio(audioFile);
            logger.info("Successfully transcribed audio.");

            // Check for null/empty from service (could indicate parsing issues or actual
            // empty transcription)
            if (transcribedText == null) {
                logger.error("Transcription resulted in null. Check GeminiRestService logs.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to process transcription response from Gemini."));
            }
            if (transcribedText.trim().isEmpty()) {
                logger.warn("Gemini returned an empty transcription for file: {}. Audio might be silent.",
                        audioFile.getOriginalFilename());
                return ResponseEntity.ok(""); // Return empty string for empty transcription
            }

            return ResponseEntity.ok(transcribedText); // Return plain text

        } catch (ApiKeyConfigurationException e) { // Catch the specific configuration error
            logger.error("Transcription failed due to configuration issue: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // 500 Internal Server Error is appropriate
                                                                           // for server config issues
                    .body(Map.of("message", "Configuration Error: " + e.getMessage() + " Please set the API key."));
        } catch (IOException e) {
            logger.error("IO Error processing audio file: {}", audioFile.getOriginalFilename(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to read/process audio file: " + e.getMessage()));
        } catch (RestClientException e) {
            logger.error("Network/Client Error communicating with Gemini API", e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY) // 502
                    .body(Map.of("message", "Failed to communicate with Gemini service: " + e.getMessage()));
        } catch (RuntimeException e) {
            // Catch other runtime exceptions (like HTTP errors wrapped by the service)
            logger.error("Runtime Error during transcription for file: {}", audioFile.getOriginalFilename(), e);
            // Check cause just in case
            if (e.getCause() instanceof ApiKeyConfigurationException) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message",
                                "Configuration Error: " + e.getCause().getMessage() + " Please set the API key."));
            }
            // Check for specific Gemini API error messages
            if (e.getMessage() != null && e.getMessage().contains("API key not valid")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // 401
                        .body(Map.of("message", "Invalid Gemini API Key. Please check the configured key."));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe audio due to an internal error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during transcription for file: {}", audioFile.getOriginalFilename(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during transcription."));
        }
    }

    // === Endpoint to configure the API Key ===
    // WARNING: THIS ENDPOINT IS UNSECURED BY DEFAULT! Add appropriate security
    // (e.g., Spring Security).
    @PostMapping("/configure-key")
    public ResponseEntity<?> configureApiKey(@RequestBody ApiKeyRequest request) {
        logger.warn("Received request to configure Gemini API Key. Ensure this endpoint is secured!"); // Log security
                                                                                                       // warning
        if (request == null || request.getApiKey() == null || request.getApiKey().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "API key is required in the request body."));
        }
        try {
            // Delegate saving to the service layer
            geminiRestService.saveApiKey(request.getApiKey());
            logger.info("Gemini API key saved/updated successfully via configuration endpoint.");
            // SECURITY: Do NOT return the key in the response
            return ResponseEntity.ok(Map.of("message", "Gemini API key configured successfully."));
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to save Gemini API key due to invalid argument: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Catch potential DB errors or other issues during save
            logger.error("Error configuring Gemini API key", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to save API key: " + e.getMessage()));
        }
    }

    // === NEW Endpoint to retrieve the API Key ===
    // WARNING: EXPOSING AN API KEY VIA AN UNSECURED ENDPOINT IS A MAJOR SECURITY
    // RISK!
    // ANYONE WHO CAN ACCESS THIS ENDPOINT CAN STEAL YOUR KEY.
    // Ensure proper authentication and authorization are in place if using this in
    // any real environment.
    @GetMapping("/get-key")
    public ResponseEntity<?> getApiKey() {
        logger.warn("Request received for GET /get-key. EXPOSING API KEY - THIS IS INSECURE!");
        try {
            String apiKey = geminiRestService.getKey();
            // Return the key directly in the response body
            // Consider if you *really* need to expose the full key.
            return ResponseEntity.ok(Map.of("apiKey", apiKey));
        } catch (ApiKeyConfigurationException e) {
            // Key not found or empty in DB
            logger.error("Failed to retrieve Gemini API key: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND) // 404 Not Found is appropriate here
                    .body(Map.of("message", "Gemini API Key not configured or is empty: " + e.getMessage()));
        } catch (Exception e) {
            // Catch unexpected errors during retrieval
            logger.error("Unexpected error retrieving Gemini API key", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve API key due to an internal error: " + e.getMessage()));
        }
    }

    // Simple DTO class for the request body of the configure endpoint
    // Can be static inner class or its own file if preferred
    public static class ApiKeyRequest {
        private String apiKey;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }
    }
}