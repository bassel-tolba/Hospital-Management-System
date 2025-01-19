package mine.profile.website.rest.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.PrescribedMedicationDTO;
import mine.profile.website.service.PrescribedMedicationService;

@RestController
@RequestMapping("/api/prescribed-medications")
public class PrescribedMedicationController {

    private final PrescribedMedicationService prescribedMedicationService;

    public PrescribedMedicationController(PrescribedMedicationService prescribedMedicationService) {
        this.prescribedMedicationService = prescribedMedicationService;
    }

    @GetMapping
    public ResponseEntity<List<PrescribedMedicationDTO>> findAllPrescribedMedications() {
        return ResponseEntity.ok(prescribedMedicationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescribedMedicationDTO> findPrescribedMedicationById(@PathVariable Long id) {
        PrescribedMedicationDTO prescribedMedicationDTO = prescribedMedicationService.findById(id);
        return new ResponseEntity<>(prescribedMedicationDTO, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<PrescribedMedicationDTO> createPrescribedMedication(
            @RequestBody PrescribedMedicationDTO prescribedMedicationDTO) {
        PrescribedMedicationDTO createdPrescribedMedication = prescribedMedicationService
                .createPrescribedMedication(prescribedMedicationDTO);
        return new ResponseEntity<>(createdPrescribedMedication, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescribedMedication(@PathVariable Long id) {
        prescribedMedicationService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}