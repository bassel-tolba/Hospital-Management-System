package mine.profile.website.dtos;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdmissionDTO {
    private Long id;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private Long patientId;
    private String patientName;
    private Long bedId;
}