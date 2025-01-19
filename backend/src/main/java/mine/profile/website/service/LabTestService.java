package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.LabTestDTO;
import mine.profile.website.models.LabTest;
import mine.profile.website.repository.LabTestRepository;

@Service
public class LabTestService {

    @Autowired
    private LabTestRepository labTestRepository;

    // Inside LabTestService.java
    @Transactional
    public LabTestDTO createLabTest(LabTestDTO labTestDTO) {
        LabTest labTest = labTestDTO.toEntity();
        System.out.println("LabTest before save: " + labTest.toString());
        labTest = labTestRepository.save(labTest);
        return LabTestDTO.fromEntity(labTest);
    }

    @Transactional
    public LabTestDTO getLabTestById(Long id) {
        LabTest labTest = labTestRepository.findById(id).orElse(null);
        if (labTest == null) {
            return null;
        }
        return LabTestDTO.fromEntity(labTest);
    }

    @Transactional
    public List<LabTestDTO> getAllLabTests() {
        List<LabTest> labTests = labTestRepository.findAll();
        return labTests.stream()
                .map(LabTestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<LabTestDTO> searchLabTests(String testName) {
        List<LabTest> labTests = labTestRepository.findByTestNameContainingIgnoreCase(testName);
        return labTests.stream()
                .map(LabTestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<LabTestDTO> getLabTestsByCode(String testCode) {
        List<LabTest> labTests = labTestRepository.findByTestCode(testCode);
        return labTests.stream()
                .map(LabTestDTO::fromEntity)
                .collect(Collectors.toList());
    }
}