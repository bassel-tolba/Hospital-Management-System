package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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
import mine.profile.website.dtos.AppointmentDTO;
import mine.profile.website.dtos.AssessmentDTO;
import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.DocumentDTO;
import mine.profile.website.dtos.ImageReportDTO;
import mine.profile.website.dtos.LabResultDTO;
import mine.profile.website.dtos.MedicationAdministrationDTO;
import mine.profile.website.dtos.NursingCarePlanDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.dtos.PatientProductUsageDTO;
import mine.profile.website.dtos.PrescriptionDTO;
import mine.profile.website.dtos.ProcedureLogDTO;
import mine.profile.website.dtos.QuickNoteDTO;
import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.service.PatientDataService;

@RestController
@RequestMapping("/api/patients-data")
public class PatientDataController {

    @Autowired
    private PatientDataService patientDataService;

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long patientId) {
        return ResponseEntity.ok(patientDataService.getPatientById(patientId));
    }

    @GetMapping("/{patientId}/admissions")
    public ResponseEntity<Page<AdmissionDTO>> getAdmissionsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getAdmissionsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/appointments")
    public ResponseEntity<Page<AppointmentDTO>> getAppointmentsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) { // Add filter parameter
        return ResponseEntity
                .ok(patientDataService.getAppointmentsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/assessments")
    public ResponseEntity<Page<AssessmentDTO>> getAssessmentsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity
                .ok(patientDataService.getAssessmentsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/billings")
    public ResponseEntity<Page<BillingDTO>> getBillingsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity.ok(patientDataService.getBillingsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/care-plans")
    public ResponseEntity<Page<NursingCarePlanDTO>> getNursingCarePlansByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity
                .ok(patientDataService.getNursingCarePlansByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/prescriptions")
    public ResponseEntity<Page<PrescriptionDTO>> getPrescriptionsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity
                .ok(patientDataService.getPrescriptionsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/image-reports")
    public ResponseEntity<Page<ImageReportDTO>> getImageReportsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity
                .ok(patientDataService.getImageReportsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/documents")
    public ResponseEntity<Page<DocumentDTO>> getDocumentsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity.ok(patientDataService.getDocumentsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/vital-signs")
    public ResponseEntity<Page<VitalSignDTO>> getVitalSignsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity.ok(patientDataService.getVitalSignsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/product-usages")
    public ResponseEntity<Page<PatientProductUsageDTO>> getPatientProductUsageByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity
                .ok(patientDataService.getPatientProductUsageByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/medication-administrations")
    public ResponseEntity<Page<MedicationAdministrationDTO>> getMedicationAdministrationsByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity.ok(
                patientDataService.getMedicationAdministrationsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/lab-results")
    public ResponseEntity<Page<LabResultDTO>> getLabResultsByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity.ok(patientDataService.getLabResultsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/{patientId}/procedure-logs")
    public ResponseEntity<Page<ProcedureLogDTO>> getProcedureLogsByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean filterByAdmission) {
        return ResponseEntity
                .ok(patientDataService.getProcedureLogsByPatientId(patientId, page, size, filterByAdmission));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PatientDTO>> searchPatients(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.searchPatients(searchTerm, page, size));
    }

    // QuickNote endpoints
    @GetMapping("/{patientId}/quick-notes")
    public ResponseEntity<Page<QuickNoteDTO>> getQuickNotesByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getQuickNotesByPatientId(patientId, page, size));
    }

    @PostMapping("/{patientId}/quick-notes")
    public ResponseEntity<QuickNoteDTO> createQuickNote(
            @PathVariable Long patientId,
            @RequestBody QuickNoteDTO quickNoteDTO) {
        QuickNoteDTO createdQuickNote = patientDataService.createQuickNote(patientId, quickNoteDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdQuickNote);
    }

    @DeleteMapping("/quick-notes/{quickNoteId}")
    public ResponseEntity<Void> deleteQuickNote(@PathVariable Long quickNoteId) {
        patientDataService.deleteQuickNote(quickNoteId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/quick-notes/{quickNoteId}")
    public ResponseEntity<QuickNoteDTO> updateQuickNote(
            @PathVariable Long quickNoteId,
            @RequestBody QuickNoteDTO quickNoteDTO) {
        QuickNoteDTO updatedQuickNote = patientDataService.updateQuickNote(quickNoteId, quickNoteDTO);
        return ResponseEntity.ok(updatedQuickNote);
    }
}