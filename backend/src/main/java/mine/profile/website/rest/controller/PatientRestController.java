package mine.profile.website.rest.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.Year; // For parsing year only
import java.time.YearMonth; // For parsing year-month
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

// Gson Imports
import com.google.gson.Gson;
import com.google.gson.JsonArray; // Import required
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

    // Keep the Gson instance for parsing within this controller
    private final Gson gson = new Gson();

    // Keep constants
    private static final DateTimeFormatter EXPECTED_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy");
    private static final List<String> VALID_GENDERS = List.of("Male", "Female");
    private static final Pattern JSON_EXTRACT_PATTERN = Pattern.compile("```(?:json)?\\s*(\\{.*\\})\\s*```|(\\{.*\\})",
            Pattern.DOTALL);
    private static final Pattern BLOOD_TYPE_PATTERN = Pattern.compile("^(A|B|AB|O)[+-]$", Pattern.CASE_INSENSITIVE); // Make
                                                                                                                     // case-insensitive
                                                                                                                     // initially

    // Keep the prompt
    private static final String PATIENT_INFO_PROMPT = "You are extracting patient information from audio to fill a registration form. The output MUST be a single JSON object, and NOTHING ELSE.  Do NOT include any introductory or concluding text, or markdown like ```json.\n"
            + // Added no markdown here
            "\n" +
            "Extract the information from the audio and follow these STRICT rules:\n" +
            "\n" +
            "1.  **Missing Information:** If a field is not *explicitly* mentioned in the audio, set its value to \"did not get\".\n"
            +
            "\n" +
            "2.  **Fields:**\n" +
            "    *   `firstName`: Patient's first name.  Do NOT include any extra words.\n" +
            "    *   `lastName`: Patient's last name. Do NOT include any extra words.\n" +
            "    *   `dateOfBirth`: Patient's date of birth.  MUST be in `yyyy-MM-dd` format. If the year, month, or day is missing or unclear, provide what you can but try to fit the `yyyy-MM-dd` format (e.g., '1995-07-did not get' is NOT valid, use 'did not get'). If only year is known, use `yyyy-01-01`. If year and month, use `yyyy-MM-01`. If the full date is spoken, use it. If unusable, use 'did not get'.\n"
            + // Adjusted prompt slightly for clarity
            "    *   `gender`: Patient's gender.  MUST be either `Male` or `Female` (English, case-sensitive). No other values are allowed, under any circumstances. If unsure or different, use 'did not get'.\n"
            + // Added 'did not get' option
            "    *   `address`: Patient's address. Format as: `City - Street - Additional Details`.  If parts are missing, include what you can. Be as specific as possible, but ONLY include information stated in the audio. Examples:\n"
            +
            "        *   \"Alexandria - El Shatby - Building near the train station\"\n" +
            "        *   \"Cairo - Nasr City - 123 Main Street\"\n" +
            "        *   \"did not get\" (if no address information is provided)\n" +
            "    *    Do NOT make up address components. Do NOT include introductory phrases like 'The address is'.\n" +
            "    *   `phoneNumber`: Patient's phone number. Do NOT include extra text or labels.\n" +
            "    *   `email`: Patient's email address. Do NOT include extra text.\n" +
            "    *   `bloodType`: Patient's blood type. MUST be capitalized (e.g., `A+`, `AB-`, `O+`). MUST match pattern `(A|B|AB|O)[+-]`. If not clearly stated or invalid, use \"did not get\".\n"
            + // Stricter pattern definition
            "    *   `allergies`: List of patient's allergies.  ONLY include the allergy names, separated by commas.  Do NOT include any descriptive phrases, explanations, or filler words. Example: \"Penicillin, Nuts, Shellfish\"\n"
            +
            "    *   `medicalHistory`: Patient's medical history.  ONLY include concrete medical information (conditions, past illnesses, etc.).  Do NOT include filler words, conversational phrases, or vague statements. Be concise and specific.\n"
            +
            "\n" +
            "3.  **Language:** Determine the primary language spoken in the audio (English or Arabic). Output all fields in that language, *EXCEPT* for the `gender` field, which MUST ALWAYS be `Male` or `Female` in English (or 'did not get').\n"
            + // Added 'did not get'
            "\n" +
            "4.  **Filler Words and Extraneous Information:**  ABSOLUTELY IGNORE any filler words (e.g., 'um', 'uh', 'like', 'you know', 'basically', 'sort of'), casual conversation, or phrases that *describe* the information instead of providing the information itself (e.g., 'a lot of problems', 'some issues with', 'I think it was').  Do NOT include *any* extra text that is not directly part of the requested data.\n"
            +
            "\n" +
            "Here is the REQUIRED JSON format:\n" + // No markdown here either
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
            "}";

    // --- CRUD Endpoints (Retained as provided by user) ---
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
    // --- End of CRUD ---

    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeAudio(@RequestPart("audio") MultipartFile audioFile) {
        logger.info("Received transcribe request");
        if (audioFile == null || audioFile.isEmpty()) {
            logger.warn("Audio file is missing or empty for transcription.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Audio file is required."));
        }
        try {
            logger.info("Calling geminiRestService.transcribeAndProcess");
            // Service still returns a String
            String rawGeminiResponse = geminiRestService.transcribeAndProcess(audioFile, PATIENT_INFO_PROMPT);
            logger.info("GeminiRestService returned raw string: {}", rawGeminiResponse);

            // Use the updated postProcessResponse method
            String processedJsonString = postProcessResponse(rawGeminiResponse);
            logger.info("Post-processed JSON string: {}", processedJsonString);

            // Return the processed JSON string directly
            // The frontend will need to parse this JSON string
            return ResponseEntity.ok(processedJsonString);

        } catch (IOException e) {
            // Errors likely from service's file handling/upload
            logger.error("IO Error reported during transcription process: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process audio file: " + e.getMessage()));
        } catch (RuntimeException e) {
            // Errors from service call OR from postProcessResponse parsing
            logger.error("Runtime Error during transcription or processing: {}", e.getMessage(), e);
            String userMessage = "Failed to transcribe audio: " + e.getMessage();
            if (e.getCause() != null) {
                userMessage += " (Cause: " + e.getCause().getMessage() + ")";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", userMessage));
        } catch (Exception e) {
            logger.error("Unexpected error during transcription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during transcription: " + e.getMessage()));
        }
    }

    /**
     * MODIFIED: Parses the Gemini API response string, accommodating both direct
     * JSON
     * and nested 'candidates' structure. Also performs patient-specific validation.
     *
     * @param rawResponseBody The raw string response from the Gemini API call.
     * @return A processed JSON String suitable for the frontend.
     * @throws RuntimeException if final parsing fails or required structure is
     *                          invalid.
     */
    private String postProcessResponse(String rawResponseBody) {
        if (rawResponseBody == null || rawResponseBody.trim().isEmpty()) {
            logger.error("Cannot process empty or null Gemini response body.");
            throw new RuntimeException("Gemini returned an empty or null response.");
        }

        String jsonTextToParse = rawResponseBody.trim();
        logger.debug("Attempting to process Gemini response (may be direct or nested): {}", rawResponseBody);

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
                                            "Nested structure found, but 'text' field missing or not primitive in first part. Proceeding with raw body.");
                                }
                            } else {
                                logger.warn(
                                        "Nested structure: 'parts' array is empty or first element is not an object. Proceeding with raw body.");
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
                            "Nested structure: 'candidates' array is empty or first element is not an object. Proceeding with raw body.");
                }
            } else {
                logger.debug(
                        "Response does not appear to have standard nested 'candidates' structure. Assuming direct JSON.");
            }
        } catch (JsonSyntaxException e) {
            logger.warn(
                    "Response body is not valid JSON when checking for nested structure: {}. Proceeding assuming direct JSON.",
                    e.getMessage());
        } catch (Exception e) { // Catch other potential issues like ClassCastException, NullPointerException
            logger.warn("Unexpected error while checking for nested structure: {}. Proceeding assuming direct JSON.",
                    e.getMessage(), e);
        }

        // 2. Clean potential markdown from the (potentially extracted) jsonTextToParse
        String cleanedJsonText;
        Matcher matcher = JSON_EXTRACT_PATTERN.matcher(jsonTextToParse);
        if (matcher.find()) {
            String group1 = matcher.group(1);
            String group2 = matcher.group(2);
            cleanedJsonText = group1 != null ? group1.trim() : (group2 != null ? group2.trim() : ""); // Prefer explicit
                                                                                                      // json block
            logger.debug("Stripped markdown using regex. Result: {}", cleanedJsonText);
        } else {
            cleanedJsonText = jsonTextToParse; // No markdown found
            logger.debug("No markdown found or needed stripping.");
        }

        if (cleanedJsonText.isEmpty()) {
            logger.error("After processing, the JSON text to parse is empty. Original response: {}", rawResponseBody);
            throw new RuntimeException("Failed to extract valid JSON content from Gemini response.");
        }

        // 3. Parse the cleaned JSON text into a JsonObject for validation
        JsonObject extractedData;
        try {
            extractedData = this.gson.fromJson(cleanedJsonText, JsonObject.class);
            if (extractedData == null) { // Should not happen with valid JSON, but check
                throw new JsonSyntaxException("Parsing cleaned JSON resulted in null object");
            }
            logger.debug("Successfully parsed cleaned JSON into JsonObject.");
        } catch (JsonSyntaxException e) {
            logger.error("Final JSON parsing failed. Invalid JSON syntax in: '{}'. Original response: '{}'. Error: {}",
                    cleanedJsonText, rawResponseBody, e.getMessage(), e);
            throw new RuntimeException(
                    "Failed to parse final Gemini response JSON: Invalid syntax. Content: " + cleanedJsonText, e);
        }

        // 4. Perform Patient-Specific Post-Processing and Validation

        // Date of Birth Validation/Formatting
        if (extractedData.has("dateOfBirth")) {
            // Ensure it's a primitive string before getting it
            if (extractedData.get("dateOfBirth").isJsonPrimitive()) {
                String dobString = extractedData.get("dateOfBirth").getAsString();
                if (!"did not get".equalsIgnoreCase(dobString)) { // Case-insensitive check for "did not get"
                    String formattedDob = "did not get"; // Default if parsing fails
                    try {
                        // Try full date first
                        LocalDate parsedDate = LocalDate.parse(dobString, EXPECTED_DATE_FORMATTER);
                        formattedDob = parsedDate.format(EXPECTED_DATE_FORMATTER);
                    } catch (DateTimeParseException e1) {
                        try {
                            // Try year and month
                            YearMonth ym = YearMonth.parse(dobString, YEAR_MONTH_FORMATTER);
                            formattedDob = ym.atDay(1).format(EXPECTED_DATE_FORMATTER); // Use 1st day of month
                            logger.debug("Parsed yyyy-MM for DOB: {}, formatted as: {}", dobString, formattedDob);
                        } catch (DateTimeParseException e2) {
                            try {
                                // Try year only
                                Year y = Year.parse(dobString, YEAR_FORMATTER);
                                formattedDob = y.atDay(1).format(EXPECTED_DATE_FORMATTER); // Use Jan 1st of year
                                logger.debug("Parsed yyyy for DOB: {}, formatted as: {}", dobString, formattedDob);
                            } catch (DateTimeParseException e3) {
                                logger.warn(
                                        "Could not parse dateOfBirth '{}' into yyyy-MM-dd format. Setting to 'did not get'.",
                                        dobString);
                                // formattedDob remains "did not get"
                            }
                        }
                    }
                    extractedData.addProperty("dateOfBirth", formattedDob);
                }
            } else {
                logger.warn("dateOfBirth field was present but not a primitive string. Setting to 'did not get'.");
                extractedData.addProperty("dateOfBirth", "did not get");
            }
        } else {
            extractedData.addProperty("dateOfBirth", "did not get"); // Ensure field exists if missing entirely
        }

        // Gender Validation (Strict)
        if (extractedData.has("gender")) {
            if (extractedData.get("gender").isJsonPrimitive()) {
                String gender = extractedData.get("gender").getAsString();
                if (!VALID_GENDERS.contains(gender)) { // Check against strict list first
                    // Map common Arabic variations if strict check fails
                    if ("ذكر".equals(gender)) {
                        extractedData.addProperty("gender", "Male");
                    } else if ("أنثى".equals(gender)) {
                        extractedData.addProperty("gender", "Female");
                    } else {
                        logger.warn("Invalid gender value '{}' received. Setting to 'did not get'.", gender);
                        extractedData.addProperty("gender", "did not get");
                    }
                }
                // If it was already "Male" or "Female", it remains unchanged.
            } else {
                logger.warn("gender field was present but not a primitive string. Setting to 'did not get'.");
                extractedData.addProperty("gender", "did not get");
            }
        } else {
            extractedData.addProperty("gender", "did not get"); // Ensure field exists if missing entirely
        }

        // Blood Type Validation (Pattern and Capitalization)
        if (extractedData.has("bloodType")) {
            if (extractedData.get("bloodType").isJsonPrimitive()) {
                String bloodType = extractedData.get("bloodType").getAsString();
                if (!"did not get".equalsIgnoreCase(bloodType)) {
                    Matcher bloodMatcher = BLOOD_TYPE_PATTERN.matcher(bloodType);
                    if (bloodMatcher.matches()) {
                        // It matches the pattern (A/B/AB/O followed by +/-)
                        extractedData.addProperty("bloodType", bloodType.toUpperCase()); // Ensure consistent case
                                                                                         // (e.g., a+ becomes A+)
                    } else {
                        logger.warn("Invalid bloodType format '{}' received. Setting to 'did not get'.", bloodType);
                        extractedData.addProperty("bloodType", "did not get");
                    }
                }
            } else {
                logger.warn("bloodType field was present but not a primitive string. Setting to 'did not get'.");
                extractedData.addProperty("bloodType", "did not get");
            }
        } else {
            extractedData.addProperty("bloodType", "did not get"); // Ensure field exists if missing entirely
        }

        // Ensure all other required keys exist, setting to "did not get" if missing or
        // null
        String[] requiredKeys = { "firstName", "lastName", "address", "phoneNumber", "email", "allergies",
                "medicalHistory" };
        for (String key : requiredKeys) {
            if (!extractedData.has(key)) {
                logger.warn("Required key '{}' missing in Gemini response. Setting to 'did not get'.", key);
                extractedData.addProperty(key, "did not get");
            }
            // Also handle null values just in case Gemini returns "key": null
            else if (extractedData.get(key).isJsonNull()) {
                logger.warn("Key '{}' had a null value in Gemini response. Setting to 'did not get'.", key);
                extractedData.addProperty(key, "did not get");
            }
            // Additionally ensure they are strings if they exist but are not primitives
            // (e.g., empty objects/arrays returned by mistake)
            else if (!extractedData.get(key).isJsonPrimitive() && !extractedData.get(key).isJsonNull()) {
                logger.warn("Key '{}' had a non-primitive value ('{}'). Setting to 'did not get'.", key,
                        extractedData.get(key).toString());
                extractedData.addProperty(key, "did not get");
            }
        }

        // 5. Convert the processed JsonObject back to a String
        String finalJsonString = this.gson.toJson(extractedData);
        logger.debug("Final processed JSON string: {}", finalJsonString);
        return finalJsonString;
    }

}