package mine.profile.website.rest.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid; // Import for validation
import mine.profile.website.dtos.RoleUpdateRequest;
import mine.profile.website.models.Role;
import mine.profile.website.service.RoleService;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private static final Logger log = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private RoleService roleService;

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        log.info("GET /api/roles called");
        List<Role> roles = roleService.getAllRoles();
        log.debug("Returning {} roles", roles.size());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        log.info("GET /api/roles/{} called", id);
        Role role = roleService.getRoleById(id);
        // Note: Role's toString might cause issues if permissions are loaded lazily and
        // accessed.
        // Be careful with logging the full entity directly if lazy loading is involved.
        log.debug("Returning role with ID: {}", id);
        return ResponseEntity.ok(role);
    }

    /**
     * Creates a new role.
     * TODO: Consider using a RoleCreateRequest DTO here as well for consistency
     * and to avoid exposing the full Role entity directly in the request body.
     * If using a DTO, the service method signature would also change.
     */
    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) { // <-- Keep original for now, or change to
                                                                     // RoleCreateRequest DTO
        log.info("POST /api/roles called with role name: {}", role != null ? role.getName() : "null");
        // If using a DTO: log.info("POST /api/roles called with request: {}",
        // roleCreateRequest);
        Role createdRole = roleService.createRole(role); // Pass Role or DTO
        log.info("Role created successfully with ID: {}", createdRole.getId());
        return ResponseEntity.ok(createdRole);
    }

    /**
     * Updates an existing role based on the provided ID and request data.
     * Uses RoleUpdateRequest DTO to map incoming JSON correctly.
     *
     * @param id                The ID of the role to update.
     * @param roleUpdateRequest DTO containing the name and permission IDs.
     * @return ResponseEntity containing the updated Role entity.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest roleUpdateRequest) { // <-- Use DTO and @Valid for validation
        log.info("PUT /api/roles/{} called with update request: {}", id, roleUpdateRequest); // Log the DTO
        Role updatedRole = roleService.updateRole(id, roleUpdateRequest); // Pass the DTO to the service
        log.info("Role with ID {} updated successfully.", updatedRole.getId());
        return ResponseEntity.ok(updatedRole);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        log.info("DELETE /api/roles/{} called", id);
        roleService.deleteRole(id);
        log.info("Role with ID {} deleted successfully.", id);
        return ResponseEntity.noContent().build();
    }
}