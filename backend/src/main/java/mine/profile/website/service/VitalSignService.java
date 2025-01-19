package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Nurse;
import mine.profile.website.models.Patient;
import mine.profile.website.models.User;
import mine.profile.website.models.VitalSign;
import mine.profile.website.repository.NurseRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.UserRepository;
import mine.profile.website.repository.VitalSignRepository;

@Service
public class VitalSignService {

    @Autowired
    private VitalSignRepository vitalSignRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private ScheduleService scheduleService;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public VitalSignDTO createVitalSign(VitalSignDTO vitalSignDTO) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "User not found with username: " + userDetails.getUsername()));

        Nurse nurse = nurseRepository.findByUser_Id(user.getId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Nurse not found with user id: " + user.getId()));

        Patient patient = patientRepository.findById(vitalSignDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + vitalSignDTO.getPatientId()));

        vitalSignDTO.setTimestamp(LocalDateTime.now());
        VitalSign vitalSign = entityMapper.toEntity(vitalSignDTO, patient);
        VitalSign savedVitalSign = vitalSignRepository.save(vitalSign);

        return entityMapper.toDto(savedVitalSign);
    }

    @Transactional(readOnly = true)
    public VitalSignDTO getVitalSignById(Long id) {
        VitalSign vitalSign = vitalSignRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("VitalSign not found with id: " + id));
        return entityMapper.toDto(vitalSign);
    }

    @Transactional(readOnly = true)
    public Page<VitalSignDTO> getAllVitalSigns(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VitalSign> vitalSignPage = vitalSignRepository.findAll(pageable);
        return vitalSignPage.map(entityMapper::toDto);
    }

    @Transactional
    public VitalSignDTO updateVitalSign(Long id, VitalSignDTO vitalSignDTO) {
        VitalSign existingVitalSign = vitalSignRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("VitalSign not found with id: " + id));

        Patient patient = patientRepository.findById(vitalSignDTO.getPatientId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Patient not found with id: " + vitalSignDTO.getPatientId()));

        VitalSign updatedVitalSign = entityMapper.toEntity(vitalSignDTO, patient);
        updatedVitalSign.setId(existingVitalSign.getId());

        VitalSign savedVitalSign = vitalSignRepository.save(updatedVitalSign);
        return entityMapper.toDto(savedVitalSign);
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
        return vitalSignPage.map(entityMapper::toDto);
    }

    // New method to find vital signs within a time window for a patient
    @Transactional(readOnly = true)
    public List<VitalSignDTO> findByPatientIdAndTimeWindow(Long patientId, LocalDateTime startTime,
            LocalDateTime endTime) {
        return vitalSignRepository.findByPatientIdAndTimestampBetween(patientId, startTime, endTime)
                .stream()
                .map(entityMapper::toDto)
                .collect(Collectors.toList());
    }

}
