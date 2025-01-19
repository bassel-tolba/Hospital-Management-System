package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import mine.profile.website.dtos.PrescribedMedicationDTO;
import mine.profile.website.dtos.PrescriptionDTO;
import mine.profile.website.models.Medication;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PrescribedMedication;
import mine.profile.website.models.Prescription;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PrescribedMedicationRepository;
import mine.profile.website.repository.PrescriptionRepository;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final MedicationRepository medicationRepository;
    private final PrescribedMedicationRepository prescribedMedicationRepository;

    @Autowired
    public PrescriptionService(PrescriptionRepository prescriptionRepository, PatientRepository patientRepository,
            MedicationRepository medicationRepository, PrescribedMedicationRepository prescribedMedicationRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.medicationRepository = medicationRepository;
        this.prescribedMedicationRepository = prescribedMedicationRepository;
    }

    @Transactional
    public PrescriptionDTO createPrescription(PrescriptionDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + dto.getPatientId()));

        dto.setPrescriptionDate(LocalDateTime.now());
        Prescription prescription = PrescriptionDTO.toEntity(dto, patient);

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        List<PrescribedMedication> prescribedMedications = dto.getPrescribedMedications().stream()
                .map(prescribedMedicationDTO -> {
                    Medication medication = medicationRepository.findById(prescribedMedicationDTO.getMedicationId())
                            .orElseThrow(
                                    () -> new IllegalArgumentException(
                                            "Invalid Medication ID: " + prescribedMedicationDTO.getMedicationId()));
                    PrescribedMedication prescribedMedication = PrescribedMedicationDTO
                            .toEntity(prescribedMedicationDTO, savedPrescription, medication);
                    return prescribedMedication;
                })
                .collect(Collectors.toList());

        prescribedMedicationRepository.saveAll(prescribedMedications);

        savedPrescription.setPrescribedMedications(prescribedMedications);
        return PrescriptionDTO.toDto(savedPrescription);
    }

    @Transactional
    public List<PrescriptionDTO> findAll() {
        return prescriptionRepository.findAll().stream()
                .map(PrescriptionDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Page<PrescriptionDTO> findByPatientId(Long patientId, Pageable pageable) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + patientId));
        Page<Prescription> prescriptionPage = prescriptionRepository.findByPatient(patient, pageable);
        return prescriptionPage.map(PrescriptionDTO::toDto);
    }

    @Transactional
    public PrescriptionDTO findById(Long id) {
        return prescriptionRepository.findById(id)
                .map(PrescriptionDTO::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Prescription ID: " + id));
    }

    @Transactional
    public Prescription findByIdEntity(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Prescription ID: " + id));
    }

    @Transactional
    public void deleteById(Long id) {
        prescriptionRepository.deleteById(id);
    }
}