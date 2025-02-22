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
        // Enhanced prompt with instruction understanding, request handling, and user
        // guidance.
        return "You are a medical AI assistant. Your primary task is to populate a medical assessment template, provided in HTML, based on an audio recording. However, you must **distinguish between direct value extraction and instructions/requests.**\n\n"
                +
                "**Input:**\n" +
                "*   Audio recording of a medical assessment.\n" +
                "*   HTML template with placeholders. Placeholders are enclosed in square brackets, e.g., `[Patient Name]`.\n"
                +
                "*   Patient ID (for context, but NOT to be included in the output).\n" +
                "*   Template Name (for context, but NOT to be included in the output).\n\n" +
                "**Output:**\n" +
                "*   A SINGLE JSON object. Do NOT include ANY text other than the JSON object. No introductions, explanations, or apologies.\n"
                +
                "*   The JSON keys MUST be the placeholder names *without* the square brackets.\n" +
                "*   The JSON values MUST be derived from the audio, as described below:\n\n" +

                "**Value Derivation - IMPORTANT:**\n" +
                "1.  **Direct Value Extraction:** If the audio clearly states the value for a placeholder (e.g., 'Patient's weight is 75 kilograms'), extract that value directly and format it appropriately for medical documentation (e.g., `{\"Weight\": \"75 kg\"}`).\n"
                +
                "2.  **Instruction/Request Handling:**  The audio may contain instructions or requests related to a placeholder.  **Pay close attention to the keywords \"request\" and \"خدمه\" (Arabic for 'service').**  These words indicate that you should *reason* about the preceding conversation and generate the value based on the context. You should NOT simply transcribe the words following the placeholder name.\n"
                +
                "    *   **Example:** If the audio says, '...and for the [Diagnosis] field, request a differential diagnosis based on the symptoms mentioned,' you should analyze the previously mentioned symptoms and provide a reasoned differential diagnosis, NOT just the phrase 'request a differential diagnosis...'.\n"
                +
                "    *   **Another Example:** '...[Allergies] خدمه  استنتاج الحساسيات المحتمله من الادويه المذكوره'  This means you should *infer* the potential allergies from the medications mentioned *earlier* in the conversation, not transcribe the instruction.\n"
                +
                "3. **If the value is NOT mentioned *and* NO instruction/request is given, do NOT include the placeholder in the JSON. Do NOT use default values. Do NOT guess.**\n\n"
                +

                "**Example (Direct Extraction):**\n" +
                "Audio: '...the patient's temperature is 37.5 degrees Celsius...'  HTML: `[Temperature]`\n" +
                "JSON: `{\"Temperature\": \"37.5°C\"}`\n\n" +

                "**Example (Instruction/Request - English):**\n" +
                "Audio: '...and for the [Treatment Plan], request a plan considering the patient is diabetic.' HTML: `[Treatment Plan]`\n"
                +
                "JSON (Illustrative - the actual output would be a reasoned plan): `{\"Treatment Plan\": \"Insulin therapy, dietary modifications, regular blood glucose monitoring...\"}`\n\n"
                +

                "**Example (Instruction/Request - Arabic):**\n" +
                "Audio: '...[التحاليل المطلوبه] خدمه اقتراح التحاليل بناءً على الأعراض.' HTML: `[التحاليل المطلوبه]`\n"
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