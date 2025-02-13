package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
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

    private String generateAssessmentPrompt(String templateName, String currentHtml, Long patientId) {
        // Clear, concise, and well-structured prompt. Crucially, it emphasizes JSON
        // output and placeholder handling.
        return "You are a medical AI assistant. Your task is to extract information from provided audio and use it to populate a medical assessment template.  "
                +
                "The template is provided in HTML format.  You MUST ONLY extract information that is explicitly mentioned in the audio. Do NOT make assumptions or infer any information.\n\n"
                +
                "**Input:**\n" +
                "*  Audio recording of a medical assessment.\n" +
                "*  HTML template with placeholders. Placeholders are enclosed in square brackets, e.g., `[Patient Name]`.\n"
                +
                "*  Patient ID (for context, but NOT to be included in the output).\n" +
                "*  Template Name (for context, but NOT to be included in the output).\n\n" +
                "**Output:**\n" +
                "*  A SINGLE JSON object.  Do NOT include ANY text other than the JSON object.  No introductions, no explanations, no apologies.\n"
                +
                "*  The JSON keys MUST be the placeholder names *without* the square brackets.\n" +
                "*  The JSON values MUST be the extracted information from the audio, formatted appropriately for medical documentation (e.g., correct units, abbreviations).\n"
                +
                "*  If a placeholder's value is NOT mentioned in the audio, do NOT include it in the JSON.  Do NOT use default values. Do NOT guess.\n\n"
                +
                "**Example:**\n" +
                "If the audio says '...the patient's temperature is 37.5 degrees Celsius...' and the HTML has a placeholder `[Temperature]`, then a *part* of your JSON output should be:\n"
                +
                "`{\"Temperature\": \"37.5°C\"}`\n\n" +
                "**Important Considerations:**\n" +
                "*  **Medical Terminology:**  You must understand medical terms and abbreviations.\n" +
                "*  **Context:** Pay attention to the relationships between different parts of the assessment.\n" +
                "*  **Formatting:** Use standard medical notation and units.\n" +
                "* **Strict JSON:** Only valid JSON is accepted. No comments, no extra text.\n\n" +
                "Patient ID: " + patientId + "\n" +
                "Template Name: " + templateName + "\n\n" +
                "HTML Template:\n```html\n" + currentHtml + "\n```";
    }

    @PostMapping(value = "/transcribe-and-populate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeAndPopulateAssessment(
            @RequestPart("audio") MultipartFile audioFile,
            @RequestPart("templateName") String templateName,
            @RequestPart("currentHtml") String currentHtml,
            @RequestPart("patientId") String patientId) {
        logger.info("Received transcribeAndPopulateAssessment request for template: {}", templateName);

        try {
            Long patientIdLong = Long.parseLong(patientId);

            // Use the original HTML. Do NOT clean it.
            logger.info("Original HTML: {}", currentHtml);

            // Generate the dynamic prompt, using the *original* HTML.
            String dynamicPrompt = generateAssessmentPrompt(templateName, currentHtml, patientIdLong);

            // Call Gemini.
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, dynamicPrompt);
            logger.info("Raw Gemini response: {}", rawGeminiResponse);

            if (rawGeminiResponse == null || rawGeminiResponse.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gemini returned an empty or null response."));
            }

            // Post-process the Gemini response to extract the JSON.
            String jsonString = postProcessResponse(rawGeminiResponse);
            logger.info("Post-processed JSON: {}", jsonString);

            // Parse the JSON.
            Gson gson = new Gson();
            Map<String, Object> extractedData = gson.fromJson(jsonString, Map.class);

            // Replace placeholders in the *original* HTML using the improved method.
            String updatedHtml = replacePlaceholders(currentHtml, extractedData);
            logger.info("Updated HTML: {}", updatedHtml);

            return ResponseEntity.ok(Map.of("updatedHtml", updatedHtml));

        } catch (NumberFormatException e) {
            logger.error("Invalid patientId format", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid patientId format.  Must be a number."));
        } catch (JsonSyntaxException e) {
            logger.error("JSON parsing error", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid JSON returned by Gemini."));
        } catch (IOException | RuntimeException e) { // Combined exception handling
            logger.error("Error during processing", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe or process: " + e.getMessage()));
        }
    }

    private String replacePlaceholders(String html, Map<String, Object> data) {
        Document doc = Jsoup.parse(html);
        Pattern pattern = Pattern.compile("\\[([^\\]]+)\\]");

        // Iterate through all *text nodes* in the document. This is the key
        // improvement.
        doc.getAllElements().stream()
                .flatMap(element -> element.textNodes().stream())
                .forEach(textNode -> {
                    String originalText = textNode.text();
                    Matcher matcher = pattern.matcher(originalText);
                    StringBuffer sb = new StringBuffer();

                    while (matcher.find()) {
                        String placeholder = matcher.group(1);
                        String replacement = data.containsKey(placeholder) ? String.valueOf(data.get(placeholder))
                                : null;

                        if (replacement != null) {
                            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
                        } else {
                            // Keep the original placeholder (don't remove) if no match.
                            matcher.appendReplacement(sb, Matcher.quoteReplacement(matcher.group(0)));
                        }
                    }
                    matcher.appendTail(sb);

                    // *Only* update the text node if the text has actually changed.
                    if (!sb.toString().equals(originalText)) {
                        textNode.text(sb.toString());
                    }
                });

        return doc.outerHtml(); // Return the *complete* HTML document.
    }

    private String postProcessResponse(String responseBody) {
        // This method remains largely the same, extracting the JSON string from the
        // Gemini response.
        try {
            Gson gson = new Gson();
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);

            if (!jsonResponse.has("candidates")
                    || !jsonResponse.getAsJsonArray("candidates").isJsonArray()
                    || jsonResponse.getAsJsonArray("candidates").size() == 0) {
                throw new IOException("Invalid response structure from Gemini API: Missing 'candidates' array.");
            }

            JsonObject candidate = jsonResponse.getAsJsonArray("candidates").get(0).getAsJsonObject();
            if (!candidate.has("content")
                    || !candidate.getAsJsonObject("content").has("parts")
                    || !candidate.getAsJsonObject("content").getAsJsonArray("parts").isJsonArray()
                    || candidate.getAsJsonObject("content").getAsJsonArray("parts").size() == 0) {
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