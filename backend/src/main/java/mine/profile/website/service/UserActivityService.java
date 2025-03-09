package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.UserActivityDTO;
import mine.profile.website.models.ActivityTarget;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.models.UnitType;
import mine.profile.website.models.User;
import mine.profile.website.models.UserActivity;
import mine.profile.website.models.UserActivityType;
import mine.profile.website.repository.ActivityTargetRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.RoomRepository;
import mine.profile.website.repository.UnitRepository;
import mine.profile.website.repository.UserActivityRepository;
import mine.profile.website.repository.UserRepository;

@Service
public class UserActivityService {

    private static final Logger log = LoggerFactory.getLogger(UserActivityService.class);

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Autowired
    private ActivityTargetRepository activityTargetRepository;

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Transactional
    public List<UserActivityDTO> createUserActivity(UserActivityDTO userActivityDTO) {
        log.info("Creating user activity with details: {}", userActivityDTO);

        List<UserActivityDTO> createdActivityDTOs = new ArrayList<>();

        // --- Handle Patient IDs (creating multiple activities) ---
        if (userActivityDTO.getPatientIds() != null && !userActivityDTO.getPatientIds().isEmpty()) {
            for (Long patientId : userActivityDTO.getPatientIds()) {
                // Create a *copy* of the DTO for each patient
                UserActivityDTO individualActivityDTO = new UserActivityDTO();
                individualActivityDTO.setActivityType(userActivityDTO.getActivityType());
                individualActivityDTO.setDescription(userActivityDTO.getDescription());
                individualActivityDTO.setState(userActivityDTO.getState());
                // Set *only* the current patient ID
                individualActivityDTO.setPatientIds(Collections.singletonList(patientId));

                // Create and save the activity for this individual patient
                createdActivityDTOs.add(createIndividualUserActivity(individualActivityDTO));
            }
        }
        // --- Handle Room ID (still creates multiple activities, one per patient in the
        // room) ---
        else if (userActivityDTO.getRoomId() != null) {
            Room room = roomRepository
                    .findById(userActivityDTO.getRoomId())
                    .orElseThrow(() -> new EntityNotFoundException("Room not found"));

            List<Patient> patientsInRoom = room.getBeds().stream()
                    .filter(bed -> bed.getAdmission() != null)
                    .map(bed -> bed.getAdmission().getPatient())
                    .collect(Collectors.toList());

            log.info("Activity related to room: {}, affecting patients: {}", room, patientsInRoom);

            for (Patient patient : patientsInRoom) {
                // Create a *copy* of the DTO for each patient
                UserActivityDTO individualActivityDTO = new UserActivityDTO();
                individualActivityDTO.setActivityType(userActivityDTO.getActivityType());
                individualActivityDTO.setDescription(userActivityDTO.getDescription());
                individualActivityDTO.setState(userActivityDTO.getState());
                // Set *only* the current patient ID
                individualActivityDTO.setPatientIds(Collections.singletonList(patient.getId()));
                individualActivityDTO.setRoomId(userActivityDTO.getRoomId()); // Keep the room ID for context

                createdActivityDTOs.add(createIndividualUserActivity(individualActivityDTO));
            }
        }
        // --- Handle Unit ID (still creates multiple activities, one per patient in the
        // unit) ---
        else if (userActivityDTO.getUnitId() != null) {
            Unit unit = unitRepository
                    .findById(userActivityDTO.getUnitId())
                    .orElseThrow(() -> new EntityNotFoundException("Unit not found"));

            List<Patient> patientsInUnit = unit.getRooms().stream()
                    .flatMap(room -> room.getBeds().stream())
                    .filter(bed -> bed.getAdmission() != null)
                    .map(bed -> bed.getAdmission().getPatient())
                    .collect(Collectors.toList());

            log.info("Activity related to unit: {}, affecting patients: {}", unit, patientsInUnit);

            for (Patient patient : patientsInUnit) {
                // Create a *copy* of the DTO for each patient
                UserActivityDTO individualActivityDTO = new UserActivityDTO();
                individualActivityDTO.setActivityType(userActivityDTO.getActivityType());
                individualActivityDTO.setDescription(userActivityDTO.getDescription());
                individualActivityDTO.setState(userActivityDTO.getState());
                // Set only the current patient ID
                individualActivityDTO.setPatientIds(Collections.singletonList(patient.getId()));
                individualActivityDTO.setUnitId(userActivityDTO.getUnitId()); // Keep the unit ID for context
                createdActivityDTOs.add(createIndividualUserActivity(individualActivityDTO));
            }
        } else {
            // Handle case where no patient, room, or unit is specified. Still create one
            // activity.
            createdActivityDTOs.add(createIndividualUserActivity(userActivityDTO));
        }

        return createdActivityDTOs;
    }

