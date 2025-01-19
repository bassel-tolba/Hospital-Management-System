package mine.profile.website.rest.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.PatientProductUsageDTO;
import mine.profile.website.service.PatientProductUsageService;

@RestController
@RequestMapping("/api/product-usage")
public class PatientProductUsageController {

    private final PatientProductUsageService patientProductUsageService;

    public PatientProductUsageController(PatientProductUsageService patientProductUsageService) {
        this.patientProductUsageService = patientProductUsageService;
    }

    @PostMapping
    public ResponseEntity<PatientProductUsageDTO> createProductUsage(@RequestBody PatientProductUsageDTO dto) {
        PatientProductUsageDTO created = patientProductUsageService.createPatientProductUsage(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<Page<PatientProductUsageDTO>> getAllProductUsage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PatientProductUsageDTO> usages = patientProductUsageService.findAll(page, size);
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<PatientProductUsageDTO>> getAllProductUsageByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PatientProductUsageDTO> usages = patientProductUsageService.findAllByPatientId(patientId, page, size);
        return ResponseEntity.ok(usages);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientProductUsageDTO> getProductUsageById(@PathVariable Long id) {
        PatientProductUsageDTO usage = patientProductUsageService.findById(id);
        return ResponseEntity.ok(usage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductUsage(@PathVariable Long id) {
        patientProductUsageService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}