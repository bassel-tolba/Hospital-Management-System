package mine.profile.website.rest.controller;

import java.io.IOException;
import java.time.LocalDateTime; // For timestamp
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays; // For Arrays.asList
import java.util.HashMap;
import java.util.List; // For List
import java.util.Map;
import java.util.regex.Matcher; // For Regex
import java.util.regex.Pattern; // For Regex

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

// Gson Imports
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import mine.profile.website.services.GeminiRestService;

@RestController
@RequestMapping("/api/gemini")
public class GeminiVitalSignsController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiVitalSignsController.class);

    @Autowired
    private GeminiRestService geminiRestService;

    // Gson instance for this controller
    private final Gson gson = new Gson();

    // Constants for vital signs
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME; // yyyy-MM-ddTHH:mm:ss
    private static final Pattern JSON_EXTRACT_PATTERN = Pattern.compile("```(?:json)?\\s*(\\{.*\\})\\s*```|(\\{.*\\})",
            Pattern.DOTALL);
    private static final List<String> EXPECTED_VITAL_KEYS = Arrays.asList(
            "timestamp", "heartRate", "bloodPressureSystolic", "bloodPressureDiastolic",
            "temperature", "respiratoryRate", "oxygenSaturation", "painLevel",
            "height", "heightUnit", "weight", "weightUnit", "glucose", "glucoseUnit",
            "posture", "capillaryRefillTime", "notes", "method");
    private static final List<String> VALID_HEIGHT_UNITS = Arrays.asList("cm", "in");
    private static final List<String> VALID_WEIGHT_UNITS = Arrays.asList("kg", "lb");
    private static final List<String> VALID_GLUCOSE_UNITS = Arrays.asList("mg/dL", "mmol/L");

    // Prompts (Ensure no markdown like ```json in the prompt itself for the
    // expected format)
    private static final String VITAL_SIGNS_PROMPT = "You are extracting vital signs information from audio to fill a form. The output MUST be a single JSON object, and NOTHING ELSE. Do NOT include any introductory or concluding text, or markdown like ```json.\n"
            + // Ensure no markdown
            "\n" +
            "Extract the information and follow these STRICT rules:\n" +
            "\n" +
            "1.  **Missing Information:** If a field is not *explicitly* mentioned, set its value to \"did not get\".\n"
            +
            "\n" +
            "2.  **Fields:**\n" +
            "    *   `timestamp`: MUST be in `yyyy-MM-ddTHH:mm:ss` format. If not provided or invalid, use \"did not get\".\n"
            + // Changed default
            "    *   `heartRate`: Patient's heart rate (numeric value). Do NOT include units or extra text.\n" +
            "    *   `bloodPressureSystolic`: Systolic blood pressure (numeric value). Do NOT include extra text.\n" +
            "    *   `bloodPressureDiastolic`: Diastolic blood pressure (numeric value). Do NOT include extra text.\n" +
            "    *   `temperature`: Patient's temperature (numeric value). Do NOT include units or extra text.\n" +
            "    *   `respiratoryRate`: Respiratory rate (numeric value). Do NOT include extra text.\n" +
            "    *   `oxygenSaturation`: Oxygen saturation (numeric value). Do NOT include units or extra text.\n" +
            "    *   `painLevel`: Pain level (numeric or descriptive). Do NOT include extra text like 'pain is'.\n" +
            "    *   `height`: Height (numeric value). Do NOT include extra text.\n" +
            "    *   `heightUnit`: Height unit. MUST be `cm` or `in`. If not clearly stated or invalid, use \"did not get\".\n"
            +
            "    *   `weight`: Weight (numeric value). Do NOT include extra text.\n" +
            "    *   `weightUnit`: Weight unit. MUST be `kg` or `lb`. If not clearly stated or invalid, use \"did not get\".\n"
            +
            "    *   `glucose`: Glucose level (numeric value). Do NOT include extra text.\n" +
            "    *   `glucoseUnit`: Glucose unit. MUST be `mg/dL` or `mmol/L`. If not clearly stated or invalid, use \"did not get\".\n"
            +
            "    *   `posture`: Patient's posture (e.g., Sitting, Standing, Lying). Do NOT include extra text.\n" +
            "    *   `capillaryRefillTime`: Capillary refill time (e.g., <2 sec). Do NOT include extra text.\n" +
            "    *   `notes`: Any relevant notes. Be concise.\n" +
            "    *   `method`: Method of measurement (e.g., Oral, Axillary, BP Cuff Right Arm). Be concise.\n" +
            "\n" +
            "3.  **Filler Words:** Ignore filler words and conversational phrases.\n" +
            "\n" +
            "Here is the REQUIRED JSON format:\n" + // No markdown here
            "{\n" +
            "  \"timestamp\": \"\",\n" +
            "  \"heartRate\": \"\",\n" +
            "  \"bloodPressureSystolic\": \"\",\n" +
            "  \"bloodPressureDiastolic\": \"\",\n" +
            "  \"temperature\": \"\",\n" +
            "  \"respiratoryRate\": \"\",\n" +
            "  \"oxygenSaturation\": \"\",\n" +
            "  \"painLevel\": \"\",\n" +
            "  \"height\": \"\",\n" +
            "  \"heightUnit\": \"\",\n" +
            "  \"weight\": \"\",\n" +
            "  \"weightUnit\": \"\",\n" +
            "  \"glucose\": \"\",\n" +
            "  \"glucoseUnit\": \"\",\n" +
            "  \"posture\": \"\",\n" +
            "  \"capillaryRefillTime\": \"\",\n" +
            "  \"notes\": \"\",\n" +
            "  \"method\": \"\"\n" +
            "}";

    private static final String VITAL_SIGNS_UPDATE_PROMPT = "You are updating vital signs information based on audio input. The output MUST be a single JSON object, and NOTHING ELSE. Do NOT include any introductory or concluding text, or markdown like ```json.\n"
            + // Ensure no markdown
            "\n" +
            "**Important Instructions:**\n" +
            "\n" +
            "1.  **Only Update Mentioned Fields:** You will receive existing data. *Only* include fields in your JSON response that are *explicitly* mentioned in the audio and need to be changed. Do *NOT* include fields that are not mentioned.\n"
            +
            "2.  **Missing Information within Audio:** If a field usually exists (see the list below) but is *not* mentioned in the audio, *do not include it in the JSON*. We will keep the existing value.\n"
            +
            "3.  **Explicit 'did not get':** If the audio *explicitly* states that a value was not obtained (e.g., \"I didn't get the heart rate\"), set that field's value to \"did not get\".\n"
            +
            "\n" +
            "4.  **Fields:** (Follow the same rules as the initial extraction prompt regarding format and units. Numeric fields should contain only numbers.)\n"
            +
            "    *   `timestamp`: `yyyy-MM-ddTHH:mm:ss` or 'did not get'.\n" +
            "    *   `heartRate`: Numeric or 'did not get'.\n" +
            "    *   `bloodPressureSystolic`: Numeric or 'did not get'.\n" +
            "    *   `bloodPressureDiastolic`: Numeric or 'did not get'.\n" +
            "    *   `temperature`: Numeric or 'did not get'.\n" +
            "    *   `respiratoryRate`: Numeric or 'did not get'.\n" +
            "    *   `oxygenSaturation`: Numeric or 'did not get'.\n" +
            "    *   `painLevel`: Numeric/Descriptive or 'did not get'.\n" +
            "    *   `height`: Numeric or 'did not get'.\n" +
            "    *   `heightUnit`: `cm`, `in`, or 'did not get'.\n" +
            "    *   `weight`: Numeric or 'did not get'.\n" +
            "    *   `weightUnit`: `kg`, `lb`, or 'did not get'.\n" +
            "    *   `glucose`: Numeric or 'did not get'.\n" +
            "    *   `glucoseUnit`: `mg/dL`, `mmol/L`, or 'did not get'.\n" +
            "    *   `posture`: Text or 'did not get'.\n" +
            "    *   `capillaryRefillTime`: Text (e.g., <2 sec) or 'did not get'.\n" +
            "    *   `notes`: Text or 'did not get'.\n" +
            "    *   `method`: Text or 'did not get'.\n" +
            "\n" +
            "5.  **Filler Words:** Ignore filler words and conversational phrases.\n" +
            "\n" +
            "**Example (IMPORTANT):**\n" +
            "If the audio only says \"The heart rate is 80\", your JSON response *MUST* be *ONLY*:\n" + // No markdown
            "{\n" +
            "  \"heartRate\": \"80\"\n" +
            "}\n" +
            "If the audio only says \"The heart rate is 80 and I didn't get oxygen saturation\", your JSON response *MUST* be *ONLY*:\n"
            + // No markdown
            "{\n" +
            "  \"heartRate\": \"80\",\n" +
            "  \"oxygenSaturation\": \"did not get\"\n" +
            "}";

    @PostMapping(value = "/transcribe-vitals", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeVitalSigns(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received transcribeVitalSigns request");
        if (audioFile == null || audioFile.isEmpty()) {
            logger.warn("Audio file is missing or empty for vital signs transcription.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Audio file is required."));
        }
        try {
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, VITAL_SIGNS_PROMPT);
            logger.info("Raw Gemini response for vitals: {}", rawGeminiResponse);

            // Use the corrected postProcessResponse method
            String processedJsonString = postProcessResponse(rawGeminiResponse);
            logger.info("Post-processed vitals response: {}", processedJsonString);

            // Return the processed JSON string directly
            return ResponseEntity.ok(processedJsonString);

        } catch (IOException e) {
            logger.error("IO Error during vital signs transcription process: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process audio file for vital signs: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Runtime Error during vital signs transcription or processing: {}", e.getMessage(), e);
            String userMessage = "Failed to transcribe vital signs: " + e.getMessage();
            if (e.getCause() != null) {
                userMessage += " (Cause: " + e.getCause().getMessage() + ")";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", userMessage));
        } catch (Exception e) {
            logger.error("Unexpected error during vital signs transcription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message",
                            "An unexpected error occurred during vital signs transcription: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/transcribe-vitals-update/{vitalSignId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeVitalSignsUpdate(
            @RequestPart("audio") MultipartFile audioFile,
            @RequestPart("originalData") String originalDataJson, // Keep receiving original data as JSON string
            @PathVariable Long vitalSignId) {

        logger.info("Received transcribeVitalSignsUpdate request for ID: {}", vitalSignId);
        if (audioFile == null || audioFile.isEmpty()) {
            logger.warn("Audio file is missing or empty for vital signs update.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Audio file is required."));
        }
        if (originalDataJson == null || originalDataJson.trim().isEmpty()) {
            logger.warn("Original data JSON is missing or empty for vital signs update.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Original data JSON is required."));
        }

        try {
            // Parse the original data JSON string into a Map
            @SuppressWarnings("unchecked") // Suppress warning for generic cast
            Map<String, Object> originalData = gson.fromJson(originalDataJson, HashMap.class);
            if (originalData == null) {
                throw new JsonSyntaxException("Parsing originalDataJson resulted in null");
            }

            // Get the updates from Gemini
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, VITAL_SIGNS_UPDATE_PROMPT);
            logger.info("Raw Gemini response for update: {}", rawGeminiResponse);

            // Use the same flexible post-processor, but it will only return mentioned
            // fields based on the UPDATE prompt
            String processedUpdateJson = postProcessResponse(rawGeminiResponse);
            logger.info("Post-processed update response JSON: {}", processedUpdateJson);

            // Parse the processed *update* JSON into a Map
            @SuppressWarnings("unchecked") // Suppress warning for generic cast
            Map<String, Object> updatedFields = gson.fromJson(processedUpdateJson, HashMap.class);
            if (updatedFields == null) {
                // Gemini might return empty JSON "{}" if nothing was mentioned, which is valid
                updatedFields = new HashMap<>();
                logger.info("Gemini update response was empty or parsed to null, assuming no fields mentioned.");
            }

            // Merge the updated fields into the original data
            logger.debug("Merging updated fields into original data. Original keys: {}, Update keys: {}",
                    originalData.keySet(), updatedFields.keySet());
            for (Map.Entry<String, Object> entry : updatedFields.entrySet()) {
                // Only update if the key exists in the original data structure (or add if
                // needed, depending on desired behavior)
                // This simple merge updates existing keys and adds new ones if Gemini
                // hallucinated a field
                originalData.put(entry.getKey(), entry.getValue());
                logger.trace("Updated/Added key '{}' with value from Gemini update.", entry.getKey());
            }

            // Convert the final merged map back to a JSON string to return
            String finalJson = gson.toJson(originalData);
            logger.info("Successfully merged updates. Returning final JSON.");
            return ResponseEntity.ok(finalJson);

        } catch (JsonSyntaxException e) {
            logger.error("JSON parsing error in transcribeVitalSignsUpdate: {}. Input JSON: '{}'", e.getMessage(),
                    originalDataJson, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid JSON format provided (originalData or Gemini response)."));
        } catch (IOException e) {
            logger.error("IO Error during update transcription process: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process audio file for update: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Runtime Error during update transcription or processing: {}", e.getMessage(), e);
            String userMessage = "Failed to transcribe update for vital signs: " + e.getMessage();
            if (e.getCause() != null) {
                userMessage += " (Cause: " + e.getCause().getMessage() + ")";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", userMessage));
        } catch (Exception e) {
            logger.error("Unexpected Error during update transcription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during update: " + e.getMessage()));
        }
    }

    /**
     * CORRECTED: Parses the Gemini API response string flexibly and
     * validates/defaults
     * vital signs fields.
     *
     * @param rawResponseBody The raw string response from the Gemini API call.
     * @return A processed JSON String representing the vital signs data.
     * @throws RuntimeException if final parsing fails or required structure is
     *                          invalid.
     */
    private String postProcessResponse(String rawResponseBody) {
        if (rawResponseBody == null || rawResponseBody.trim().isEmpty()) {
            logger.error("Cannot process empty or null Gemini response body.");
            // Return an empty JSON object string instead of throwing an error immediately,
            // as the caller might handle it. Or throw, depending on desired strictness.
            // Let's throw for now to be explicit about the failure.
            throw new RuntimeException("Gemini returned an empty or null response.");
        }

        String jsonTextToParse = rawResponseBody.trim();
        logger.debug("Attempting to process Gemini vitals response (may be direct or nested): {}", rawResponseBody);

        // 1. Try parsing as the standard nested structure to extract inner text
        try {
            JsonObject jsonResponse = this.gson.fromJson(jsonTextToParse, JsonObject.class);

            // --- Safely navigate nested structure ---
            if (jsonResponse.has("candidates") && jsonResponse.get("candidates").isJsonArray()) {
                JsonArray candidates = jsonResponse.getAsJsonArray("candidates");
                if (!candidates.isEmpty() && candidates.get(0).isJsonObject()) {
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    if (candidate.has("content") && candidate.get("content").isJsonObject()) {
                        JsonObject content = candidate.getAsJsonObject("content");
                        if (content.has("parts") && content.get("parts").isJsonArray()) {
                            JsonArray parts = content.getAsJsonArray("parts");
                            if (!parts.isEmpty() && parts.get(0).isJsonObject()) {
                                JsonObject firstPart = parts.get(0).getAsJsonObject();
                                if (firstPart.has("text") && firstPart.get("text").isJsonPrimitive()) {
                                    // Nested structure found, extract inner text
                                    jsonTextToParse = firstPart.get("text").getAsString().trim();
                                    logger.debug("Successfully extracted text from nested structure: {}",
                                            jsonTextToParse);
                                } else {
                                    logger.warn(
                                            "Nested structure found, but 'text' field missing/not primitive in first part. Proceeding with raw body.");
                                }
                            } else {
                                logger.warn(
                                        "Nested structure: 'parts' array empty or first element not object. Proceeding with raw body.");
                            }
                        } else {
                            logger.warn(
                                    "Nested structure: 'content' object missing 'parts' array. Proceeding with raw body.");
                        }
                    } else {
                        logger.warn(
                                "Nested structure: 'candidate' object missing 'content' object. Proceeding with raw body.");
                    }
                } else {
                    logger.warn(
                            "Nested structure: 'candidates' array empty or first element not object. Proceeding with raw body.");
                }
            } else {
                logger.debug(
                        "Response does not appear to have standard nested 'candidates' structure. Assuming direct JSON.");
            }
        } catch (JsonSyntaxException e) {
            logger.warn(
                    "Response body not valid JSON when checking for nested structure: {}. Proceeding assuming direct JSON.",
                    e.getMessage());
        } catch (Exception e) { // Catch other potential issues
            logger.warn("Unexpected error checking for nested structure: {}. Proceeding assuming direct JSON.",
                    e.getMessage(), e);
        }

        // 2. Clean potential markdown
        String cleanedJsonText;
        Matcher matcher = JSON_EXTRACT_PATTERN.matcher(jsonTextToParse);
        if (matcher.find()) {
            String group1 = matcher.group(1);
            String group2 = matcher.group(2);
            cleanedJsonText = group1 != null ? group1.trim() : (group2 != null ? group2.trim() : "");
            logger.debug("Stripped markdown using regex. Result: {}", cleanedJsonText);
        } else {
            cleanedJsonText = jsonTextToParse; // No markdown found
            logger.debug("No markdown found or needed stripping.");
        }

        if (cleanedJsonText.isEmpty()) {
            logger.error("After processing, JSON text to parse is empty. Original response: {}", rawResponseBody);
            throw new RuntimeException("Failed to extract valid JSON content from Gemini response.");
        }

        // 3. Parse the cleaned JSON text into a JsonObject for validation
        JsonObject extractedData;
        try {
            extractedData = this.gson.fromJson(cleanedJsonText, JsonObject.class);
            if (extractedData == null) {
                throw new JsonSyntaxException("Parsing cleaned JSON resulted in null object");
            }
            logger.debug("Successfully parsed cleaned JSON into JsonObject.");
        } catch (JsonSyntaxException e) {
            logger.error("Final JSON parsing failed. Invalid syntax in: '{}'. Original: '{}'. Error: {}",
                    cleanedJsonText, rawResponseBody, e.getMessage(), e);
            throw new RuntimeException(
                    "Failed to parse final Gemini response JSON: Invalid syntax. Content: " + cleanedJsonText, e);
        }

        // 4. Perform Vital Signs Specific Post-Processing and Validation/Defaulting

        // Timestamp Validation/Defaulting
        if (extractedData.has("timestamp")) {
            if (extractedData.get("timestamp").isJsonPrimitive()) {
                String tsString = extractedData.get("timestamp").getAsString();
                if (!"did not get".equalsIgnoreCase(tsString)) {
                    try {
                        // Attempt to parse with expected format
                        LocalDateTime.parse(tsString, TIMESTAMP_FORMATTER);
                        // If successful, keep the original valid string
                        extractedData.addProperty("timestamp", tsString);
                    } catch (DateTimeParseException e) {
                        logger.warn("Invalid timestamp format '{}' received. Setting to 'did not get'.", tsString);
                        extractedData.addProperty("timestamp", "did not get");
                    }
                }
            } else {
                logger.warn("timestamp field present but not a primitive string. Setting to 'did not get'.");
                extractedData.addProperty("timestamp", "did not get");
            }
        } else {
            extractedData.addProperty("timestamp", "did not get"); // Default if missing
        }

        // Unit Validations
        validateUnit(extractedData, "heightUnit", VALID_HEIGHT_UNITS);
        validateUnit(extractedData, "weightUnit", VALID_WEIGHT_UNITS);
        validateUnit(extractedData, "glucoseUnit", VALID_GLUCOSE_UNITS);

        // Ensure all expected keys exist, defaulting to "did not get"
        for (String key : EXPECTED_VITAL_KEYS) {
            if (!extractedData.has(key)) {
                logger.trace("Expected key '{}' missing. Setting to 'did not get'.", key);
                extractedData.addProperty(key, "did not get");
            } else if (extractedData.get(key).isJsonNull()) {
                logger.trace("Key '{}' had null value. Setting to 'did not get'.", key);
                extractedData.addProperty(key, "did not get");
            }
            // Optional: Add check for non-primitive types if needed, similar to
            // PatientRestController
            else if (!extractedData.get(key).isJsonPrimitive() && !key.equals("notes")) { // Allow notes potentially to
                                                                                          // be objects/arrays if needed
                                                                                          // later, but default is
                                                                                          // string
                logger.warn("Key '{}' has non-primitive value '{}'. Setting to 'did not get'.", key,
                        extractedData.get(key).toString());
                extractedData.addProperty(key, "did not get");
            }

        }

        // 5. Convert the processed JsonObject back to a String
        String finalJsonString = this.gson.toJson(extractedData);
        logger.debug("Final processed vital signs JSON string: {}", finalJsonString);
        return finalJsonString;
    }

    /**
     * Helper method to validate unit fields.
     * 
     * @param data       The JsonObject containing the data.
     * @param key        The key of the unit field (e.g., "heightUnit").
     * @param validUnits A list of valid unit strings.
     */
    private void validateUnit(JsonObject data, String key, List<String> validUnits) {
        if (data.has(key)) {
            if (data.get(key).isJsonPrimitive()) {
                String unit = data.get(key).getAsString();
                if (!"did not get".equalsIgnoreCase(unit) && !validUnits.contains(unit)) {
                    logger.warn("Invalid unit '{}' for field '{}'. Setting to 'did not get'. Valid units are: {}", unit,
                            key, validUnits);
                    data.addProperty(key, "did not get");
                }
                // If it's valid or "did not get", leave it as is.
            } else {
                logger.warn("{} field present but not a primitive string. Setting to 'did not get'.", key);
                data.addProperty(key, "did not get");
            }
        } else {
            // If the unit key itself is missing, add it as "did not get"
            logger.trace("Unit key '{}' missing. Setting to 'did not get'.", key);
            data.addProperty(key, "did not get");
        }
    }

}