    private UserActivityDTO createIndividualUserActivity(UserActivityDTO userActivityDTO) {
        ActivityTarget activityTarget = new ActivityTarget();

        if (userActivityDTO.getPatientIds() != null && !userActivityDTO.getPatientIds().isEmpty()) {
            List<Patient> patients = patientRepository.findAllById(userActivityDTO.getPatientIds());
            if (!patients.isEmpty()) { // Check if the patient exists.
                activityTarget.setPatients(patients);
                log.info(
                        "Activity assigned directly to patient: {}",
                        patients.get(0)); // Log only the single patient
            } else {
                // Handle the case if patient Ids is sent but one of them is not found.
                // Option 1: Throw an exception
                // throw new
                // EntityNotFoundException("Patient with ID " +
                // userActivityDTO.getPatientIds().get(0) + " not
                // found");
                // Option 2: Skip this patient and log a warning (more robust, avoids failing
                // the entire
                // request)
                log.warn(
                        "Patient with ID {} not found, skipping activity creation for this patient.",
                        userActivityDTO.getPatientIds().get(0));
                return null; // Important: Return null to indicate that no DTO was created.
            }
        } else if (userActivityDTO.getRoomId() != null) {
            Room room = roomRepository.findById(userActivityDTO.getRoomId()).orElse(null);
            if (room != null) {
                activityTarget.setRoom(room);
                List<Patient> patientsInRoom = room.getBeds().stream()
                        .filter(bed -> bed.getAdmission() != null)
                        .map(bed -> bed.getAdmission().getPatient())
                        .collect(Collectors.toList());
                if (!patientsInRoom.isEmpty()) {
                    activityTarget.setPatients(patientsInRoom);
                }
            }
        } else if (userActivityDTO.getUnitId() != null) {

            Unit unit = unitRepository.findById(userActivityDTO.getUnitId()).orElse(null);
            if (unit != null) {
                activityTarget.setUnit(unit);
                List<Patient> patientsInUnit = unit.getRooms().stream()
                        .flatMap(room -> room.getBeds().stream())
                        .filter(bed -> bed.getAdmission() != null)
                        .map(bed -> bed.getAdmission().getPatient())
                        .collect(Collectors.toList());

                if (!patientsInUnit.isEmpty()) {
                    activityTarget.setPatients(patientsInUnit);
                }
            }
        }

        activityTarget = activityTargetRepository.save(activityTarget);

        UserActivity userActivity = userActivityDTO.toEntity();
        userActivity.setActivityTarget(activityTarget);
        userActivity.setTimestamp(LocalDateTime.now());
        log.info("Saving activity: {}", userActivity);
        UserActivity savedUserActivity = userActivityRepository.save(userActivity);
        log.info("User activity created successfully with ID: {}", savedUserActivity.getId());

        return UserActivityDTO.fromEntity(savedUserActivity);
    }

