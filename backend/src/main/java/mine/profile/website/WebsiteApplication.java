package mine.profile.website;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import mine.profile.website.models.Permission;
import mine.profile.website.models.Role;
import mine.profile.website.repository.PermissionRepository;
import mine.profile.website.repository.RoleRepository;

@SpringBootApplication
public class WebsiteApplication {

    private static final Logger log = LoggerFactory.getLogger(WebsiteApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(WebsiteApplication.class, args);
    }

    @Bean
    public CommandLineRunner initializeDatabase(RoleRepository roleRepository,
            PermissionRepository permissionRepository) {
        return (args) -> {
            log.info("Initializing database roles and permissions...");
            createDefaultRolesAndPermissions(roleRepository, permissionRepository);
            log.info("Database initialization complete.");
        };
    }

    private void createDefaultRolesAndPermissions(RoleRepository roleRepository,
            PermissionRepository permissionRepository) {
        // ... (All your existing createOrFindPermission calls - keep them!) ...
        createOrFindPermission("CREATE_PATIENT", permissionRepository);
        createOrFindPermission("READ_PATIENT", permissionRepository);
        createOrFindPermission("UPDATE_PATIENT", permissionRepository);
        createOrFindPermission("DELETE_PATIENT", permissionRepository);
        createOrFindPermission("CREATE_DOCTOR", permissionRepository);
        createOrFindPermission("READ_DOCTOR", permissionRepository);
        createOrFindPermission("UPDATE_DOCTOR", permissionRepository);
        createOrFindPermission("DELETE_DOCTOR", permissionRepository);
        createOrFindPermission("CREATE_USER", permissionRepository);
        createOrFindPermission("READ_USER", permissionRepository);
        createOrFindPermission("UPDATE_USER", permissionRepository);
        createOrFindPermission("DELETE_USER", permissionRepository);
        createOrFindPermission("CREATE_APPOINTMENT", permissionRepository);
        createOrFindPermission("READ_APPOINTMENT", permissionRepository);
        createOrFindPermission("UPDATE_APPOINTMENT", permissionRepository);
        createOrFindPermission("DELETE_APPOINTMENT", permissionRepository);
        createOrFindPermission("CREATE_MEDICATION", permissionRepository);
        createOrFindPermission("READ_MEDICATION", permissionRepository);
        createOrFindPermission("UPDATE_MEDICATION", permissionRepository);
        createOrFindPermission("DELETE_MEDICATION", permissionRepository);
        createOrFindPermission("UPDATE_MEDICATION_STOCK", permissionRepository);
        createOrFindPermission("READ_MEDICATION_HISTORY", permissionRepository);
        createOrFindPermission("CREATE_PRESCRIPTION", permissionRepository);
        createOrFindPermission("READ_PRESCRIPTION", permissionRepository);
        createOrFindPermission("UPDATE_PRESCRIPTION", permissionRepository);
        createOrFindPermission("DELETE_PRESCRIPTION", permissionRepository);
        createOrFindPermission("CREATE_PRESCRIBED_MEDICATION", permissionRepository);
        createOrFindPermission("READ_PRESCRIBED_MEDICATION", permissionRepository);
        createOrFindPermission("UPDATE_PRESCRIBED_MEDICATION", permissionRepository);
        createOrFindPermission("DELETE_PRESCRIBED_MEDICATION", permissionRepository);
        createOrFindPermission("CREATE_ROOM", permissionRepository);
        createOrFindPermission("READ_ROOM", permissionRepository);
        createOrFindPermission("UPDATE_ROOM", permissionRepository);
        createOrFindPermission("DELETE_ROOM", permissionRepository);
        createOrFindPermission("CREATE_BED", permissionRepository);
        createOrFindPermission("READ_BED", permissionRepository);
        createOrFindPermission("UPDATE_BED", permissionRepository);
        createOrFindPermission("DELETE_BED", permissionRepository);
        createOrFindPermission("CREATE_ADMISSION", permissionRepository);
        createOrFindPermission("READ_ADMISSION", permissionRepository);
        createOrFindPermission("UPDATE_ADMISSION", permissionRepository);
        createOrFindPermission("DELETE_ADMISSION", permissionRepository);
        createOrFindPermission("CREATE_ASSESSMENT", permissionRepository);
        createOrFindPermission("READ_ASSESSMENT", permissionRepository);
        createOrFindPermission("UPDATE_ASSESSMENT", permissionRepository);
        createOrFindPermission("DELETE_ASSESSMENT", permissionRepository);
        createOrFindPermission("CREATE_NURSING_CARE_PLAN", permissionRepository);
        createOrFindPermission("READ_NURSING_CARE_PLAN", permissionRepository);
        createOrFindPermission("UPDATE_NURSING_CARE_PLAN", permissionRepository);
        createOrFindPermission("DELETE_NURSING_CARE_PLAN", permissionRepository);
        createOrFindPermission("CREATE_LAB_TEST", permissionRepository);
        createOrFindPermission("READ_LAB_TEST", permissionRepository);
        createOrFindPermission("UPDATE_LAB_TEST", permissionRepository);
        createOrFindPermission("DELETE_LAB_TEST", permissionRepository);
        createOrFindPermission("CREATE_LAB_RESULT", permissionRepository);
        createOrFindPermission("READ_LAB_RESULT", permissionRepository);
        createOrFindPermission("UPDATE_LAB_RESULT", permissionRepository);
        createOrFindPermission("DELETE_LAB_RESULT", permissionRepository);
        createOrFindPermission("CREATE_IMAGE_REPORT", permissionRepository);
        createOrFindPermission("READ_IMAGE_REPORT", permissionRepository);
        createOrFindPermission("UPDATE_IMAGE_REPORT", permissionRepository);
        createOrFindPermission("DELETE_IMAGE_REPORT", permissionRepository);
        createOrFindPermission("CREATE_IMAGE_REPORT_TYPE", permissionRepository);
        createOrFindPermission("READ_IMAGE_REPORT_TYPE", permissionRepository);
        createOrFindPermission("UPDATE_IMAGE_REPORT_TYPE", permissionRepository);
        createOrFindPermission("DELETE_IMAGE_REPORT_TYPE", permissionRepository);
        createOrFindPermission("CREATE_MEDICATION_ADMINISTRATION", permissionRepository);
        createOrFindPermission("READ_MEDICATION_ADMINISTRATION", permissionRepository);
        createOrFindPermission("UPDATE_MEDICATION_ADMINISTRATION", permissionRepository);
        createOrFindPermission("DELETE_MEDICATION_ADMINISTRATION", permissionRepository);
        createOrFindPermission("CREATE_PRODUCT", permissionRepository);
        createOrFindPermission("READ_PRODUCT", permissionRepository);
        createOrFindPermission("UPDATE_PRODUCT", permissionRepository);
        createOrFindPermission("DELETE_PRODUCT", permissionRepository);
        createOrFindPermission("CREATE_PATIENT_PRODUCT_USAGE", permissionRepository);
        createOrFindPermission("READ_PATIENT_PRODUCT_USAGE", permissionRepository);
        createOrFindPermission("UPDATE_PATIENT_PRODUCT_USAGE", permissionRepository);
        createOrFindPermission("DELETE_PATIENT_PRODUCT_USAGE", permissionRepository);
        createOrFindPermission("CREATE_PROCEDURE", permissionRepository);
        createOrFindPermission("READ_PROCEDURE", permissionRepository);
        createOrFindPermission("UPDATE_PROCEDURE", permissionRepository);
        createOrFindPermission("DELETE_PROCEDURE", permissionRepository);
        createOrFindPermission("CREATE_VITAL_SIGN", permissionRepository);
        createOrFindPermission("READ_VITAL_SIGN", permissionRepository);
        createOrFindPermission("UPDATE_VITAL_SIGN", permissionRepository);
        createOrFindPermission("DELETE_VITAL_SIGN", permissionRepository);
        createOrFindPermission("CREATE_UNIT", permissionRepository);
        createOrFindPermission("READ_UNIT", permissionRepository);
        createOrFindPermission("UPDATE_UNIT", permissionRepository);
        createOrFindPermission("DELETE_UNIT", permissionRepository);
        createOrFindPermission("CREATE_BILLING", permissionRepository);
        createOrFindPermission("READ_BILLING", permissionRepository);
        createOrFindPermission("UPDATE_BILLING", permissionRepository);
        createOrFindPermission("DELETE_BILLING", permissionRepository);
        createOrFindPermission("CREATE_CARE_PLAN_GOAL", permissionRepository);
        createOrFindPermission("READ_CARE_PLAN_GOAL", permissionRepository);
        createOrFindPermission("UPDATE_CARE_PLAN_GOAL", permissionRepository);
        createOrFindPermission("DELETE_CARE_PLAN_GOAL", permissionRepository);
        // ---------------document and type -------------------
        createOrFindPermission("CREATE_DOCUMENT", permissionRepository);
        createOrFindPermission("READ_DOCUMENT", permissionRepository);
        createOrFindPermission("UPDATE_DOCUMENT", permissionRepository);
        createOrFindPermission("DELETE_DOCUMENT", permissionRepository);
        createOrFindPermission("CREATE_DOCUMENT_TYPE", permissionRepository); // added
        createOrFindPermission("UPDATE_DOCUMENT_TYPE", permissionRepository);
        createOrFindPermission("DELETE_DOCUMENT_TYPE", permissionRepository);
        // -----------------------------------
        createOrFindPermission("CREATE_PROCEDURE_LOG", permissionRepository);
        createOrFindPermission("READ_PROCEDURE_LOG", permissionRepository);
        createOrFindPermission("UPDATE_PROCEDURE_LOG", permissionRepository);
        createOrFindPermission("DELETE_PROCEDURE_LOG", permissionRepository);
        createOrFindPermission("CREATE_USER_ACTIVITY", permissionRepository);
        createOrFindPermission("READ_USER_ACTIVITY", permissionRepository);
        createOrFindPermission("UPDATE_USER_ACTIVITY", permissionRepository);
        createOrFindPermission("DELETE_USER_ACTIVITY", permissionRepository);
        createOrFindPermission("MANAGE_ROLES", permissionRepository);
        createOrFindPermission("MANAGE_PERMISSIONS", permissionRepository);

        createOrFindPermission("CREATE_ROLE", permissionRepository);
        createOrFindPermission("UPDATE_ROLE", permissionRepository);
        createOrFindPermission("DELETE_ROLE", permissionRepository);

        createOrFindPermission("CREATE_PERMISSION", permissionRepository);
        createOrFindPermission("UPDATE_PERMISSION", permissionRepository);
        createOrFindPermission("DELETE_PERMISSION", permissionRepository);

        // Get all permissions
        List<Permission> allPermissions = permissionRepository.findAll();

        // Define Roles and assign permissions
        Role adminRole = createOrFindRole("ADMIN", roleRepository, new HashSet<>(allPermissions));

        // Permissions for DOCTOR
        Set<Permission> doctorPermissions = Stream.of(
                "READ_PATIENT", "CREATE_APPOINTMENT", "READ_APPOINTMENT", "UPDATE_APPOINTMENT",
                "CREATE_ASSESSMENT", "READ_ASSESSMENT", "UPDATE_ASSESSMENT",
                "CREATE_PRESCRIPTION", "READ_PRESCRIPTION", "UPDATE_PRESCRIPTION",
                "READ_LAB_RESULT", "READ_IMAGE_REPORT",
                "CREATE_DOCUMENT", "READ_DOCUMENT", "UPDATE_DOCUMENT" // Added document permissions
        ).map(name -> createOrFindPermission(name, permissionRepository)).collect(Collectors.toSet());
        Role doctorRole = createOrFindRole("DOCTOR", roleRepository, doctorPermissions);

        // Permissions for NURSE
        Set<Permission> nursePermissions = Stream.of(
                "READ_PATIENT", "READ_APPOINTMENT",
                "CREATE_NURSING_CARE_PLAN", "READ_NURSING_CARE_PLAN", "UPDATE_NURSING_CARE_PLAN",
                "CREATE_VITAL_SIGN", "READ_VITAL_SIGN", "UPDATE_VITAL_SIGN",
                "READ_MEDICATION", "ADMINISTER_MEDICATION",
                "READ_LAB_RESULT", "READ_IMAGE_REPORT",
                "CREATE_DOCUMENT", "READ_DOCUMENT" // Added document permissions
        ).map(name -> createOrFindPermission(name, permissionRepository)).collect(Collectors.toSet());
        Role nurseRole = createOrFindRole("NURSE", roleRepository, nursePermissions);

        // Permissions for RECEPTIONIST
        Set<Permission> receptionistPermissions = Stream.of(
                "CREATE_PATIENT", "READ_PATIENT", "UPDATE_PATIENT",
                "CREATE_APPOINTMENT", "READ_APPOINTMENT", "UPDATE_APPOINTMENT",
                "READ_DOCUMENT" // Added document permissions
        ).map(name -> createOrFindPermission(name, permissionRepository)).collect(Collectors.toSet());
        Role receptionistRole = createOrFindRole("RECEPTIONIST", roleRepository, receptionistPermissions);

        // Permissions for BILLING_CLERK
        Set<Permission> billingClerkPermissions = Stream.of(
                "READ_PATIENT", "CREATE_BILLING", "READ_BILLING", "UPDATE_BILLING")
                .map(name -> createOrFindPermission(name, permissionRepository)).collect(Collectors.toSet());
        Role billingClerkRole = createOrFindRole("BILLING_CLERK", roleRepository, billingClerkPermissions);

        // Permissions for LAB_TECHNICIAN
        Set<Permission> labTechnicianPermissions = Stream.of(
                "READ_PATIENT", "CREATE_LAB_TEST", "READ_LAB_TEST", "CREATE_LAB_RESULT", "READ_LAB_RESULT")
                .map(name -> createOrFindPermission(name, permissionRepository)).collect(Collectors.toSet());
        Role labTechnicianRole = createOrFindRole("LAB_TECHNICIAN", roleRepository, labTechnicianPermissions);

        // Permissions for RADIOLOGY_TECHNICIAN
        Set<Permission> radiologyTechnicianPermissions = Stream.of(
                "READ_PATIENT", "CREATE_IMAGE_REPORT", "READ_IMAGE_REPORT", "UPDATE_IMAGE_REPORT")
                .map(name -> createOrFindPermission(name, permissionRepository)).collect(Collectors.toSet());
        Role radiologyTechnicianRole = createOrFindRole("RADIOLOGY_TECHNICIAN", roleRepository,
                radiologyTechnicianPermissions);

        // Permissions for PHARMACY_TECHNICIAN
        Set<Permission> pharmacyTechnicianPermissions = Stream.of(
                "READ_PATIENT", "READ_MEDICATION", "READ_PRESCRIPTION", "DISPENSE_MEDICATION")
                .map(name -> createOrFindPermission(name, permissionRepository)).collect(Collectors.toSet());
        Role pharmacyTechnicianRole = createOrFindRole("PHARMACY_TECHNICIAN", roleRepository,
                pharmacyTechnicianPermissions);

        log.info("Default roles and permissions created/updated.");
    }

    private Permission createOrFindPermission(String permissionName, PermissionRepository permissionRepository) {
        return permissionRepository.findByName(permissionName)
                .orElseGet(() -> {
                    Permission permission = new Permission();
                    permission.setName(permissionName);
                    return permissionRepository.save(permission);
                });
    }

    private Role createOrFindRole(String roleName, RoleRepository roleRepository, Set<Permission> permissions) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    role.setPermissions(permissions);
                    return roleRepository.save(role);
                });
    }
}