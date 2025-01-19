package mine.profile.website.rest.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.MedicationDTO;
import mine.profile.website.dtos.history.MedicationHistoryDTO;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.service.MedicationService;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {

    private final MedicationService medicationService;

    @Autowired
    private MedicationRepository medicationRepository;

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

    @PatchMapping("/{id}/increase-stock")
    public ResponseEntity<MedicationDTO> increaseMedicationStock(
            @PathVariable Long id, @RequestParam int quantity) {
        MedicationDTO updatedMedication = medicationService.increaseStock(id, quantity);
        return new ResponseEntity<>(updatedMedication, HttpStatus.OK);
    }

    @PatchMapping("/{id}/decrease-stock")
    public ResponseEntity<MedicationDTO> decreaseMedicationStock(
            @PathVariable Long id, @RequestParam int quantity) {
        MedicationDTO updatedMedication = medicationService.decreaseStock(id, quantity);
        return new ResponseEntity<>(updatedMedication, HttpStatus.OK);
    }

    public List<MedicationDTO> findAll() {
        return medicationRepository.findAll().stream()
                .map(MedicationDTO::toDto)
                .collect(Collectors.toList());
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
    public ResponseEntity<List<MedicationHistoryDTO>> getMedicationHistory() {
        List<MedicationHistoryDTO> medicationHistory = medicationService.getAllMedicationHistory();
        return new ResponseEntity<>(medicationHistory, HttpStatus.OK);
    }
}