// UnitDTO.java
package mine.profile.website.dtos;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UnitDTO {
    private Long id;
    private String name;
    private Long departmentId;
    private List<Long> roomIds;

}