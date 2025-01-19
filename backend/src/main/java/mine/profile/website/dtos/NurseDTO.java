package mine.profile.website.dtos;

import lombok.Getter;
import lombok.Setter;
import mine.profile.website.models.Nurse;
import mine.profile.website.models.User;

@Getter
@Setter
public class NurseDTO {
    private Long id;
    private User user;

    public static NurseDTO toDto(Nurse nurse) {
        NurseDTO nurseDTO = new NurseDTO();
        nurseDTO.setId(nurse.getId());
        nurseDTO.setUser(nurse.getUser());
        return nurseDTO;

    }

    public static Nurse toEntity(NurseDTO nurseDTO) {
        Nurse nurse = new Nurse();
        nurse.setId(nurseDTO.getId());
        nurse.setUser(nurseDTO.getUser());
        return nurse;
    }
}