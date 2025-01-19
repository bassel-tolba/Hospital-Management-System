package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import mine.profile.website.dtos.MedicationDTO;
import mine.profile.website.dtos.history.MedicationHistoryDTO;
import mine.profile.website.models.Medication;
import mine.profile.website.models.history.MedicationHistory;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.repository.history.MedicationHistoryRepository;

@Service
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final MedicationHistoryRepository medicationHistoryRepository;
    private final ObjectMapper objectMapper;

    public MedicationService(MedicationRepository medicationRepository,
            MedicationHistoryRepository medicationHistoryRepository,
            ObjectMapper objectMapper) {
        this.medicationRepository = medicationRepository;
        this.medicationHistoryRepository = medicationHistoryRepository;
        this.objectMapper = objectMapper;

    }

    @Transactional
    public MedicationDTO createMedication(MedicationDTO dto) {
        Medication medication = MedicationDTO.toEntity(dto);
        Medication savedMedication = medicationRepository.save(medication);
        createMedicationHistory(savedMedication, "CREATE", null, dto);
        return MedicationDTO.toDto(savedMedication);
    }

    @Transactional
    public List<MedicationDTO> findAll() {
        return medicationRepository.findAll().stream()
                .map(MedicationDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicationDTO findById(Long id) {
        return medicationRepository.findById(id)
                .map(MedicationDTO::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + id));
    }

    @Transactional
    public MedicationDTO updateMedication(Long id, MedicationDTO dto) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + id));
        Medication updatedMedication = MedicationDTO.toEntity(dto);
        MedicationDTO oldMedicationDTO = MedicationDTO.toDto(medication);
        medication.setName(updatedMedication.getName());
        medication.setAmountPerUnit(updatedMedication.getAmountPerUnit());
        medication.setDosage(updatedMedication.getDosage());
        medication.setImageURL(updatedMedication.getImageURL());
        medication.setPrice(updatedMedication.getPrice());
        medication.setPricingUnit(updatedMedication.getPricingUnit());
        Medication savedMedication = medicationRepository.save(medication);
        createMedicationHistory(savedMedication, "UPDATE", oldMedicationDTO, dto);
        return MedicationDTO.toDto(savedMedication);
    }

    @Transactional
    public void deleteById(Long id) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + id));
        medicationRepository.delete(medication);
        createMedicationHistory(medication, "DELETE", null, null);
    }

    @Transactional
    public List<MedicationDTO> searchMedications(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Medication> medications = medicationRepository.searchMedications(searchTerm, pageable);
        return medications.getContent().stream()
                .map(MedicationDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicationDTO increaseStock(Long id, int quantity, String reason) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + id));
        MedicationDTO oldMedicationDTO = MedicationDTO.toDto(medication);
        medication.increaseStock(quantity);
        Medication savedMedication = medicationRepository.save(medication);
        createMedicationHistory(savedMedication, "STOCK_INCREASE", oldMedicationDTO,
                MedicationDTO.toDto(savedMedication), reason);
        return MedicationDTO.toDto(savedMedication);

    }

    @Transactional
    public MedicationDTO increaseStock(Long id, int quantity) {
        return increaseStock(id, quantity, null);
    }

    @Transactional
    public MedicationDTO decreaseStock(Long id, int quantity, String reason) {
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + id));
        MedicationDTO oldMedicationDTO = MedicationDTO.toDto(medication);
        medication.decreaseStock(quantity);
        Medication savedMedication = medicationRepository.save(medication);
        createMedicationHistory(savedMedication, "STOCK_DECREASE", oldMedicationDTO,
                MedicationDTO.toDto(savedMedication), reason);
        return MedicationDTO.toDto(savedMedication);
    }

    @Transactional
    public MedicationDTO decreaseStock(Long id, int quantity) {
        return decreaseStock(id, quantity, null);
    }

    private void createMedicationHistory(Medication medication, String action, MedicationDTO oldData,
            MedicationDTO newData) {
        createMedicationHistory(medication, action, oldData, newData, null);
    }

    private void createMedicationHistory(Medication medication, String action, MedicationDTO oldData,
            MedicationDTO newData, String reason) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "system";
        String changes = "";
        try {
            Map<String, Object> difference = getDifference(oldData, newData);
            if (reason != null)
                difference.put("reason", reason);
            if (difference != null && !difference.isEmpty()) {
                changes = objectMapper.writeValueAsString(difference);
            } else if (oldData == null && newData != null) {
                changes = objectMapper.writeValueAsString(newData);
            } else if (oldData != null && newData == null) {
                changes = objectMapper.writeValueAsString(oldData);
            }

        } catch (Exception e) {
            changes = "could not map the changes";
        }
        MedicationHistory history = new MedicationHistory();
        history.setMedication(medication);
        history.setAction(action);
        history.setTimestamp(LocalDateTime.now());
        history.setUserName(username);
        history.setChanges(changes);

        medicationHistoryRepository.save(history);
    }

    private Map<String, Object> getDifference(MedicationDTO oldData, MedicationDTO newData) {
        if (oldData == null && newData == null)
            return null;
        ObjectMapper mapper = new ObjectMapper();
        try {
            String old = mapper.writeValueAsString(oldData);
            String newOne = mapper.writeValueAsString(newData);
            JsonNode oldNode = mapper.readTree(old);
            JsonNode newNode = mapper.readTree(newOne);

            Map<String, Object> differences = new HashMap<>();
            Iterator<String> fieldNames = newNode.fieldNames();
            while (fieldNames.hasNext()) {
                String fieldName = fieldNames.next();
                JsonNode newValue = newNode.get(fieldName);
                if (!oldNode.has(fieldName) || !oldNode.get(fieldName).equals(newValue)) {
                    differences.put(fieldName, newValue);
                }
            }
            return differences;
        } catch (Exception e) {
            return null;
        }

    }

    @Transactional
    public List<MedicationHistoryDTO> getAllMedicationHistory() {
        return medicationHistoryRepository.findAll().stream().map(MedicationHistoryDTO::toDto)
                .collect(Collectors.toList());
    }
}