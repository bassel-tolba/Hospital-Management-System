package mine.profile.website.rest.controller;

import java.io.IOException;
import java.util.List;

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

import jakarta.validation.Valid;
import mine.profile.website.dtos.ImageReportDTO;
import mine.profile.website.service.ImageReportService;

@RestController
@RequestMapping("/api/imagereports")
public class ImageReportController {

    @Autowired
    private ImageReportService imageReportService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ImageReportDTO> createImageReport(
            @Valid @RequestPart("imageReportDTO") ImageReportDTO imageReportDTO,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles) throws IOException {

        ImageReportDTO createdImageReport = imageReportService.createImageReport(imageReportDTO, imageFiles);
        return new ResponseEntity<>(createdImageReport, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ImageReportDTO> getImageReportById(@PathVariable Long id) {
        return ResponseEntity.ok(imageReportService.getImageReportById(id));
    }

    @GetMapping(value = "/patient/{patientId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<ImageReportDTO>> findByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(imageReportService.findByPatientId(patientId, page, size));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ImageReportDTO> updateImageReport(@PathVariable Long id,
            @Valid @RequestPart("imageReportDTO") ImageReportDTO imageReportDTO,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles) throws IOException {
        return ResponseEntity.ok(imageReportService.updateImageReport(id, imageReportDTO, imageFiles));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImageReport(@PathVariable Long id) {
        imageReportService.deleteImageReport(id);
        return ResponseEntity.noContent().build();
    }

}