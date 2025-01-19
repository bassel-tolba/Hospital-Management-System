package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.PrescribedMedicationDTO;
import mine.profile.website.models.Medication;
import mine.profile.website.models.PrescribedMedication;
import mine.profile.website.models.Prescription;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.repository.PrescribedMedicationRepository;
import mine.profile.website.repository.PrescriptionRepository;

@Service
public class PrescribedMedicationService {
    private final PrescribedMedicationRepository prescribedMedicationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicationRepository medicationRepository;

    public PrescribedMedicationService(PrescribedMedicationRepository prescribedMedicationRepository,
            PrescriptionRepository prescriptionRepository,
            MedicationRepository medicationRepository) {
        this.prescribedMedicationRepository = prescribedMedicationRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicationRepository = medicationRepository;
    }

    @Transactional
    public PrescribedMedicationDTO createPrescribedMedication(PrescribedMedicationDTO dto) {
        Prescription prescription = prescriptionRepository.findById(dto.getPrescriptionId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Prescription ID: " + dto.getPrescriptionId()));
        Medication medication = medicationRepository.findById(dto.getMedicationId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Medication ID: " + dto.getMedicationId()));

        PrescribedMedication prescribedMedication = PrescribedMedicationDTO.toEntity(dto, prescription, medication);
        PrescribedMedication savedPrescribedMedication = prescribedMedicationRepository.save(prescribedMedication);
        return PrescribedMedicationDTO.toDto(savedPrescribedMedication);

    }

    @Transactional
    public List<PrescribedMedicationDTO> findAll() {
        return prescribedMedicationRepository.findAll().stream()
                .map(PrescribedMedicationDTO::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PrescribedMedicationDTO findById(Long id) {
        return prescribedMedicationRepository.findById(id)
                .map(PrescribedMedicationDTO::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid PrescribedMedication ID: " + id));
    }

    @Transactional
    public void deleteById(Long id) {
        prescribedMedicationRepository.deleteById(id);
    }
}