package mine.profile.website.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.UnitDTO;
import mine.profile.website.models.Unit;
import mine.profile.website.models.UnitType;
import mine.profile.website.repository.UnitRepository;

@Service
public class UnitService {
    private static final Logger log = LoggerFactory.getLogger(UnitService.class);

    @Autowired
    private UnitRepository unitRepository;

    @Transactional
    public UnitDTO createUnit(UnitDTO unitDTO) {
        Unit unit = unitDTO.toEntity();
        Unit savedUnit = unitRepository.save(unit);
        return new UnitDTO(savedUnit);
    }

    @Transactional(readOnly = true)
    public UnitDTO getUnitById(Long id) {
        return unitRepository.findById(id)
                .map(UnitDTO::new)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<UnitDTO> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(UnitDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UnitDTO updateUnit(Long id, UnitDTO unitDTO) {
        return unitRepository.findById(id)
                .map(unit -> {
                    Unit updatedUnit = unitDTO.toEntity();
                    unit.setUnitType(updatedUnit.getUnitType());
                    unit.setName(updatedUnit.getName());
                    unit.setLocation(updatedUnit.getLocation());
                    unit.setDescription(updatedUnit.getDescription());
                    return new UnitDTO(unitRepository.save(unit));
                })
                .orElse(null);
    }

    @Transactional
    public void deleteUnit(Long id) {
        unitRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UnitDTO> searchUnits(String searchTerm) {
        List<Unit> units = unitRepository.findByNameContaining(searchTerm);
        return units.stream()
                .map(UnitDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UnitDTO> getUnitsByType(String unitTypeStr) {
        log.info("Fetching units by type: {}", unitTypeStr);
        try {
            UnitType unitType = UnitType.valueOf(unitTypeStr.toUpperCase());
            List<Unit> units = unitRepository.findByUnitType(unitType);
            return units.stream()
                    .map(UnitDTO::new)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.error("Invalid unit type string provided: {}", unitTypeStr, e);
            return Collections.emptyList();
        }
    }
}