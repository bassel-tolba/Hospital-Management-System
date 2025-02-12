package mine.profile.website.rest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.AdmissionDTO;
import mine.profile.website.dtos.AdmissionTypeDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.service.AdmissionService;
import mine.profile.website.service.AdmissionTypeService;

@RestController
@RequestMapping("/api")
public class AdmissionController {

    @Autowired
    private AdmissionService admissionService;
    @Autowired
    private AdmissionTypeService admissionTypeService;

    @PostMapping("/admissions")
    public ResponseEntity<AdmissionDTO> createAdmission(@RequestBody AdmissionDTO admissionDTO) {
        AdmissionDTO createdAdmission = admissionService.createAdmission(admissionDTO);
        return new ResponseEntity<>(createdAdmission, HttpStatus.CREATED);
    }

    @GetMapping("/admissions/{id}")
    public ResponseEntity<AdmissionDTO> getAdmissionById(@PathVariable Long id) {
        AdmissionDTO admissionDTO = admissionService.getAdmissionById(id);
        return ResponseEntity.ok(admissionDTO);
    }

    @GetMapping("/admissions")
    public ResponseEntity<List<AdmissionDTO>> searchAdmissions(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long bedId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<AdmissionDTO> admissions = admissionService.searchAdmissions(patientId, bedId, page, size);
        return ResponseEntity.ok(admissions);
    }

    @GetMapping("/admissions/open")
    public ResponseEntity<List<AdmissionDTO>> getOpenAdmissions() {
        List<AdmissionDTO> admissions = admissionService.findOpenAdmissions();
        return ResponseEntity.ok(admissions);
    }

    @PutMapping("/admissions/{id}")
    public ResponseEntity<AdmissionDTO> updateAdmission(@PathVariable Long id, @RequestBody AdmissionDTO admissionDTO) {
        AdmissionDTO updatedAdmission = admissionService.updateAdmission(id, admissionDTO);
        return ResponseEntity.ok(updatedAdmission);
    }

    @DeleteMapping("/admissions/{id}")
    public ResponseEntity<Void> deleteAdmission(@PathVariable Long id) {
        admissionService.deleteAdmission(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admissions/bed/{bedId}/patient")
    public ResponseEntity<PatientDTO> getPatientByBedId(@PathVariable Long bedId) {
        PatientDTO patientDTO = admissionService.getPatientByBedId(bedId);
        if (patientDTO == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(patientDTO, HttpStatus.OK);
    }

    // Admission Type Endpoints
    @PostMapping("/admissionTypes")
    public ResponseEntity<AdmissionTypeDTO> createAdmissionType(@RequestBody AdmissionTypeDTO admissionTypeDTO) {
        AdmissionTypeDTO createdType = admissionTypeService.createAdmissionType(admissionTypeDTO);
        return new ResponseEntity<>(createdType, HttpStatus.CREATED);
    }

    @GetMapping("/admissionTypes/{id}")
    public ResponseEntity<AdmissionTypeDTO> getAdmissionTypeById(@PathVariable Long id) {
        AdmissionTypeDTO typeDTO = admissionTypeService.getAdmissionTypeById(id);
        return ResponseEntity.ok(typeDTO);
    }

    @GetMapping("/admissionTypes")
    public ResponseEntity<List<AdmissionTypeDTO>> getAllAdmissionTypes() {
        List<AdmissionTypeDTO> types = admissionTypeService.getAllAdmissionTypes();
        return ResponseEntity.ok(types);
    }

    @PutMapping("/admissionTypes/{id}")
    public ResponseEntity<AdmissionTypeDTO> updateAdmissionType(@PathVariable Long id,
            @RequestBody AdmissionTypeDTO admissionTypeDTO) {
        AdmissionTypeDTO updatedType = admissionTypeService.updateAdmissionType(id, admissionTypeDTO);
        return ResponseEntity.ok(updatedType);
    }

    @DeleteMapping("/admissionTypes/{id}")
    public ResponseEntity<Void> deleteAdmissionType(@PathVariable Long id) {
        admissionTypeService.deleteAdmissionType(id);
        return ResponseEntity.noContent().build();
    }
}