package mine.profile.website.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

@Service
public class GeminiRestService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files?key=";
    private static final String GENERATE_CONTENT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    public String transcribeAndProcess(MultipartFile audioFile, String prompt) throws IOException {
        String fileUri = uploadFile(audioFile);
        return generateContent(fileUri, audioFile.getContentType(), prompt);
    }

    private String uploadFile(MultipartFile file) throws IOException {
        // ... (Your existing uploadFile method remains the same) ...
        RestTemplate restTemplate = new RestTemplate();
        Path tempFile = Files.createTempFile("audio_", ".webm");
        file.transferTo(tempFile.toFile());

        // --- 1. Initiate Resumable Upload (Get the Upload URL) ---
        HttpHeaders initialHeaders = new HttpHeaders();
        initialHeaders.set("X-Goog-Upload-Protocol", "resumable"); // Important: Specify resumable upload
        initialHeaders.set("X-Goog-Upload-Command", "start");
        initialHeaders.set("X-Goog-Upload-Header-Content-Length", String.valueOf(file.getSize()));
        initialHeaders.set("X-Goog-Upload-Header-Content-Type", file.getContentType());
        initialHeaders.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> fileMap = new HashMap<>();
        fileMap.put("display_name", file.getOriginalFilename());
        Map<String, Object> body = new HashMap<>();
        body.put("file", fileMap);

        HttpEntity<Map<String, Object>> initialRequestEntity = new HttpEntity<>(body, initialHeaders);

        ResponseEntity<String> initialResponse = restTemplate.exchange(
                UPLOAD_URL + apiKey,
                HttpMethod.POST,
                initialRequestEntity,
                String.class);

        if (!initialResponse.getStatusCode().is2xxSuccessful()) {
            Files.delete(tempFile);
            throw new IOException("Failed to initiate upload: " + initialResponse.getBody());
        }

        // --- 2. Extract the *Actual* Upload URL ---
        String uploadUrl = initialResponse.getHeaders().getFirst("X-Goog-Upload-Url"); // Get from HEADERS
        if (uploadUrl == null) {
            Files.delete(tempFile);
            throw new IOException("Upload URL not found in response headers.");
        }

        // --- 3. Upload the File Data (POST to the *uploadUrl*) ---
        HttpHeaders uploadHeaders = new HttpHeaders();
        uploadHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        uploadHeaders.set("X-Goog-Upload-Command", "upload, finalize"); // Finalize in the same request
        uploadHeaders.set("Content-Length", String.valueOf(file.getSize()));
        uploadHeaders.set("X-Goog-Upload-Offset", "0"); // Start at the beginning

        byte[] fileBytes = Files.readAllBytes(tempFile);
        HttpEntity<byte[]> uploadRequestEntity = new HttpEntity<>(fileBytes, uploadHeaders);

        ResponseEntity<String> uploadResponse = restTemplate.exchange(
                uploadUrl, // Use the *extracted* upload URL!
                HttpMethod.POST, // and POST method
                uploadRequestEntity,
                String.class);

        if (!uploadResponse.getStatusCode().is2xxSuccessful()) {
            Files.delete(tempFile);
            throw new IOException("Failed to upload file data: " + uploadResponse.getBody());
        }

        String fileUri = null;
        try {
            Gson gson = new Gson();
            JsonObject jsonResponse = gson.fromJson(uploadResponse.getBody(), JsonObject.class);
            JsonObject fileObject = jsonResponse.getAsJsonObject("file");
            fileUri = fileObject.get("uri").getAsString();
            System.err.println("Extracted fileUri from response body: " + fileUri);

        } catch (JsonSyntaxException e) {
            Files.delete(tempFile); // Clean up temp file
            System.err.println("Failed to parse JSON response: " + uploadResponse.getBody());
            throw new IOException("Failed to parse JSON response: " + uploadResponse.getBody(), e);
        }

        if (fileUri == null) {
            Files.delete(tempFile); // Clean up temp file
            System.err.println("File URI not found in the response body.");
            throw new IOException("File URI not found in the response body.");
        }

        Files.delete(tempFile); // Clean up after successful upload
        return fileUri;
    }

    private String generateContent(String fileUri, String mimeType, String prompt) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> fileData = new HashMap<>();
        fileData.put("fileUri", fileUri);
        fileData.put("mimeType", mimeType);

        Map<String, Object> filePart = new HashMap<>();
        filePart.put("fileData", fileData);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", List.of(textPart, filePart));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 1); // Low temperature for more deterministic output
        generationConfig.put("topK", 64);
        generationConfig.put("topP", 0.95);
        generationConfig.put("maxOutputTokens", 4096);
        generationConfig.put("stopSequences", Collections.emptyList());
        generationConfig.put("responseMimeType", "application/json");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(userContent));
        requestBody.put("generationConfig", generationConfig);

        List<Map<String, Object>> safetySettings = List.of(
                createSafetySetting("HARM_CATEGORY_HARASSMENT", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_HATE_SPEECH", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_SEXUALLY_EXPLICIT", "BLOCK_NONE"),
                createSafetySetting("HARM_CATEGORY_DANGEROUS_CONTENT", "BLOCK_NONE"));
        requestBody.put("safetySettings", safetySettings);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        System.err.println("Generate Content Request URL: " + GENERATE_CONTENT_URL + apiKey);
        System.err.println("Generate Content Headers: " + headers);
        System.err.println("Generate Content Body: " + requestBody);
        ResponseEntity<String> response = restTemplate.exchange(
                GENERATE_CONTENT_URL + apiKey, HttpMethod.POST, requestEntity, String.class);

        System.err.println("Generate Content Response Code: " + response.getStatusCode());
        System.err.println("Generate Content Response Body: " + response.getBody());

        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody(); // No longer doing any post-processing here.
        } else {
            throw new RuntimeException(
                    "Failed to generate content: " + response.getStatusCode() + " - " + response.getBody());
        }
    }

    private Map<String, Object> createSafetySetting(String category, String threshold) {
        Map<String, Object> setting = new HashMap<>();
        setting.put("category", category);
        setting.put("threshold", threshold);
        return setting;
    }

}