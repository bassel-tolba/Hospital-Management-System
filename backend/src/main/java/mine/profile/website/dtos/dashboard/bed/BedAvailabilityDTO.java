// backend/src/main/java/mine/profile/website/dtos/dashboard/bed/BedAvailabilityDTO.java
package mine.profile.website.dtos.dashboard.bed;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BedAvailabilityDTO {
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
}