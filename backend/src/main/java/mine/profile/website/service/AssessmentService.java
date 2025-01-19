package mine.profile.website.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.AssessmentDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Assessment;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.AssessmentRepository;
import mine.profile.website.repository.PatientRepository;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Transactional
    public AssessmentDTO createAssessment(AssessmentDTO assessmentDTO) {
        Patient patient = patientRepository.findById(assessmentDTO.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + assessmentDTO.getPatientId()));

        Assessment assessment = entityMapper.toEntity(assessmentDTO, patient);
        Assessment savedAssessment = assessmentRepository.save(assessment);
        return entityMapper.toDto(savedAssessment);
    }

    @Transactional
    public AssessmentDTO getAssessmentById(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found with id: " + id));
        return entityMapper.toDto(assessment);
    }

    @Transactional
    public Page<AssessmentDTO> findByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Assessment> assessmentPage = assessmentRepository.findByPatientId(patientId, pageable);
        return assessmentPage.map(entityMapper::toDto);
    }

    @Transactional
    public AssessmentDTO updateAssessment(Long id, AssessmentDTO assessmentDTO) {
        Assessment existingAssessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found with id: " + id));
        Patient patient = patientRepository.findById(assessmentDTO.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + assessmentDTO.getPatientId()));

        existingAssessment.setAssessmentDateTime(assessmentDTO.getAssessmentDateTime());
        existingAssessment.setNotes(assessmentDTO.getNotes());
        existingAssessment.setPatient(patient);

        Assessment updatedAssessment = assessmentRepository.save(existingAssessment);
        return entityMapper.toDto(updatedAssessment);
    }

    @Transactional
    public void deleteAssessment(Long id) {
        if (!assessmentRepository.existsById(id)) {
            throw new EntityNotFoundException("Assessment not found with id: " + id);
        }
        assessmentRepository.deleteById(id);
    }
}