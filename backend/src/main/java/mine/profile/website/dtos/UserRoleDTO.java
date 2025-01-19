
package mine.profile.website.dtos;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserRoleDTO {
    private Long id;
    private String name;
    private List<String> permissions;
}