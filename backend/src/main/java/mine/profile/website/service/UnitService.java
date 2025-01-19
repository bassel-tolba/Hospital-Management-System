package mine.profile.website.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mine.profile.website.dtos.UnitDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Unit;
import mine.profile.website.repository.UnitRepository;

@Service
public class UnitService {

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Transactional
    public UnitDTO createUnit(UnitDTO unitDTO) {

        Unit unit = entityMapper.toEntity(unitDTO);
        Unit savedUnit = unitRepository.save(unit);
        return entityMapper.toDto(savedUnit);
    }

    @Transactional
    public UnitDTO getUnitById(Long id) {
        return unitRepository.findById(id)
                .map(entityMapper::toDto)
                .orElse(null);
    }

    @Transactional
    public List<UnitDTO> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(entityMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UnitDTO updateUnit(Long id, UnitDTO unitDTO) {
        return unitRepository.findById(id)
                .map(unit -> {

                    Unit unitEntity = entityMapper.toEntity(unitDTO);
                    unit.setUnitType(unitEntity.getUnitType());
                    return entityMapper.toDto(unitRepository.save(unit));
                })
                .orElse(null);
    }

    @Transactional
    public void deleteUnit(Long id) {
        unitRepository.deleteById(id);
    }

    @Transactional
    public List<UnitDTO> searchUnits(String searchTerm) {
        List<Unit> units = unitRepository.findByUnitTypeContaining(searchTerm);
        return units.stream()
                .map(entityMapper::toDto)
                .collect(Collectors.toList());
    }

}