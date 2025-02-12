package mine.profile.website.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
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
import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Appointment;
import mine.profile.website.models.Assessment;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Document;
import mine.profile.website.models.ImageReport;
import mine.profile.website.models.LabResult;
import mine.profile.website.models.MedicationAdministration;
import mine.profile.website.models.NursingCarePlan;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PatientProductUsage;
import mine.profile.website.models.Prescription;
import mine.profile.website.models.VitalSign;
import mine.profile.website.repository.AdmissionRepository;
import mine.profile.website.repository.AppointmentRepository;
import mine.profile.website.repository.AssessmentRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.DocumentRepository; // Import DocumentRepository
import mine.profile.website.repository.ImageReportRepository;
import mine.profile.website.repository.LabResultRepository;
import mine.profile.website.repository.MedicationAdministrationRepository;
import mine.profile.website.repository.NursingCarePlanRepository;
import mine.profile.website.repository.PatientProductUsageRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PaymentRepository;
import mine.profile.website.repository.PrescriptionRepository;
import mine.profile.website.repository.ProcedureLogRepository;
import mine.profile.website.repository.ProcedureRepository;
import mine.profile.website.repository.ProductRepository;
import mine.profile.website.repository.VitalSignRepository;

@Service
public class PatientDataService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AdmissionRepository admissionRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private NursingCarePlanRepository nursingCarePlanRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private VitalSignRepository vitalSignRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Autowired
    private PatientProductUsageRepository patientProductUsageRepository;

    @Autowired
    private MedicationAdministrationRepository medicationAdministrationRepository;

    @Autowired
    private ImageReportRepository imageReportRepository;

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private ProcedureLogRepository procedureLogRepository;

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProcedureRepository procedureRepository;

    @Autowired
    private DocumentRepository documentRepository; // Inject DocumentRepository

    @Autowired
    private BedRepository bedRepository;

    // -------------------- Patient Data Retrieval Functions --------------------
    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));
        return entityMapper.toDto(patient);
    }

    @Transactional(readOnly = true)
    public Page<AdmissionDTO> getAdmissionsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Admission> admissions = admissionRepository.findByPatientId(patientId, pageable);
        return admissions.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> appointments = appointmentRepository.findByPatientId(patientId, pageable);
        return appointments.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AssessmentDTO> getAssessmentsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Assessment> assessments = assessmentRepository.findByPatientId(patientId, pageable);
        return assessments.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<BillingDTO> getBillingsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Billing> billings = billingRepository.findByPatientId(patientId, pageable);
        return billings.map(billing -> BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                bedRepository));
    }

    @Transactional(readOnly = true)
    public Page<NursingCarePlanDTO> getNursingCarePlansByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NursingCarePlan> nursingCarePlans = nursingCarePlanRepository.findByPatientId(patientId, pageable);
        return nursingCarePlans.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionDTO> getPrescriptionsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + patientId));
        Page<Prescription> prescriptionPage = prescriptionRepository.findByPatient(patient, pageable);
        return prescriptionPage.map(PrescriptionDTO::toDto);
    }

    @Transactional(readOnly = true)
    public Page<VitalSignDTO> getVitalSignsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VitalSign> vitalSigns = vitalSignRepository.findByPatientId(patientId, pageable);
        return vitalSigns.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ImageReportDTO> getImageReportsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ImageReport> imageReports = imageReportRepository.findByPatientId(patientId, pageable);
        return imageReports.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<DocumentDTO> getDocumentsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Document> documents = documentRepository.findByPatientId(patientId, pageable);
        return documents.map(DocumentDTO::toDto);
    }

    @Transactional(readOnly = true)
    public Page<PatientProductUsageDTO> getPatientProductUsageByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PatientProductUsage> patientProductUsagePage = patientProductUsageRepository.findByPatientId(patientId,
                pageable);
        return patientProductUsagePage.map(PatientProductUsageDTO::toDto);
    }

    @Transactional(readOnly = true)
    public Page<MedicationAdministrationDTO> getMedicationAdministrationsByPatientId(Long patientId, int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MedicationAdministration> medicationAdministrations = medicationAdministrationRepository
                .findByPatientId(patientId, pageable);
        return medicationAdministrations.map(MedicationAdministrationDTO::toDto);
    }

    @Transactional(readOnly = true)
    public Page<LabResultDTO> getLabResultsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LabResult> labResults = labResultRepository.findByPatientId(patientId, pageable);
        return labResults.map(LabResultDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO> searchPatients(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return patientRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMedicalRecordNumberContainingIgnoreCase(
                        searchTerm, searchTerm, searchTerm, pageable)
                .map(entityMapper::toDto);
    }
}