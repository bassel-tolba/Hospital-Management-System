// DocumentTypeController.java
package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import mine.profile.website.dtos.DocumentTypeDTO;
import mine.profile.website.service.DocumentTypeService;

@RestController
@RequestMapping("/api/documenttypes")
public class DocumentTypeController {

    @Autowired
    private DocumentTypeService documentTypeService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentTypeDTO> createDocumentType(
            @Valid @RequestBody DocumentTypeDTO documentTypeDTO) {
        DocumentTypeDTO createdDocumentType = documentTypeService.createDocumentType(documentTypeDTO);
        return new ResponseEntity<>(createdDocumentType, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentTypeDTO> getDocumentTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(documentTypeService.getDocumentTypeById(id));
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<DocumentTypeDTO>> getAllDocumentTypes(Pageable pageable) {
        return ResponseEntity.ok(documentTypeService.getAllDocumentTypes(pageable));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentTypeDTO> updateDocumentType(@PathVariable Long id,
            @Valid @RequestBody DocumentTypeDTO documentTypeDTO) {
        return ResponseEntity.ok(documentTypeService.updateDocumentType(id, documentTypeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocumentType(@PathVariable Long id) {
        documentTypeService.deleteDocumentType(id);
        return ResponseEntity.noContent().build();
    }
}