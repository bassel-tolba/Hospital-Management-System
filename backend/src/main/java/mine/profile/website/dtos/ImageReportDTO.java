package mine.profile.website.dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ImageReportDTO {
    private Long id;
    private LocalDateTime reportDateTime;
    private String description;
    private String reportText;
    private String imageType;
    private List<String> imageUrls;
    private Long patientId;
    private Long performedById;
    private String performedByName;
    private Long imageReportTypeId;
    private Long billingId;
}