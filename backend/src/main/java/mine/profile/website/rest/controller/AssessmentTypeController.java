package mine.profile.website.rest.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Import for security
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mine.profile.website.dtos.AssessmentTypeDTO;
import mine.profile.website.service.AssessmentTypeService;

@RestController
@RequestMapping("/api/assessment-types")
public class AssessmentTypeController {

    private static final Logger log = LoggerFactory.getLogger(AssessmentTypeController.class);

    @Autowired
    private AssessmentTypeService assessmentTypeService;

    // Endpoint to get all types (names and display names, no content)
    @GetMapping
    @PreAuthorize("isAuthenticated()") // Any authenticated user can see the list of types
    public ResponseEntity<List<AssessmentTypeDTO>> getAllAssessmentTypes() {
        log.info("Received request to get all assessment types");
        List<AssessmentTypeDTO> types = assessmentTypeService.getAllAssessmentTypes();
        return ResponseEntity.ok(types);
    }

    // Endpoint to get a specific type BY ID (including content) - Might be needed
    // for admin UI
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_ASSESSMENT_TYPES') or hasAuthority('READ_ASSESSMENT')") // Admin or someone who
                                                                                                // can read assessments
    public ResponseEntity<AssessmentTypeDTO> getAssessmentTypeById(@PathVariable Long id) {
        log.info("Received request to get assessment type by ID: {}", id);
        AssessmentTypeDTO type = assessmentTypeService.getAssessmentTypeById(id);
        return ResponseEntity.ok(type);
    }

    // Endpoint to get a specific type BY NAME (including content) - Used by
    // frontend form and potentially AI backend
    @GetMapping("/by-name/{name}")
    @PreAuthorize("isAuthenticated()") // Authenticated users need this to populate the form
    public ResponseEntity<AssessmentTypeDTO> getAssessmentTypeByName(@PathVariable String name) {
        log.info("Received request to get assessment type by name: {}", name);
        AssessmentTypeDTO type = assessmentTypeService.getAssessmentTypeByName(name);
        return ResponseEntity.ok(type);
    }

    // --- Optional: Endpoints for managing types (usually admin only) ---

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_ASSESSMENT_TYPES')") // Requires specific permission
    public ResponseEntity<AssessmentTypeDTO> createAssessmentType(@Valid @RequestBody AssessmentTypeDTO dto) {
        log.info("Received request to create assessment type with name: {}", dto.getName());
        AssessmentTypeDTO createdType = assessmentTypeService.createAssessmentType(dto);
        return new ResponseEntity<>(createdType, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_ASSESSMENT_TYPES')")
    public ResponseEntity<AssessmentTypeDTO> updateAssessmentType(@PathVariable Long id,
            @Valid @RequestBody AssessmentTypeDTO dto) {
        log.info("Received request to update assessment type with ID: {}", id);
        AssessmentTypeDTO updatedType = assessmentTypeService.updateAssessmentType(id, dto);
        return ResponseEntity.ok(updatedType);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_ASSESSMENT_TYPES')")
    public ResponseEntity<Void> deleteAssessmentType(@PathVariable Long id) {
        log.info("Received request to delete assessment type with ID: {}", id);
        assessmentTypeService.deleteAssessmentType(id);
        return ResponseEntity.noContent().build();
    }
}