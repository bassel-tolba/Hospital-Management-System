package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
import mine.profile.website.models.Bed;
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
        try {
            User user = userRepository.getById(userId);
            List<UserActivity> pendingActivities = userActivityRepository.findAll();

            Set<Long> allPotentialUserPatients = new HashSet<>();
            List<String> allPotentialUserPatientsNames = new ArrayList<>();

            Set<UnitType> userUnitTypes = getUserUnitTypes(user);
            Set<Long> forcedActivities = new HashSet<>();

            if (user.getUnits() != null) {
                for (Unit unit : user.getUnits()) {
                    if (unit != null) {
                        if (unit.getRooms() != null) {
                            for (Room room : unit.getRooms()) {
                                if (room != null) {
                                    if (room.getBeds() != null) {
                                        for (Bed bed : room.getBeds()) {
                                            if (bed != null && bed.getAdmission() != null
                                                    && bed.getAdmission().getPatient() != null) {
                                                Patient patient = bed.getAdmission().getPatient();
                                                allPotentialUserPatients.add(patient.getId());
                                                allPotentialUserPatientsNames
                                                        .add(patient.getFirstName() + " " + patient.getLastName());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (user.getRooms() != null) {
                for (Room room : user.getRooms()) {
                    if (room != null) {
                        if (room.getBeds() != null) {
                            for (Bed bed : room.getBeds()) {
                                if (bed != null && bed.getAdmission() != null
                                        && bed.getAdmission().getPatient() != null) {
                                    Patient patient = bed.getAdmission().getPatient();
                                    allPotentialUserPatients.add(patient.getId());
                                    allPotentialUserPatientsNames
                                            .add(patient.getFirstName() + " " + patient.getLastName());
                                }
                            }
                        }
                    }
                }
            }

            if (user.getPatients() != null) {
                for (Patient patient : user.getPatients()) {
                    if (patient != null) {
                        allPotentialUserPatients.add(patient.getId());
                        allPotentialUserPatientsNames.add(patient.getFirstName() + " " + patient.getLastName());
                    }
                }
            }

            // Apply forced activity logic
            if (userUnitTypes.contains(UnitType.LABORATORY)) {
                forcedActivities.addAll(pendingActivities.stream()
                        .filter(activity -> activity.getActivityType() == UserActivityType.LAB_TEST)
                        .map(UserActivity::getId)
                        .collect(Collectors.toSet()));

            }
            if (userUnitTypes.contains(UnitType.RADIOLOGY)) {
                forcedActivities.addAll(pendingActivities.stream()
                        .filter(activity -> activity.getActivityType() == UserActivityType.IMAGE_REPORT)
                        .map(UserActivity::getId)
                        .collect(Collectors.toSet()));
            }

            Set<Long> finalForcedActivities = forcedActivities;
            return pendingActivities.stream()
                    .filter(activity -> isActivityApplicable(activity, allPotentialUserPatients, user.getUsername())
                            || finalForcedActivities.contains(activity.getId()))
                    .map(UserActivityDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Failed to get available activities for user with ID: " + userId + e);
            throw new RuntimeException("Failed to get available activities", e);
        }
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

    @Transactional
    private boolean isActivityApplicable(UserActivity activity, Set<Long> allPotentialUserPatients, String userName) {
        ActivityTarget activityTarget = activity.getActivityTarget();
        Set<Long> activityPatients = new HashSet<>();
        List<String> activityPatientsNames = new ArrayList<>();

        if (activityTarget.getUnit() != null) {
            activityTarget.getUnit().getRooms().stream()
                    .flatMap(room -> room.getBeds().stream())
                    .filter(bed -> bed.getAdmission() != null && bed.getAdmission().getPatient() != null)
                    .map(bed -> bed.getAdmission().getPatient())
                    .forEach(patient -> {
                        activityPatients.add(patient.getId());
                        activityPatientsNames.add(patient.getFirstName() + " " + patient.getLastName());

                    });

        }
        if (activityTarget.getRoom() != null) {
            activityTarget.getRoom().getBeds().stream()
                    .filter(bed -> bed.getAdmission() != null && bed.getAdmission().getPatient() != null)
                    .map(bed -> bed.getAdmission().getPatient())
                    .forEach(patient -> {
                        activityPatients.add(patient.getId());
                        activityPatientsNames.add(patient.getFirstName() + " " + patient.getLastName());
                    });
        }

        if (activityTarget.getPatients() != null) {
            activityTarget.getPatients().forEach(patient -> {
                activityPatients.add(patient.getId());
                activityPatientsNames.add(patient.getFirstName() + " " + patient.getLastName());

            });

        }

        // Check if there's any overlap
        return activityPatients.stream().anyMatch(allPotentialUserPatients::contains);
    }

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

    public List<UserActivityDTO> getAllActivities() {
        log.info("Fetching all activities");
        return userActivityRepository.findAll().stream()
                .map(UserActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public UserActivityDTO getActivityById(Long id) {
        log.info("Fetching activity by ID : {}", id);
        UserActivity userActivity = userActivityRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Activity not found with ID: {}", id);
                    return new EntityNotFoundException("Activity not found with ID: " + id);
                });

        return UserActivityDTO.fromEntity(userActivity);
    }

    public void deleteActivityById(Long id) {
        log.info("Deleting activity by ID : {}", id);
        if (!userActivityRepository.existsById(id)) {
            log.error("Activity not found with ID: {}", id);
            throw new EntityNotFoundException("Activity not found with ID: " + id);
        }
        userActivityRepository.deleteById(id);
    }
}