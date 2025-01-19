package mine.profile.website.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import mine.profile.website.dtos.NurseDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.dtos.RoomDTO;
import mine.profile.website.dtos.UnitDTO;
import mine.profile.website.exception.ResourceNotFoundException;
import mine.profile.website.exception.UnauthorizedPatientAccessException;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Nurse;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.repository.NurseRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.RoomRepository;
import mine.profile.website.repository.UnitRepository;

@Service
public class NurseService {

    private final NurseRepository nurseRepository;
    private final PatientRepository patientRepository;
    private final UnitRepository unitRepository;
    private final RoomRepository roomRepository;
    private final ScheduleService scheduleService;
    private final EntityMapper entityMapper;

    public NurseService(NurseRepository nurseRepository, PatientRepository patientRepository,
            UnitRepository unitRepository, RoomRepository roomRepository, ScheduleService scheduleService,
            EntityMapper entityMapper) {
        this.nurseRepository = nurseRepository;
        this.patientRepository = patientRepository;
        this.unitRepository = unitRepository;
        this.roomRepository = roomRepository;
        this.scheduleService = scheduleService;
        this.entityMapper = entityMapper;
    }

    public NurseDTO createNurse(NurseDTO nurseDTO) {
        Nurse nurse = NurseDTO.toEntity(nurseDTO);
        Nurse createdNurse = nurseRepository.save(nurse);
        return NurseDTO.toDto(createdNurse);
    }

    public NurseDTO getNurseById(Long id) {
        Nurse nurse = nurseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", id));
        return NurseDTO.toDto(nurse);
    }

