package mine.profile.website.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

@Service
public class GeminiRestService {

    // Add Logger
    private static final Logger logger = LoggerFactory.getLogger(GeminiRestService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    // Ensure URLs are correct for your model (gemini-1.5-flash-latest might be
    // preferred)
    // Using flash as per your original Dockerfile - adjust if needed
    private static final String UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files?key=";
    // URL for generating content - Make sure 'gemini-1.5-flash-latest' or your
    // chosen model is correct
    private static final String GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";

    // --- Existing Methods ---

    // Keep transcribeAndProcess if used elsewhere
    public String transcribeAndProcess(MultipartFile audioFile, String prompt) throws IOException {
        logger.info("Starting transcription and processing for file: {}", audioFile.getOriginalFilename());
        String fileUri = uploadFile(audioFile);
        return generateContentWithFile(fileUri, audioFile.getContentType(), prompt); // Renamed for clarity
    }

    public String transcribeAudio(MultipartFile audioFile) throws IOException {
        logger.info("Starting simple transcription for file: {}", audioFile.getOriginalFilename());
        String fileUri = uploadFile(audioFile);
        return generateSimpleTranscription(fileUri, audioFile.getContentType());
    }

    // No changes needed in uploadFile
    private String uploadFile(MultipartFile file) throws IOException {
        logger.debug("Uploading file: {}, Size: {}, Type: {}", file.getOriginalFilename(), file.getSize(),
                file.getContentType());
        // ... (Your existing uploadFile method logic) ...
        RestTemplate restTemplate = new RestTemplate();
        Path tempFile = null; // Define outside try block for finally cleanup
        try {
            tempFile = Files.createTempFile("audio_", ".tmp"); // Use generic tmp extension
            file.transferTo(tempFile.toFile());
            logger.debug("Temporary file created at: {}", tempFile.toString());

            // --- 1. Initiate Resumable Upload ---
            HttpHeaders initialHeaders = new HttpHeaders();
            initialHeaders.set("X-Goog-Upload-Protocol", "resumable");
            initialHeaders.set("X-Goog-Upload-Command", "start");
            initialHeaders.set("X-Goog-Upload-Header-Content-Length", String.valueOf(file.getSize()));
            initialHeaders.set("X-Goog-Upload-Header-Content-Type", file.getContentType());
            initialHeaders.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> fileMap = Map.of("display_name", file.getOriginalFilename());
            Map<String, Object> body = Map.of("file", fileMap);
            HttpEntity<Map<String, Object>> initialRequestEntity = new HttpEntity<>(body, initialHeaders);

            logger.debug("Initiating upload to: {}", UPLOAD_URL + "..."); // Don't log key
            ResponseEntity<String> initialResponse = restTemplate.exchange(
                    UPLOAD_URL + apiKey, HttpMethod.POST, initialRequestEntity, String.class);

            if (!initialResponse.getStatusCode().is2xxSuccessful()) {
                logger.error("Failed to initiate upload: {} - {}", initialResponse.getStatusCode(),
                        initialResponse.getBody());
                throw new IOException("Failed to initiate upload: " + initialResponse.getBody());
            }

            // --- 2. Extract Upload URL ---
            String uploadUrl = initialResponse.getHeaders().getFirst("X-Goog-Upload-Url");
            if (uploadUrl == null) {
                logger.error("Upload URL not found in response headers.");
                throw new IOException("Upload URL not found in response headers.");
            }
            logger.debug("Received resumable upload URL.");

            // --- 3. Upload File Data ---
            HttpHeaders uploadHeaders = new HttpHeaders();
            // uploadHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM); // Let
            // RestTemplate handle based on byte[]
            uploadHeaders.set("X-Goog-Upload-Command", "upload, finalize");
            uploadHeaders.set("Content-Length", String.valueOf(file.getSize()));
            uploadHeaders.set("X-Goog-Upload-Offset", "0");

            byte[] fileBytes = Files.readAllBytes(tempFile);
            HttpEntity<byte[]> uploadRequestEntity = new HttpEntity<>(fileBytes, uploadHeaders);

            logger.debug("Uploading file data to extracted URL...");
            ResponseEntity<String> uploadResponse = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, uploadRequestEntity, String.class);

            if (!uploadResponse.getStatusCode().is2xxSuccessful()) {
                logger.error("Failed to upload file data: {} - {}", uploadResponse.getStatusCode(),
                        uploadResponse.getBody());
                throw new IOException("Failed to upload file data: " + uploadResponse.getBody());
            }

            // --- 4. Extract File URI ---
            String fileUri = extractFileUri(uploadResponse.getBody());
            logger.info("File uploaded successfully. URI: {}", fileUri);
            return fileUri;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP Error during file upload: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new IOException("HTTP Error during upload: " + e.getResponseBodyAsString(), e);
        } catch (IOException e) {
            logger.error("IO Error during file upload: {}", e.getMessage(), e);
            throw e; // Re-throw original IO exception
        } catch (Exception e) {
            logger.error("Unexpected error during file upload", e);
            throw new IOException("Unexpected error during upload: " + e.getMessage(), e);
        } finally {
            // Ensure temporary file is deleted
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                    logger.debug("Deleted temporary file: {}", tempFile.toString());
                } catch (IOException e) {
                    logger.warn("Failed to delete temporary file: {}", tempFile.toString(), e);
                }
            }
        }

    }

    // Renamed for clarity, used by transcribeAndProcess
    private String generateContentWithFile(String fileUri, String mimeType, String prompt) {
        logger.debug("Generating content with file URI: {} and prompt.", fileUri);
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = createStandardHeaders();

        Map<String, Object> fileData = Map.of("fileUri", fileUri, "mimeType", mimeType);
        Map<String, Object> filePart = Map.of("fileData", fileData);
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(textPart, filePart));

        Map<String, Object> requestBody = createBaseRequestBody(userContent);
        // Add specific generationConfig if needed for this use case
        // requestBody.put("generationConfig", createSpecificGenerationConfig());

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GENERATE_CONTENT_URL + apiKey, HttpMethod.POST, requestEntity, String.class);

            logger.debug("Generate content with file response code: {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful()) {
                // Decide if post-processing is needed here or return raw JSON string
                // For consistency, let's extract text like other methods
                return extractTextFromResponse(response.getBody());
            } else {
                logger.error("Failed to generate content with file: {} - {}", response.getStatusCode(),
                        response.getBody());
                throw new RuntimeException(
                        "Failed to generate content: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP Error generating content with file: {} - {}", e.getStatusCode(),
                    e.getResponseBodyAsString(), e);
            throw new RuntimeException("HTTP Error generating content: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("Unexpected error generating content with file", e);
            throw new RuntimeException("Unexpected error generating content: " + e.getMessage(), e);
        }
    }

    // Used by transcribeAudio
    private String generateSimpleTranscription(String fileUri, String mimeType) {
        logger.debug("Generating simple transcription for file URI: {}", fileUri);
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = createStandardHeaders();

        Map<String, Object> fileData = Map.of("fileUri", fileUri, "mimeType", mimeType);
        Map<String, Object> filePart = Map.of("fileData", fileData);
        // Add a simple instruction prompt for pure transcription
        Map<String, Object> textPart = Map.of("text", "Transcribe the audio. Respond only with the transcribed text.");
        Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(textPart, filePart)); // Include text
                                                                                                        // part

        Map<String, Object> requestBody = createBaseRequestBody(userContent);
        // Use default generationConfig or define one suitable for transcription

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GENERATE_CONTENT_URL + apiKey, HttpMethod.POST, requestEntity, String.class);

            logger.debug("Simple transcription response code: {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful()) {
                return extractTextFromResponse(response.getBody()); // Extract only text
            } else {
                logger.error("Failed to transcribe audio: {} - {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException(
                        "Failed to transcribe audio: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP Error during transcription: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("HTTP Error during transcription: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("Unexpected error during transcription", e);
            throw new RuntimeException("Unexpected error during transcription: " + e.getMessage(), e);
        }
    }

    // --- NEW METHOD for Text-Only Generation ---
    public String generateTextContent(String prompt) {
        logger.debug("Generating text content with prompt.");
        if (prompt == null || prompt.isBlank()) {
            logger.warn("generateTextContent called with blank prompt.");
            return ""; // Or throw exception
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = createStandardHeaders();

        // Parts only contains the text prompt
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(textPart)); // Only textPart

        Map<String, Object> requestBody = createBaseRequestBody(userContent);
        // Add generationConfig - ensure responseMimeType is compatible with
        // extractTextFromResponse
        requestBody.put("generationConfig", createDefaultGenerationConfig());

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GENERATE_CONTENT_URL + apiKey, HttpMethod.POST, requestEntity, String.class);

            logger.debug("Generate text content response code: {}", response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful()) {
                // Extract the raw text response using the existing helper
                return extractTextFromResponse(response.getBody());
            } else {
                logger.error("Failed to generate text content: {} - {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException(
                        "Failed to generate text content: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP Error generating text content: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(),
                    e);
            throw new RuntimeException("HTTP Error generating text content: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            logger.error("Unexpected error generating text content", e);
            throw new RuntimeException("Unexpected error generating text content: " + e.getMessage(), e);
        }
    }

    // --- Helper Methods ---

    private HttpHeaders createStandardHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    // Helper to create the base structure of the request body
    private Map<String, Object> createBaseRequestBody(Map<String, Object> userContent) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(userContent));
        requestBody.put("safetySettings", createDefaultSafetySettings());
        // Add default generationConfig - override later if needed
        requestBody.put("generationConfig", createDefaultGenerationConfig());
        return requestBody;
    }

    // Helper for default generation config (tune as needed)
    private Map<String, Object> createDefaultGenerationConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("temperature", 0.7); // Balanced temperature
        config.put("topK", 40);
        config.put("topP", 0.95);
        config.put("maxOutputTokens", 4096); // Adjust as needed
        config.put("stopSequences", Collections.emptyList());
        // Keep response as JSON to reuse parsing logic
        config.put("responseMimeType", "application/json");
        return config;
    }

    // Helper for safety settings
    private List<Map<String, Object>> createDefaultSafetySettings() {
        return List.of(
                createSafetySetting("HARM_CATEGORY_HARASSMENT", "BLOCK_NONE"), // Adjust thresholds if needed
                createSafetySetting("HARM_CATEGORY_HATE_SPEECH", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_SEXUALLY_EXPLICIT", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_DANGEROUS_CONTENT", "BLOCK_NONE"));
    }

    private Map<String, Object> createSafetySetting(String category, String threshold) {
        return Map.of("category", category, "threshold", threshold);
    }

    // Renamed from postProcessTranscriptionResponse for general use
    private String extractTextFromResponse(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            logger.warn("Attempting to extract text from blank response body.");
            return ""; // Or throw?
        }
        try {
            Gson gson = new Gson();
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);

            // Defensive checks for JSON structure
            if (jsonResponse == null || !jsonResponse.has("candidates")
                    || !jsonResponse.get("candidates").isJsonArray()) {
                logger.error("Invalid Gemini response structure: 'candidates' array missing or not an array. Body: {}",
                        responseBody);
                throw new RuntimeException("Invalid Gemini response structure: 'candidates' array missing.");
            }

            var candidates = jsonResponse.getAsJsonArray("candidates");
            if (candidates.isEmpty()) {
                logger.warn("Gemini response contains no candidates. Body: {}", responseBody);
                // Check for promptFeedback if available
                if (jsonResponse.has("promptFeedback")) {
                    logger.warn("Prompt Feedback: {}", jsonResponse.get("promptFeedback"));
                    JsonObject feedback = jsonResponse.getAsJsonObject("promptFeedback");
                    if (feedback.has("blockReason")) {
                        throw new RuntimeException(
                                "Content blocked by Gemini: " + feedback.get("blockReason").getAsString());
                    }
                }
                return ""; // Return empty if no candidates
            }

            JsonObject candidate = candidates.get(0).getAsJsonObject();
            if (candidate == null || !candidate.has("content") || !candidate.get("content").isJsonObject()) {
                logger.error(
                        "Invalid Gemini response structure: candidate 'content' missing or not an object. Body: {}",
                        responseBody);
                throw new RuntimeException("Invalid Gemini response structure: candidate 'content' missing.");
            }

            JsonObject content = candidate.getAsJsonObject("content");
            if (!content.has("parts") || !content.get("parts").isJsonArray()) {
                logger.error("Invalid Gemini response structure: content 'parts' missing or not an array. Body: {}",
                        responseBody);
                throw new RuntimeException("Invalid Gemini response structure: content 'parts' missing.");
            }

            var parts = content.getAsJsonArray("parts");
            if (parts.isEmpty()) {
                logger.warn("Gemini response content has no parts. Body: {}", responseBody);
                return ""; // Return empty if no parts
            }

            JsonObject firstPart = parts.get(0).getAsJsonObject();
            if (firstPart == null || !firstPart.has("text") || !firstPart.get("text").isJsonPrimitive()) {
                logger.error("Invalid Gemini response structure: first part 'text' missing or not primitive. Body: {}",
                        responseBody);
                throw new RuntimeException("Invalid Gemini response structure: first part 'text' missing.");
            }

            String extractedText = firstPart.get("text").getAsString();
            logger.debug("Extracted text from Gemini response.");
            return extractedText.trim(); // Trim whitespace

        } catch (JsonSyntaxException e) {
            logger.error("Error parsing Gemini JSON response: {}. Body: {}", e.getMessage(), responseBody, e);
            throw new RuntimeException("Error parsing Gemini JSON response: " + e.getMessage(), e);
        } catch (Exception e) {
            // Catch broader exceptions during parsing
            logger.error("Unexpected error processing Gemini response: {}. Body: {}", e.getMessage(), responseBody, e);
            throw new RuntimeException("Unexpected error processing Gemini response: " + e.getMessage(), e);
        }
    }

    // Helper to extract File URI from upload response (used only by uploadFile)
    private String extractFileUri(String uploadResponseBody) throws IOException {
        try {
            Gson gson = new Gson();
            JsonObject jsonResponse = gson.fromJson(uploadResponseBody, JsonObject.class);
            if (jsonResponse == null || !jsonResponse.has("file") || !jsonResponse.get("file").isJsonObject()) {
                logger.error("Upload response missing 'file' object. Body: {}", uploadResponseBody);
                throw new IOException("Upload response missing 'file' object.");
            }
            JsonObject fileObject = jsonResponse.getAsJsonObject("file");
            if (!fileObject.has("uri") || !fileObject.get("uri").isJsonPrimitive()) {
                logger.error("Upload response 'file' object missing 'uri'. Body: {}", uploadResponseBody);
                throw new IOException("Upload response 'file' object missing 'uri'.");
            }
            return fileObject.get("uri").getAsString();
        } catch (JsonSyntaxException e) {
            logger.error("Failed to parse upload JSON response: {}. Body: {}", e.getMessage(), uploadResponseBody, e);
            throw new IOException("Failed to parse upload JSON response: " + uploadResponseBody, e);
        }
    }

}