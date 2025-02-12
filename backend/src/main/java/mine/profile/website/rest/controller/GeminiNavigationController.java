package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.Map;

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

import mine.profile.website.services.GeminiRestService;

@RestController
@RequestMapping("/api/gemini")
public class GeminiNavigationController {

    private static final Logger logger = LoggerFactory.getLogger(GeminiNavigationController.class);

    @Autowired
    private GeminiRestService geminiRestService;

    private static final String NAVIGATION_PROMPT = "You are a navigation assistant within a hospital application. " +
            "The user will describe the page they want to navigate to, and you must return a JSON object " +
            "containing the 'pageName' and 'success' boolean fields. The app uses these pages: Login, Register, Profile, Patients, Activities, Procedures, Vital Signs, Assessments, Procedure Logs, Units, Rooms, Beds, Admissions, Users, Medications, Medication History, Prescriptions, Medication Administrations, Product Usages, Products, Billings, Image Reports, Image Report Types, Documents, Document Types, Lab Tests, Lab Results, All Features, Roles Permissions.\n"
            +
            "If you are confident about the page that user says respond in this JSON format:\n" +
            "{\n" +
            "   \"pageName\": \"name of page\",\n" +
            "   \"success\": true\n" +
            "}\n" +
            "else if you are not confident or not sure  respond in this format:\n" +
            "{\n" +
            "   \"pageName\": \"\",\n" +
            "   \"success\": false\n" +
            "}";

    @PostMapping(value = "/navigate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> navigateByVoice(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received navigation request");
        try {
            String geminiResponse = geminiRestService.transcribeAndProcess(audioFile, NAVIGATION_PROMPT);
            logger.info("GeminiRestService returned: {}", geminiResponse);

            // Basic validation (you can expand this)
            if (geminiResponse == null || geminiResponse.isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gemini API returned an empty response."));
            }
            return ResponseEntity.ok(geminiResponse); // return raw JSON response

        } catch (IOException e) {
            logger.error("IO Error transcribing audio", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe audio: " + e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Runtime Error transcribing audio", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to transcribe audio: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during transcription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }
}