    @Transactional
    public List<UserActivityDTO> getAvailableActivitiesForUser(Long userId) {
        log.info("getAvailableActivitiesForUser called for user ID: {}", userId);
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        log.info("User found: {}", user);

        if (!user.isEnabled()) {
            log.warn("User is not enabled");
            throw new RuntimeException("User is not enabled");
        }

        List<UserActivity> pendingActivities = userActivityRepository.findByStateIgnoreCaseOrStateIgnoreCase(
                "pending", "inprogress"); // Query by state
        log.info("Found {} pending or in-progress activities.", pendingActivities.size());
        List<Unit> userUnits = user.getUnits();

        // Phase 2: Fetch full Patient details for all relevant patients
        Set<Long> patientIds = pendingActivities.stream()
                .map(UserActivity::getActivityTarget)
                .filter(target -> target != null && target.getPatients() != null)
                .flatMap(target -> target.getPatients().stream())
                .map(Patient::getId)
                .collect(Collectors.toSet());
        log.info("Patient IDs to fetch: {}", patientIds);
        // Fetch *full* Patient objects, including admissions, etc.
        List<Patient> fullyLoadedPatients = patientRepository.findAllById(patientIds);
        log.info("Fully loaded patients count: {}", fullyLoadedPatients.size());
        // Create a map for efficient lookup
        Map<Long, Patient> patientMap = fullyLoadedPatients.stream().collect(Collectors.toMap(Patient::getId, p -> p));

        // Now, replace the lightweight Patient objects in the activities with the fully
        // loaded ones
        for (UserActivity activity : pendingActivities) {
            if (activity.getActivityTarget() != null && activity.getActivityTarget().getPatients() != null) {
                List<Patient> updatedPatients = activity.getActivityTarget().getPatients().stream()
                        .map(
                                patient -> patientMap.getOrDefault(
                                        patient.getId(),
                                        patient)) // Get from map // Replace with fully loaded patient
                        .collect(Collectors.toList());
                activity.getActivityTarget().setPatients(updatedPatients); // Set fully loaded patients
            }
        }
        log.info("Starting filtering of activities...");
        List<UserActivityDTO> result = pendingActivities.stream()
                .filter(activity -> isActivityApplicable(activity, user))
                // Apply Role and Unit-Based filtering
                .filter(activity -> isAllowedActivity(activity, user, userUnits))
                .map(UserActivityDTO::fromEntity)
                .collect(Collectors.toList());
        log.info("Filtered activities count: {}", result.size());
        return result;
    }

    private boolean isAllowedActivity(UserActivity activity, User user, List<Unit> userUnits) {
        log.info("Checking if activity {} is allowed for user {}", activity.getId(), user.getUsername());
        UserActivityType type = activity.getActivityType();
        String role = user.getRoleName();

        if ("LAB_TECHNICIAN".equalsIgnoreCase(role) && type == UserActivityType.LAB_TEST) {
            log.info("User is LAB_TECHNICIAN, activity type is LAB_TEST. Checking unit compatibility.");
            return userUnits != null
                    && userUnits.stream().anyMatch(unit -> unit.getUnitType() == UnitType.LABORATORY);
        }

        if ("RADIOLOGY_TECHNICIAN".equalsIgnoreCase(role) && type == UserActivityType.IMAGE_REPORT) {
            log.info(
                    "User is RADIOLOGY_TECHNICIAN, activity type is IMAGE_REPORT. Checking unit compatibility.");
            return userUnits != null
                    && userUnits.stream().anyMatch(unit -> unit.getUnitType() == UnitType.RADIOLOGY);
        }

        if ("NURSE".equalsIgnoreCase(role)) {
            log.info("User is NURSE. Checking allowed activity types.");
            return isNurseAllowedActivityType(type);
        }

        // If none of the above conditions match, allow the activity
        log.info("Activity allowed by default.");
        return true;
    }

    private boolean isActivityApplicable(UserActivity activity, User user) {
        log.info(
                "Checking if activity {} is applicable to user {}", activity.getId(), user.getUsername());
        ActivityTarget activityTarget = activity.getActivityTarget();

        // If activity target is null or doesn't target specific patients, it's not
        // applicable
        if (activityTarget == null
                || activityTarget.getPatients() == null
                || activityTarget.getPatients().isEmpty()) {
            log.info("Activity target is null or has no patients. Not applicable.");
            return false;
        }

        // Iterate through each patient associated with the activity
        for (Patient activityPatient : activityTarget.getPatients()) {
            log.info("Checking authorization for patient: {}", activityPatient.getId());
            if (isUserAuthorizedForPatient(user, activityPatient)) {
                log.info("User is authorized for patient {}. Activity is applicable.", activityPatient.getId());
                return true; // User is authorized for at least one patient in the activity
            }
        }

        log.info("User is not authorized for any patients in the activity. Not applicable.");
        return false; // User is not authorized for any of the patients
    }

