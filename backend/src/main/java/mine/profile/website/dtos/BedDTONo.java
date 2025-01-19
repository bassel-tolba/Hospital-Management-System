package mine.profile.website.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.config.BooleanDeserializer;

@Getter
@Setter
@NoArgsConstructor
public class BedDTONo {
    private Long id;
    private String bedNumber;
    @JsonDeserialize(using = BooleanDeserializer.class)
    private boolean isOccupied;
}
