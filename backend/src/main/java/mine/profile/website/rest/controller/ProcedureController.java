package mine.profile.website.rest.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import mine.profile.website.dtos.ProcedureDTO;
import mine.profile.website.service.ProcedureService;

@RestController
@RequestMapping("/api/procedures")
public class ProcedureController {

    private static final Logger log = LoggerFactory.getLogger(ProcedureController.class);

    private final ProcedureService procedureService;

    public ProcedureController(ProcedureService procedureService) {
        this.procedureService = procedureService;
    }

    @PostMapping
    public ResponseEntity<ProcedureDTO> createProcedure(@RequestBody ProcedureDTO procedureDTO) {
        log.info("Received request to create procedure: {}", procedureDTO);
        ProcedureDTO createdProcedure = procedureService.createProcedure(procedureDTO);
        log.info("Procedure created successfully with ID: {}", createdProcedure.getId());
        return new ResponseEntity<>(createdProcedure, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ProcedureDTO>> getAllProcedures(Pageable pageable) {
        log.info("Received request to get all procedures with pageable: {}", pageable);
        Page<ProcedureDTO> procedures = procedureService.findAll(pageable);
        log.info("Retrieved {} procedures", procedures.getContent().size());
        return new ResponseEntity<>(procedures, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedureDTO> getProcedureById(@PathVariable Long id) {
        log.info("Received request to get procedure by ID: {}", id);
        ProcedureDTO procedure = procedureService.findById(id);
        log.info("Retrieved procedure with ID: {}", procedure.getId());
        return new ResponseEntity<>(procedure, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcedureDTO> updateProcedure(@PathVariable Long id, @RequestBody ProcedureDTO procedureDTO) {
        log.info("Received request to update procedure with ID: {}, Data: {}", id, procedureDTO);
        ProcedureDTO updatedProcedure = procedureService.updateProcedure(id, procedureDTO);
        log.info("Procedure updated successfully with ID: {}", updatedProcedure.getId());
        return new ResponseEntity<>(updatedProcedure, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProcedure(@PathVariable Long id) {
        log.info("Received request to delete procedure by ID: {}", id);
        procedureService.deleteById(id);
        log.info("Procedure deleted successfully with ID: {}", id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProcedureDTO>> searchProcedures(
            @RequestParam(value = "query", required = false) String query,
            Pageable pageable) {
        log.info("Received request to search procedures with query: {}, pageable: {}", query, pageable);
        Page<ProcedureDTO> procedures = procedureService.searchByNameOrCode(query, pageable);
        log.info("Search completed with {} results.", procedures.getTotalElements());
        return new ResponseEntity<>(procedures, HttpStatus.OK);
    }
}