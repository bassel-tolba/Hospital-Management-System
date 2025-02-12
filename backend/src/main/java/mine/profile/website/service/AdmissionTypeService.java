package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.AdmissionTypeDTO;
import mine.profile.website.models.AdmissionType;
import mine.profile.website.repository.AdmissionTypeRepository;

@Service
public class AdmissionTypeService {

    @Autowired
    private AdmissionTypeRepository admissionTypeRepository;

    public AdmissionTypeDTO createAdmissionType(AdmissionTypeDTO admissionTypeDTO) {
        AdmissionType admissionType = new AdmissionType(admissionTypeDTO.getName(), admissionTypeDTO.getPrice());
        AdmissionType savedAdmissionType = admissionTypeRepository.save(admissionType);
        return new AdmissionTypeDTO(savedAdmissionType.getId(), savedAdmissionType.getName(),
                savedAdmissionType.getPrice());
    }

    public AdmissionTypeDTO getAdmissionTypeById(Long id) {
        AdmissionType admissionType = admissionTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admission type not found with id: " + id));
        return new AdmissionTypeDTO(admissionType.getId(), admissionType.getName(), admissionType.getPrice());
    }

    public List<AdmissionTypeDTO> getAllAdmissionTypes() {
        return admissionTypeRepository.findAll().stream()
                .map(type -> new AdmissionTypeDTO(type.getId(), type.getName(), type.getPrice()))
                .collect(Collectors.toList());
    }

    public AdmissionTypeDTO updateAdmissionType(Long id, AdmissionTypeDTO admissionTypeDTO) {
        AdmissionType existingType = admissionTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admission type not found with id: " + id));
        existingType.setName(admissionTypeDTO.getName());
        existingType.setPrice(admissionTypeDTO.getPrice());

        AdmissionType updatedType = admissionTypeRepository.save(existingType);
        return new AdmissionTypeDTO(updatedType.getId(), updatedType.getName(), updatedType.getPrice());
    }

    public void deleteAdmissionType(Long id) {
        AdmissionType admissionType = admissionTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Admission type not found with id: " + id));
        admissionTypeRepository.delete(admissionType);
    }
}