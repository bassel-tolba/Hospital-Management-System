package mine.profile.website.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import mine.profile.website.models.ApiKeySetting; // <-- Ensure this import is correct
// Import Repository and Entity
import mine.profile.website.repository.ApiKeySettingRepository;

@Service
public class GeminiRestService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiRestService.class);
    private static final String GEMINI_SERVICE_NAME = "GEMINI";

    @Autowired
    private ApiKeySettingRepository apiKeySettingRepository;

    private static final String UPLOAD_URL_BASE = "https://generativelanguage.googleapis.com/upload/v1beta/files?key=";
    private static final String GENERATE_CONTENT_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";

    private static final Gson gson = new Gson();

    // Regex pattern to extract JSON possibly wrapped in markdown backticks
    private static final Pattern JSON_EXTRACT_PATTERN = Pattern.compile("```(?:json)?\\s*(\\{.*\\})\\s*```|(\\{.*\\})",
            Pattern.DOTALL);

    // --- Method to save the API Key ---
    @Transactional
    public void saveApiKey(String rawApiKey) {
        if (rawApiKey == null || rawApiKey.trim().isEmpty()) {
            logger.warn("Attempted to save an empty API key for {}", GEMINI_SERVICE_NAME);
            throw new IllegalArgumentException("API key cannot be empty.");
        }
        // Use the correct type from your models package
        ApiKeySetting setting = apiKeySettingRepository.findById(GEMINI_SERVICE_NAME)
                .orElse(new ApiKeySetting(GEMINI_SERVICE_NAME, rawApiKey));
        setting.setKeyValue(rawApiKey);
        apiKeySettingRepository.save(setting);
        logger.info("Successfully saved/updated API key for {}", GEMINI_SERVICE_NAME);
    }

    // --- NEW Method to get the API Key ---
    /**
     * Retrieves the configured API key for Gemini from the database.
     * WARNING: This method returns the raw API key. Be careful where it's used.
     *
     * @return The stored API key.
     * @throws ApiKeyConfigurationException if the key is not configured or is
     *                                      empty.
     */
    public String getKey() {
        // Reuse the existing helper method which includes error handling
        // for missing or empty keys.
        return getApiKeyFromDb();
    }

    // --- Helper method to get the API key from DB ---
    private String getApiKeyFromDb() {
        // Use the correct type from your models package
        Optional<ApiKeySetting> settingOpt = apiKeySettingRepository
                .findById(GEMINI_SERVICE_NAME);
        if (settingOpt.isEmpty()) {
            logger.error("API Key setting for {} not found in the database.", GEMINI_SERVICE_NAME);
            throw new ApiKeyConfigurationException(GEMINI_SERVICE_NAME + " API Key not configured in database.");
        }
        String key = settingOpt.get().getKeyValue();
        if (key == null || key.trim().isEmpty()) {
            logger.error("Stored API Key for {} is empty in the database.", GEMINI_SERVICE_NAME);
            throw new ApiKeyConfigurationException(GEMINI_SERVICE_NAME + " API Key is configured but empty.");
        }
        return key;
    }

    // --- Core Methods modified to use getApiKeyFromDb() and add systemInstruction
    // ---

    // Method to transcribe audio (uses generateSimpleTranscription)
    public String transcribeAudio(MultipartFile audioFile) throws IOException {
        String currentApiKey = getApiKeyFromDb(); // Fetches key internally
        String fileUri = uploadFile(audioFile, currentApiKey);
        return generateSimpleTranscription(fileUri, audioFile.getContentType(), currentApiKey);
    }

    // If you have other methods like transcribeAndProcess, ensure they also call
    // getApiKeyFromDb()
    public String transcribeAndProcess(MultipartFile audioFile, String prompt) throws IOException {
        String currentApiKey = getApiKeyFromDb(); // Fetches key internally
        String fileUri = uploadFile(audioFile, currentApiKey);
        return generateContent(fileUri, audioFile.getContentType(), prompt, currentApiKey);
    }

    // Upload file logic
    private String uploadFile(MultipartFile file, String apiKey) throws IOException {
        logger.debug("Attempting upload for {}", file.getOriginalFilename());
        RestTemplate restTemplate = new RestTemplate();
        Path tempFile = null;
        try {
            tempFile = Files.createTempFile("audio_", ".tmp");
            file.transferTo(tempFile.toFile());
            HttpHeaders initialHeaders = new HttpHeaders();
            initialHeaders.set("X-Goog-Upload-Protocol", "resumable");
            initialHeaders.set("X-Goog-Upload-Command", "start");
            initialHeaders.set("X-Goog-Upload-Header-Content-Length", String.valueOf(file.getSize()));
            initialHeaders.set("X-Goog-Upload-Header-Content-Type", file.getContentType());
            initialHeaders.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> fileMap = Map.of("display_name", file.getOriginalFilename());
            Map<String, Object> body = Map.of("file", fileMap);
            HttpEntity<Map<String, Object>> initialRequestEntity = new HttpEntity<>(body, initialHeaders);
            String initialUploadUrl = UPLOAD_URL_BASE + apiKey;
            ResponseEntity<String> initialResponse = restTemplate.exchange(initialUploadUrl, HttpMethod.POST,
                    initialRequestEntity, String.class);
            if (!initialResponse.getStatusCode().is2xxSuccessful())
                throw new IOException("Failed to initiate upload: " + initialResponse.getBody());
            String uploadUrl = initialResponse.getHeaders().getFirst("X-Goog-Upload-Url");
            if (uploadUrl == null)
                throw new IOException("Upload URL not found in response headers.");
            HttpHeaders uploadHeaders = new HttpHeaders();
            uploadHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            uploadHeaders.set("X-Goog-Upload-Command", "upload, finalize");
            uploadHeaders.set("Content-Length", String.valueOf(file.getSize()));
            uploadHeaders.set("X-Goog-Upload-Offset", "0");
            byte[] fileBytes = Files.readAllBytes(tempFile);
            HttpEntity<byte[]> uploadRequestEntity = new HttpEntity<>(fileBytes, uploadHeaders);
            ResponseEntity<String> uploadResponse = restTemplate.exchange(uploadUrl, HttpMethod.POST,
                    uploadRequestEntity, String.class);
            if (!uploadResponse.getStatusCode().is2xxSuccessful())
                throw new IOException("Failed to upload file data: " + uploadResponse.getBody());
            String fileUri = parseFileUriFromUploadResponse(uploadResponse.getBody());
            logger.info("File uploaded successfully. URI: {}", fileUri);
            return fileUri;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP Error during upload: {}", e.getResponseBodyAsString(), e);
            // Check for API key specific error
            if (e.getStatusCode().value() == 400 && e.getResponseBodyAsString().contains("API key not valid")) {
                throw new ApiKeyConfigurationException("Invalid Gemini API Key provided during file upload.");
            }
            throw new IOException("HTTP Error during upload: " + e.getStatusCode(), e);
        } catch (RestClientException e) {
            logger.error("Network error during upload", e);
            throw new IOException("Network error during upload: " + e.getMessage(), e);
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException e) {
                    logger.warn("Failed to delete temp file {}", tempFile, e);
                }
            }
        }
    }

    // Helper to parse URI from upload response
    private String parseFileUriFromUploadResponse(String responseBody) throws IOException {
        try {
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
            // Check if the top-level structure is correct and contains the 'file' object
            if (jsonResponse == null || !jsonResponse.has("file") || !jsonResponse.get("file").isJsonObject()) {
                // Log the problematic response body for debugging
                logger.error("Invalid upload response format: Missing 'file' object. Body: {}", responseBody);
                throw new IOException("Invalid upload response format: Missing 'file' object.");
            }
            JsonObject fileObject = jsonResponse.getAsJsonObject("file");

            // Check if the 'file' object contains the 'uri' field
            if (!fileObject.has("uri") || !fileObject.get("uri").isJsonPrimitive()
                    || !fileObject.get("uri").getAsJsonPrimitive().isString()) {
                logger.error("Invalid upload response format: Missing or invalid 'uri' in 'file' object. Body: {}",
                        responseBody);
                throw new IOException("Invalid upload response format: Missing or invalid 'uri' in 'file' object.");
            }

            String fileUri = fileObject.get("uri").getAsString();
            if (fileUri == null || fileUri.trim().isEmpty()) {
                // This case might be less likely if the previous checks pass, but good to have.
                logger.error("File URI extracted from response is null or empty. Body: {}", responseBody);
                throw new IOException("File URI extracted from response is null or empty.");
            }
            return fileUri;
        } catch (JsonSyntaxException | IllegalStateException | NullPointerException e) {
            logger.error("Failed to parse file URI from upload response: {}. Body: {}", e.getMessage(), responseBody,
                    e);
            throw new IOException("Failed to parse file URI from upload response: " + responseBody, e);
        }
    }

    // Generate content logic (used by transcribeAndProcess)
    private String generateContent(String fileUri, String mimeType, String userPrompt, String apiKey) {
        logger.debug("Generating content for URI {} with prompt.", fileUri);
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> fileData = Map.of("fileUri", fileUri, "mimeType", mimeType);
        Map<String, Object> filePart = Map.of("fileData", fileData);
        Map<String, Object> textPart = Map.of("text", userPrompt);
        Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(textPart, filePart));
        Map<String, Object> generationConfig = Map.of("responseMimeType", "application/json", "temperature", 0.5);
        List<Map<String, Object>> safetySettings = List.of(
                createSafetySetting("HARM_CATEGORY_HARASSMENT", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_HATE_SPEECH", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_SEXUALLY_EXPLICIT", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_DANGEROUS_CONTENT", "BLOCK_NONE"));
        Map<String, Object> systemTextPart = Map.of("text", "DONT USE MARKDOWN IN YOUR RESPONSES ONLY USE TEXT");
        Map<String, Object> systemInstruction = Map.of("parts", List.of(systemTextPart));
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(userContent));
        requestBody.put("generationConfig", generationConfig);
        requestBody.put("safetySettings", safetySettings);
        requestBody.put("systemInstruction", systemInstruction);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        String generateUrl = GENERATE_CONTENT_URL_BASE + apiKey;
        try {
            logger.debug("Sending generateContent request. URL: {}, Body: {}", generateUrl, gson.toJson(requestBody));
            ResponseEntity<String> response = restTemplate.exchange(generateUrl, HttpMethod.POST, requestEntity,
                    String.class);
            logger.debug("generateContent response. Status: {}, Body: {}", response.getStatusCode(),
                    response.getBody());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractTextFromApiResponse(response.getBody());
            } else {
                logger.error("Failed generateContent: Status {}, Body: {}", response.getStatusCode(),
                        response.getBody());
                // Check for API key error in response body before throwing generic exception
                if (response.getBody() != null && response.getBody().contains("API key not valid")) {
                    throw new ApiKeyConfigurationException("Invalid Gemini API Key provided for generateContent.");
                }
                throw new RuntimeException(
                        "Failed generateContent: " + response.getStatusCode() + " Body: " + response.getBody());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP Error during generateContent: {}", e.getResponseBodyAsString(), e);
            // Check for API key specific error
            if (e.getStatusCode().value() == 400 && e.getResponseBodyAsString().contains("API key not valid")) {
                throw new ApiKeyConfigurationException("Invalid Gemini API Key provided for generateContent.");
            }
            throw new RuntimeException("HTTP Error calling Gemini generateContent: " + e.getStatusCode(), e);
        } catch (RestClientException e) {
            logger.error("Error calling Gemini generateContent", e);
            throw new RuntimeException("Error calling Gemini generateContent: " + e.getMessage(), e);
        }
    }

    // Generate simple transcription logic (used by transcribeAudio)
    private String generateSimpleTranscription(String fileUri, String mimeType, String apiKey) {
        logger.debug("Generating simple transcription for URI {}", fileUri);
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> fileData = Map.of("fileUri", fileUri, "mimeType", mimeType);
        Map<String, Object> filePart = Map.of("fileData", fileData);
        Map<String, Object> textPart = Map.of("text",
                "Transcribe the audio file accurately. Provide only the text content of the speech.");
        Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(textPart, filePart));
        List<Map<String, Object>> safetySettings = List.of(
                createSafetySetting("HARM_CATEGORY_HARASSMENT", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_HATE_SPEECH", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_SEXUALLY_EXPLICIT", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_DANGEROUS_CONTENT", "BLOCK_NONE"));
        Map<String, Object> systemTextPart = Map.of("text", "DONT USE MARKDOWN IN YOUR RESPONSES ONLY USE TEXT");
        Map<String, Object> systemInstruction = Map.of("parts", List.of(systemTextPart));
        Map<String, Object> generationConfig = Map.of("responseMimeType", "text/plain", "temperature", 0.2);
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(userContent));
        requestBody.put("safetySettings", safetySettings);
        requestBody.put("generationConfig", generationConfig);
        requestBody.put("systemInstruction", systemInstruction);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        String transcribeUrl = GENERATE_CONTENT_URL_BASE + apiKey;
        try {
            logger.debug("Sending transcription request. URL: {}, Body: {}", transcribeUrl, gson.toJson(requestBody));
            ResponseEntity<String> response = restTemplate.exchange(transcribeUrl, HttpMethod.POST, requestEntity,
                    String.class);
            logger.debug("Transcription response. Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String responseBody = response.getBody();
                // Gemini *should* honor text/plain here, but we double-check
                if (response.getHeaders().getContentType() != null
                        && response.getHeaders().getContentType().isCompatibleWith(MediaType.TEXT_PLAIN)) {
                    logger.debug("Received plain text response for transcription.");
                    // Directly return the plain text body
                    return responseBody.trim();
                } else {
                    // If it's not plain text, assume it's the JSON structure and try parsing
                    logger.warn(
                            "Received non-plain text response for transcription (expected text/plain), attempting JSON extraction.");
                    return extractTextFromApiResponse(responseBody);
                }
            } else {
                logger.error("Failed transcription: Status {}, Body: {}", response.getStatusCode(), response.getBody());
                // Check for API key error in response body
                if (response.getBody() != null && response.getBody().contains("API key not valid")) {
                    throw new ApiKeyConfigurationException("Invalid Gemini API Key provided for transcription.");
                }
                throw new RuntimeException(
                        "Failed transcription: " + response.getStatusCode() + " Body: " + response.getBody());
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            logger.error("HTTP Error during transcription: {}", e.getResponseBodyAsString(), e);
            // Check for API key specific error
            if (e.getStatusCode().value() == 400 && e.getResponseBodyAsString().contains("API key not valid")) {
                throw new ApiKeyConfigurationException("Invalid Gemini API Key provided for transcription.");
            }
            throw new RuntimeException("HTTP Error calling Gemini transcription: " + e.getStatusCode(), e);
        } catch (RestClientException e) {
            logger.error("Error calling Gemini transcription", e);
            throw new RuntimeException("Error calling Gemini transcription: " + e.getMessage(), e);
        }
    }

    // Helper to extract text from the standard Gemini JSON response structure
    private String extractTextFromApiResponse(String responseBody) {
        try {
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);

            // Navigate through the JSON structure: candidates -> [0] -> content -> parts ->
            // [0] -> text
            if (jsonResponse == null || !jsonResponse.has("candidates") || !jsonResponse.get("candidates").isJsonArray()
                    || jsonResponse.getAsJsonArray("candidates").isEmpty()) {
                logger.warn("Gemini response missing 'candidates' array or it's empty. Body: {}", responseBody);
                // Fallback: Attempt to strip markdown if it looks like it might be the raw text
                // wrapped
                return attemptMarkdownStripping(responseBody.trim());
            }

            JsonObject candidate = jsonResponse.getAsJsonArray("candidates").get(0).getAsJsonObject();
            if (candidate == null || !candidate.has("content") || !candidate.getAsJsonObject("content").has("parts")
                    || !candidate.getAsJsonObject("content").get("parts").isJsonArray()
                    || candidate.getAsJsonObject("content").getAsJsonArray("parts").isEmpty()) {
                logger.warn("Gemini response missing 'content' or 'parts' array. Body: {}", responseBody);
                // Fallback: Attempt to strip markdown
                return attemptMarkdownStripping(responseBody.trim());
            }

            StringBuilder extractedText = new StringBuilder();
            candidate.getAsJsonObject("content").getAsJsonArray("parts").forEach(partElement -> {
                if (partElement.isJsonObject()) {
                    JsonObject part = partElement.getAsJsonObject();
                    if (part != null && part.has("text") && part.get("text").isJsonPrimitive()
                            && part.get("text").getAsJsonPrimitive().isString()) {
                        extractedText.append(part.get("text").getAsString()).append(" ");
                    }
                }
            });

            String result = extractedText.toString().trim();
            logger.debug("Extracted text from API JSON response parts: '{}'", result);

            // Final check: Even if extracted from JSON, the text itself might contain
            // markdown
            return attemptMarkdownStripping(result);

        } catch (JsonSyntaxException | IllegalStateException | IndexOutOfBoundsException | NullPointerException e) {
            logger.error(
                    "Error processing Gemini JSON response: {}. Returning raw body after attempting markdown strip. Body: {}",
                    e.getMessage(), responseBody, e);
            // Fallback: Attempt to strip markdown from the raw body
            return attemptMarkdownStripping(responseBody.trim());
        }
    }

    // Helper specifically for stripping potential markdown ```json ... ``` or ```
    // ... ```
    private String attemptMarkdownStripping(String text) {
        if (text == null)
            return "";
        // Check if it looks like it's wrapped in markdown backticks
        if (text.startsWith("```") && text.endsWith("```")) {
            logger.debug("Text appears wrapped in markdown backticks, attempting removal.");
            Matcher matcher = JSON_EXTRACT_PATTERN.matcher(text);
            if (matcher.find()) {
                // Group 1 captures JSON block within ```json ... ```
                // Group 2 captures block within plain ``` ... ``` or if it's just JSON
                String extracted = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
                if (extracted != null) {
                    logger.debug("Stripped markdown using regex, result: {}", extracted.trim());
                    return extracted.trim();
                }
            }
            // Regex failed, try basic string replace as a simpler fallback
            String stripped = text.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "").trim();
            logger.debug("Stripped markdown using basic replace, result: {}", stripped);
            return stripped;
        }
        // Doesn't look like markdown, return as is
        return text;
    }

    // Helper to create safety setting map
    private Map<String, Object> createSafetySetting(String category, String threshold) {
        Map<String, Object> setting = new HashMap<>();
        setting.put("category", category);
        setting.put("threshold", threshold);
        return setting;
    }

    // Custom Exception for Configuration Errors
    public static class ApiKeyConfigurationException extends RuntimeException {
        public ApiKeyConfigurationException(String message) {
            super(message);
        }
    }
}