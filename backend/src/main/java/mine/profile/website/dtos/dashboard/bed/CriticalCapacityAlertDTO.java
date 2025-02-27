// backend/src/main/java/mine/profile/website/dtos/dashboard/bed/CriticalCapacityAlertDTO.java
package mine.profile.website.dtos.dashboard.bed;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CriticalCapacityAlertDTO {
    private Long unitId;
    private String unitName;
    private double occupancyRate; // Percentage that triggered the alert
}