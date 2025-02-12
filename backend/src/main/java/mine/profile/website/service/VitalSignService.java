package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.models.Patient;
import mine.profile.website.models.VitalSign;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.VitalSignRepository;

@Service
public class VitalSignService {

    @Autowired
    private VitalSignRepository vitalSignRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Transactional
    public VitalSignDTO createVitalSign(VitalSignDTO vitalSignDTO) {

        Patient patient = patientRepository.findById(vitalSignDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + vitalSignDTO.getPatientId()));

        vitalSignDTO.setTimestamp(LocalDateTime.now());
        VitalSign vitalSign = vitalSignDTO.toEntity(patient);
        VitalSign savedVitalSign = vitalSignRepository.save(vitalSign);

        return VitalSignDTO.toDto(savedVitalSign);
    }

    @Transactional(readOnly = true)
    public VitalSignDTO getVitalSignById(Long id) {
        VitalSign vitalSign = vitalSignRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("VitalSign not found with id: " + id));
        return VitalSignDTO.toDto(vitalSign);
    }

    @Transactional(readOnly = true)
    public Page<VitalSignDTO> getAllVitalSigns(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VitalSign> vitalSignPage = vitalSignRepository.findAll(pageable);
        return vitalSignPage.map(VitalSignDTO::toDto);
    }

    @Transactional
    public VitalSignDTO updateVitalSign(Long id, VitalSignDTO vitalSignDTO) {
        VitalSign existingVitalSign = vitalSignRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("VitalSign not found with id: " + id));

        Patient patient = patientRepository.findById(vitalSignDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + vitalSignDTO.getPatientId()));

        VitalSign updatedVitalSign = vitalSignDTO.toEntity(patient);
        updatedVitalSign.setId(existingVitalSign.getId());

        VitalSign savedVitalSign = vitalSignRepository.save(updatedVitalSign);
        return VitalSignDTO.toDto(savedVitalSign);
    }

    @Transactional
    public void deleteVitalSign(Long id) {
        if (!vitalSignRepository.existsById(id)) {
            throw new EntityNotFoundException("VitalSign not found with id: " + id);
        }
        vitalSignRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<VitalSignDTO> findByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VitalSign> vitalSignPage = vitalSignRepository.findByPatientId(patientId, pageable);
        return vitalSignPage.map(VitalSignDTO::toDto);
    }

    // New method to find vital signs within a time window for a patient
    @Transactional(readOnly = true)
    public List<VitalSignDTO> findByPatientIdAndTimeWindow(Long patientId, LocalDateTime startTime,
            LocalDateTime endTime) {
        return vitalSignRepository.findByPatientIdAndTimestampBetween(patientId, startTime, endTime)
                .stream()
                .map(VitalSignDTO::toDto)
                .collect(Collectors.toList());
    }
}