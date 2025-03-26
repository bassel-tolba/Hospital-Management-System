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
    private DocumentRepository documentRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private QuickNoteRepository quickNoteRepository;

    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));
        return entityMapper.toDto(patient);
    }

    @Transactional(readOnly = true)
    public Page<AdmissionDTO> getAdmissionsByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Use the new method with sorting
        Page<Admission> admissions = admissionRepository.findByPatientIdOrderByAdmissionDateDesc(patientId, pageable);
        return admissions.map(entityMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO> getAppointmentsByPatientId(Long patientId, int page, int size,
            boolean filterByAdmission) {
        Pageable pageable = PageRequest.of(page, size);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
        if (filterByAdmission) {
            Optional<Admission> currentAdmission = patient.getCurrentAdmission();
            if (currentAdmission.isPresent()) {
                return appointmentRepository
                        .findByPatientIdAndAppointmentDateTimeAfter(patientId,
                                currentAdmission.get().getAdmissionDate(), pageable)
                        .map(entityMapper::toDto);
            } else {
                return Page.empty(pageable);
            }
        } else {
            // Use the new method with sorting
            return appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId, pageable)
                    .map(entityMapper::toDto);
        }
    }

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
            // Use the new method with sorting
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
            // Use the new method with sorting
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
            // Use the new method with sorting
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
            // Use the new method with sorting and patient object
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
            // Use the new method with sorting
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
            // Use the new method with sorting
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
            // Use the new method with sorting
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
            // Use the new method with sorting
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
            // Use the new method with sorting
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
            // Use the new method with sorting
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
            // Use the new method with sorting
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

    // Add QuickNote methods
    @Transactional(readOnly = true)
    public Page<QuickNoteDTO> getQuickNotesByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Use the new method with sorting
        Page<QuickNote> quickNotes = quickNoteRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
        return quickNotes.map(QuickNoteDTO::toDto); // You'll need a toDto method in QuickNoteDTO
    }

    // Create QuickNote
    @Transactional
    public QuickNoteDTO createQuickNote(Long patientId, QuickNoteDTO quickNoteDTO) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + patientId));

        QuickNote quickNote = new QuickNote();
        quickNote.setNoteText(quickNoteDTO.getNoteText());
        quickNote.setCreatedAt(LocalDateTime.now());
        quickNote.setPatient(patient); // Associate with the patient
        quickNote.setAddedByUser(quickNoteDTO.getAddedByUser());

        // No need to manually add to the list, JPA handles it
        QuickNote savedQuickNote = quickNoteRepository.save(quickNote);
        return QuickNoteDTO.toDto(savedQuickNote);
    }

    // Delete QuickNote (using soft delete)
    @Transactional
    public void deleteQuickNote(Long quickNoteId) {
        quickNoteRepository.deleteById(quickNoteId); // Or implement soft delete if QuickNote has a deleted flag.
    }

    // Update QuickNote
    @Transactional
    public QuickNoteDTO updateQuickNote(Long quickNoteId, QuickNoteDTO quickNoteDTO) {
        QuickNote quickNote = quickNoteRepository.findById(quickNoteId)
                .orElseThrow(() -> new EntityNotFoundException("QuickNote not found with id: " + quickNoteId));

        quickNote.setNoteText(quickNoteDTO.getNoteText());
        // quickNote.setCreatedAt(quickNoteDTO.getCreatedAt()); //don't allow update
        // created time
        quickNote.setAddedByUser(quickNoteDTO.getAddedByUser());
        // patient association should not be changed

        QuickNote updatedQuickNote = quickNoteRepository.save(quickNote); // save updates
        return QuickNoteDTO.toDto(updatedQuickNote); // return DTO
    }
}