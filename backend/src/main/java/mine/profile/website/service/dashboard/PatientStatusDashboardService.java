package mine.profile.website.service.dashboard;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import mine.profile.website.dtos.dashboard.patientstatus.PatientStatusOverviewDTO;
import mine.profile.website.repository.PatientRepository;

@Service
@RequiredArgsConstructor
public class PatientStatusDashboardService {

    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public PatientStatusOverviewDTO getPatientStatusOverview() {
        // Count active patients (patients with an active admission)
        long activePatientsCount = patientRepository.findAll().stream()
                .filter(patient -> patient.getCurrentAdmission().isPresent())
                .count();

        // Count patients by severity level. Efficient single query approach.
        List<Object[]> severityCounts = patientRepository.countPatientsBySeverityLevel();
        Map<Integer, Long> patientsBySeverityLevel = severityCounts.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0], // Severity Level
                        row -> (Long) row[1] // Count
                ));

        return new PatientStatusOverviewDTO(activePatientsCount, patientsBySeverityLevel);
    }
}