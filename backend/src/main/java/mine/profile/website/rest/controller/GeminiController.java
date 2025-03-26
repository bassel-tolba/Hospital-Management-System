// GeminiController.java
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
public class GeminiController { // Changed class name!

    private static final Logger logger = LoggerFactory.getLogger(GeminiController.class);

    @Autowired
    private GeminiRestService geminiRestService;

    @PostMapping(value = "/soundtotext", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> soundToText(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received soundToText request");
        try {
            String transcribedText = geminiRestService.transcribeAudio(audioFile); // Call the *new* service method
            logger.info("Transcribed text: {}", transcribedText);

            if (transcribedText == null || transcribedText.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Gemini returned an empty or null response."));
            }

            // Return the transcribed text directly (no JSON wrapping needed)
            return ResponseEntity.ok(transcribedText);

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
                    .body(Map.of("message", "An unexpected error occurred during transcription: " + e.getMessage()));
        }
    }
}