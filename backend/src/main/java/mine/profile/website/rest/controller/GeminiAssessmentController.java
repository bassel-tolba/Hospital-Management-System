package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.TextNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // Use RequestParam for simple fields
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

// Required Gson imports
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import mine.profile.website.services.GeminiRestService; // Assuming correct path

@RestController
@RequestMapping("/api/assessments/ai") // Base path for AI related assessment actions
public class GeminiAssessmentController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAssessmentController.class);

    @Autowired
    private GeminiRestService geminiRestService; // Service for Gemini API interaction

    // Create a Gson instance for parsing within this controller
    private final Gson gson = new Gson();

    // Regex pattern for cleaning JSON (static final)
    private static final Pattern JSON_EXTRACT_PATTERN = Pattern.compile("```(?:json)?\\s*(\\{.*\\})\\s*```|(\\{.*\\})",
            Pattern.DOTALL);

    // --- Prompt Generation Logic ---
    private String generateAssessmentPrompt(String templateName, String currentHtml, Long patientId) {
        // Your existing detailed prompt logic here - unchanged
        logger.debug("Generating assessment prompt for template: {}, patientId: {}", templateName, patientId);
        return "You are a medical AI assistant. Your primary task is to populate a medical assessment template, provided in HTML, based on an audio recording. You must **distinguish between direct value extraction and instructions/requests.**\n\n"
                +
                "**Input:**\n" +
                "*   Audio recording of a medical assessment.\n" +
                "*   HTML template content (provided below) with placeholders. Placeholders are enclosed in square brackets, e.g., `[Patient Name]`.\n"
                +
                "*   Patient ID (for context, but NOT to be included in the output).\n" +
                "*   Template Name (for context, but NOT to be included in the output).\n\n" +
                "**Output:**\n" +
                "*   A SINGLE JSON object. Do NOT include ANY text other than the JSON object. No introductions, explanations, markdown (like ```json), or apologies.\n"
                +
                "*   The JSON keys MUST be the placeholder names *without* the square brackets.\n" +
                "*   The JSON values MUST be derived from the audio, as described below:\n\n" +

                "**Value Derivation - IMPORTANT:**\n" +
                "1.  **Direct Value Extraction:** If the audio clearly states the value for a placeholder (e.g., 'Patient's weight is 75 kilograms'), extract that value directly and format it appropriately for medical documentation (e.g., `{\"Weight\": \"75 kg\"}`).\n"
                +
                "2.  **Instruction/Request Handling:**  The audio may contain instructions or requests related to a placeholder. **Pay close attention to the keywords \"request\" and \"خدمه\" (Arabic for 'service').** These words indicate that you should *reason* about the preceding conversation and generate the value based on the context. You should NOT simply transcribe the words following the placeholder name.\n"
                +
                "    *   **Example:** If the audio says, '...and for the [Diagnosis] field, request a differential diagnosis based on the symptoms mentioned,' you should analyze the previously mentioned symptoms and provide a reasoned differential diagnosis, NOT just the phrase 'request a differential diagnosis...'.\n"
                +
                "    *   **Another Example:** '...[Allergies] خدمه  استنتاج الحساسيات المحتمله من الادويه المذكوره'  This means you should *infer* the potential allergies from the medications mentioned *earlier* in the conversation, not transcribe the instruction.\n"
                +
                "3. **If the value is NOT mentioned *and* NO instruction/request is given, do NOT include the placeholder in the JSON. Do NOT use default values. Do NOT guess.**\n\n"
                +

                "**Example (Direct Extraction):**\n" +
                "Audio: '...the patient's temperature is 37.5 degrees Celsius...'  HTML Placeholder: `[Temperature]`\n"
                +
                "JSON: `{\"Temperature\": \"37.5°C\"}`\n\n" +

                "**Example (Instruction/Request - English):**\n" +
                "Audio: '...and for the [Treatment Plan], request a plan considering the patient is diabetic.' HTML Placeholder: `[Treatment Plan]`\n"
                +
                "JSON (Illustrative - the actual output would be a reasoned plan): `{\"Treatment Plan\": \"Insulin therapy, dietary modifications, regular blood glucose monitoring...\"}`\n\n"
                +
                "**Example (Instruction/Request - Arabic):**\n" +
                "Audio: '...[التحاليل المطلوبه] خدمه اقتراح التحاليل بناءً على الأعراض.' HTML Placeholder: `[التحاليل المطلوبه]`\n"
                +
                "JSON (Illustrative): `{\"التحاليل المطلوبه\": \"CBC, CMP, HbA1c...\"}`\n\n" +
                "**Important Considerations:**\n" +
                "*   **Medical Terminology:** You must understand medical terms and abbreviations in both English and Arabic.\n"
                +
                "*   **Context:** Pay VERY close attention to the entire conversation.  Instructions and requests often refer to information provided earlier.\n"
                +
                "*   **Formatting:** Use standard medical notation and units.\n" +
                "*   **Strict JSON:** Only valid JSON is accepted. No comments, no extra text.\n" +
                "*  **Bilingual:** Be prepared to process both English and Arabic medical terms and instructions.\n\n" +
                // User Guidance section remains the same...
                "**User Guidance (For Best Audio Input):**\n" +
                "*   **Speak Clearly:** Enunciate words and phrases distinctly.\n" +
                "*   **Consistent Terminology:** Use the exact placeholder names from the HTML template (without the brackets) when referring to fields.  For example, say 'Patient Name is...' or 'For the Treatment Plan, request...'.\n"
                +
                "*   **Logical Order:** Follow a logical order similar to the template structure. This helps with context.\n"
                +
                "*   **Explicit Instructions:** When you want the AI to *generate* a value, use the words \"request\" or \"خدمه\" *before* mentioning the placeholder name. Clearly state what you want the AI to do. For example, \"Request for [Diagnosis] a differential diagnosis.\",  or  \"[الحساسيه] خدمه استنتاج.\".\n"
                +
                "*   **Provide Context First:** For instructions, mention relevant information *before* giving the instruction.  For example, *instead* of saying  \"Request a treatment plan for [Treatment Plan].  The patient is diabetic.\", say \"The patient is diabetic. For [Treatment Plan], request a treatment plan.\"\n"
                +
                "*   **Avoid Ambiguity:** Be as specific as possible.  Instead of saying 'He has a fever', say 'The patient's [Temperature] is 39 degrees Celsius'.\n"
                +
                "*   **Pause Briefly:** Leave a short pause (about 0.5-1 second) between different pieces of information, especially between different fields.\n\n"
                +
                "**Contextual Information:**\n" +
                "Patient ID: " + patientId + "\n" +
                "Template Name: " + templateName + "\n\n" +
                "**Current HTML Content (contains placeholders to populate):**\n```html\n" + currentHtml + "\n```";
    }

    @PostMapping(value = "/transcribe-and-populate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeAndPopulateAssessment(
            @RequestPart("audio") MultipartFile audioFile,
            // Use RequestParam for simple fields - Spring handles conversion
            @RequestParam("templateName") String templateName,
            @RequestParam("patientId") Long patientId,
            // This currentHtml comes from the CKEditor state on the frontend
            @RequestParam("currentHtml") String currentHtml) {

        logger.info("Received AI transcribe request. Template: {}, PatientID: {}", templateName, patientId);

        // --- Input Validation ---
        if (audioFile == null || audioFile.isEmpty()) {
            logger.warn("Audio file is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Audio file is required."));
        }
        if (currentHtml == null || currentHtml.trim().isEmpty()) {
            logger.warn("Current HTML content is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current HTML content is required (from editor)."));
        }
        if (templateName == null || templateName.trim().isEmpty()) {
            logger.warn("Template name is missing or empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Template name is required."));
        }
        if (patientId == null) {
            logger.warn("Patient ID is missing.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Patient ID is required."));
        }

        try {
            logger.debug("Original HTML length: {}", currentHtml.length());

            // 1. Generate the dynamic prompt using the provided context
            String dynamicPrompt = generateAssessmentPrompt(templateName, currentHtml, patientId);

            // 2. Call the Gemini Service to get the raw response string
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, dynamicPrompt);
            logger.info("Raw Gemini response string received."); // Avoid logging full response unless debugging
            if (logger.isDebugEnabled()) { // Log sensitive data only in debug mode
                logger.debug("Raw Gemini Response: {}", rawGeminiResponse);
            }

            // 3. Parse the flexible response string into a Map
            Map<String, Object> extractedData = parseFlexibleGeminiResponse(rawGeminiResponse);

            // 4. Replace placeholders in the *original* currentHtml
            String updatedHtml = replacePlaceholders(currentHtml, extractedData);
            logger.info("HTML updated successfully after placeholder replacement.");
            logger.debug("Updated HTML length: {}", updatedHtml.length());

            // 5. Return the updated HTML to the frontend
            return ResponseEntity.ok(Map.of("updatedHtml", updatedHtml));

        } catch (GeminiRestService.ApiKeyConfigurationException e) {
            logger.error("Gemini API Key configuration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "AI service configuration error: " + e.getMessage()));
        } catch (IOException e) {
            logger.error("IOException during file processing or upload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error processing audio file: " + e.getMessage()));
        } catch (RuntimeException e) { // Includes parsing errors from parseFlexibleGeminiResponse
            logger.error("RuntimeException during AI processing or parsing: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process assessment with AI: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during AI transcription/population: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    // --- Helper Method: Parse Flexible Gemini Response ---
    private Map<String, Object> parseFlexibleGeminiResponse(String rawResponseBody) {
        // Logic from previous answer - unchanged
        if (rawResponseBody == null || rawResponseBody.trim().isEmpty()) {
            logger.error("Cannot parse empty or null Gemini response body.");
            throw new RuntimeException("Gemini returned an empty or null response.");
        }

        String jsonTextToParse = rawResponseBody.trim();
        logger.debug("Attempting to parse flexible Gemini response (trimmed length: {})", jsonTextToParse.length());

        // 1. Try parsing standard nested structure
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
                                    logger.debug("Extracted text from nested structure.");
                                } else {
                                    logger.warn(
                                            "Nested structure found, but 'text' field missing/invalid in first part.");
                                }
                            } else {
                                logger.warn("Nested structure 'parts' array is empty or first element not object.");
                            }
                        } else {
                            logger.warn("Nested structure 'parts' field missing or not array.");
                        }
                    } else {
                        logger.warn("Nested structure 'content' field missing or not object.");
                    }
                } else {
                    logger.warn("Nested structure 'candidates' array is empty or first element not object.");
                }
            } else {
                logger.debug("Response does not contain 'candidates' key. Assuming direct JSON.");
            }
        } catch (JsonSyntaxException e) {
            logger.warn(
                    "Response body is not valid JSON when checking for nested structure: {}. Will attempt parsing raw body.",
                    e.getMessage());
        } catch (Exception e) {
            logger.warn("Unexpected error checking for nested Gemini structure: {}. Will attempt parsing raw body.",
                    e.getMessage(), e);
        }

        // 2. Clean potential markdown
        String cleanedJsonText;
        Matcher matcher = JSON_EXTRACT_PATTERN.matcher(jsonTextToParse);
        if (matcher.find()) {
            String group1 = matcher.group(1); // Explicit ```json {..} ```
            String group2 = matcher.group(2); // Just {..}
            cleanedJsonText = (group1 != null) ? group1.trim() : (group2 != null ? group2.trim() : null);
            if (cleanedJsonText == null) {
                cleanedJsonText = jsonTextToParse.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "").trim();
                logger.warn("Regex matched markdown but failed to extract JSON group. Used basic strip.");
            } else {
                logger.debug("Stripped markdown using regex.");
            }
        } else {
            cleanedJsonText = jsonTextToParse;
            logger.debug("No markdown found or needed stripping.");
        }

        if (cleanedJsonText == null || cleanedJsonText.isEmpty()) {
            logger.error("After processing, the JSON text to parse is empty. Original response length: {}",
                    rawResponseBody.length());
            throw new RuntimeException("Failed to extract valid JSON content from Gemini response.");
        }

        // 3. Parse the cleaned JSON text into a Map
        try {
            java.lang.reflect.Type mapType = new com.google.gson.reflect.TypeToken<Map<String, Object>>() {
            }.getType();
            Map<String, Object> resultMap = this.gson.fromJson(cleanedJsonText, mapType);
            if (resultMap == null) {
                logger.error("Final parsing of cleaned JSON string resulted in null. Cleaned JSON: '{}'",
                        cleanedJsonText);
                throw new RuntimeException("Failed to parse Gemini response into a data map (result was null).");
            }
            logger.info("Successfully parsed Gemini response into Map: {} keys", resultMap.size());
            return resultMap;
        } catch (JsonSyntaxException e) {
            logger.error("Final JSON parsing failed. Invalid JSON syntax in cleaned text (length {}). Error: {}",
                    cleanedJsonText.length(), e.getMessage());
            if (logger.isTraceEnabled()) { // Log potentially large/sensitive cleaned text only on trace
                logger.trace("Cleaned JSON causing syntax error: {}", cleanedJsonText);
            }
            throw new RuntimeException("Failed to parse final Gemini response JSON: Invalid syntax.", e);
        } catch (Exception e) {
            logger.error("Unexpected error during final JSON parsing. Cleaned text length: {}. Error: {}",
                    cleanedJsonText.length(), e.getMessage(), e);
            throw new RuntimeException("Unexpected error parsing final Gemini response JSON: " + e.getMessage(), e);
        }
    }

    // --- Helper Method: Replace Placeholders in HTML ---
    private String replacePlaceholders(String html, Map<String, Object> data) {
        // Logic from previous answer - unchanged
        if (html == null || data == null || data.isEmpty()) {
            return html; // Return original if no data or html
        }
        Document doc = Jsoup.parse(html);
        Pattern pattern = Pattern.compile("\\[([^\\]]+?)\\]"); // Find [Placeholder]

        doc.traverse((node, depth) -> {
            if (node instanceof TextNode) {
                TextNode textNode = (TextNode) node;
                String originalText = textNode.getWholeText();
                Matcher matcher = pattern.matcher(originalText);
                StringBuffer sb = new StringBuffer();
                boolean changed = false;

                while (matcher.find()) {
                    String placeholderKey = matcher.group(1).trim();
                    Object valueObject = data.get(placeholderKey);
                    // Convert value to string, handle nulls gracefully
                    String replacement = (valueObject != null) ? String.valueOf(valueObject) : null;

                    if (replacement != null) {
                        // Escape special characters for regex replacement, then unescape common HTML
                        // entities
                        String escapedReplacement = Matcher.quoteReplacement(replacement);
                        // String unescapedHtml =
                        // org.apache.commons.text.StringEscapeUtils.unescapeHtml4(escapedReplacement);
                        // // Use Apache Commons if available
                        // Or manually unescape basic ones if Apache Commons is not available:
                        String basicUnescaped = escapedReplacement.replace("&lt;", "<").replace("&gt;", ">")
                                .replace("&amp;", "&");
                        matcher.appendReplacement(sb, basicUnescaped);
                        changed = true;
                        // logger.trace("Replaced placeholder '[{}]'", placeholderKey); // Avoid logging
                        // value
                    } else {
                        // If no data for placeholder, keep the original placeholder text
                        matcher.appendReplacement(sb, Matcher.quoteReplacement(matcher.group(0)));
                        // logger.trace("No data for placeholder '[{}]'", placeholderKey);
                    }
                }
                matcher.appendTail(sb);

                if (changed) {
                    textNode.text(sb.toString());
                }
            }
        });

        return doc.html(); // Return the full modified HTML string
    }
}