package mine.profile.website.rest.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.ProcedureLogDTO;
import mine.profile.website.service.ProcedureLogService;

@RestController
@RequestMapping("/api/procedure-logs")
public class ProcedureLogController {

    private final ProcedureLogService procedureLogService;

    public ProcedureLogController(ProcedureLogService procedureLogService) {
        this.procedureLogService = procedureLogService;
    }

    @PostMapping
    public ResponseEntity<ProcedureLogDTO> createProcedureLog(@RequestBody ProcedureLogDTO procedureLogDTO) {
        ProcedureLogDTO createdLog = procedureLogService.createProcedureLog(procedureLogDTO);
        return new ResponseEntity<>(createdLog, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedureLogDTO> getProcedureLogById(@PathVariable Long id) {
        ProcedureLogDTO procedureLogDTO = procedureLogService.findById(id);
        return ResponseEntity.ok(procedureLogDTO);
    }

    @GetMapping
    public ResponseEntity<List<ProcedureLogDTO>> getAllProcedureLogs() {
        List<ProcedureLogDTO> procedureLogs = procedureLogService.findAll();
        return ResponseEntity.ok(procedureLogs);
    }

    // Updated endpoint for searching by patientId with pagination
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<ProcedureLogDTO>> getProcedureLogsByPatientId(
            @PathVariable Long patientId, Pageable pageable) { // Add Pageable parameter
        Page<ProcedureLogDTO> procedureLogsPage = procedureLogService.findByPatientId(patientId, pageable);
        return ResponseEntity.ok(procedureLogsPage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProcedureLog(@PathVariable Long id) {
        procedureLogService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}