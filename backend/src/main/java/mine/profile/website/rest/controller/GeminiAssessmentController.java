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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import mine.profile.website.services.GeminiRestService;

@RestController
@RequestMapping("/api/assessments/ai")
public class GeminiAssessmentController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAssessmentController.class);

    @Autowired
    private GeminiRestService geminiRestService;

    private final Gson gson = new Gson();
    private static final Pattern JSON_EXTRACT_PATTERN = Pattern.compile("```(?:json)?\\s*(\\{.*\\})\\s*```|(\\{.*\\})",
            Pattern.DOTALL);

    // --- NEW Prompt Generation Logic for Structured Data Extraction ---
    private String generateStructuredDataExtractionPrompt(String templateName, String currentHtml, Long patientId) {
        logger.debug("Generating STRUCTURED prompt for template: {}, patientId: {}, HTML snippet: {}", templateName,
                patientId, currentHtml.substring(0, Math.min(currentHtml.length(), 100)));
        // This prompt tells Gemini to identify fields (by ID or name) and extract
        // values for them.
        // The 'currentHtml' is provided for context, so Gemini can see the available
        // fields.
        return "You are a medical AI assistant. Your task is to extract structured information from an audio recording and map it to fields within a provided HTML snippet, which represents a medical assessment template.\n\n"
                +
                "**Input:**\n" +
                "*   Audio recording of a medical assessment.\n" +
                "*   The current HTML content of the assessment form (provided below). This HTML contains standard form elements like `<input>`, `<textarea>`, `<select>` which may have `id` or `name` attributes.\n"
                +
                "*   Patient ID (for context).\n" +
                "*   Template Name (for context).\n\n" +
                "**Output Requirements:**\n" +
                "*   A SINGLE JSON object. Do NOT include ANY text other than the JSON object. No introductions, explanations, markdown (like ```json), or apologies.\n"
                +
                "*   The top-level JSON object MUST have a key named `fields`.\n" +
                "*   The value of `fields` MUST be another JSON object where:\n" +
                "    *   Keys are the `id` or `name` attributes of the form elements found in the provided HTML that you can populate from the audio.\n"
                +
                "    *   Values are the extracted data from the audio corresponding to that form element.\n" +
                "*   Also include an optional top-level key `rawTranscription` with the full transcribed text if possible.\n\n"
                +
                "**Value Derivation and Field Matching - IMPORTANT:**\n" +
                "1.  **Identify Target Fields:** Examine the provided 'Current HTML Content'. Look for `<input>`, `<textarea>`, and `<select>` elements. Note their `id` and `name` attributes.\n"
                +
                "2.  **Direct Value Extraction:** If the audio clearly states a value for a field identifiable in the HTML (e.g., 'Patient's mood rating is 8'), extract that value. The key in your `fields` object should be the `id` (preferred) or `name` of that HTML element (e.g., `\"moodRating\": \"8\"`).\n"
                +
                "3.  **Instruction/Request Handling (Keywords: \"request\", \"خدمه\"):** If the audio uses keywords like \"request\" or \"خدمه\" (Arabic for 'service') in relation to a concept that maps to a field in the HTML, you should *reason* about the preceding conversation and generate an appropriate value for that field. The key in your `fields` object will still be the `id` or `name` of the target HTML element.\n"
                +
                "    *   **Example (HTML has `<textarea id=\"treatmentPlan\"></textarea>`):** Audio: '...and for the treatment plan, request a course of action considering the patient's recent weight gain.'\n"
                +
                "        JSON: `{\"fields\": {\"treatmentPlan\": \"Recommend dietary counseling, increase physical activity to 150 mins/week, follow-up in 4 weeks...\"}, \"rawTranscription\": \"...\"}`\n"
                +
                "4.  **Checkbox/Radio Handling:** For checkboxes, the value should be `true` or `false`. For radio button groups, the value should be the `value` attribute of the selected radio button (e.g., if HTML is `<input type=\"radio\" name=\"sleep_quality\" value=\"good\"> Good`, and user says sleep was good, output `\"sleep_quality\": \"good\"`).\n"
                +
                "5.  **If a value for a field is NOT mentioned AND NO instruction/request is given, do NOT include that field's key in the `fields` object.** Do NOT use default values. Do NOT guess.\n\n"
                +
                "**Example (HTML has `<input id=\"patientWeightKg\" name=\"weight\">` and `<textarea id=\"chiefComplaint\"></textarea>`):\n"
                +
                "Audio: 'The patient, John Doe, reports a persistent cough for 3 days. Weight is 70 kilograms.'\n" +
                "Expected JSON Output:\n" +
                "```json\n" +
                "{\n" +
                "  \"fields\": {\n" +
                "    \"patientWeightKg\": \"70\",\n" + // or "weight": "70" if using name
                "    \"chiefComplaint\": \"Persistent cough for 3 days.\"\n" +
                "  },\n" +
                "  \"rawTranscription\": \"The patient, John Doe, reports a persistent cough for 3 days. Weight is 70 kilograms.\"\n"
                +
                "}\n" +
                "```\n\n" +
                "**Contextual Information (Do NOT include these in the output JSON directly):\n" +
                "Patient ID: " + patientId + "\n" +
                "Template Name: " + templateName + "\n\n" +
                "**Current HTML Content (Identify fields from here to populate):**\n```html\n" + currentHtml + "\n```";
    }

    // Endpoint for the new structured data approach
    @PostMapping(value = "/extract-structured-data", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> extractStructuredDataFromAudio(
            @RequestPart("audio") MultipartFile audioFile,
            @RequestParam("templateName") String templateName,
            @RequestParam("patientId") Long patientId,
            @RequestParam("currentHtml") String currentHtml) { // currentHtml is for context for the AI

        logger.info("Received AI STRUCTURED data extraction request. Template: {}, PatientID: {}", templateName,
                patientId);

        if (audioFile == null || audioFile.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Audio file is required."));
        if (currentHtml == null || currentHtml.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Current HTML content is required."));
        if (templateName == null || templateName.trim().isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Template name is required."));
        if (patientId == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Patient ID is required."));

        try {
            // 1. Generate the new dynamic prompt for structured data extraction
            String dynamicPrompt = generateStructuredDataExtractionPrompt(templateName, currentHtml, patientId);

            // 2. Call Gemini Service
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, dynamicPrompt);
            logger.info("Raw Gemini response for structured data received.");
            if (logger.isDebugEnabled()) {
                logger.debug("Raw Gemini Response (Structured): {}", rawGeminiResponse);
            }

            // 3. Parse the Gemini response. We expect a JSON object with a "fields" key.
            // The parseFlexibleGeminiResponse method is already good at extracting the core
            // JSON part.
            Map<String, Object> parsedResponse = parseFlexibleGeminiResponse(rawGeminiResponse);

            // Validate if the parsed response has the expected "fields" structure
            if (parsedResponse == null || !parsedResponse.containsKey("fields")
                    || !(parsedResponse.get("fields") instanceof Map)) {
                logger.error("Gemini response, after parsing, did not contain the expected 'fields' map. Parsed: {}",
                        parsedResponse);
                // Try to return the raw transcription if available, even if fields are missing
                if (parsedResponse != null && parsedResponse.containsKey("rawTranscription")) {
                    return ResponseEntity
                            .ok(Map.of("rawTranscription", parsedResponse.get("rawTranscription"), "fields", Map.of()));
                }
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "AI response did not provide structured fields correctly."));
            }

            // Successfully parsed structured data
            logger.info("Successfully parsed Gemini response into structured data with {} fields.",
                    ((Map<?, ?>) parsedResponse.get("fields")).size());
            return ResponseEntity.ok(parsedResponse); // Return the whole object: { "fields": {...}, "rawTranscription":
                                                      // "..." }

        } catch (GeminiRestService.ApiKeyConfigurationException e) {
            logger.error("Gemini API Key config error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "AI service config error: " + e.getMessage()));
        } catch (IOException e) {
            logger.error("IOException: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing audio: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("RuntimeException: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process with AI: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error: " + e.getMessage()));
        }
    }

    // Helper method to parse Gemini's response (this can remain largely the same as
    // it's good at finding the JSON block)
    private Map<String, Object> parseFlexibleGeminiResponse(String rawResponseBody) {
        // This method (from your provided code) is good at extracting the JSON.
        // It should now be able to parse the expected { "fields": {...},
        // "rawTranscription": "..." } structure.
        if (rawResponseBody == null || rawResponseBody.trim().isEmpty()) {
            logger.error("Cannot parse empty or null Gemini response body.");
            throw new RuntimeException("Gemini returned an empty or null response.");
        }
        String jsonTextToParse = rawResponseBody.trim();
        // (The rest of your existing parseFlexibleGeminiResponse logic to extract and
        // clean JSON block)
        // ...
        // 1. Try parsing standard nested structure (from Gemini's typical API response)
        try {
            JsonObject jsonResponse = this.gson.fromJson(jsonTextToParse, JsonObject.class);
            if (jsonResponse.has("candidates")) {
                JsonArray candidates = jsonResponse.getAsJsonArray("candidates");
                if (candidates != null && !candidates.isEmpty() && candidates.get(0).isJsonObject()) {
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    if (candidate.has("content") && candidate.get("content").isJsonObject()) {
                        JsonObject content = candidate.getAsJsonObject("content");
                        if (content.has("parts") && content.get("parts").isJsonArray()) {
                            JsonArray parts = content.getAsJsonArray("parts");
                            if (parts != null && !parts.isEmpty() && parts.get(0).isJsonObject()) {
                                JsonObject firstPart = parts.get(0).getAsJsonObject();
                                if (firstPart.has("text") && firstPart.get("text").isJsonPrimitive()) {
                                    jsonTextToParse = firstPart.get("text").getAsString().trim();
                                }
                            }
                        }
                    }
                }
            }
        } catch (JsonSyntaxException | IllegalStateException e) { // Catch broader exceptions for safety
            logger.warn(
                    "Response body not valid JSON when checking for Gemini API nested structure or structure was unexpected: {}. Will attempt parsing raw/cleaned body.",
                    e.getMessage());
        }

        // 2. Clean potential markdown
        String cleanedJsonText;
        Matcher matcher = JSON_EXTRACT_PATTERN.matcher(jsonTextToParse);
        if (matcher.find()) {
            cleanedJsonText = matcher.group(1) != null ? matcher.group(1).trim()
                    : (matcher.group(2) != null ? matcher.group(2).trim()
                            : jsonTextToParse.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "").trim());
        } else {
            cleanedJsonText = jsonTextToParse;
        }

        if (cleanedJsonText == null || cleanedJsonText.isEmpty()) {
            throw new RuntimeException("Failed to extract valid JSON content from Gemini response after cleaning.");
        }
        // 3. Parse the cleaned JSON text into a Map
        try {
            java.lang.reflect.Type mapType = new com.google.gson.reflect.TypeToken<Map<String, Object>>() {
            }.getType();
            Map<String, Object> resultMap = this.gson.fromJson(cleanedJsonText, mapType);
            if (resultMap == null) {
                throw new RuntimeException(
                        "Failed to parse Gemini response into a data map (result was null). Cleaned JSON: "
                                + cleanedJsonText);
            }
            return resultMap;
        } catch (JsonSyntaxException e) {
            throw new RuntimeException(
                    "Failed to parse final Gemini response JSON: Invalid syntax. Cleaned JSON: " + cleanedJsonText, e);
        }
    }

    // The old placeholder-based endpoint (optional: can be kept for backward
    // compatibility or removed)
    // @PostMapping(value = "/transcribe-and-populate", consumes =
    // MediaType.MULTIPART_FORM_DATA_VALUE)
    // public ResponseEntity<?> transcribeAndPopulateAssessment_Old(...) { ... }

    // The replacePlaceholders method is NO LONGER NEEDED for the
    // "/extract-structured-data" endpoint.
    // It can be removed if you are fully migrating to the structured data approach.
    // private String replacePlaceholders(String html, Map<String, Object> data) {
    // ... }
}