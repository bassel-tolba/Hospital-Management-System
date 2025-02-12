package mine.profile.website.service;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.DocumentDTO;
import mine.profile.website.models.Document;
import mine.profile.website.models.DocumentType;
import mine.profile.website.models.Patient;
import mine.profile.website.models.User;
import mine.profile.website.repository.DocumentRepository;
import mine.profile.website.repository.DocumentTypeRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.UserRepository;
import mine.profile.website.util.FileHandler;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private DocumentTypeRepository documentTypeRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FileHandler fileHandler;

    @Transactional
    public DocumentDTO createDocument(DocumentDTO documentDTO, MultipartFile file) throws IOException {
        System.out.println("File received in createDocument: " + file);
        String documentPath = null;

        if (file != null && !file.isEmpty()) {
            documentPath = fileHandler.saveFile(file);
        }
        System.out.println("Document path created: " + documentPath);

        DocumentType documentType = documentTypeRepository.findById(documentDTO.getDocumentTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Document Type not found with id: " + documentDTO.getDocumentTypeId()));

        Patient patient = patientRepository.findById(documentDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + documentDTO.getPatientId()));

        User user = userRepository.findById(documentDTO.getUploadedById())
                .orElseThrow(
                        () -> new EntityNotFoundException("User not found with id: " + documentDTO.getUploadedById()));

        Document document = documentDTO.toEntity(documentType, patient, user);

        document.setDocumentPath(documentPath);
        document.setUploadDate(LocalDateTime.now());

        Document savedDocument = documentRepository.save(document);
        return DocumentDTO.toDto(savedDocument);
    }

    @Transactional
    public DocumentDTO getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
        return DocumentDTO.toDto(document);
    }

    @Transactional
    public Page<DocumentDTO> findByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Document> documentsPage = documentRepository.findByPatientId(patientId, pageable);
        return documentsPage.map(DocumentDTO::toDto);
    }

    @Transactional
    public DocumentDTO updateDocument(Long id, DocumentDTO documentDTO, MultipartFile file) throws IOException {
        System.out.println("File received in updateDocument: " + file);
        Document existingDocument = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
        String documentPath = existingDocument.getDocumentPath();

        if (file != null && !file.isEmpty()) {
            documentPath = fileHandler.saveFile(file);
        }
        System.out.println("Document path created: " + documentPath);
        DocumentType documentType = documentTypeRepository.findById(documentDTO.getDocumentTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Document Type not found with id: " + documentDTO.getDocumentTypeId()));

        Patient patient = patientRepository.findById(documentDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + documentDTO.getPatientId()));
        User user = userRepository.findById(documentDTO.getUploadedById())
                .orElseThrow(
                        () -> new EntityNotFoundException("User not found with id: " + documentDTO.getUploadedById()));
        existingDocument.setDocumentName(documentDTO.getDocumentName());
        existingDocument.setDocumentPath(documentPath);
        existingDocument.setDocumentType(documentType);
        existingDocument.setPatient(patient);
        existingDocument.setUploadedBy(user);
        Document updatedDocument = documentRepository.save(existingDocument);
        return DocumentDTO.toDto(updatedDocument);
    }

    @Transactional
    public void deleteDocument(Long id) {
        if (!documentRepository.existsById(id)) {
            throw new EntityNotFoundException("Document not found with id: " + id);
        }
        documentRepository.deleteById(id);
    }
}