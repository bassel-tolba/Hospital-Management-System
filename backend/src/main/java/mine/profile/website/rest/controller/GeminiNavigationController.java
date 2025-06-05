package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

// Use Jackson (comes with Spring Boot Web) or Gson for parsing
import com.fasterxml.jackson.core.JsonProcessingException; // Jackson
import com.fasterxml.jackson.core.type.TypeReference; // Jackson
import com.fasterxml.jackson.databind.ObjectMapper; // Jackson
// OR
// import com.google.gson.Gson;
// import com.google.gson.JsonSyntaxException;
// import com.google.gson.reflect.TypeToken; // Gson Type Reference

import mine.profile.website.services.GeminiRestService;

@RestController
@RequestMapping("/api/gemini")
public class GeminiNavigationController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiNavigationController.class);

    @Autowired
    private GeminiRestService geminiRestService;

    // Use Jackson ObjectMapper (preferred in Spring Boot)
    private static final ObjectMapper objectMapper = new ObjectMapper();
    // OR use Gson
    // private static final Gson gson = new Gson();

    // Keep your existing prompt
    private static final String NAVIGATION_PROMPT = "You are an intelligent navigation assistant for a hospital management application. "
            +
            "The user will speak or describe the page they want to go to. " +
            "Your task is to return ONLY a JSON object with two fields: 'pageName' (the exact name of the page as listed below) and 'success' (a boolean). "
            +
            "Do NOT include any explanations, extra text, or markdown formatting such as ```json. " +
            "The available pages in the app are: " +
            "Login, Register, Profile, Patients, Activities, Procedures, Vital Signs, Assessments, Procedure Logs, Units, Rooms, Beds, Admissions, Users, Medications, Medication History, Prescriptions, Medication Administrations, Product Usages, Products, Billings, Image Reports, Image Report Types, Documents, Document Types, Lab Tests, Lab Results, All Features, Roles Permissions, Dashboard, About Us. "
            +
            "If you are confident about which page the user means, respond with:\n" +
            "{\n" +
            "  \"pageName\": \"<exact page name from the list above>\",\n" +
            "  \"success\": true\n" +
            "}\n" +
            "If you are not confident or the request does not match any page, respond with:\n" +
            "{\n" +
            "  \"pageName\": \"\",\n" +
            "  \"success\": false\n" +
            "}";

    private static final Pattern JSON_EXTRACT_PATTERN = Pattern.compile("```(?:json)?\\s*(\\{.*\\})\\s*```|(\\{.*\\})",
            Pattern.DOTALL);

    @PostMapping(value = "/navigate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> navigateByVoice(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received navigation request for file: {}", audioFile.getOriginalFilename());
        try {
            String geminiRawResponse = geminiRestService.transcribeAndProcess(audioFile, NAVIGATION_PROMPT);
            logger.info("Raw GeminiRestService response: {}", geminiRawResponse);

            if (geminiRawResponse == null || geminiRawResponse.trim().isEmpty()) {
                logger.warn("Gemini API returned an empty or null response.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gemini API returned an empty response."));
            }

            String extractedJson = extractJsonFromGeminiResponse(geminiRawResponse);

            if (extractedJson == null) {
                logger.error("Could not extract valid JSON content from Gemini response: {}", geminiRawResponse);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Failed to parse navigation command from Gemini response."));
            }

            logger.info("Extracted JSON string: {}", extractedJson);

            // --- PARSE the extracted JSON string into a Map ---
            Map<String, Object> responseMap;
            try {
                // Use Jackson
                responseMap = objectMapper.readValue(extractedJson, new TypeReference<Map<String, Object>>() {
                });
                // OR use Gson
                // java.lang.reflect.Type mapType = new TypeToken<Map<String, Object>>()
                // {}.getType();
                // responseMap = gson.fromJson(extractedJson, mapType);

            } catch (JsonProcessingException e) { // Or JsonSyntaxException for Gson
                logger.error("Extracted content is not valid JSON: {}", extractedJson, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message",
                                "Received malformed JSON structure from Gemini. Content: " + extractedJson));
            }

            // --- Return the Map - Spring will serialize it correctly ---
            // ContentType will be set automatically by Spring's message converters
            return ResponseEntity.ok(responseMap);

            // Keep other catch blocks
        } catch (GeminiRestService.ApiKeyConfigurationException e) {
            logger.error("Navigation failed due to configuration issue: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Configuration Error: " + e.getMessage()));
        } catch (IOException e) {
            logger.error("IO Error during navigation processing", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process audio file: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Runtime Error during navigation processing", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process navigation request: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during navigation processing", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message",
                            "An unexpected error occurred during navigation processing: " + e.getMessage()));
        }
    }

    // Keep extractJsonFromGeminiResponse method as it was
    private String extractJsonFromGeminiResponse(String rawResponse) {
        if (rawResponse == null)
            return null;
        Matcher matcher = JSON_EXTRACT_PATTERN.matcher(rawResponse.trim());
        if (matcher.find()) {
            String json = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
            if (json != null)
                return json.trim();
        }
        String trimmedResponse = rawResponse.trim();
        if (trimmedResponse.startsWith("{") && trimmedResponse.endsWith("}")) {
            logger.warn("JSON_EXTRACT_PATTERN failed, assuming plain JSON.");
            return trimmedResponse;
        }
        logger.warn("Could not find JSON structure in response: {}", rawResponse);
        return null;
    }
}