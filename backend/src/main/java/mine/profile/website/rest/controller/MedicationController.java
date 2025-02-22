// MedicationController.java
package mine.profile.website.rest.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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

import mine.profile.website.dtos.MedicationBatchDTO;
import mine.profile.website.dtos.MedicationDTO;
import mine.profile.website.models.MedicationBatch;
import mine.profile.website.repository.MedicationBatchRepository;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.service.MedicationService;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {

    private final MedicationService medicationService;

    @Autowired
    private MedicationRepository medicationRepository;

    @Autowired
    private MedicationBatchRepository medicationBatchRepository;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @PostMapping
    public ResponseEntity<MedicationDTO> createMedication(@RequestBody MedicationDTO medicationDTO) {
        MedicationDTO createdMedication = medicationService.createMedication(medicationDTO);
        return new ResponseEntity<>(createdMedication, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MedicationDTO>> getAllMedications() {
        List<MedicationDTO> medications = medicationService.findAll();
        return new ResponseEntity<>(medications, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicationDTO> updateMedication(@PathVariable Long id,
            @RequestBody MedicationDTO medicationDTO) {
        MedicationDTO updatedMedication = medicationService.updateMedication(id, medicationDTO);
        return new ResponseEntity<>(updatedMedication, HttpStatus.OK);
    }
    // Remove increase-stock and decrease-stock endpoints. Use add-batch instead.

    @PostMapping("/{id}/add-batch")
    public ResponseEntity<MedicationBatchDTO> addBatch(
            @PathVariable Long id, @RequestBody MedicationBatchDTO batchDTO) {
        MedicationBatchDTO addedBatch = medicationService.addBatch(id, batchDTO);
        return new ResponseEntity<>(addedBatch, HttpStatus.CREATED);
    }

    @PutMapping("/batches/{batchId}")
    public ResponseEntity<MedicationBatchDTO> updateBatch(
            @PathVariable Long batchId, @RequestBody MedicationBatchDTO batchDTO) {
        MedicationBatchDTO updatedBatch = medicationService.updateBatch(batchId, batchDTO);
        return new ResponseEntity<>(updatedBatch, HttpStatus.OK);
    }

    @DeleteMapping("/batches/{batchId}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long batchId) {
        medicationService.deleteBatch(batchId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicationDTO>> searchMedications(
            @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        if (searchTerm == null) {
            List<MedicationDTO> medications = medicationService.searchMedications("", page, size);
            return new ResponseEntity<>(medications, HttpStatus.OK);
        }
        List<MedicationDTO> medications = medicationService.searchMedications(searchTerm, page, size);
        return new ResponseEntity<>(medications, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationDTO> getMedicationById(@PathVariable Long id) {
        MedicationDTO medication = medicationService.findById(id);
        return new ResponseEntity<>(medication, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(@PathVariable Long id) {
        medicationService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getMedicationHistory(
            @RequestParam(value = "medicationId", required = false) Long medicationId,
            @RequestParam(value = "start", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime start,
            @RequestParam(value = "end", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime end,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        // Remove default time settings from here.
        Map<String, Object> medicationHistory = medicationService.getMedicationHistory(medicationId, start, end, page,
                size);
        return new ResponseEntity<>(medicationHistory, HttpStatus.OK);
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearMedicationHistory() {
        medicationService.clearMedicationHistory();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ADD THIS ENDPOINT
    @GetMapping("/{medicationId}/batches")
    public ResponseEntity<List<MedicationBatchDTO>> getBatchesForMedication(@PathVariable Long medicationId) {
        List<MedicationBatch> batches = medicationBatchRepository
                .findByMedicationIdOrderByPurchaseDateAsc(medicationId);
        List<MedicationBatchDTO> batchDTOs = batches.stream()
                .map(MedicationBatchDTO::toDto)
                .collect(Collectors.toList());
        return new ResponseEntity<>(batchDTOs, HttpStatus.OK);
    }
}