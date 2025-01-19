package mine.profile.website.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.ProcedureDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Procedure;
import mine.profile.website.repository.ProcedureRepository;

@Service
public class ProcedureService {

    private final ProcedureRepository procedureRepository;
    private final EntityMapper entityMapper;

    public ProcedureService(ProcedureRepository procedureRepository, EntityMapper entityMapper) {
        this.procedureRepository = procedureRepository;
        this.entityMapper = entityMapper;
    }

    @Transactional
    public ProcedureDTO createProcedure(ProcedureDTO dto) {
        Procedure procedure = entityMapper.toEntity(dto);
        Procedure savedProcedure = procedureRepository.save(procedure);
        return entityMapper.toDto(savedProcedure);
    }

    @Transactional
    public Page<ProcedureDTO> findAll(Pageable pageable) {
        Page<Procedure> procedurePage = procedureRepository.findAll(pageable);
        return procedurePage.map(entityMapper::toDto);
    }

    @Transactional
    public ProcedureDTO findById(Long id) {
        return entityMapper.toDto(procedureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Procedure ID: " + id)));
    }

    @Transactional
    public ProcedureDTO updateProcedure(Long id, ProcedureDTO procedureDTO) {
        Procedure existingProcedure = procedureRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Procedure not found with id: " + id));

        // Update the fields of the existing procedure with the values from the DTO
        existingProcedure.setCode(procedureDTO.getCode());
        existingProcedure.setName(procedureDTO.getName());
        existingProcedure.setPrice(procedureDTO.getPrice());

        Procedure updatedProcedure = procedureRepository.save(existingProcedure);
        return entityMapper.toDto(updatedProcedure);
    }

    @Transactional
    public void deleteById(Long id) {
        procedureRepository.deleteById(id);
    }

    // New method for searching by name or code with pagination
    @Transactional
    public Page<ProcedureDTO> searchByNameOrCode(String searchTerm, Pageable pageable) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return procedureRepository.findAll(pageable).map(entityMapper::toDto);
        }
        Page<Procedure> procedurePage = procedureRepository.searchByNameOrCode(searchTerm, pageable);
        return procedurePage.map(entityMapper::toDto);
    }
}