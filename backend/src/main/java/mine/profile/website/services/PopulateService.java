//in PopulateService
package mine.profile.website.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.github.javafaker.Faker;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.models.Assessment;
import mine.profile.website.models.Bed;
import mine.profile.website.models.CarePlanGoal;
import mine.profile.website.models.Medication;
import mine.profile.website.models.NursingCarePlan;
import mine.profile.website.models.Patient;
import mine.profile.website.models.PrescribedMedication;
import mine.profile.website.models.Prescription;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.models.UnitType;
import mine.profile.website.models.VitalSign;
import mine.profile.website.repository.AssessmentRepository;
import mine.profile.website.repository.BedRepository;
import mine.profile.website.repository.CarePlanGoalRepository;
import mine.profile.website.repository.MedicationRepository;
import mine.profile.website.repository.NursingCarePlanRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.PrescribedMedicationRepository;
import mine.profile.website.repository.PrescriptionRepository;
import mine.profile.website.repository.RoleRepository;
import mine.profile.website.repository.RoomRepository;
import mine.profile.website.repository.UnitRepository;
import mine.profile.website.repository.UserRepository;
import mine.profile.website.repository.VitalSignRepository;

@Service
public class PopulateService {

    @Autowired
    private PatientService patientService; // Use the Service, not the repo directly for Patient creation.

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private VitalSignRepository vitalSignRepository;
    @Autowired
    private AssessmentRepository assessmentRepository;
    @Autowired
    private NursingCarePlanRepository nursingCarePlanRepository;
    @Autowired
    private CarePlanGoalRepository carePlanGoalRepository;
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    @Autowired
    private PrescribedMedicationRepository prescribedMedicationRepository;
    @Autowired
    private MedicationRepository medicationRepository;
    @Autowired
    private UnitRepository unitRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;

    @PersistenceContext
    private EntityManager entityManager; // Inject EntityManager for clearing

    private final Faker faker = new Faker();
    private final Random random = new Random();
    private static final int BATCH_SIZE = 100; // Smaller batch size for 8GB RAM

    @Transactional
    public void populateDataWithoutUnitsRoomsBeds() { // Renamed method
        // Removed: populateUnitsAndRoomsAndBeds(100_000, 100, 20);
        populatePatients(10_000); // Reduced to 10,000 as requested
        populatePatientData(); // Keep patient-related data
    }

    @Transactional
    public void populateData() { // Keep the old method, and do not change it
        populatePatients(10_000); // Now for 10 million
        populatePatientData(); // Moved vital signs and other data AFTER patients are committed
    }

    @Transactional
    public void populatePatients(int count) {
        int totalBatches = (count + BATCH_SIZE - 1) / BATCH_SIZE; // Calculate total batches

        IntStream.range(0, totalBatches).forEach(batch -> {
            try {
                List<PatientDTO> patientDTOs = new ArrayList<>();
                for (int i = 0; i < BATCH_SIZE; i++) {
                    int patientIndex = batch * BATCH_SIZE + i;
                    if (patientIndex >= count)
                        break; // Stop if we reach the desired count

                    patientDTOs.add(createFakePatientDTO());

                }
                patientDTOs.forEach(patientDTO -> {
                    try {
                        patientService.createPatient(patientDTO, null);
                    } catch (Exception e) {
                        System.err.println("Error creating patient: " + e.getMessage());
                        // Log and continue, or rethrow if you want to stop on error.
                    }
                });

                entityManager.flush(); // Force a flush to the database
                entityManager.clear(); // Detach entities to free memory *ESSENTIAL*

                System.out.println("Created batch " + (batch + 1) + " of " + totalBatches + " patients.");

            } catch (Exception e) {
                System.err.println("Error in batch " + batch + ": " + e.getMessage());
                e.printStackTrace(); // More detailed error information
            }
        });

    }

    @Transactional
    public void populatePatientData() {
        populateVitalSigns(10);
        populateAssessments(5);
        populateNursingCarePlansAndGoals(2);
        populatePrescriptionsAndMedications(3);
    }

    @Transactional
    public void populateVitalSigns(int countPerPatient) {
        System.out.println("Populating vital signs...");
        Pageable pageable = PageRequest.of(0, BATCH_SIZE);
        Page<Patient> patientPage;

        do {
            patientPage = patientRepository.findAll(pageable);
            for (Patient patient : patientPage.getContent()) {
                List<VitalSign> vitalSigns = new ArrayList<>();
                for (int i = 0; i < countPerPatient; i++) {
                    vitalSigns.add(createFakeVitalSign(patient));
                }
                vitalSignRepository.saveAll(vitalSigns);
            }
            entityManager.flush(); // Force a flush
            entityManager.clear(); // *CRITICAL* Clear the persistence context
            pageable = pageable.next();
        } while (patientPage.hasNext());
        System.out.println("Vital signs populated.");
    }

