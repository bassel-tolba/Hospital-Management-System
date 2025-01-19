package mine.profile.website.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProcedureDTO {
    private Long id;
    private String code;
    private String name;
    private double price;

    public ProcedureDTO(Long id, String code, String name, double price) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.price = price;
    }
}