// AppointmentController.java (UPDATED)
package mine.profile.website.rest.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping; // <-- ADD THIS IMPORT
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.AppointmentDTO;
import mine.profile.website.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO createdAppointment = appointmentService.createAppointment(appointmentDTO);
        return new ResponseEntity<>(createdAppointment, HttpStatus.CREATED);
    }

    // --- NEW METHOD TO HANDLE UPDATES ---
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(@PathVariable Long id,
            @RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO updatedAppointment = appointmentService.updateAppointment(id, appointmentDTO);
        return ResponseEntity.ok(updatedAppointment);
    }

    @GetMapping
    public ResponseEntity<Page<AppointmentDTO>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentDTO> appointments = appointmentService.getAllAppointments(pageable);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<AppointmentDTO>> getAppointmentsByPatientId(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatientId(patientId, pageable);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/patient/not-deleted/{patientId}")
    public ResponseEntity<Page<AppointmentDTO>> getAppointmentsByPatientIdAndNotDeleted(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatientIdAndNotDeleted(patientId,
                pageable);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AppointmentDTO>> getAppointmentsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentDTO> appointments = appointmentService.getAppointmentsByUserId(userId, pageable);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AppointmentDTO>> searchAppointments(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentDTO> appointments = appointmentService.searchAppointments(searchTerm, pageable);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/patient/{patientId}/user/{userId}")
    public ResponseEntity<Page<AppointmentDTO>> getAppointmentsByPatientIdAndUserId(
            @PathVariable Long patientId,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatientIdAndUserId(patientId, userId,
                pageable);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{id}/end")
    public ResponseEntity<AppointmentDTO> endAppointment(@PathVariable Long id) {
        AppointmentDTO updatedAppointment = appointmentService.endAppointment(id);
        return ResponseEntity.ok(updatedAppointment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}