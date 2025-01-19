package mine.profile.website.rest.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.NurseActivityDTO;
import mine.profile.website.dtos.NurseDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.dtos.RoomDTO;
import mine.profile.website.dtos.UnitDTO;
import mine.profile.website.service.NurseActivityService;
import mine.profile.website.service.NurseService;

@RestController
@RequestMapping("/api/nurses")
public class NurseController {
    private final NurseService nurseService;
    private final NurseActivityService nurseActivityService;

    public NurseController(NurseService nurseService, NurseActivityService nurseActivityService) {
        this.nurseService = nurseService;
        this.nurseActivityService = nurseActivityService;
    }

    @PostMapping
    public ResponseEntity<NurseDTO> createNurse(@RequestBody NurseDTO nurse) {
        NurseDTO createdNurse = nurseService.createNurse(nurse);
        return new ResponseEntity<>(createdNurse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NurseDTO> getNurseById(@PathVariable Long id) {
        NurseDTO nurse = nurseService.getNurseById(id);
        return ResponseEntity.ok(nurse);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<NurseDTO> getNurseByUserId(@PathVariable Long userId) {
        NurseDTO nurse = nurseService.getNurseByUserId(userId);
        return ResponseEntity.ok(nurse);
    }

    @GetMapping
    public ResponseEntity<Page<NurseDTO>> getAllNurses(Pageable pageable) {
        Page<NurseDTO> nurses = nurseService.getAllNurses(pageable);
        return ResponseEntity.ok(nurses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NurseDTO> updateNurse(@PathVariable Long id, @RequestBody NurseDTO nurseDetails) {
        NurseDTO updatedNurse = nurseService.updateNurse(id, nurseDetails);
        return ResponseEntity.ok(updatedNurse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNurse(@PathVariable Long id) {
        nurseService.deleteNurse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{nurseId}/patients/{patientId}")
    public ResponseEntity<Void> assignNurseToPatient(@PathVariable Long nurseId, @PathVariable Long patientId) {
        nurseService.assignNurseToPatient(nurseId, patientId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{nurseId}/patients/{patientId}")
    public ResponseEntity<Void> removeNurseFromPatient(@PathVariable Long nurseId, @PathVariable Long patientId) {
        nurseService.removeNurseFromPatient(nurseId, patientId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{nurseId}/units/{unitId}")
    public ResponseEntity<Void> assignNurseToUnit(@PathVariable Long nurseId, @PathVariable Long unitId) {
        nurseService.assignNurseToUnit(nurseId, unitId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{nurseId}/units/{unitId}")
    public ResponseEntity<Void> removeNurseFromUnit(@PathVariable Long nurseId, @PathVariable Long unitId) {
        nurseService.removeNurseFromUnit(nurseId, unitId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{nurseId}/rooms/{roomId}")
    public ResponseEntity<Void> assignNurseToRoom(@PathVariable Long nurseId, @PathVariable Long roomId) {
        nurseService.assignNurseToRoom(nurseId, roomId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{nurseId}/rooms/{roomId}")
    public ResponseEntity<Void> removeNurseFromRoom(@PathVariable Long nurseId, @PathVariable Long roomId) {
        nurseService.removeNurseFromRoom(nurseId, roomId);
        return ResponseEntity.noContent().build();
    }

    // Nurse Activity Endpoints

    @PostMapping("/{nurseId}/activities")
    public ResponseEntity<NurseActivityDTO> recordNurseActivity(
            @PathVariable Long nurseId,
            @RequestParam String activityType,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String notes) {
        NurseActivityDTO createdActivity = nurseActivityService.recordActivity(nurseId, activityType, patientId, notes);
        return new ResponseEntity<>(createdActivity, HttpStatus.CREATED);
    }

    @GetMapping("/activities")
    public ResponseEntity<List<NurseActivityDTO>> getAllActivities() {
        List<NurseActivityDTO> activities = nurseActivityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/{nurseId}/activities")
    public ResponseEntity<List<NurseActivityDTO>> getAllActivitiesByNurse(@PathVariable Long nurseId) {
        List<NurseActivityDTO> activities = nurseActivityService.getAllActivitiesByNurse(nurseId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/activities/{activityId}")
    public ResponseEntity<NurseActivityDTO> getActivityById(@PathVariable Long activityId) {
        NurseActivityDTO activity = nurseActivityService.getActivityById(activityId);
        return ResponseEntity.ok(activity);
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long activityId) {
        nurseActivityService.deleteActivity(activityId);
        return ResponseEntity.noContent().build();
    }

    // Patient data and schedules endpoints
    @GetMapping("/{nurseId}/patients")
    public ResponseEntity<List<PatientDTO>> getAssignedPatients(@PathVariable Long nurseId) {
        List<PatientDTO> patients = nurseService.getAssignedPatients(nurseId);
        return ResponseEntity.ok(patients);

    }

    @GetMapping("/{nurseId}/schedules")
    public ResponseEntity<List<Map<String, Object>>> getPatientSchedules(@PathVariable Long nurseId) {
        List<Map<String, Object>> schedules = nurseService.getPatientSchedules(nurseId);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{nurseId}/patients/{patientId}")
    public ResponseEntity<PatientDTO> getPatientDetails(@PathVariable Long nurseId, @PathVariable Long patientId) {
        PatientDTO patient = nurseService.getPatientDetails(nurseId, patientId);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/{nurseId}/units")
    public ResponseEntity<List<UnitDTO>> getAssignedUnits(@PathVariable Long nurseId) {
        List<UnitDTO> units = nurseService.getAssignedUnits(nurseId);
        return ResponseEntity.ok(units);
    }

    @GetMapping("/{nurseId}/rooms")
    public ResponseEntity<List<RoomDTO>> getAssignedRooms(@PathVariable Long nurseId) {
        List<RoomDTO> rooms = nurseService.getAssignedRooms(nurseId);
        return ResponseEntity.ok(rooms);
    }

    // New endpoint
    @GetMapping("/{nurseId}/units/{unitId}/patients")
    public ResponseEntity<List<PatientDTO>> getPatientsByUnit(@PathVariable Long nurseId, @PathVariable Long unitId) {
        List<PatientDTO> patients = nurseService.getPatientsByUnit(nurseId, unitId);
        return ResponseEntity.ok(patients);
    }
}