    public NurseDTO getNurseByUserId(Long userId) {
        Nurse nurse = nurseRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "userId", userId));
        return NurseDTO.toDto(nurse);
    }

    public Page<NurseDTO> getAllNurses(Pageable pageable) {
        Page<Nurse> nurses = nurseRepository.findAll(pageable);
        return nurses.map(NurseDTO::toDto);
    }

    public NurseDTO updateNurse(Long id, NurseDTO nurseDetails) {
        Nurse nurse = nurseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", id));
        nurse.setUser(NurseDTO.toEntity(nurseDetails).getUser());
        Nurse updatedNurse = nurseRepository.save(nurse);
        return NurseDTO.toDto(updatedNurse);
    }

    public void deleteNurse(Long id) {
        Nurse nurse = nurseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", id));
        nurseRepository.delete(nurse);
    }

    public void assignNurseToPatient(Long nurseId, Long patientId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));
        nurse.getPatients().add(patient);
        nurseRepository.save(nurse);
    }

    public void removeNurseFromPatient(Long nurseId, Long patientId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));
        nurse.getPatients().remove(patient);
        nurseRepository.save(nurse);
    }

    public void assignNurseToUnit(Long nurseId, Long unitId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", unitId));
        nurse.getUnits().add(unit);
        nurseRepository.save(nurse);
    }

    public void removeNurseFromUnit(Long nurseId, Long unitId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", unitId));
        nurse.getUnits().remove(unit);
        nurseRepository.save(nurse);
    }

    public void assignNurseToRoom(Long nurseId, Long roomId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        nurse.getRooms().add(room);
        nurseRepository.save(nurse);
    }

    public void removeNurseFromRoom(Long nurseId, Long roomId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        nurse.getRooms().remove(room);
        nurseRepository.save(nurse);
    }

    public List<PatientDTO> getAssignedPatients(Long nurseId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));

        List<Patient> allPatients = new ArrayList<>();

        // Fetch patients from assigned units
        for (Unit unit : nurse.getUnits()) {
            allPatients.addAll(patientRepository.findPatientsByUnitId(unit.getId()));
        }

        // Fetch patients from assigned rooms
        for (Room room : nurse.getRooms()) {
            allPatients.addAll(patientRepository.findPatientsByRoomId(room.getId()));
        }

        // Fetch patients directly assigned to the nurse if you keep the direct relation
        // allPatients.addAll(patientRepository.findPatientsByNurseId(nurseId));

        // Convert all unique patients to DTOs
        return allPatients.stream()
                .distinct()
                .map(PatientDTO::toDto)
                .collect(Collectors.toList());
    }

    public List<UnitDTO> getAssignedUnits(Long nurseId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        if (nurse.getUnits() == null) {
            return new ArrayList<>();
        }
        return nurse.getUnits().stream()
                .map(entityMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<RoomDTO> getAssignedRooms(Long nurseId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        if (nurse.getRooms() == null) {
            return new ArrayList<>();
        }
        return nurse.getRooms().stream()
                .map(entityMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPatientSchedules(Long nurseId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));

        List<Patient> allPatients = new ArrayList<>();
        // Fetch patients from assigned units
        for (Unit unit : nurse.getUnits()) {
            allPatients.addAll(patientRepository.findPatientsByUnitId(unit.getId()));
        }

        // Fetch patients from assigned rooms
        for (Room room : nurse.getRooms()) {
            allPatients.addAll(patientRepository.findPatientsByRoomId(room.getId()));
        }

        // Fetch patients directly assigned to the nurse if you keep the direct relation
        // allPatients.addAll(patientRepository.findPatientsByNurseId(nurseId));

        List<Map<String, Object>> schedules = new ArrayList<>();

        for (Patient patient : allPatients) {
            // Assuming patients have a relation to a unit, this will be the correct way to
            // access it.
            String unitType = patient.getAdmissions().get(0).getBed().getRoom().getUnit().getUnitType().toString();
            int timeWindowMinutes = getTimeWindowForUnit(unitType);
            // generate schedule for each patient
            List<Map<String, Object>> patientSchedule = scheduleService.generatePatientSchedule(patient,
                    timeWindowMinutes);
            schedules.addAll(patientSchedule);
        }
        return schedules;
    }

    private int getTimeWindowForUnit(String unitType) {
        switch (unitType) {
            case "ICU":
            case "CCU":
            case "NICU":
            case "EMERGENCY":
                return 15; // 15 minutes for these units
            case "WARD":
            case "GENERAL_MEDICAL":
            case "GENERAL_SURGICAL":
            case "PEDIATRIC":
            case "OBSTETRICS_GYNECOLOGY":
            case "ORTHOPEDIC":
            case "ONCOLOGY":
            case "DIALYSIS":
            case "PSYCHIATRIC":
            case "NEUROLOGY":
            case "PULMONARY":
            case "GASTROENTEROLOGY":
            case "OPHTHALMOLOGY":
            case "ENT":
            case "DERMATOLOGY":
            case "REHABILITATION":
            case "INFECTIOUS_DISEASE":
            case "OPERATING_ROOM":
                return 4 * 60; // 4 hours for these units
            default:
                return 4 * 60; // Default to 4 hours if the unit type is not recognized
        }
    }

    public void authorizeNurseForPatient(Long nurseId, Long patientId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Check if the patient is in any of the Nurse assigned Unit or Rooms
        boolean isAuthorized = nurse.getUnits().stream()
                .anyMatch(unit -> patientRepository.findPatientsByUnitId(unit.getId()).contains(patient))
                || nurse.getRooms().stream()
                        .anyMatch(room -> patientRepository.findPatientsByRoomId(room.getId()).contains(patient))
                || nurse.getPatients().contains(patient);

        if (!isAuthorized) {
            throw new UnauthorizedPatientAccessException(
                    "Nurse is not authorized to access data for patient with id: " + patientId);
        }

    }

    public PatientDTO getPatientDetails(Long nurseId, Long patientId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Check if the patient is in any of the Nurse assigned Unit or Rooms
        boolean isAuthorized = nurse.getUnits().stream()
                .anyMatch(unit -> patientRepository.findPatientsByUnitId(unit.getId()).contains(patient))
                || nurse.getRooms().stream()
                        .anyMatch(room -> patientRepository.findPatientsByRoomId(room.getId()).contains(patient))
                || nurse.getPatients().contains(patient);

        if (!isAuthorized) {
            throw new UnauthorizedPatientAccessException(
                    "Nurse is not authorized to access data for patient with id: " + patientId);
        }

        return PatientDTO.toDto(patient);
    }

    // Updated method to fetch patients by unit
    public List<PatientDTO> getPatientsByUnit(Long nurseId, Long unitId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Unit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", unitId));

        if (!nurse.getUnits().contains(unit)) {
            throw new UnauthorizedPatientAccessException(
                    "Nurse is not authorized to access data for unit with id " + unitId);
        }

        List<Patient> patientsInUnit = patientRepository.findPatientsByUnitId(unitId);

        return patientsInUnit.stream()
                .map(PatientDTO::toDto)
                .collect(Collectors.toList());
    }
}