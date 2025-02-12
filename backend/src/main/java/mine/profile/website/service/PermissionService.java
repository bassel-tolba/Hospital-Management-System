package mine.profile.website.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.models.Permission;
import mine.profile.website.repository.PermissionRepository;

@Service
public class PermissionService {
    private static final Logger log = LoggerFactory.getLogger(PermissionService.class);
    @Autowired
    private PermissionRepository permissionRepository;

    public List<Permission> getAllPermissions() {
        log.info("getting all permissions");
        return permissionRepository.findAll();
    }

    public Permission getPermissionById(Long id) {
        log.info("getting permission by id = {}", id);
        return permissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id: " + id));
    }

    public Permission createPermission(Permission permission) {
        log.info("creating permission = {}", permission);
        return permissionRepository.save(permission);
    }

    public Permission updatePermission(Long id, Permission updatedPermission) {
        log.info("updating permission with id = {}, the new permission = {}", id, updatedPermission);
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id: " + id));
        permission.setName(updatedPermission.getName());
        return permissionRepository.save(permission);
    }

    public void deletePermission(Long id) {
        log.info("deleting permission with id = {}", id);
        if (!permissionRepository.existsById(id)) {
            log.error("Permission not found with ID: {}", id);
            throw new EntityNotFoundException("Permission not found with id: " + id);
        }
        permissionRepository.deleteById(id);
    }
}