// backend/src/main/java/mine/profile/website/dtos/dashboard/bed/BedOccupancyDTO.java
package mine.profile.website.dtos.dashboard.bed;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BedOccupancyDTO {
    private Long unitId;
    private String unitName;
    private long totalBeds;
    private long occupiedBeds;
    private double occupancyRate; // Percentage
}