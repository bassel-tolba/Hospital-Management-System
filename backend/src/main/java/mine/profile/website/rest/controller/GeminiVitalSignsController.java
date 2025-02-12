// GeminiVitalSignsController.java
package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

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

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import mine.profile.website.services.GeminiRestService;

@RestController
@RequestMapping("/api/gemini")
public class GeminiVitalSignsController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiVitalSignsController.class);

    @Autowired
    private GeminiRestService geminiRestService;

    private static final String VITAL_SIGNS_PROMPT = "You are extracting vital signs information from audio to fill a form.  The output MUST be a single JSON object, and NOTHING ELSE.  Do NOT include any introductory or concluding text.\n"
            +
            "\n" +
            "Extract the information and follow these STRICT rules:\n" +
            "\n" +
            "1.  **Missing Information:** If a field is not *explicitly* mentioned, set its value to \"did not get\".\n"
            +
            "\n" +
            "2.  **Fields:**\n" +
            "    *   `timestamp`: MUST be in `yyyy-MM-ddTHH:mm:ss` format. If not provided, it will default to the current time.\n"
            +
            "    *   `heartRate`: Patient's heart rate.  Do NOT include extra text or labels.\n" +
            "    *   `bloodPressureSystolic`: Systolic blood pressure.  Do NOT include extra text.\n" +
            "    *   `bloodPressureDiastolic`: Diastolic blood pressure.  Do NOT include extra text.\n" +
            "    *   `temperature`: Patient's temperature.  Do NOT include extra text.\n" +
            "    *   `respiratoryRate`: Respiratory rate.  Do NOT include extra text.\n" +
            "    *   `oxygenSaturation`: Oxygen saturation.  Do NOT include extra text.\n" +
            "    *   `painLevel`: Pain level.  Do NOT include extra text.\n" +
            "    *   `height`: Height.  Do NOT include extra text.\n" +
            "    *   `heightUnit`: Height unit (`cm` or `in`). If not clearly stated, use \"did not get\".\n" +
            "    *   `weight`: Weight. Do NOT include extra text.\n" +
            "    *   `weightUnit`: Weight unit (`kg` or `lb`). If not clearly stated, use \"did not get\".\n" +
            "    *   `glucose`: Glucose.  Do NOT include extra text.\n" +
            "    *   `glucoseUnit`: Glucose unit (`mg/dL` or `mmol/L`). If not clearly stated, use \"did not get\".\n" +
            "    *   `posture`: Patient's posture.  Do NOT include extra text.\n" +
            "    *   `capillaryRefillTime`: Capillary refill time.  Do NOT include extra text.\n" +
            "    *   `notes`: Any notes.  Do NOT include filler words or conversational phrases. Be concise and specific.\n"
            +
            "    *   `method`: Method of measurement.  Do NOT include filler words.\n" +
            "\n" +
            "3.  **Filler Words:**  Ignore filler words and conversational phrases.\n" +
            "\n" +
            "Here is the REQUIRED JSON format:\n" +
            "```json\n" +
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
            "}\n" +
            "```";
    private static final String VITAL_SIGNS_UPDATE_PROMPT = "You are updating vital signs information based on audio input.  The output MUST be a single JSON object, and NOTHING ELSE. Do NOT include any introductory or concluding text.\n"
            +
            "\n" +
            "**Important Instructions:**\n" +
            "\n" +
            "1.  **Only Update Mentioned Fields:**  You will receive existing data.  *Only* include fields in your JSON response that are *explicitly* mentioned in the audio and need to be changed.  Do *NOT* include fields that are not mentioned.\n"
            +
            "2.  **Missing Information within Audio:** If a field usually exists (see the list below) but is *not* mentioned in the audio, *do not include it in the JSON*.  We will keep the existing value.\n"
            +
            "3.  **Explicit 'did not get':** If the audio *explicitly* states that a value was not obtained (e.g., \"I didn't get the heart rate\"), set that field's value to \"did not get\".\n"
            +
            "\n" +
            "4.  **Fields:** (Same fields as before, listed here for completeness):\n" +
            "    *   `timestamp`: ...\n" +
            "    *   `heartRate`: ...\n" +
            "    *   `bloodPressureSystolic`: ...\n" +
            "    *   `bloodPressureDiastolic`: ...\n" +
            "    *   `temperature`: ...\n" +
            "    *   `respiratoryRate`: ...\n" +
            "    *   `oxygenSaturation`: ...\n" +
            "    *   `painLevel`: ...\n" +
            "    *   `height`: ...\n" +
            "    *   `heightUnit`: ...\n" +
            "    *   `weight`: ...\n" +
            "    *   `weightUnit`: ...\n" +
            "    *   `glucose`: ...\n" +
            "    *   `glucoseUnit`: ...\n" +
            "    *   `posture`: ...\n" +
            "    *   `capillaryRefillTime`: ...\n" +
            "    *   `notes`: ...\n" +
            "    *   `method`: ...\n" +
            "\n" +
            "5.  **Filler Words:** Ignore filler words and conversational phrases.\n" +
            "\n" +
            "**Example (IMPORTANT):**\n" +
            "If the audio only says \"The heart rate is 80\", your JSON response *MUST* be *ONLY*:\n" +
            "```json\n" +
            "{\n" +
            "  \"heartRate\": \"80\"\n" +
            "}\n" +
            "```\n" +
            "If the audio only says \"The heart rate is 80 and I didn't get oxygen saturation\", your JSON response *MUST* be *ONLY*:\n"
            +
            "```json\n" +
            "{\n" +
            "  \"heartRate\": \"80\",\n" +
            " \"oxygenSaturation\": \"did not get\"\n" +
            "}\n" +
            "```\n";

    @PostMapping(value = "/transcribe-vitals", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeVitalSigns(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received transcribeVitalSigns request");
        try {
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, VITAL_SIGNS_PROMPT);
            logger.info("Raw Gemini response: {}", rawGeminiResponse); // Log the raw response

            if (rawGeminiResponse == null || rawGeminiResponse.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gemini returned an empty or null response."));
            }

            String postProcessedResponse = postProcessResponse(rawGeminiResponse);
            logger.info("Post-processed response: {}", postProcessedResponse);

            // Return the post-processed JSON string directly
            return ResponseEntity.ok(postProcessedResponse);
        } catch (IOException e) {
            logger.error("IO Error transcribing audio for vital signs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe audio for vital signs: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Runtime Error transcribing audio for vital signs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe audio for vital signs: " + e.getMessage()));
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
            @RequestPart("originalData") String originalDataJson,
            @PathVariable Long vitalSignId) {

        logger.info("Received transcribeVitalSignsUpdate request for ID: {}", vitalSignId);

        try {
            Gson gson = new Gson();
            Map<String, Object> originalData = gson.fromJson(originalDataJson, HashMap.class);

            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, VITAL_SIGNS_UPDATE_PROMPT);
            logger.info("Raw Gemini response for update: {}", rawGeminiResponse); // Log raw response

            if (rawGeminiResponse == null || rawGeminiResponse.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gemini returned an empty or null response."));
            }

            String postProcessedResponse = postProcessResponse(rawGeminiResponse);
            logger.info("Post-processed update response: {}", postProcessedResponse);

            Map<String, Object> updatedFields = gson.fromJson(postProcessedResponse, HashMap.class);

            for (Map.Entry<String, Object> entry : updatedFields.entrySet()) {
                originalData.put(entry.getKey(), entry.getValue());
            }

            String finalJson = gson.toJson(originalData);
            return ResponseEntity.ok(finalJson);

        } catch (JsonSyntaxException e) {
            logger.error("JSON parsing error in transcribeVitalSignsUpdate", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid originalData JSON format."));
        } catch (IOException e) {
            logger.error("IO Error during update transcription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe audio: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Runtime Error during update transcription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe audio for vital signs: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected Error during update transcription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    private String postProcessResponse(String responseBody) {
        // copy and past the postProcessResponse method from the PatientRestController
        // class
        try {
            Gson gson = new Gson();
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);

            // --- Basic Structure Validation (Important) ---
            if (!jsonResponse.has("candidates") || !jsonResponse.getAsJsonArray("candidates").isJsonArray() ||
                    jsonResponse.getAsJsonArray("candidates").size() == 0) {
                throw new IOException("Invalid response structure from Gemini API: Missing 'candidates' array.");
            }

            JsonObject candidate = jsonResponse.getAsJsonArray("candidates").get(0).getAsJsonObject();
            if (!candidate.has("content") || !candidate.getAsJsonObject("content").has("parts") ||
                    !candidate.getAsJsonObject("content").getAsJsonArray("parts").isJsonArray() ||
                    candidate.getAsJsonObject("content").getAsJsonArray("parts").size() == 0) {
                throw new IOException(
                        "Invalid response structure from Gemini API: Missing or invalid 'content' or 'parts'.");
            }

            JsonObject firstPart = candidate.getAsJsonObject("content").getAsJsonArray("parts").get(0)
                    .getAsJsonObject();
            if (!firstPart.has("text")) {
                throw new IOException("Invalid response structure: 'text' field missing in Gemini response.");
            }
            String extractedJsonText = firstPart.get("text").getAsString();
            // Remove backticks and "json" keyword if present
            extractedJsonText = extractedJsonText.replace("```json", "").replace("```", "").trim();
            return extractedJsonText;

        } catch (JsonSyntaxException | IOException e) {
            throw new RuntimeException("Error processing Gemini response: " + e.getMessage(), e);
        }
    }
}