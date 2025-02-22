// MedicationService.java
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

import mine.profile.website.dtos.MedicationBatchDTO;
import mine.profile.website.dtos.MedicationDTO;
import mine.profile.website.dtos.history.MedicationHistoryDTO;
import mine.profile.website.exception.InsufficientStockException;
import mine.profile.website.models.Medication;
import mine.profile.website.models.MedicationBatch;
import mine.profile.website.models.history.MedicationHistory;
import mine.profile.website.repository.MedicationBatchRepository;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.repository.history.MedicationHistoryRepository;

@Service
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final MedicationHistoryRepository medicationHistoryRepository;
    private final MedicationBatchRepository medicationBatchRepository; // Add this
    private final ObjectMapper objectMapper;

    public MedicationService(MedicationRepository medicationRepository,
            MedicationHistoryRepository medicationHistoryRepository,
            MedicationBatchRepository medicationBatchRepository, // Add this
            ObjectMapper objectMapper) {
        this.medicationRepository = medicationRepository;
        this.medicationHistoryRepository = medicationHistoryRepository;
        this.medicationBatchRepository = medicationBatchRepository; // Add this
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
                .map(medication -> {
                    MedicationDTO dto = MedicationDTO.toDto(medication);
                    dto.setStock(medication.getTotalStock()); // Calculate and set stock
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicationDTO findById(Long id) {
        return medicationRepository.findById(id)
                .map(medication -> {
                    MedicationDTO dto = MedicationDTO.toDto(medication);
                    dto.setStock(medication.getTotalStock()); // Calculate and set stock
                    return dto;
                })
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
        medication.setPrice(updatedMedication.getPrice()); // Update selling price
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
                .map(medication -> {
                    MedicationDTO dto = MedicationDTO.toDto(medication);
                    dto.setStock(medication.getTotalStock()); // Calculate and set stock
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicationBatchDTO addBatch(Long medicationId, MedicationBatchDTO batchDTO) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + medicationId));

        MedicationBatch batch = MedicationBatchDTO.toEntity(batchDTO);
        batch.setMedication(medication);
        batch.setPurchaseDate(LocalDateTime.now());
        batch.setRemainingQuantity(batch.getQuantity()); // Initially, all quantity is remaining
        MedicationBatch savedBatch = medicationBatchRepository.save(batch);
        createMedicationHistory(medication, "STOCK_INCREASE", null, MedicationDTO.toDto(medication),
                "Purchase: " + savedBatch.getQuantity() + " @ " + savedBatch.getPurchasePrice());

        return MedicationBatchDTO.toDto(savedBatch);
    }

    @Transactional
    public void decreaseStock(Long medicationId, int quantity) {
        decreaseStock(medicationId, quantity, null);
    }

    @Transactional
    public void decreaseStock(Long medicationId, int quantity, String reason) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + medicationId));

        // Get batches ordered by purchase date (FIFO)
        List<MedicationBatch> batches = medicationBatchRepository
                .findByMedicationIdOrderByPurchaseDateAsc(medicationId);

        int remainingToDecrease = quantity;
        for (MedicationBatch batch : batches) {
            if (remainingToDecrease <= 0) {
                break; // We've decreased enough
            }

            int decreaseFromThisBatch = Math.min(remainingToDecrease, batch.getRemainingQuantity());
            batch.setRemainingQuantity(batch.getRemainingQuantity() - decreaseFromThisBatch);
            remainingToDecrease -= decreaseFromThisBatch;
            medicationBatchRepository.save(batch); // Save changes to the batch
        }

        if (remainingToDecrease > 0) {
            throw new InsufficientStockException("Not enough stock for medication: " + medication.getName());
        }
        createMedicationHistory(medication, "STOCK_DECREASE", MedicationDTO.toDto(medication), null, reason);
    }

    @Transactional
    public MedicationBatchDTO updateBatch(Long batchId, MedicationBatchDTO batchDTO) {
        MedicationBatch batch = medicationBatchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Batch ID: " + batchId));

        // Check if quantity is being reduced below what's already been used
        if (batchDTO.getQuantity() < (batch.getQuantity() - batch.getRemainingQuantity())) {
            throw new IllegalArgumentException(
                    "Cannot reduce quantity below the amount already administered from this batch.");
        }

        batch.setPurchasePrice(batchDTO.getPurchasePrice());
        batch.setQuantity(batchDTO.getQuantity());
        batch.setRemainingQuantity(batchDTO.getQuantity() - (batch.getQuantity() - batch.getRemainingQuantity())); // Update
                                                                                                                   // remaining

        MedicationBatch updatedBatch = medicationBatchRepository.save(batch);

        // *** IMPORTANT: Update the associated Medication ***
        Medication medication = updatedBatch.getMedication();
        medicationRepository.save(medication); // This triggers recalculation and persistence of totalStock

        createMedicationHistory(medication, "BATCH_UPDATE", null, MedicationDTO.toDto(medication),
                "Batch Update: " + updatedBatch.getQuantity() + " @ " + updatedBatch.getPurchasePrice());

        return MedicationBatchDTO.toDto(updatedBatch);
    }

    @Transactional
    public void deleteBatch(Long batchId) {
        MedicationBatch batch = medicationBatchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Batch ID: " + batchId));
        // Check if any quantity has been used from this batch. Prevent deletion if so.
        if (batch.getQuantity() > batch.getRemainingQuantity()) {
            throw new IllegalStateException("Cannot delete a batch that has already been partially administered.");
        }

        createMedicationHistory(batch.getMedication(), "BATCH_DELETE", null, MedicationDTO.toDto(batch.getMedication()),
                "Batch DELETE: " + batch.getQuantity() + " @ " + batch.getPurchasePrice());
        medicationBatchRepository.delete(batch);

        // *** IMPORTANT: Update the associated Medication ***
        Medication medication = batch.getMedication();
        medicationRepository.save(medication); // This triggers recalculation and persistence of totalStock

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
    public Map<String, Object> getMedicationHistory(Long medicationId, LocalDateTime start, LocalDateTime end,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MedicationHistory> historyPage;

        if (medicationId != null) {
            historyPage = medicationHistoryRepository.findAllByMedicationIdAndTimestampBetween(medicationId, start,
                    end, pageable);
        } else {
            historyPage = medicationHistoryRepository.findAllByTimestampBetween(start, end, pageable);
        }

        List<MedicationHistoryDTO> historyDTOs = historyPage.getContent().stream()
                .map(MedicationHistoryDTO::toDto)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("history", historyDTOs);
        result.put("totalPages", historyPage.getTotalPages());
        result.put("totalElements", historyPage.getTotalElements());
        return result;
    }

    @Transactional
    public void clearMedicationHistory() {
        medicationHistoryRepository.deleteAll();
    }
}