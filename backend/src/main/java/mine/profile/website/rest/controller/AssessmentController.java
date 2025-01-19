package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mine.profile.website.dtos.AssessmentDTO;
import mine.profile.website.service.AssessmentService;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<AssessmentDTO> createAssessment(@Valid @RequestBody AssessmentDTO assessmentDTO) {
        AssessmentDTO createdAssessment = assessmentService.createAssessment(assessmentDTO);
        return new ResponseEntity<>(createdAssessment, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentDTO> getAssessmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assessmentService.getAssessmentById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<AssessmentDTO>> findByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(assessmentService.findByPatientId(patientId, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentDTO> updateAssessment(@PathVariable Long id,
            @Valid @RequestBody AssessmentDTO assessmentDTO) {
        return ResponseEntity.ok(assessmentService.updateAssessment(id, assessmentDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Long id) {
        assessmentService.deleteAssessment(id);
        return ResponseEntity.noContent().build();
    }
}