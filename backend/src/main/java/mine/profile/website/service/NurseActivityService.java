package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import mine.profile.website.dtos.NurseActivityDTO;
import mine.profile.website.exception.ResourceNotFoundException;
import mine.profile.website.models.ActivityType;
import mine.profile.website.models.Nurse;
import mine.profile.website.models.NurseActivity;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.NurseActivityRepository;
import mine.profile.website.repository.NurseRepository;
import mine.profile.website.repository.PatientRepository;

@Service
public class NurseActivityService {
    private final NurseActivityRepository nurseActivityRepository;
    private final NurseRepository nurseRepository;
    private final PatientRepository patientRepository;

    public NurseActivityService(NurseActivityRepository nurseActivityRepository, NurseRepository nurseRepository,
            PatientRepository patientRepository) {
        this.nurseActivityRepository = nurseActivityRepository;
        this.nurseRepository = nurseRepository;
        this.patientRepository = patientRepository;
    }

    public NurseActivityDTO recordActivity(Long nurseId, String activityType, Long patientId, String notes) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        Patient patient = null;
        if (patientId != null) {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));
        }

        ActivityType activityTypeEnum = ActivityType.valueOf(activityType);

        NurseActivity nurseActivity = new NurseActivity(nurse, activityTypeEnum, LocalDateTime.now(), patient, notes);

        return NurseActivityDTO.toDto(nurseActivityRepository.save(nurseActivity));

    }

    public NurseActivityDTO getActivityById(Long id) {
        return NurseActivityDTO.toDto(nurseActivityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NurseActivity", "id", id)));
    }

    public List<NurseActivityDTO> getAllActivities() {
        return nurseActivityRepository.findAll().stream()
                .map(NurseActivityDTO::toDto)
                .collect(Collectors.toList());
    }

    public List<NurseActivityDTO> getAllActivitiesByNurse(Long nurseId) {
        nurseRepository.findById(nurseId)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse", "id", nurseId));
        return nurseActivityRepository.findByNurseId(nurseId).stream()
                .map(NurseActivityDTO::toDto)
                .collect(Collectors.toList());
    }

    public void deleteActivity(Long id) {
        NurseActivity nurseActivity = nurseActivityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NurseActivity", "id", id));
        nurseActivityRepository.delete(nurseActivity);
    }

}