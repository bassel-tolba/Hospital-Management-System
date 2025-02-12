package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
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
    public UserActivityDTO createUserActivity(UserActivityDTO userActivityDTO) {
        log.info("Creating user activity with details: {}", userActivityDTO);

        ActivityTarget activityTarget = new ActivityTarget();
        if (userActivityDTO.getPatientIds() != null && !userActivityDTO.getPatientIds().isEmpty()) {
            List<Patient> patients = patientRepository.findAllById(userActivityDTO.getPatientIds());
            activityTarget.setPatients(patients);
        } else if (userActivityDTO.getRoomId() != null) {
            Room room = roomRepository.findById(userActivityDTO.getRoomId())
                    .orElseThrow(() -> new EntityNotFoundException("Room not found"));
            activityTarget.setRoom(room);
            activityTarget.setPatients(room.getBeds().stream()
                    .filter(bed -> bed.getAdmission() != null)
                    .map(bed -> bed.getAdmission().getPatient())
                    .collect(Collectors.toList()));

        } else if (userActivityDTO.getUnitId() != null) {
            Unit unit = unitRepository.findById(userActivityDTO.getUnitId())
                    .orElseThrow(() -> new EntityNotFoundException("Unit not found"));
            activityTarget.setUnit(unit);
            activityTarget.setPatients(unit.getRooms().stream()
                    .flatMap(room -> room.getBeds().stream())
                    .filter(bed -> bed.getAdmission() != null)
                    .map(bed -> bed.getAdmission().getPatient())
                    .collect(Collectors.toList()));

        }

        activityTarget = activityTargetRepository.save(activityTarget);

        UserActivity userActivity = userActivityDTO.toEntity();
        userActivity.setActivityTarget(activityTarget);
        userActivity.setTimestamp(LocalDateTime.now());
        UserActivity savedUserActivity = userActivityRepository.save(userActivity);
        log.info("User activity created successfully with ID: {}", savedUserActivity.getId());

        return UserActivityDTO.fromEntity(savedUserActivity);
    }

    @Transactional
    public List<UserActivityDTO> getAvailableActivitiesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("User is not enabled");
        }

        List<UserActivity> pendingActivities = userActivityRepository.findByStateIgnoreCaseOrStateIgnoreCase("pending",
                "inprogress"); // Query by state
        List<Unit> userUnits = user.getUnits();

        return pendingActivities.stream()
                .filter(activity -> isActivityApplicable(activity, user))
                // Apply Role and Unit-Based filtering
                .filter(activity -> isAllowedActivity(activity, user, userUnits))
                .map(UserActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private boolean isAllowedActivity(UserActivity activity, User user, List<Unit> userUnits) {
        UserActivityType type = activity.getActivityType();
        String role = user.getRoleName();

        if ("LAB_TECHNICIAN".equalsIgnoreCase(role) && type == UserActivityType.LAB_TEST) {
            return userUnits != null && userUnits.stream().anyMatch(unit -> unit.getUnitType() == UnitType.LABORATORY);
        }

        if ("RADIOLOGY_TECHNICIAN".equalsIgnoreCase(role) && type == UserActivityType.IMAGE_REPORT) {
            return userUnits != null && userUnits.stream().anyMatch(unit -> unit.getUnitType() == UnitType.RADIOLOGY);
        }

        if ("NURSE".equalsIgnoreCase(role)) {
            return isNurseAllowedActivityType(type);
        }

        // If none of the above conditions match, allow the activity
        return true;
    }

    private boolean isActivityApplicable(UserActivity activity, User user) {
        ActivityTarget activityTarget = activity.getActivityTarget();

        // If activity target is null or doesn't target specific patients, it's not
        // applicable
        if (activityTarget == null || activityTarget.getPatients() == null || activityTarget.getPatients().isEmpty()) {
            return false;
        }

        // Iterate through each patient associated with the activity
        for (Patient activityPatient : activityTarget.getPatients()) {
            if (isUserAuthorizedForPatient(user, activityPatient)) {
                return true; // User is authorized for at least one patient in the activity
            }
        }

        return false; // User is not authorized for any of the patients
    }

    private boolean isUserAuthorizedForPatient(User user, Patient patient) {
        // 1. Check if user is assigned to the patient's Unit
        if (patient.getUnit() != null && user.getUnits() != null
                && user.getUnits().stream().anyMatch(unit -> unit.getId().equals(patient.getUnit().getId()))) {
            return true;
        }

        // 2. Check if user is assigned to the patient's Room
        if (patient.getRoom() != null && user.getRooms() != null
                && user.getRooms().stream().anyMatch(room -> room.getId().equals(patient.getRoom().getId()))) {
            return true;
        }

        // 3. Check if the patient is directly assigned to the user
        if (user.getPatients() != null && user.getPatients().stream()
                .anyMatch(assignedPatient -> assignedPatient.getId().equals(patient.getId()))) {
            return true;
        }

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
        return type == UserActivityType.ASSESSMENT ||
                type == UserActivityType.VITAL_SIGNS ||
                type == UserActivityType.MEDICATION_ADMINISTRATION ||
                type == UserActivityType.PRODUCT;
    }

    private boolean isNurseOnlyActivity(UserActivityType type) {
        return type == UserActivityType.VITAL_SIGNS ||
                type == UserActivityType.MEDICATION_ADMINISTRATION ||
                type == UserActivityType.ASSESSMENT;
    }

    @Transactional
    public UserActivityDTO updateActivityState(Long id, String state) {
        log.info("Updating activity with id : {} and state : {}", id, state);
        UserActivity userActivity = userActivityRepository.findById(id)
                .orElseThrow(() -> {
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
        UserActivity userActivity = userActivityRepository.findById(id)
                .orElseThrow(() -> {
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