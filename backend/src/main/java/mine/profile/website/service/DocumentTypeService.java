// DocumentTypeService.java
package mine.profile.website.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.DocumentTypeDTO;
import mine.profile.website.models.DocumentType;
import mine.profile.website.repository.DocumentTypeRepository;

@Service
public class DocumentTypeService {

    @Autowired
    private DocumentTypeRepository documentTypeRepository;

    @Transactional
    public DocumentTypeDTO createDocumentType(DocumentTypeDTO documentTypeDTO) {
        DocumentType documentType = documentTypeDTO.toEntity();
        DocumentType savedDocumentType = documentTypeRepository.save(documentType);
        return DocumentTypeDTO.toDto(savedDocumentType);
    }

    @Transactional
    public DocumentTypeDTO getDocumentTypeById(Long id) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document Type not found with id: " + id));
        return DocumentTypeDTO.toDto(documentType);
    }

    @Transactional
    public Page<DocumentTypeDTO> getAllDocumentTypes(Pageable pageable) {
        Page<DocumentType> documentTypesPage = documentTypeRepository.findAll(pageable);
        return documentTypesPage.map(DocumentTypeDTO::toDto);
    }

    @Transactional
    public DocumentTypeDTO updateDocumentType(Long id, DocumentTypeDTO documentTypeDTO) {
        DocumentType existingDocumentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document Type not found with id: " + id));

        existingDocumentType.setName(documentTypeDTO.getName());
        DocumentType updatedDocumentType = documentTypeRepository.save(existingDocumentType);
        return DocumentTypeDTO.toDto(updatedDocumentType);
    }

    @Transactional
    public void deleteDocumentType(Long id) {
        if (!documentTypeRepository.existsById(id)) {
            throw new EntityNotFoundException("Document Type not found with id: " + id);
        }
        documentTypeRepository.deleteById(id);
    }
}