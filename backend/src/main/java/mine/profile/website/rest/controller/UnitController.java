package mine.profile.website.rest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import mine.profile.website.dtos.UnitDTO;
import mine.profile.website.service.UnitService;

@RestController
@RequestMapping("/api/units")
public class UnitController {

    @Autowired
    private UnitService unitService;

    @PostMapping
    public ResponseEntity<UnitDTO> createUnit(@RequestBody UnitDTO unitDTO) {
        UnitDTO createdUnit = unitService.createUnit(unitDTO);
        return new ResponseEntity<>(createdUnit, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitDTO> getUnitById(@PathVariable Long id) {
        UnitDTO unitDTO = unitService.getUnitById(id);
        if (unitDTO != null) {
            return new ResponseEntity<>(unitDTO, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<UnitDTO>> getAllUnits() {
        List<UnitDTO> units = unitService.getAllUnits();
        return new ResponseEntity<>(units, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitDTO> updateUnit(@PathVariable Long id, @RequestBody UnitDTO unitDTO) {
        UnitDTO updatedUnit = unitService.updateUnit(id, unitDTO);
        if (updatedUnit != null) {
            return new ResponseEntity<>(updatedUnit, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        unitService.deleteUnit(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UnitDTO>> searchUnits(@RequestParam String searchTerm) {
        if (searchTerm == null) {
            searchTerm = new String();
        }
        List<UnitDTO> units = unitService.searchUnits(searchTerm);
        return new ResponseEntity<>(units, HttpStatus.OK);
    }
}