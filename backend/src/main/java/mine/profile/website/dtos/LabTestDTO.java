package mine.profile.website.dtos;

import java.io.IOException;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.LabTest;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabTestDTO {

    private Long id;
    private String testName;
    private String testCode;
    private Double price;
    private String description;
    private String referenceRange;
    // Changed to Map<String, Object>
    private Map<String, Object> structureMap;

    public LabTest toEntity() {
        LabTest labTest = new LabTest();
        labTest.setId(this.id);
        labTest.setTestName(this.testName);
        labTest.setTestCode(this.testCode);
        labTest.setPrice(this.price);
        labTest.setDescription(this.description);
        labTest.setReferenceRange(this.referenceRange);

        ObjectMapper mapper = new ObjectMapper();
        String structureDataJson;
        try {
            structureDataJson = mapper.writeValueAsString(this.structureMap);
            labTest.setStructureData(structureDataJson); // Serialize to JSON string
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting structureMap to JSON", e); // Handle the exception properly
        }
        return labTest;
    }

    public static LabTestDTO fromEntity(LabTest labTest) {
        ObjectMapper mapper = new ObjectMapper();
        // Changed to Map<String, Object>
        Map<String, Object> structureMap;
        try {
            structureMap = mapper.readValue((String) labTest.getStructureData(),
                    new TypeReference<Map<String, Object>>() {
                    });
        } catch (IOException e) {
            structureMap = null; // Handle the exception properly. maybe log and return null
        }
        return new LabTestDTO(
                labTest.getId(),
                labTest.getTestName(),
                labTest.getTestCode(),
                labTest.getPrice(),
                labTest.getDescription(),
                labTest.getReferenceRange(),
                structureMap);
    }
}