    @Transactional
    public void populateAssessments(int countPerPatient) {
        System.out.println("Populating assessments...");
        Pageable pageable = PageRequest.of(0, BATCH_SIZE);
        Page<Patient> patientPage;

        do {
            patientPage = patientRepository.findAll(pageable);
            for (Patient patient : patientPage.getContent()) {
                List<Assessment> assessments = new ArrayList<>();
                for (int i = 0; i < countPerPatient; i++) {
                    assessments.add(createFakeAssessment(patient));
                }
                assessmentRepository.saveAll(assessments);
            }
            entityManager.flush();
            entityManager.clear();
            pageable = pageable.next();
        } while (patientPage.hasNext());
        System.out.println("assessments populated.");
    }

    @Transactional
    public void populateNursingCarePlansAndGoals(int countPerPatient) {
        System.out.println("Populating nursing care plans...");
        Pageable pageable = PageRequest.of(0, BATCH_SIZE);
        Page<Patient> patientPage;

        do {
            patientPage = patientRepository.findAll(pageable);
            for (Patient patient : patientPage.getContent()) {
                for (int i = 0; i < countPerPatient; i++) {
                    NursingCarePlan carePlan = createFakeNursingCarePlan(patient);
                    nursingCarePlanRepository.save(carePlan); // Save the care plan

                    // Create and associate goals
                    List<CarePlanGoal> goals = new ArrayList<>();
                    for (int j = 0; j < 3; j++) {
                        goals.add(createFakeCarePlanGoal(carePlan));
                    }
                    carePlanGoalRepository.saveAll(goals);
                }
            }
            entityManager.flush();
            entityManager.clear();
            pageable = pageable.next();
        } while (patientPage.hasNext());
        System.out.println("Nursing care plans populated.");
    }

    @Transactional
    public void populatePrescriptionsAndMedications(int countPerPatient) {
        System.out.println("Populating prescriptions...");

        // 1. Populate Medications (if needed) - Use batching here too
        if (medicationRepository.count() == 0) {
            List<Medication> medications = new ArrayList<>();
            for (int i = 0; i < 20; i++) {
                medications.add(createFakeMedication());
                if (medications.size() >= BATCH_SIZE) { // Batch medications too
                    medicationRepository.saveAll(medications);
                    medications.clear();
                    entityManager.flush();
                    entityManager.clear();
                }
            }
            if (!medications.isEmpty()) { // Save any remaining medications
                medicationRepository.saveAll(medications);
                entityManager.flush();
                entityManager.clear();
            }
        }

        // 2. Populate Prescriptions and PrescribedMedications (paginated)
        Pageable pageable = PageRequest.of(0, BATCH_SIZE);
        Page<Patient> patientPage;
        List<Medication> availableMedications = medicationRepository.findAll(); // Get all meds

        do {
            patientPage = patientRepository.findAll(pageable);
            for (Patient patient : patientPage.getContent()) {
                for (int i = 0; i < countPerPatient; i++) {
                    Prescription prescription = createFakePrescription(patient);
                    prescriptionRepository.save(prescription); // Save prescription

                    List<PrescribedMedication> prescribedMeds = new ArrayList<>();
                    for (int j = 0; j < 2; j++) {
                        Medication medication = availableMedications.get(random.nextInt(availableMedications.size()));
                        prescribedMeds.add(createFakePrescribedMedication(prescription, medication));
                    }
                    prescribedMedicationRepository.saveAll(prescribedMeds);
                }
            }
            entityManager.flush();
            entityManager.clear();
            pageable = pageable.next();
        } while (patientPage.hasNext());
        System.out.println("Prescriptions populated.");
    }

    @Transactional
    public void populateUnitsAndRoomsAndBeds(int numUnits, int numRoomsPerUnit, int numBedsPerRoom) {
        System.out.println("Populating units, rooms, and beds...");

        for (int i = 0; i < numUnits; i++) {
            Unit unit = createFakeUnit();
            unitRepository.save(unit);
            entityManager.flush(); // Flush after each unit to help with memory

            for (int j = 0; j < numRoomsPerUnit; j++) {
                Room room = createFakeRoom(unit); // Corrected Room creation
                roomRepository.save(room);

                List<Bed> beds = new ArrayList<>();
                for (int k = 0; k < numBedsPerRoom; k++) {
                    beds.add(createFakeBed(room));
                }
                bedRepository.saveAll(beds); // Batch save beds
            }
            entityManager.flush(); // Flush after each room and its beds
            entityManager.clear();
        }

    }

