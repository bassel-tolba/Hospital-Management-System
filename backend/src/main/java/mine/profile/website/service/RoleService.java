package mine.profile.website.service;

import java.util.Collections;
import java.util.HashSet; // Use HashSet for efficient lookups and storage
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Ensure transactional behavior

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.RoleUpdateRequest;
import mine.profile.website.models.Permission;
import mine.profile.website.models.Role;
import mine.profile.website.repository.PermissionRepository;
import mine.profile.website.repository.RoleRepository;

@Service
public class RoleService {
    private static final Logger log = LoggerFactory.getLogger(RoleService.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Retrieves all roles from the database.
     *
     * @return A list of all Role entities.
     */
    public List<Role> getAllRoles() {
        log.info("Fetching all roles");
        return roleRepository.findAll();
    }

    /**
     * Retrieves a specific role by its ID.
     * Includes fetching associated permissions eagerly due to Role entity
     * configuration.
     *
     * @param id The ID of the role to retrieve.
     * @return The Role entity.
     * @throws EntityNotFoundException if no role with the given ID is found.
     */
    public Role getRoleById(Long id) {
        log.info("Fetching role by ID: {}", id);
        return roleRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Role not found with ID: {}", id);
                    return new EntityNotFoundException("Role not found with id: " + id);
                });
    }

    /**
     * Creates a new role.
     * NOTE: This currently accepts the full Role entity. Consider using a DTO.
     * If permissions are included in the input Role object, it attempts to
     * find and set managed instances of those permissions.
     *
     * @param role The Role entity to create (potentially with unmanaged Permission
     *             objects).
     * @return The persisted Role entity with managed permissions.
     * @throws EntityNotFoundException if any provided permission ID does not exist.
     */
    @Transactional // Ensure atomicity
    public Role createRole(Role role) {
        log.info("Attempting to create new role with name: {}", role.getName());
        // Optional: Add check if role with the same name already exists
        // if (roleRepository.findByName(role.getName()).isPresent()) { ... }

        // Ensure permissions exist and are managed entities if provided
        if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
            log.debug("Role creation request includes {} permissions. Fetching managed instances.",
                    role.getPermissions().size());
            Set<Permission> managedPermissions = new HashSet<>();
            for (Permission inputPerm : role.getPermissions()) {
                if (inputPerm == null || inputPerm.getId() == null) {
                    log.warn("Skipping null permission or permission with null ID during role creation.");
                    continue;
                }
                Permission managedPerm = permissionRepository.findById(inputPerm.getId())
                        .orElseThrow(() -> {
                            log.error("Permission not found with ID: {} during role creation", inputPerm.getId());
                            return new EntityNotFoundException("Permission not found with id: " + inputPerm.getId());
                        });
                managedPermissions.add(managedPerm);
                log.trace("Added managed permission ID: {}", managedPerm.getId());
            }
            role.setPermissions(managedPermissions); // Set the managed permissions
        } else {
            log.debug("Role creation request has no permissions.");
            role.setPermissions(Collections.emptySet()); // Ensure it's an empty set, not null
        }

        Role savedRole = roleRepository.save(role);
        log.info("Successfully created role '{}' with ID: {}", savedRole.getName(), savedRole.getId());
        return savedRole;
    }

    /**
     * Updates an existing role identified by its ID using data from the
     * RoleUpdateRequest DTO.
     * Replaces the role's permissions entirely with those specified by the IDs in
     * the DTO.
     *
     * @param id         The ID of the role to update.
     * @param requestDto The DTO containing the new name and the set of permission
     *                   IDs.
     * @return The updated and persisted Role entity.
     * @throws EntityNotFoundException if the role ID or any provided permission ID
     *                                 does not exist.
     */
    @Transactional // Ensure atomicity
    public Role updateRole(Long id, RoleUpdateRequest requestDto) {
        log.info("Attempting to update role ID: {} with data: Name='{}', PermissionIds={}",
                id, requestDto.getName(), requestDto.getPermissionIds());

        // 1. Find the existing Role entity
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Role not found for update with ID: {}", id);
                    return new EntityNotFoundException("Role not found with id: " + id);
                });
        log.debug("Found role ID: {} with current name: '{}'", id, role.getName());

        // 2. Update the role's name
        role.setName(requestDto.getName());
        log.debug("Updated role name to: '{}'", requestDto.getName());

        // 3. Process Permission IDs from DTO to get managed Permission entities
        Set<Permission> newPermissions = new HashSet<>(); // Use HashSet for efficiency
        if (requestDto.getPermissionIds() != null && !requestDto.getPermissionIds().isEmpty()) {
            log.debug("Processing {} permission IDs from request for role ID: {}", requestDto.getPermissionIds().size(),
                    id);
            for (Long permId : requestDto.getPermissionIds()) {
                // Basic validation
                if (permId == null) {
                    log.warn("Received null permission ID in update request for role ID: {}. Skipping.", id);
                    continue;
                }
                // Find the managed Permission entity by ID
                Permission managedPermission = permissionRepository.findById(permId)
                        .orElseThrow(() -> {
                            // Log error before throwing
                            log.error("Permission not found with ID: {} while updating role ID: {}", permId, id);
                            return new EntityNotFoundException("Permission not found with id: " + permId);
                        });
                newPermissions.add(managedPermission);
                log.trace("Mapped and added managed permission ID: {} to new set for role ID: {}", permId, id);
            }
            log.debug("Successfully mapped {} permission IDs to managed Permission entities for role ID: {}",
                    newPermissions.size(), id);
        } else {
            // If permissionIds is null or empty, we clear existing permissions
            log.info("No permission IDs provided in update request for role ID: {}. Permissions will be cleared.", id);
            // newPermissions remains an empty HashSet
        }

        // 4. Set the resolved permissions on the role entity.
        // This replaces the existing collection entirely because of how JPA manages
        // collections.
        role.setPermissions(newPermissions);
        log.info("Set {} permissions for role ID: {}", role.getPermissions().size(), id);

        // 5. Save the updated role entity
        Role savedRole = roleRepository.save(role);
        log.info("Successfully updated and saved role ID: {}", savedRole.getId());
        return savedRole;
    }

    /**
     * Deletes a role by its ID.
     *
     * @param id The ID of the role to delete.
     * @throws EntityNotFoundException if no role with the given ID exists.
     */
    @Transactional // Ensure atomicity
    public void deleteRole(Long id) {
        log.info("Attempting to delete role with ID: {}", id);
        if (!roleRepository.existsById(id)) {
            log.error("Cannot delete. Role not found with ID: {}", id);
            throw new EntityNotFoundException("Role not found with id: " + id);
        }
        roleRepository.deleteById(id);
        log.info("Successfully deleted role with ID: {}", id);
    }
}