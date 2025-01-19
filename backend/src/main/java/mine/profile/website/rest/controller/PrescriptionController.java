package mine.profile.website.rest.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.PrescriptionDTO;
import mine.profile.website.service.PrescriptionService;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<PrescriptionDTO> createPrescription(@RequestBody PrescriptionDTO prescriptionDTO) {
        PrescriptionDTO createdPrescription = prescriptionService.createPrescription(prescriptionDTO);
        return new ResponseEntity<>(createdPrescription, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> findAllPrescriptions() {
        return ResponseEntity.ok(prescriptionService.findAll());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<PrescriptionDTO>> findPrescriptionsByPatientId(@PathVariable Long patientId,
            Pageable pageable) {
        Page<PrescriptionDTO> prescriptions = prescriptionService.findByPatientId(patientId, pageable);
        return new ResponseEntity<>(prescriptions, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> findPrescriptionById(@PathVariable Long id) {
        PrescriptionDTO prescriptionDTO = prescriptionService.findById(id);
        return new ResponseEntity<>(prescriptionDTO, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable Long id) {
        prescriptionService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}