    // --- Helper methods (same as before, but repeated for completeness) ---
    private PatientDTO createFakePatientDTO() {
        PatientDTO patientDTO = new PatientDTO();
        patientDTO.setFirstName(faker.name().firstName());
        patientDTO.setLastName(faker.name().lastName());
        patientDTO.setDateOfBirth(LocalDate.now().minusYears(random.nextInt(80)));
        patientDTO.setGender(random.nextBoolean() ? "Male" : "Female");
        patientDTO.setAddress(faker.address().fullAddress());
        patientDTO.setPhoneNumber(faker.phoneNumber().phoneNumber());
        patientDTO.setEmail(faker.internet().emailAddress());
        patientDTO.setMedicalRecordNumber(faker.idNumber().valid());
        patientDTO.setBloodType(faker.medical().diseaseName());
        patientDTO.setAllergies(faker.medical().symptoms());
        patientDTO.setMedicalHistory(faker.medical().medicineName());
        return patientDTO;
    }

    private VitalSign createFakeVitalSign(Patient patient) {
        return new VitalSign(
                LocalDateTime.now(),
                random.nextDouble() * 60 + 60, // Heart rate between 60 and 120
                random.nextDouble() * 40 + 100, // Systolic BP between 100 and 140
                random.nextDouble() * 30 + 60, // Diastolic BP between 60 and 90
                random.nextDouble() * 2 + 36, // Temperature between 36 and 38
                random.nextDouble() * 8 + 12, // Respiratory rate between 12 and 20
                random.nextDouble() * 10 + 90, // Oxygen saturation between 90 and 100
                random.nextInt(11), // Pain level between 0 and 10
                random.nextDouble() * 50 + 150, // Height between 150 and 200 cm
                "cm",
                random.nextDouble() * 50 + 50, // Weight between 50 and 100 kg
                "kg",
                random.nextDouble() * 4 + 4, // Glucose between 4 and 8 mmol/L
                "mmol/L",
                "Sitting",
                random.nextDouble() * 2 + 1, // Capillary refill time between 1 and 3 seconds
                "Manual",
                patient);
    }

    private Assessment createFakeAssessment(Patient patient) {
        return new Assessment(
                LocalDateTime.now(),
                faker.lorem().paragraph(),
                patient);
    }

    private NursingCarePlan createFakeNursingCarePlan(Patient patient) {
        return new NursingCarePlan(
                LocalDateTime.now(),
                faker.lorem().sentence(),
                patient);
    }

    private CarePlanGoal createFakeCarePlanGoal(NursingCarePlan carePlan) {
        return new CarePlanGoal(
                faker.lorem().sentence(),
                faker.lorem().word(),
                carePlan);
    }

    private Prescription createFakePrescription(Patient patient) {
        Prescription prescription = new Prescription();
        prescription.setPrescriptionDate(LocalDateTime.now());
        prescription.setNote(faker.lorem().sentence());
        prescription.setValidityDays(30); // Example validity
        prescription.setPatient(patient);
        prescription.setExpired(false);
        return prescription;
    }

    private PrescribedMedication createFakePrescribedMedication(Prescription prescription, Medication medication) {
        PrescribedMedication prescribedMed = new PrescribedMedication();
        prescribedMed.setPrescription(prescription);
        prescribedMed.setMedication(medication);
        prescribedMed.setDosage(faker.medical().medicineName());
        prescribedMed.setRoute("Oral");
        prescribedMed.setAmount(1);
        prescribedMed.setExpired(false);
        return prescribedMed;

    }

    private Medication createFakeMedication() {
        Medication medication = new Medication();
        medication.setName(faker.medical().medicineName());
        medication.setDosage(faker.medical().hospitalName());
        medication.setStock(random.nextInt(100));
        medication.setPrice(BigDecimal.valueOf(random.nextDouble() * 50)); // USE BIGDECIMAL
        return medication;

    }

    private Unit createFakeUnit() {
        UnitType[] unitTypes = UnitType.values();
        UnitType unitType = unitTypes[random.nextInt(unitTypes.length)];
        return new Unit(
                unitType,
                faker.company().name() + " Unit",
                faker.address().buildingNumber(),
                faker.lorem().sentence());
    }

    private Room createFakeRoom(Unit unit) {
        return new Room(
                faker.number().digits(3),
                "Double",
                new ArrayList<>(),
                unit);
    }

    private Bed createFakeBed(Room room) {
        return new Bed(
                faker.number().digits(2),
                false,
                room);
    }

}