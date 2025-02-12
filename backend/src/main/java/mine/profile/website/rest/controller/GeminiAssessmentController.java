package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.HashMap;
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

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import mine.profile.website.services.GeminiRestService;

@RestController
@RequestMapping("/api/assessments/ai")
public class GeminiAssessmentController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAssessmentController.class);

    @Autowired
    private GeminiRestService geminiRestService;

    // Helper function to generate the dynamic prompt
    private String generateAssessmentPrompt(String templateName, String currentHtml, Long patientId) {
        // Basic prompt structure. This is VERY important.
        String basePrompt = "You are extracting information from audio to fill in placeholders within an HTML assessment template.  The output MUST be a single JSON object, and NOTHING ELSE. Do NOT include any introductory or concluding text.\n"
                + "\n"
                + "**Instructions:**\n"
                + "\n"
                + "1. **Placeholders:** The template uses placeholders enclosed in square brackets, like this: `[Placeholder Name]`.\n"
                + "2. **Extract Values:** Extract the values corresponding to these placeholders from the audio.\n"
                + "3. **Missing Information:** If a field is not *explicitly* mentioned in the audio, *do not include it in the JSON*.  Do NOT use 'did not get' or any other default value.\n"
                + "4. **Output Format:**  Return *only* a JSON object where the keys are the placeholder names (WITHOUT the brackets) and the values are the extracted information. For example, `{\"Patient Name\": \"John Doe\", \"Temperature\": \"98.6\"}`.  Do NOT include any extra text or explanations.\n"
                + "5. **Patient ID:** I am also giving the patientId, don't add it to your response, is just for your knowledge\n"
                + "\n"
                + "**Template Name:** " + templateName + "\n\n"
                + "Here is the current HTML content (for context, but extract from AUDIO):\n"
                + "```html\n"
                + currentHtml + "\n"
                + "```\n";

        return basePrompt;
    }

    @PostMapping(value = "/transcribe-and-populate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeAndPopulateAssessment(
            @RequestPart("audio") MultipartFile audioFile,
            @RequestPart("templateName") String templateName,
            @RequestPart("currentHtml") String currentHtml,
            @RequestPart("patientId") String patientId) { // Change to String
        logger.info("Received transcribeAndPopulateAssessment request for template: {}", templateName);

        try {
            // Parse patientId to Long
            Long patientIdLong = Long.parseLong(patientId);

            // Generate the dynamic prompt
            String dynamicPrompt = generateAssessmentPrompt(templateName, currentHtml, patientIdLong);

            // Call Gemini
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, dynamicPrompt);
            logger.info("Raw Gemini response: {}", rawGeminiResponse);

            if (rawGeminiResponse == null || rawGeminiResponse.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gemini returned an empty or null response."));
            }

            // Post-process the Gemini response to get the JSON
            String jsonString = postProcessResponse(rawGeminiResponse);
            logger.info("Post-processed JSON: {}", jsonString);
            // Parse the JSON response
            Gson gson = new Gson();
            Map<String, Object> extractedData = gson.fromJson(jsonString, HashMap.class);

            // Replace placeholders in the HTML
            String updatedHtml = replacePlaceholders(currentHtml, extractedData);

            // Return the updated HTML
            return ResponseEntity.ok(Map.of("updatedHtml", updatedHtml));

        } catch (NumberFormatException e) {
            logger.error("Invalid patientId format", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid patientId format.  Must be a number."));
        } catch (JsonSyntaxException e) {
            logger.error("JSON parsing error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid JSON returned by Gemini."));
        } catch (IOException e) {
            logger.error("IO Error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe or process: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Runtime Error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe or process.: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected Error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    private String replacePlaceholders(String html, Map<String, Object> data) {
        // Use a regular expression to find placeholders like [Placeholder Name]
        Pattern pattern = Pattern.compile("\\[([^\\]]+)\\]"); // Corrected regex
        Matcher matcher = pattern.matcher(html);

        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String placeholder = matcher.group(1); // Get the content inside the brackets
            String replacement = data.containsKey(placeholder) ? data.get(placeholder).toString() : null; // Get value,
                                                                                                          // handle null

            if (replacement != null) {
                // Escape the replacement string for use in replaceAll (important!)
                replacement = Matcher.quoteReplacement(replacement);
                matcher.appendReplacement(sb, replacement);
            } else {
                // If no replacement, keep the original placeholder (don't remove it)
                matcher.appendReplacement(sb, Matcher.quoteReplacement(matcher.group(0))); // Keep original
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String postProcessResponse(String responseBody) {

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