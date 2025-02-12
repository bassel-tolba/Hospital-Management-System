package mine.profile.website.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdmissionTypeDTO {
    private Long id;
    private String name;
    private double price;

    public AdmissionTypeDTO(Long id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}