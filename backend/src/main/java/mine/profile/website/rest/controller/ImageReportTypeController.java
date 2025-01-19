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
import mine.profile.website.dtos.ImageReportTypeDTO;
import mine.profile.website.service.ImageReportTypeService;

@RestController
@RequestMapping("/api/imagereporttypes")
public class ImageReportTypeController {

    @Autowired
    private ImageReportTypeService imageReportTypeService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ImageReportTypeDTO> createImageReportType(
            @Valid @RequestBody ImageReportTypeDTO imageReportTypeDTO) {
        ImageReportTypeDTO createdImageReportType = imageReportTypeService.createImageReportType(imageReportTypeDTO);
        return new ResponseEntity<>(createdImageReportType, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ImageReportTypeDTO> getImageReportTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(imageReportTypeService.getImageReportTypeById(id));
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<ImageReportTypeDTO>> getAllImageReportTypes(Pageable pageable) {
        return ResponseEntity.ok(imageReportTypeService.getAllImageReportTypes(pageable));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ImageReportTypeDTO> updateImageReportType(@PathVariable Long id,
            @Valid @RequestBody ImageReportTypeDTO imageReportTypeDTO) {
        return ResponseEntity.ok(imageReportTypeService.updateImageReportType(id, imageReportTypeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImageReportType(@PathVariable Long id) {
        imageReportTypeService.deleteImageReportType(id);
        return ResponseEntity.noContent().build();
    }
}