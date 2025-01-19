package mine.profile.website.dtos;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.LabResult;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LabResultDTO {
    private Long id;
    private LocalDateTime resultDateTime;
    private Map<String, Object> resultMap = new HashMap<>();
    private String notes;
    private Long patientId;
    private Long performedById;
    private Long labTestId;
    private Long billingId;

    public static LabResultDTO fromEntity(LabResult labResult) {
        LabResultDTO dto = new LabResultDTO();
        dto.setId(labResult.getId());
        dto.setResultDateTime(labResult.getResultDateTime());
        dto.setNotes(labResult.getNotes());
        dto.setPatientId(labResult.getPatient().getId());
        dto.setPerformedById(labResult.getPerformedBy().getId());
        dto.setLabTestId(labResult.getLabTest().getId());
        if (labResult.getBilling() != null) {
            dto.setBillingId(labResult.getBilling().getId());
        }
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> resultMap;
        try {
            resultMap = mapper.readValue((String) labResult.getResultData(), new TypeReference<Map<String, Object>>() {
            });
        } catch (IOException e) {
            resultMap = null; // Handle the exception properly. maybe log and return null
        }
        dto.setResultMap(resultMap);
        return dto;
    }

    public LabResult toEntity() {
        LabResult labResult = new LabResult();
        labResult.setId(this.getId());
        labResult.setResultDateTime(this.getResultDateTime());
        labResult.setNotes(this.getNotes());
        ObjectMapper mapper = new ObjectMapper();
        String resultDataJson;
        try {
            resultDataJson = mapper.writeValueAsString(this.resultMap);
            labResult.setResultData(resultDataJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting resultMap to JSON", e);
        }
        return labResult;
    }
}