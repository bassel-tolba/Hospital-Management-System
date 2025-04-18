package mine.profile.website.dtos;

import java.util.Set;

import jakarta.validation.constraints.NotBlank; // Use @NotBlank for non-null and trimmed non-empty check
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString; // Optional: for logging

/**
 * Data Transfer Object for updating a Role.
 * Matches the expected JSON payload from the frontend.
 */
@Getter
@Setter
@NoArgsConstructor
@ToString // Optional: Useful for logging the DTO content
public class RoleUpdateRequest {

    @NotBlank(message = "Role name cannot be blank") // More specific validation
    @Size(max = 50, message = "Role name cannot exceed 50 characters")
    private String name;

    // This field name MUST match the JSON key sent by the frontend
    // ("permissionIds")
    // Contains the IDs of the permissions to assign to the role.
    private Set<Long> permissionIds; // Use Set or List, Long matches Permission ID type
}