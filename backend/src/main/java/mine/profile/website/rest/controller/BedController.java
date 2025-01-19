package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
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

import mine.profile.website.dtos.BedDTO;
import mine.profile.website.service.BedService;

@RestController
@RequestMapping("/beds")
public class BedController {

    @Autowired
    private BedService bedService;

    @PostMapping
    public ResponseEntity<BedDTO> createBed(@RequestBody BedDTO bedDTO) {
        BedDTO createdBed = bedService.createBed(bedDTO);
        return new ResponseEntity<>(createdBed, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BedDTO> getBedById(@PathVariable Long id) {
        BedDTO bedDTO = bedService.getBedById(id);
        return new ResponseEntity<>(bedDTO, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Page<BedDTO>> getAllBeds(
            @RequestParam(name = "searchTerm", required = false) String searchTerm,
            @RequestParam(name = "roomId", required = false) Long roomId,
            @RequestParam(name = "unitId", required = false) Long unitId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Page<BedDTO> bedsPage = bedService.searchBeds(searchTerm, roomId, unitId, page, size);
        return new ResponseEntity<>(bedsPage, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BedDTO> updateBed(@PathVariable Long id, @RequestBody BedDTO bedDTO) {
        BedDTO updatedBed = bedService.updateBed(id, bedDTO);
        return new ResponseEntity<>(updatedBed, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/free-expired")
    public ResponseEntity<String> freeAllExpiredBeds() {
        bedService.freeAllExpiredBeds();
        return ResponseEntity.ok("Free all expired beds");
    }
}