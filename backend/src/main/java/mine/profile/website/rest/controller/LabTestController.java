package mine.profile.website.rest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
}