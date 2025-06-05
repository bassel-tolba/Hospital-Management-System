// PatientDataService.java
package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.Optional;

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
import mine.profile.website.dtos.ProcedureLogDTO;
import mine.profile.website.dtos.QuickNoteDTO;
import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Billing;
import mine.profile.website.models.Patient;
import mine.profile.website.models.QuickNote;
import mine.profile.website.repository.AdmissionRepository;
// AppointmentRepository might still be needed if there are other direct uses, but not for the primary getAppointmentsByPatientId flow.
// For now, keeping it, but it's not used in the modified getAppointmentsByPatientId.
import mine.profile.website.repository.AppointmentRepository;
import mine.profile.website.repository.AssessmentRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.DocumentRepository;
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
import mine.profile.website.repository.QuickNoteRepository;
import mine.profile.website.repository.VitalSignRepository;

@Service
public class PatientDataService {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AdmissionRepository admissionRepository;
    @Autowired
    private AppointmentRepository appointmentRepository; // Kept for now, ensure it's actually needed elsewhere.
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
    private DocumentRepository documentRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private QuickNoteRepository quickNoteRepository;

    @Autowired
    private AppointmentService appointmentService;

    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));
        return entityMapper.toDto(patient);
    }

    @Transactional(readOnly = true)
    public Page<AdmissionDTO> getAdmissionsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Admission> admissions = admissionRepository.findByPatientIdOrderByAdmissionDateDesc(patientId, pageable);
        return admissions.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));

        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                // <<<< MODIFIED TO USE AppointmentService >>>>
                return appointmentService.getAppointmentsByPatientIdAndAppointmentDateTimeAfter(patientId,
                        currentAdmission.get().getAdmissionDate(), pageable);
            } else {
                return Page.empty(pageable);
            }
        } else {
            // <<<< ALREADY MODIFIED TO USE AppointmentService >>>>
            // This uses the AppointmentService method that also sorts by
            // AppointmentDateTimeDesc
            return appointmentService.getAppointmentsByPatientId(patientId, pageable);
        }
    }

    // ... other methods remain the same ...
    @Transactional(readOnly = true)
    public Page<AssessmentDTO> getAssessmentsByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return assessmentRepository
                        .findByPatientIdAndAssessmentDateTimeAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(entityMapper::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return assessmentRepository.findByPatientIdOrderByAssessmentDateTimeDesc(patientId, pageable)
                    .map(entityMapper::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<BillingDTO> getBillingsByPatientId(Long patientId, int page, int size, boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                Page<Billing> billings = billingRepository.findByPatientIdAndBillDateAfter(patientId,
                        currentAdmission.get().getAdmissionDate(), pageable);
                return billings.map(billing -> BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                        patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                        procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                        bedRepository));
            } else {
                return Page.empty(pageable);
            }
        } else {
            Page<Billing> billings = billingRepository.findByPatientIdOrderByBillDateDesc(patientId, pageable);
            return billings.map(billing -> BillingDTO.toDto(billing, paymentRepository, procedureLogRepository,
                    patientProductUsageRepository, labResultRepository, imageReportRepository, productRepository,
                    procedureRepository, admissionRepository, patientRepository, medicationAdministrationRepository,
                    bedRepository));
        }
    }

    @Transactional(readOnly = true)
    public Page<NursingCarePlanDTO> getNursingCarePlansByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return nursingCarePlanRepository
                        .findByPatientIdAndStartDateAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(entityMapper::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return nursingCarePlanRepository.findByPatientIdOrderByStartDateDesc(patientId, pageable)
                    .map(entityMapper::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<PrescriptionDTO> getPrescriptionsByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return prescriptionRepository
                        .findByPatientIdAndPrescriptionDateAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(PrescriptionDTO::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return prescriptionRepository.findByPatientOrderByPrescriptionDateDesc(patient, pageable)
                    .map(PrescriptionDTO::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<VitalSignDTO> getVitalSignsByPatientId(Long patientId, int page, int size, boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return vitalSignRepository
                        .findByPatientIdAndTimestampAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(VitalSignDTO::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return vitalSignRepository.findByPatientIdOrderByTimestampDesc(patientId, pageable)
                    .map(VitalSignDTO::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<ImageReportDTO> getImageReportsByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return imageReportRepository
                        .findByPatientIdAndReportDateTimeAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(entityMapper::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return imageReportRepository.findByPatientIdOrderByReportDateTimeDesc(patientId, pageable)
                    .map(entityMapper::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<DocumentDTO> getDocumentsByPatientId(Long patientId, int page, int size, boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return documentRepository
                        .findByPatientIdAndUploadDateAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(DocumentDTO::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return documentRepository.findByPatientIdOrderByUploadDateDesc(patientId, pageable)
                    .map(DocumentDTO::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<PatientProductUsageDTO> getPatientProductUsageByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return patientProductUsageRepository
                        .findByPatientIdAndStartTimeAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(PatientProductUsageDTO::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return patientProductUsageRepository.findByPatientIdOrderByStartTimeDesc(patientId, pageable)
                    .map(PatientProductUsageDTO::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<MedicationAdministrationDTO> getMedicationAdministrationsByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return medicationAdministrationRepository
                        .findByPatientIdAndAdministrationTimeAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(MedicationAdministrationDTO::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return medicationAdministrationRepository.findByPatientIdOrderByAdministrationTimeDesc(patientId, pageable)
                    .map(MedicationAdministrationDTO::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<LabResultDTO> getLabResultsByPatientId(Long patientId, int page, int size, boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return labResultRepository
                        .findByPatientIdAndResultDateTimeAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(LabResultDTO::fromEntity);
            } else {
                return Page.empty(pageable);
            }
        } else {
            return labResultRepository.findByPatientIdOrderByResultDateTimeDesc(patientId, pageable)
                    .map(LabResultDTO::fromEntity);
        }
    }

    @Transactional(readOnly = true)
    public Page<ProcedureLogDTO> getProcedureLogsByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        Optional<Admission> currentAdmission = patient.getCurrentAdmission();
        if (filterByAdmission) {
            if (currentAdmission.isPresent()) {
                return procedureLogRepository
                        .findByPatientIdAndStartTimeAfter(patientId, currentAdmission.get().getAdmissionDate(),
                                pageable)
                        .map(ProcedureLogDTO::toDto);

            } else {
                return Page.empty(pageable);
            }
        } else {
            return procedureLogRepository.findByPatientIdOrderByStartTimeDesc(patientId, pageable)
                    .map(ProcedureLogDTO::toDto);
        }
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO> searchPatients(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return patientRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMedicalRecordNumberContainingIgnoreCase(
                        searchTerm, searchTerm, searchTerm, pageable)
                .map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<QuickNoteDTO> getQuickNotesByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<QuickNote> quickNotes = quickNoteRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
        return quickNotes.map(QuickNoteDTO::toDto);
    }

    @Transactional
    public QuickNoteDTO createQuickNote(Long patientId, QuickNoteDTO quickNoteDTO) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));

        QuickNote quickNote = new QuickNote();
        quickNote.setNoteText(quickNoteDTO.getNoteText());
        quickNote.setCreatedAt(LocalDateTime.now());
        quickNote.setPatient(patient);
        quickNote.setAddedByUser(quickNoteDTO.getAddedByUser());

        QuickNote savedQuickNote = quickNoteRepository.save(quickNote);
        return QuickNoteDTO.toDto(savedQuickNote);
    }

    @Transactional
    public void deleteQuickNote(Long quickNoteId) {
        quickNoteRepository.deleteById(quickNoteId);
    }

    @Transactional
    public QuickNoteDTO updateQuickNote(Long quickNoteId, QuickNoteDTO quickNoteDTO) {
        QuickNote quickNote = quickNoteRepository.findById(quickNoteId)
                .orElseThrow(() -> new EntityNotFoundException("QuickNote not found with id: " + quickNoteId));

        quickNote.setNoteText(quickNoteDTO.getNoteText());
        quickNote.setAddedByUser(quickNoteDTO.getAddedByUser());

        QuickNote updatedQuickNote = quickNoteRepository.save(quickNote);
        return QuickNoteDTO.toDto(updatedQuickNote);
    }
}