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
import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.service.VitalSignService;

@RestController
@RequestMapping("/api/vital-signs")
public class VitalSignController {

    @Autowired
    private VitalSignService vitalSignService;

    @PostMapping
    public ResponseEntity<VitalSignDTO> createVitalSign(@Valid @RequestBody VitalSignDTO vitalSignDTO) {
        return new ResponseEntity<>(vitalSignService.createVitalSign(vitalSignDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VitalSignDTO> getVitalSignById(@PathVariable Long id) {
        return ResponseEntity.ok(vitalSignService.getVitalSignById(id));
    }

    @GetMapping
    public ResponseEntity<Page<VitalSignDTO>> getAllVitalSigns(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(vitalSignService.getAllVitalSigns(page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VitalSignDTO> updateVitalSign(@PathVariable Long id,
            @Valid @RequestBody VitalSignDTO vitalSignDTO) {
        return ResponseEntity.ok(vitalSignService.updateVitalSign(id, vitalSignDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVitalSign(@PathVariable Long id) {
        vitalSignService.deleteVitalSign(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<VitalSignDTO>> getVitalSignsByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(vitalSignService.findByPatientId(patientId, page, size));
    }
}