    private boolean isUserAuthorizedForPatient(User user, Patient patient) {
        log.info(
                "Checking if user {} is authorized for patient {}", user.getUsername(), patient.getId());

        // 3. Check if the patient is directly assigned to the user (Highest priority
        // now)
        if (user.getPatients() != null
                && user.getPatients().stream()
                        .anyMatch(assignedPatient -> assignedPatient.getId().equals(patient.getId()))) {
            log.info("User is directly assigned to patient. Authorized.");
            return true;
        }

        // 1. Check if user is assigned to the patient's Room (Second Highest Priority)
        if (patient.getRoom() != null
                && user.getRooms() != null
                && user.getRooms().stream().anyMatch(room -> room.getId().equals(patient.getRoom().getId()))) {
            log.info("User is assigned to patient's room. Authorized.");
            return true;
        }

        // 2. Check unit only if no direct assignment and no room assignment
        if (patient.getUnit() != null && user.getUnits() != null) {
            if (user.getRooms() == null || user.getRooms().isEmpty()) {
                if (user.getUnits().stream()
                        .anyMatch(unit -> unit.getId().equals(patient.getUnit().getId()))) {
                    log.info("User is assigned to patient's unit and has no room assignments. Authorized.");
                    return true;
                }
            } else {
                // Check if the user is assigned to ANY rooms within the patient's current unit
                boolean userAssignedToRoomInUnit = user.getRooms().stream()
                        .anyMatch(
                                room -> room.getUnit() != null
                                        && room.getUnit().getId().equals(patient.getUnit().getId()));

                if (!userAssignedToRoomInUnit) {
                    log.info(
                            "User is assigned to patient's unit, and patient is in a room, but user is not assigned to any specific rooms within that unit. Authorized.");
                    return true;
                } else {
                    log.info(
                            "User is assigned to patient's unit and to rooms within that unit, but not the patient's specific room. Not authorized by unit.");
                }
            }
        }

        log.info("User is not authorized for patient.");
        return false;
    }

    private Set<UnitType> getUserUnitTypes(User user) {
        Set<UnitType> unitTypes = new HashSet<>();
        if (user.getUnits() != null) {
            for (Unit unit : user.getUnits()) {
                unitTypes.add(unit.getUnitType());
            }
        }
        return unitTypes;
    }

    private boolean isNurseAllowedActivityType(UserActivityType type) {
        return type == UserActivityType.ASSESSMENT
                || type == UserActivityType.VITAL_SIGNS
                || type == UserActivityType.MEDICATION_ADMINISTRATION
                || type == UserActivityType.PRODUCT;
    }

    private boolean isNurseOnlyActivity(UserActivityType type) {
        return type == UserActivityType.VITAL_SIGNS
                || type == UserActivityType.MEDICATION_ADMINISTRATION
                || type == UserActivityType.ASSESSMENT;
    }

    @Transactional
    public UserActivityDTO updateActivityState(Long id, String state) {
        log.info("Updating activity with id : {} and state : {}", id, state);
        UserActivity userActivity = userActivityRepository
                .findById(id)
                .orElseThrow(
                        () -> {
                            log.error("Activity not found with ID: {}", id);
                            return new EntityNotFoundException("User not found with ID: " + id);
                        });
        userActivity.setState(state);

        UserActivity savedUserActivity = userActivityRepository.save(userActivity);
        log.info("User activity updated successfully with ID: {}", savedUserActivity.getId());

        return UserActivityDTO.fromEntity(savedUserActivity);
    }

    @Transactional
    public List<UserActivityDTO> getAllActivities() {
        log.info("Fetching all activities");
        return userActivityRepository.findAll().stream()
                .map(UserActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserActivityDTO getActivityById(Long id) {
        log.info("Fetching activity by ID : {}", id);
        UserActivity userActivity = userActivityRepository
                .findById(id)
                .orElseThrow(
                        () -> {
                            log.error("Activity not found with ID: {}", id);
                            return new EntityNotFoundException("Activity not found with ID: " + id);
                        });

        return UserActivityDTO.fromEntity(userActivity);
    }

    @Transactional
    public void deleteActivityById(Long id) {
        log.info("Deleting activity by ID : {}", id);
        if (!userActivityRepository.existsById(id)) {
            log.error("Activity not found with ID: {}", id);
            throw new EntityNotFoundException("Activity not found with ID: " + id);
        }
        userActivityRepository.deleteById(id);
    }
}