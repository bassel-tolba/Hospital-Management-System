package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException; // Import this
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import mine.profile.website.dtos.LabTestDTO;
import mine.profile.website.models.LabTest;
import mine.profile.website.repository.LabTestRepository;

@Service
public class LabTestService {

    @Autowired
    private LabTestRepository labTestRepository;

    // ... (existing methods: createLabTest, getLabTestById, etc.) ...
    @Transactional
    public LabTestDTO createLabTest(LabTestDTO labTestDTO) {
        LabTest labTest = labTestDTO.toEntity();
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

    @Transactional
    public LabTestDTO updateLabTest(Long id, LabTestDTO labTestDTO) {
        LabTest existingLabTest = labTestRepository.findById(id).orElse(null);
        if (existingLabTest == null) {
            return null; // Or throw a custom exception like LabTestNotFoundException
        }

        existingLabTest.setTestName(labTestDTO.getTestName());
        existingLabTest.setTestCode(labTestDTO.getTestCode());
        existingLabTest.setPrice(labTestDTO.getPrice());
        existingLabTest.setDescription(labTestDTO.getDescription());
        existingLabTest.setReferenceRange(labTestDTO.getReferenceRange());

        if (labTestDTO.getStructureMap() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                existingLabTest.setStructureData(mapper.writeValueAsString(labTestDTO.getStructureMap()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error converting structureMap to JSON", e);
            }
        }

        existingLabTest = labTestRepository.save(existingLabTest);
        return LabTestDTO.fromEntity(existingLabTest);
    }

    @Transactional
    public void deleteLabTest(Long id) {
        if (!labTestRepository.existsById(id)) {
            throw new IllegalArgumentException("LabTest with id " + id + " not found");
        }
        try {
            labTestRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            // Catch the specific exception for foreign key violations
            throw new DataIntegrityViolationException(
                    "Cannot delete lab test because it is associated with existing lab results.");
        }
    }
}