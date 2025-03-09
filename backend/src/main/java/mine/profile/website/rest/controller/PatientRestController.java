// rest/controller/PatientRestController.java (Modified)
package mine.profile.website.rest.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import jakarta.validation.Valid;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.services.GeminiRestService;
import mine.profile.website.services.PatientService;

@RestController
@RequestMapping("/api/patients")
public class PatientRestController {

    private static final Logger logger = LoggerFactory.getLogger(PatientRestController.class);

    @Autowired
    private PatientService patientService;

    @Autowired
    private GeminiRestService geminiRestService;

    private static final DateTimeFormatter EXPECTED_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final List<String> VALID_GENDERS = List.of("Male", "Female");

    private static final String PATIENT_INFO_PROMPT = "You are extracting patient information from audio to fill a registration form. The output MUST be a single JSON object, and NOTHING ELSE.  Do NOT include any introductory or concluding text.\n"
            +
            "\n" +
            "Extract the information from the audio and follow these STRICT rules:\n" +
            "\n" +
            "1.  **Missing Information:** If a field is not *explicitly* mentioned in the audio, set its value to \"did not get\".\n"
            +
            "\n" +
            "2.  **Fields:**\n" +
            "    *   `firstName`: Patient's first name.  Do NOT include any extra words.\n" +
            "    *   `lastName`: Patient's last name. Do NOT include any extra words.\n" +
            "    *   `dateOfBirth`: Patient's date of birth.  MUST be in `yyyy-MM-dd` format. If the year is missing or unclear, provide what you can in `yyyy-MM-dd` format.  Prioritize getting the year, month, and day in the correct order.\n"
            +
            "    *   `gender`: Patient's gender.  MUST be either `Male` or `Female` (English, case-sensitive).  No other values are allowed, under any circumstances.\n"
            +
            "    *   `address`: Patient's address. Format as: `City - Street - Additional Details`.  If parts are missing, include what you can. Be as specific as possible, but ONLY include information stated in the audio. Examples:\n"
            +
            "        *   \"Alexandria - El Shatby - Building near the train station\"\n" +
            "        *   \"Cairo - Nasr City - 123 Main Street\"\n" +
            "        *   \"did not get\" (if no address information is provided)\n" +
            "    *    Do NOT make up address components. Do NOT include introductory phrases like 'The address is'.\n" +
            "    *   `phoneNumber`: Patient's phone number. Do NOT include extra text or labels.\n" +
            "    *   `email`: Patient's email address. Do NOT include extra text.\n" +
            "    *   `bloodType`: Patient's blood type. MUST be capitalized (e.g., `A+`, `AB-`, `O+`). If not clearly stated, use \"did not get\".\n"
            +
            "    *   `allergies`: List of patient's allergies.  ONLY include the allergy names, separated by commas.  Do NOT include any descriptive phrases, explanations, or filler words. Example: \"Penicillin, Nuts, Shellfish\"\n"
            +
            "    *   `medicalHistory`: Patient's medical history.  ONLY include concrete medical information (conditions, past illnesses, etc.).  Do NOT include filler words, conversational phrases, or vague statements. Be concise and specific.\n"
            +
            "\n" +
            "3.  **Language:** Determine the primary language spoken in the audio (English or Arabic). Output all fields in that language, *EXCEPT* for the `gender` field, which MUST ALWAYS be `Male` or `Female` in English.\n"
            +
            "\n" +
            "4.  **Filler Words and Extraneous Information:**  ABSOLUTELY IGNORE any filler words (e.g., 'um', 'uh', 'like', 'you know', 'basically', 'sort of'), casual conversation, or phrases that *describe* the information instead of providing the information itself (e.g., 'a lot of problems', 'some issues with', 'I think it was').  Do NOT include *any* extra text that is not directly part of the requested data.\n"
            +
            "\n" +
            "Here is the REQUIRED JSON format:\n" +
            "```json\n" +
            "{\n" +
            "  \"firstName\": \"\",\n" +
            "  \"lastName\": \"\",\n" +
            "  \"dateOfBirth\": \"\",\n" +
            "  \"gender\": \"\",\n" +
            "  \"address\": \"\",\n" +
            "  \"phoneNumber\": \"\",\n" +
            "  \"email\": \"\",\n" +
            "  \"bloodType\": \"\",\n" +
            "  \"allergies\": \"\",\n" +
            "  \"medicalHistory\": \"\"\n" +
            "}\n" +
            "```";

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientDTO> createPatient(@Valid @RequestPart("patient") PatientDTO patientDTO,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {
        logger.info("Received createPatient request");
        PatientDTO createdPatient = patientService.createPatient(patientDTO, profilePicture);

        if (createdPatient != null) {
            logger.info("Patient created with ID: {}", createdPatient.getId());
            return new ResponseEntity<>(createdPatient, HttpStatus.CREATED);
        } else {
            logger.warn("Patient creation failed");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        logger.info("Received getPatientById request for ID: {}", id);
        PatientDTO patientDTO = patientService.getPatientById(id);
        if (patientDTO != null) {
            logger.info("Found patient with ID: {}", id);
            return new ResponseEntity<>(patientDTO, HttpStatus.OK);
        } else {
            logger.info("No patient found with ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        logger.info("Received getAllPatients request");
        List<PatientDTO> patientDTOs = patientService.getAllPatients();
        logger.info("Returning {} patients", patientDTOs.size());
        return new ResponseEntity<>(patientDTOs, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientDTO> updatePatient(@PathVariable Long id,
            @RequestPart("patient") @Valid PatientDTO patientDTO,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestPart(value = "removedProfilePictureUrls", required = false) String removedProfilePictureUrls) {

        logger.info("Received updatePatient request for ID: {}", id);
        PatientDTO updatedPatient = patientService.updatePatient(id, patientDTO, profilePicture,
                removedProfilePictureUrls);
        if (updatedPatient != null) {
            logger.info("Patient updated with ID: {}", id);
            return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
        } else {
            logger.info("No patient found with ID: {} for update", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        logger.info("Received deletePatient request for ID: {}", id);
        boolean deleted = patientService.deletePatient(id);
        if (deleted) {
            logger.info("Patient deleted with ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            logger.info("No patient found with ID: {} for deletion", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PatientDTO>> searchPatients(
            @RequestParam(required = false, name = "searchTerm") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "severityLevel,asc") String sort) { // Add sort parameter

        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 ? Sort.Direction.fromString(sortParams[1])
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<PatientDTO> patients;
        if (search == null || search.isEmpty()) {
            patients = patientService.getPatients(pageable);
        } else {
            patients = patientService.searchPatients(search, pageable);
        }
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/search/name")
    public ResponseEntity<List<PatientDTO>> searchPatientByFullName(@RequestParam String name) {
        List<PatientDTO> patientDTOs = patientService.searchPatientByFullName(name);
        return new ResponseEntity<>(patientDTOs, HttpStatus.OK);
    }

    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeAudio(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received transcribe request");
        try {
            logger.info("Calling geminiRestService.transcribeAndProcess");
            String geminiResponse = geminiRestService.transcribeAndProcess(audioFile, PATIENT_INFO_PROMPT);
            logger.info("GeminiRestService returned: {}", geminiResponse);

            String postProcessedResponse = postProcessResponse(geminiResponse);
            logger.info("Post-processed response: {}", postProcessedResponse);

            // Return the post-processed JSON string directly
            return ResponseEntity.ok(postProcessedResponse);

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

            // Parse the extracted JSON text
            JsonObject extractedData = gson.fromJson(extractedJsonText, JsonObject.class);

            // --- Minimal Post-Processing (Date and Gender Enforcement) ---

            // 1. Date of Birth (Ensure format, even if partially extracted)
            if (extractedData.has("dateOfBirth")) {
                String dobString = extractedData.get("dateOfBirth").getAsString();
                if (!"did not get".equals(dobString)) {
                    try {
                        LocalDate parsedDate = LocalDate.parse(dobString, EXPECTED_DATE_FORMATTER);
                        extractedData.addProperty("dateOfBirth", parsedDate.format(EXPECTED_DATE_FORMATTER)); // Ensure
                                                                                                              // correct
                                                                                                              // format
                    } catch (DateTimeParseException e) {
                        // Attempt to parse partial dates (e.g., year only, year-month)
                        try {
                            // Try parsing year and month
                            DateTimeFormatter yearMonthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
                            LocalDate partialDate = LocalDate.parse(dobString + "-01", yearMonthFormatter); // Add "-01"
                                                                                                            // for day
                            extractedData.addProperty("dateOfBirth", partialDate.format(EXPECTED_DATE_FORMATTER));
                        } catch (DateTimeParseException e2) {
                            try {
                                // Try parsing year only
                                DateTimeFormatter yearFormatter = DateTimeFormatter.ofPattern("yyyy");
                                LocalDate partialDate = LocalDate.parse(dobString + "-01-01", yearFormatter); // Add
                                                                                                              // "-01-01"
                                extractedData.addProperty("dateOfBirth", partialDate.format(EXPECTED_DATE_FORMATTER));
                            } catch (DateTimeParseException e3) {
                                System.err.println("Invalid date format received: " + dobString);
                                extractedData.addProperty("dateOfBirth", "did not get"); // Set to "did not get" if all
                                                                                         // parsing fails
                            }
                        }
                    }
                }
            }
            // 2. Gender (STRICT Enforcement)
            if (extractedData.has("gender")) {
                String gender = extractedData.get("gender").getAsString();
                if (!VALID_GENDERS.contains(gender)) {
                    // Attempt to map common Arabic terms, otherwise set to "did not get"
                    if (gender.equals("ذكر")) {
                        extractedData.addProperty("gender", "Male");
                    } else if (gender.equals("أنثى")) {
                        extractedData.addProperty("gender", "Female");
                    } else {
                        extractedData.addProperty("gender", "did not get");
                    }
                }
            }
            // 3. Blood Type (Capitalization - using a regex for flexibility)
            if (extractedData.has("bloodType")) {
                String bloodType = extractedData.get("bloodType").getAsString();
                if (!"did not get".equals(bloodType)) {
                    Pattern bloodTypePattern = Pattern.compile("^(A|B|AB|O)[+-]$");
                    Matcher matcher = bloodTypePattern.matcher(bloodType);
                    if (matcher.matches()) {
                        extractedData.addProperty("bloodType", bloodType.toUpperCase()); // Consistent capitalization
                    } else {
                        extractedData.addProperty("bloodType", "did not get");
                    }
                }
            }

            // Convert back to a JSON string
            return gson.toJson(extractedData);

        } catch (JsonSyntaxException | IOException e) {
            throw new RuntimeException("Error processing Gemini response: " + e.getMessage(), e);
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<PatientDTO>> filterPatients(
            @RequestParam(required = false) Long unitId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long bedId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String sort) { // Default sort, can be overridden

        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 ? Sort.Direction.fromString(sortParams[1])
                : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        if (unitId != null) {
            return ResponseEntity.ok(patientService.getPatientsByUnit(unitId, pageable));
        } else if (roomId != null) {
            return ResponseEntity.ok(patientService.getPatientsByRoom(roomId, pageable));
        } else if (bedId != null) {
            return ResponseEntity.ok(patientService.getPatientsByBed(bedId, pageable));
        } else {
            // If no filter is specified, return all *active* patients.
            return ResponseEntity.ok(patientService.getPatients(pageable)); // Or a custom method to get only active
                                                                            // patients if needed
        }
    }
}