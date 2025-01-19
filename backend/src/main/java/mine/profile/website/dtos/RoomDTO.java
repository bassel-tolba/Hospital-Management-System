
package mine.profile.website.dtos;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String roomType;
    private Long unitId;
    private List<Long> bedIds;
}