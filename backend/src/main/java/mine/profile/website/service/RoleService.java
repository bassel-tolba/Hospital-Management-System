package mine.profile.website.service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
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

    public List<Role> getAllRoles() {
        log.info("getting all roles");
        return roleRepository.findAll();
    }

    public Role getRoleById(Long id) {
        log.info("get role by id = {}", id);
        return roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + id));
    }

    @Transactional
    public Role createRole(Role role) {
        log.info("creating new role = {}", role);
        // Ensure permissions exist and set them for the role.
        if (role.getPermissions() != null) {
            Set<Permission> managedPermissions = role.getPermissions().stream()
                    .map(perm -> permissionRepository.findById(perm.getId())
                            .orElseThrow(
                                    () -> new EntityNotFoundException("Permission not found with id: " + perm.getId())))
                    .collect(Collectors.toSet());
            role.setPermissions(managedPermissions);
        }
        return roleRepository.save(role);
    }

    @Transactional
    public Role updateRole(Long id, Role updatedRole) {
        log.info("updating the role = {}, with the new role = {}", id, updatedRole);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + id));

        role.setName(updatedRole.getName());

        if (updatedRole.getPermissions() != null) {
            Set<Permission> managedPermissions = updatedRole.getPermissions().stream()
                    .map(perm -> permissionRepository.findById(perm.getId())
                            .orElseThrow(
                                    () -> new EntityNotFoundException("Permission not found with id: " + perm.getId())))
                    .collect(Collectors.toSet());
            role.setPermissions(managedPermissions);
        } else {
            role.setPermissions(Collections.emptySet()); // Or handle as appropriate for your logic
        }

        return roleRepository.save(role);
    }

    @Transactional
    public void deleteRole(Long id) {
        log.info("deleting role with the id = {}", id);
        if (!roleRepository.existsById(id)) {
            log.error("Role not found with ID: {}", id);
            throw new EntityNotFoundException("Role not found with id: " + id);
        }
        roleRepository.deleteById(id);
    }
}