// LabResultController.java
package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import mine.profile.website.dtos.LabResultDTO;
import mine.profile.website.service.LabResultService;

@RestController
@RequestMapping("/api/lab-results")
public class LabResultController {

    @Autowired
    private LabResultService labResultService;

    @PostMapping
    public ResponseEntity<LabResultDTO> createLabResult(@RequestBody LabResultDTO labResultDTO) {
        LabResultDTO createdLabResult = labResultService.createLabResult(labResultDTO);
        if (createdLabResult == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(createdLabResult, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabResultDTO> updateLabResult(@PathVariable Long id, @RequestBody LabResultDTO labResultDTO) {
        LabResultDTO updatedLabResult = labResultService.updateLabResult(id, labResultDTO);
        if (updatedLabResult == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(updatedLabResult, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResultDTO> getLabResultById(@PathVariable Long id) {
        LabResultDTO labResultDTO = labResultService.getLabResultById(id);
        if (labResultDTO == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(labResultDTO, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabResult(@PathVariable Long id) {
        boolean isDeleted = labResultService.deleteLabResult(id);
        if (!isDeleted) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<LabResultDTO>> getLabResultsByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<LabResultDTO> labResults = labResultService.getLabResultsByPatient(patientId, pageable);
        return new ResponseEntity<>(labResults, HttpStatus.OK);
    }
}