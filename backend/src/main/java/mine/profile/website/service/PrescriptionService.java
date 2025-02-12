package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    /**
     * Creates a new prescription.
     *
     * @param dto The PrescriptionDTO containing the data for the new prescription.
     * @return A PrescriptionDTO representing the created prescription.
     */
    @Transactional
    public PrescriptionDTO createPrescription(PrescriptionDTO dto) {
        // Retrieve the patient, or throw if it doesn't exist
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + dto.getPatientId()));

        // Set the prescription date to now
        dto.setPrescriptionDate(LocalDateTime.now());

        // Convert the DTO to an entity
        Prescription prescription = PrescriptionDTO.toEntity(dto, patient);

        // Set the validity days (this will also set the expiration date)
        prescription.setValidityDays(dto.getValidityDays());

        // Convert each PrescribedMedicationDTO to a PrescribedMedication entity and
        // associate with prescription
        List<PrescribedMedication> prescribedMedications = dto.getPrescribedMedications().stream()
                .map(prescribedMedicationDTO -> {
                    Medication medication = medicationRepository.findById(prescribedMedicationDTO.getMedicationId())
                            .orElseThrow(
                                    () -> new IllegalArgumentException(
                                            "Invalid Medication ID: " + prescribedMedicationDTO.getMedicationId()));
                    PrescribedMedication prescribedMedication = PrescribedMedicationDTO
                            .toEntity(prescribedMedicationDTO, prescription, medication);
                    return prescribedMedication;
                })
                .collect(Collectors.toList());

        // Set the prescribed medications for the prescription
        prescription.setPrescribedMedications(prescribedMedications);

        // Save the new prescription, this will also save/cascade all of the
        // `PrescribedMedication` entities
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Return the DTO of the saved entity
        return PrescriptionDTO.toDto(savedPrescription);
    }

    /**
     * Updates an existing prescription.
     *
     * @param id  The ID of the prescription to update.
     * @param dto The PrescriptionDTO containing updated data.
     * @return A PrescriptionDTO representing the updated prescription.
     * @throws IllegalArgumentException If the prescription with the given ID does
     *                                  not exist.
     */
    @Transactional
    public PrescriptionDTO updatePrescription(Long id, PrescriptionDTO dto) {
        // Retrieve the existing prescription, or throw if it doesn't exist
        Prescription existingPrescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Prescription ID: " + id));

        // Update the basic prescription fields
        existingPrescription.setNote(dto.getNote());
        existingPrescription.setValidityDays(dto.getValidityDays());

        Map<Long, PrescribedMedication> existingMedicationMap = existingPrescription.getPrescribedMedications().stream()
                .filter(medication -> medication.getId() != null)
                .collect(Collectors.toMap(PrescribedMedication::getId, Function.identity()));

        List<PrescribedMedication> updatedMedications = new ArrayList<>();
        for (PrescribedMedicationDTO medicationDTO : dto.getPrescribedMedications()) {
            Medication medication = medicationRepository.findById(medicationDTO.getMedicationId())
                    .orElseThrow(
                            () -> new IllegalArgumentException(
                                    "Invalid Medication ID: " + medicationDTO.getMedicationId()));
            if (medicationDTO.getId() != null && existingMedicationMap.containsKey(medicationDTO.getId())) {
                PrescribedMedication existingMedication = existingMedicationMap.get(medicationDTO.getId());
                // Update existing entity
                existingMedication.setDosage(medicationDTO.getDosage());
                existingMedication.setRoute(medicationDTO.getRoute());
                existingMedication.setAmount(medicationDTO.getAmount());
                existingMedication.setExpired(medicationDTO.isExpired());
                updatedMedications.add(existingMedication);
            } else {
                // Create new entity
                PrescribedMedication newMedication = PrescribedMedicationDTO.toEntity(medicationDTO,
                        existingPrescription, medication);
                updatedMedications.add(newMedication);
            }
        }
        // Remove any entities that are not in the updatedPrescribedMedications.
        List<Long> updatedMedicationIds = dto.getPrescribedMedications().stream().filter(med -> med.getId() != null)
                .map(PrescribedMedicationDTO::getId).collect(Collectors.toList());
        existingPrescription.getPrescribedMedications().removeIf(med -> !updatedMedicationIds.contains(med.getId()));

        // Update the updated collection.
        existingPrescription.getPrescribedMedications().addAll(updatedMedications);

        Prescription savedPrescription = prescriptionRepository.save(existingPrescription);
        return PrescriptionDTO.toDto(savedPrescription);
    }

    /**
     * Retrieves all prescriptions in descending order of prescription date.
     *
     * @return A list of PrescriptionDTOs.
     */
    @Transactional
    public List<PrescriptionDTO> findAll() {
        return prescriptionRepository.findAll(Sort.by(Sort.Direction.DESC, "prescriptionDate")).stream()
                .map(PrescriptionDTO::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a paginated list of prescriptions for a given patient.
     *
     * @param patientId The ID of the patient.
     * @param pageable  The Pageable instance for pagination and sorting.
     * @return A Page of PrescriptionDTOs.
     * @throws IllegalArgumentException If the patient with the given ID does not
     *                                  exist.
     */
    @Transactional
    public Page<PrescriptionDTO> findByPatientId(Long patientId, Pageable pageable) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Patient ID: " + patientId));

        // Ensure sorting by prescriptionDate in descending order
        Sort sort = pageable.getSort().isSorted()
                ? pageable.getSort().and(Sort.by(Sort.Direction.DESC, "prescriptionDate"))
                : Sort.by(Sort.Direction.DESC, "prescriptionDate");

        // Create a new Pageable instance with the updated sort
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort);

        // Fetch prescriptions with the updated Pageable
        Page<Prescription> prescriptionPage = prescriptionRepository.findByPatient(patient, sortedPageable);

        // Convert entities to DTOs
        return prescriptionPage.map(PrescriptionDTO::toDto);
    }

    /**
     * Retrieves a prescription by its ID.
     *
     * @param id The ID of the prescription to retrieve.
     * @return A PrescriptionDTO representing the prescription.
     * @throws IllegalArgumentException If the prescription with the given ID does
     *                                  not exist.
     */
    @Transactional
    public PrescriptionDTO findById(Long id) {
        return prescriptionRepository.findById(id)
                .map(PrescriptionDTO::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Prescription ID: " + id));
    }

    /**
     * Retrieves a prescription entity by its ID.
     *
     * @param id The ID of the prescription to retrieve.
     * @return A Prescription entity representing the prescription.
     * @throws IllegalArgumentException If the prescription with the given ID does
     *                                  not exist.
     */
    @Transactional
    public Prescription findByIdEntity(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Prescription ID: " + id));
    }

    /**
     * Deletes a prescription by its ID.
     *
     * @param id The ID of the prescription to delete.
     */
    @Transactional
    public void deleteById(Long id) {
        prescriptionRepository.deleteById(id);
    }
}