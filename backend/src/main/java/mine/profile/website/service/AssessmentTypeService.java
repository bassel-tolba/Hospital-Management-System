package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.AssessmentTypeDTO;
import mine.profile.website.models.AssessmentType;
import mine.profile.website.repository.AssessmentTypeRepository;

@Service
public class AssessmentTypeService {

    private static final Logger log = LoggerFactory.getLogger(AssessmentTypeService.class);

    @Autowired
    private AssessmentTypeRepository assessmentTypeRepository;

    // No EntityMapper needed here anymore for AssessmentType

    @Transactional(readOnly = true)
    public List<AssessmentTypeDTO> getAllAssessmentTypes() {
        log.debug("Fetching all assessment types (without content)");
        return assessmentTypeRepository.findAll().stream()
                .map(AssessmentTypeDTO::fromEntityWithoutContent) // Use static helper
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssessmentTypeDTO getAssessmentTypeById(Long id) {
        log.debug("Fetching assessment type by ID: {}", id);
        AssessmentType type = assessmentTypeRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("AssessmentType not found with id: {}", id);
                    return new EntityNotFoundException("AssessmentType not found with id: " + id);
                });
        return AssessmentTypeDTO.fromEntity(type); // Use static helper (includes content)
    }

    @Transactional(readOnly = true)
    public AssessmentTypeDTO getAssessmentTypeByName(String name) {
        log.debug("Fetching assessment type by name: {}", name);
        AssessmentType type = assessmentTypeRepository.findByName(name)
                .orElseThrow(() -> {
                    log.warn("AssessmentType not found with name: {}", name);
                    return new EntityNotFoundException("AssessmentType not found with name: " + name);
                });
        return AssessmentTypeDTO.fromEntity(type); // Use static helper (includes content)
    }

    // Method specifically for AI service to get template content
    @Transactional(readOnly = true)
    public String getTemplateContentByName(String name) {
        log.debug("Fetching assessment template content by name for AI: {}", name);
        AssessmentType type = assessmentTypeRepository.findByName(name)
                .orElseThrow(() -> {
                    log.error("Assessment type '{}' not found for AI transcription.", name);
                    // Throwing an exception that results in a clear client error
                    return new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Assessment type template '" + name + "' not found.");
                });
        return type.getTemplateContent();
    }

    // --- Optional: Add methods for Create, Update, Delete if admins should manage
    // types via UI ---

    @Transactional
    public AssessmentTypeDTO createAssessmentType(AssessmentTypeDTO dto) {
        log.info("Attempting to create assessment type with name: {}", dto.getName());
        if (assessmentTypeRepository.existsByName(dto.getName())) {
            log.warn("Create failed: AssessmentType with name '{}' already exists.", dto.getName());
            throw new IllegalArgumentException("AssessmentType with name '" + dto.getName() + "' already exists.");
        }
        // Manual mapping from DTO to new Entity
        AssessmentType assessmentType = new AssessmentType();
        assessmentType.setName(dto.getName());
        assessmentType.setDisplayName(dto.getDisplayName());
        assessmentType.setTemplateContent(dto.getTemplateContent());

        AssessmentType savedType = assessmentTypeRepository.save(assessmentType);
        log.info("Successfully created assessment type with ID: {}", savedType.getId());
        return AssessmentTypeDTO.fromEntity(savedType);
    }

    @Transactional
    public AssessmentTypeDTO updateAssessmentType(Long id, AssessmentTypeDTO dto) {
        log.info("Attempting to update assessment type with ID: {}", id);
        AssessmentType existingType = assessmentTypeRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Update failed: AssessmentType not found with id: {}", id);
                    return new EntityNotFoundException("AssessmentType not found with id: " + id);
                });

        // Check if name is being changed and if the new name already exists
        if (!existingType.getName().equalsIgnoreCase(dto.getName())
                && assessmentTypeRepository.existsByName(dto.getName())) {
            log.warn("Update failed: Cannot change name to '{}' as it already exists.", dto.getName());
            throw new IllegalArgumentException("AssessmentType with name '" + dto.getName() + "' already exists.");
        }

        // Manual update of entity fields from DTO
        existingType.setName(dto.getName());
        existingType.setDisplayName(dto.getDisplayName());
        existingType.setTemplateContent(dto.getTemplateContent());

        AssessmentType updatedType = assessmentTypeRepository.save(existingType);
        log.info("Successfully updated assessment type with ID: {}", updatedType.getId());
        return AssessmentTypeDTO.fromEntity(updatedType);
    }

    @Transactional
    public void deleteAssessmentType(Long id) {
        log.info("Attempting to delete assessment type with ID: {}", id);
        if (!assessmentTypeRepository.existsById(id)) {
            log.warn("Delete failed: AssessmentType not found with id: {}", id);
            throw new EntityNotFoundException("AssessmentType not found with id: " + id);
        }
        assessmentTypeRepository.deleteById(id);
        log.info("Successfully deleted assessment type with ID: {}", id);
    }
}