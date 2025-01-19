package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.AdmissionDTO;
import mine.profile.website.dtos.AppointmentDTO;
import mine.profile.website.dtos.AssessmentDTO;
import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.ImageReportDTO;
import mine.profile.website.dtos.LabResultDTO; // Import LabResultDTO
import mine.profile.website.dtos.MedicationAdministrationDTO;
import mine.profile.website.dtos.NursingCarePlanDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.dtos.PatientProductUsageDTO;
import mine.profile.website.dtos.PrescriptionDTO;
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
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getAppointmentsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/assessments")
    public ResponseEntity<Page<AssessmentDTO>> getAssessmentsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getAssessmentsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/billings")
    public ResponseEntity<Page<BillingDTO>> getBillingsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getBillingsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/care-plans")
    public ResponseEntity<Page<NursingCarePlanDTO>> getNursingCarePlansByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getNursingCarePlansByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/prescriptions")
    public ResponseEntity<Page<PrescriptionDTO>> getPrescriptionsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getPrescriptionsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/image-reports")
    public ResponseEntity<Page<ImageReportDTO>> getImageReportsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getImageReportsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/vital-signs")
    public ResponseEntity<Page<VitalSignDTO>> getVitalSignsByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getVitalSignsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/product-usages")
    public ResponseEntity<Page<PatientProductUsageDTO>> getPatientProductUsageByPatientId(@PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getPatientProductUsageByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/medication-administrations")
    public ResponseEntity<Page<MedicationAdministrationDTO>> getMedicationAdministrationsByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getMedicationAdministrationsByPatientId(patientId, page, size));
    }

    @GetMapping("/{patientId}/lab-results") // New Endpoint
    public ResponseEntity<Page<LabResultDTO>> getLabResultsByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.getLabResultsByPatientId(patientId, page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PatientDTO>> searchPatients(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(patientDataService.searchPatients(searchTerm, page, size));
    }
}