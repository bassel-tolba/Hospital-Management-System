package mine.profile.website.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.VitalSignRepository;

@Service
public class ScheduleService {

    @Autowired
    private VitalSignRepository vitalSignRepository;
    @Autowired
    private PatientRepository patientRepository;

    // Modified generatePatientSchedule to only create a schedule if no recent
    // vitals
    public List<Map<String, Object>> generatePatientSchedule(Patient patient, int timeWindowMinutes) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime timeWindowStart = now.minusMinutes(timeWindowMinutes);

        List<VitalSignDTO> recentVitals = vitalSignRepository
                .findByPatientIdAndTimestampBetween(patient.getId(), timeWindowStart, now).stream()
                .map(vitalSign -> {
                    VitalSignDTO vitalSignDTO = new VitalSignDTO();
                    vitalSignDTO.setId(vitalSign.getId());
                    vitalSignDTO.setTimestamp(vitalSign.getTimestamp());
                    vitalSignDTO.setPatientId(vitalSign.getPatient().getId());
                    return vitalSignDTO;
                }).toList();

        if (!recentVitals.isEmpty()) {
            return new ArrayList<>(); // Return empty list, no new schedule needed
        }

        List<Map<String, Object>> patientSchedule = new ArrayList<>();

        Map<String, Object> vitalSignsTask = new HashMap<>();
        vitalSignsTask.put("task", "Record Vital Signs");
        vitalSignsTask.put("scheduledTime", now);
        Map<String, Object> patientInfo = new HashMap<>();
        patientInfo.put("id", patient.getId());
        patientInfo.put("firstName", patient.getFirstName());
        patientInfo.put("lastName", patient.getLastName());
        patientInfo.put("dateOfBirth", patient.getDateOfBirth());
        patientInfo.put("gender", patient.getGender());
        vitalSignsTask.put("patient", patientInfo);
        patientSchedule.add(vitalSignsTask);
        return patientSchedule;
    }

    // Removed generateSchedulesForAllUnits,removeAndCreateSchedulesForAllUnits
    // No longer needed since the scheduling logic is done directly in
    // getPatientSchedules

}