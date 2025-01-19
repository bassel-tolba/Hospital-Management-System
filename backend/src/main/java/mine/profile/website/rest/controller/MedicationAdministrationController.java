package mine.profile.website.rest.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.MedicationAdministrationDTO;
import mine.profile.website.service.MedicationAdministrationService;
import mine.profile.website.service.PrescriptionService;
import mine.profile.website.services.PatientService;

@RestController
@RequestMapping("/api/medication-administrations")
public class MedicationAdministrationController {

    private final MedicationAdministrationService medicationAdministrationService;
    private final PatientService patientService;
    private final PrescriptionService prescriptionService;

    public MedicationAdministrationController(MedicationAdministrationService medicationAdministrationService,
            PatientService patientService, PrescriptionService prescriptionService) {
        this.medicationAdministrationService = medicationAdministrationService;
        this.patientService = patientService;
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<MedicationAdministrationDTO> createMedicationAdministration(
            @RequestBody MedicationAdministrationDTO medicationAdministrationDTO) {
        MedicationAdministrationDTO createdAdministration = medicationAdministrationService
                .createMedicationAdministration(medicationAdministrationDTO);
        return new ResponseEntity<>(createdAdministration, HttpStatus.CREATED);
    }

    @GetMapping
    public Page<MedicationAdministrationDTO> getAllMedicationAdministrations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return medicationAdministrationService.findAll(page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationAdministrationDTO> getMedicationAdministrationById(@PathVariable Long id) {
        MedicationAdministrationDTO administration = medicationAdministrationService.findById(id);
        return new ResponseEntity<>(administration, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicationAdministration(@PathVariable Long id) {
        medicationAdministrationService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/patient")
    public ResponseEntity<Page<MedicationAdministrationDTO>> getMedicationAdministrationsByPatientId(
            @RequestParam(name = "patientId") Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        patientService.getPatientById(patientId); // Check if patient exists
        Page<MedicationAdministrationDTO> administrations = medicationAdministrationService
                .findAllByPatientId(patientId, page, size);
        return new ResponseEntity<>(administrations, HttpStatus.OK);
    }
}