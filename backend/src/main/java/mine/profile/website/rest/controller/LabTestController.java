package mine.profile.website.rest.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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

import mine.profile.website.dtos.LabTestDTO;
import mine.profile.website.service.LabTestService;

@RestController
@RequestMapping("/api/lab-tests")
public class LabTestController {

    @Autowired
    private LabTestService labTestService;

    // ... (existing methods) ...

    @PostMapping
    public ResponseEntity<LabTestDTO> createLabTest(@RequestBody LabTestDTO labTestDTO) {
        LabTestDTO createdLabTest = labTestService.createLabTest(labTestDTO);
        return new ResponseEntity<>(createdLabTest, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabTestDTO> getLabTestById(@PathVariable Long id) {
        LabTestDTO labTestDTO = labTestService.getLabTestById(id);
        if (labTestDTO == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(labTestDTO, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<LabTestDTO>> getAllLabTests(@RequestParam(required = false) String testName,
            @RequestParam(required = false) String testCode) {
        if (testName != null) {
            List<LabTestDTO> labTests = labTestService.searchLabTests(testName);
            return new ResponseEntity<>(labTests, HttpStatus.OK);
        }
        if (testCode != null) {
            List<LabTestDTO> labTests = labTestService.getLabTestsByCode(testCode);
            return new ResponseEntity<>(labTests, HttpStatus.OK);
        }

        List<LabTestDTO> labTests = labTestService.getAllLabTests();
        return new ResponseEntity<>(labTests, HttpStatus.OK);
    }

    @PutMapping("/{id}") // Use PUT for updates
    public ResponseEntity<LabTestDTO> updateLabTest(@PathVariable Long id, @RequestBody LabTestDTO labTestDTO) {
        LabTestDTO updatedLabTest = labTestService.updateLabTest(id, labTestDTO);
        if (updatedLabTest == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 if lab test doesn't exist
        }
        return new ResponseEntity<>(updatedLabTest, HttpStatus.OK); // 200 OK with updated data
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLabTest(@PathVariable Long id) { // Changed return type
        try {
            labTestService.deleteLabTest(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND); // Return message
        } catch (DataIntegrityViolationException e) {
            // Custom error response for foreign key violation
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage()); // Use the custom message
            errorResponse.put("status", "400"); // Bad Request
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
}