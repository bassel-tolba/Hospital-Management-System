package mine.profile.website.rest.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import mine.profile.website.dtos.DocumentDTO;
import mine.profile.website.service.DocumentService;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;
    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentDTO> createDocument(
            @RequestPart("documentDTO") String documentDTOString,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        System.out.println("DocumentDTO: " + documentDTOString);
        System.out.println("file: " + file);
        DocumentDTO documentDTO = objectMapper.readValue(documentDTOString, DocumentDTO.class);

        DocumentDTO createdDocument = documentService.createDocument(documentDTO, file);
        return new ResponseEntity<>(createdDocument, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @GetMapping(value = "/patient/{patientId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<DocumentDTO>> findByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(documentService.findByPatientId(patientId, page, size));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DocumentDTO> updateDocument(@PathVariable Long id,
            @RequestPart("documentDTO") String documentDTOString,
            @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        System.out.println("DocumentDTO: " + documentDTOString);
        System.out.println("file: " + file);

        DocumentDTO documentDTO = objectMapper.readValue(documentDTOString, DocumentDTO.class);

        return ResponseEntity.ok(documentService.updateDocument(id, documentDTO, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}