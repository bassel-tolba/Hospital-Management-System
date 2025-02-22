package mine.profile.website.dtos.dashboard.admissions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataDTO {
    private String date;
    private Long count;
}