package mine.profile.website.dtos.dashboard.patientstatus;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientStatusOverviewDTO {
    private long activePatientsCount;
    private Map<Integer, Long> patientsBySeverityLevel; // <SeverityLevel, Count>
}