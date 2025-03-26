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

        // --- Core Entity Permissions ---
        createOrFindPermission("CREATE_PATIENT", permissionRepository);
        createOrFindPermission("READ_PATIENT", permissionRepository);
        createOrFindPermission("UPDATE_PATIENT", permissionRepository);
        createOrFindPermission("DELETE_PATIENT", permissionRepository);

        // createOrFindPermission("CREATE_DOCTOR", permissionRepository); // Doctors are
        // Users
        // createOrFindPermission("READ_DOCTOR", permissionRepository);
        // createOrFindPermission("UPDATE_DOCTOR", permissionRepository);
        // createOrFindPermission("DELETE_DOCTOR", permissionRepository);

        createOrFindPermission("CREATE_USER", permissionRepository);
        createOrFindPermission("READ_USER", permissionRepository);
        createOrFindPermission("UPDATE_USER", permissionRepository);
        createOrFindPermission("DELETE_USER", permissionRepository);

        createOrFindPermission("CREATE_APPOINTMENT", permissionRepository);
        createOrFindPermission("READ_APPOINTMENT", permissionRepository);
        createOrFindPermission("UPDATE_APPOINTMENT", permissionRepository);
        createOrFindPermission("DELETE_APPOINTMENT", permissionRepository);

        // --- Medication & Prescription Permissions ---
        createOrFindPermission("CREATE_MEDICATION", permissionRepository);
        createOrFindPermission("READ_MEDICATION", permissionRepository);
        createOrFindPermission("UPDATE_MEDICATION", permissionRepository);
        createOrFindPermission("DELETE_MEDICATION", permissionRepository);
        createOrFindPermission("UPDATE_MEDICATION_STOCK", permissionRepository);
        createOrFindPermission("READ_MEDICATION_HISTORY", permissionRepository);
        createOrFindPermission("DELETE_MEDICATION_HISTORY", permissionRepository); // New

        createOrFindPermission("CREATE_PRESCRIPTION", permissionRepository);
        createOrFindPermission("READ_PRESCRIPTION", permissionRepository);
        createOrFindPermission("UPDATE_PRESCRIPTION", permissionRepository);
        createOrFindPermission("DELETE_PRESCRIPTION", permissionRepository);

        createOrFindPermission("CREATE_PRESCRIBED_MEDICATION", permissionRepository);
        createOrFindPermission("READ_PRESCRIBED_MEDICATION", permissionRepository);
        createOrFindPermission("UPDATE_PRESCRIBED_MEDICATION", permissionRepository);
        createOrFindPermission("DELETE_PRESCRIBED_MEDICATION", permissionRepository);

        createOrFindPermission("CREATE_MEDICATION_ADMINISTRATION", permissionRepository);
        createOrFindPermission("READ_MEDICATION_ADMINISTRATION", permissionRepository);
        // createOrFindPermission("UPDATE_MEDICATION_ADMINISTRATION",
        // permissionRepository); // Not implemented
        createOrFindPermission("DELETE_MEDICATION_ADMINISTRATION", permissionRepository);
        createOrFindPermission("ADMINISTER_MEDICATION", permissionRepository); // For Nurse role

        // --- Location Permissions (Units, Rooms, Beds) ---
        createOrFindPermission("CREATE_UNIT", permissionRepository);
        createOrFindPermission("READ_UNIT", permissionRepository);
        createOrFindPermission("UPDATE_UNIT", permissionRepository);
        createOrFindPermission("DELETE_UNIT", permissionRepository);

        createOrFindPermission("CREATE_ROOM", permissionRepository);
        createOrFindPermission("READ_ROOM", permissionRepository);
        createOrFindPermission("UPDATE_ROOM", permissionRepository);
        createOrFindPermission("DELETE_ROOM", permissionRepository);

        createOrFindPermission("CREATE_BED", permissionRepository);
        createOrFindPermission("READ_BED", permissionRepository);
        createOrFindPermission("UPDATE_BED", permissionRepository);
        createOrFindPermission("DELETE_BED", permissionRepository);
        createOrFindPermission("MANAGE_BEDS", permissionRepository); // New (for free-expired)

        // --- Admission Permissions ---
        createOrFindPermission("CREATE_ADMISSION", permissionRepository);
        createOrFindPermission("READ_ADMISSION", permissionRepository);
        createOrFindPermission("UPDATE_ADMISSION", permissionRepository);
        createOrFindPermission("DELETE_ADMISSION", permissionRepository);
        createOrFindPermission("MANAGE_ADMISSION_TYPES", permissionRepository); // New

        // --- Clinical Data Permissions ---
        createOrFindPermission("CREATE_ASSESSMENT", permissionRepository);
        createOrFindPermission("READ_ASSESSMENT", permissionRepository);
        createOrFindPermission("UPDATE_ASSESSMENT", permissionRepository);
        createOrFindPermission("DELETE_ASSESSMENT", permissionRepository);

        createOrFindPermission("CREATE_NURSING_CARE_PLAN", permissionRepository);
        createOrFindPermission("READ_NURSING_CARE_PLAN", permissionRepository);
        createOrFindPermission("UPDATE_NURSING_CARE_PLAN", permissionRepository);
        createOrFindPermission("DELETE_NURSING_CARE_PLAN", permissionRepository);

        createOrFindPermission("CREATE_CARE_PLAN_GOAL", permissionRepository);
        createOrFindPermission("READ_CARE_PLAN_GOAL", permissionRepository);
        createOrFindPermission("UPDATE_CARE_PLAN_GOAL", permissionRepository);
        createOrFindPermission("DELETE_CARE_PLAN_GOAL", permissionRepository);

        createOrFindPermission("CREATE_VITAL_SIGN", permissionRepository);
        createOrFindPermission("READ_VITAL_SIGN", permissionRepository);
        createOrFindPermission("UPDATE_VITAL_SIGN", permissionRepository);
        createOrFindPermission("DELETE_VITAL_SIGN", permissionRepository);

        createOrFindPermission("CREATE_PROCEDURE", permissionRepository);
        createOrFindPermission("READ_PROCEDURE", permissionRepository);
        createOrFindPermission("UPDATE_PROCEDURE", permissionRepository);
        createOrFindPermission("DELETE_PROCEDURE", permissionRepository);

        createOrFindPermission("CREATE_PROCEDURE_LOG", permissionRepository);
        createOrFindPermission("READ_PROCEDURE_LOG", permissionRepository);
        // createOrFindPermission("UPDATE_PROCEDURE_LOG", permissionRepository); // Not
        // implemented
        createOrFindPermission("DELETE_PROCEDURE_LOG", permissionRepository);

        // --- Lab & Imaging Permissions ---
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

        // --- Product & Billing Permissions ---
        createOrFindPermission("CREATE_PRODUCT", permissionRepository);
        createOrFindPermission("READ_PRODUCT", permissionRepository);
        createOrFindPermission("UPDATE_PRODUCT", permissionRepository);
        createOrFindPermission("DELETE_PRODUCT", permissionRepository);
        createOrFindPermission("UPDATE_PRODUCT_STOCK", permissionRepository); // New
        createOrFindPermission("READ_PRODUCT_HISTORY", permissionRepository); // New
        createOrFindPermission("DELETE_PRODUCT_HISTORY", permissionRepository); // New

        createOrFindPermission("CREATE_PATIENT_PRODUCT_USAGE", permissionRepository);
        createOrFindPermission("READ_PATIENT_PRODUCT_USAGE", permissionRepository);
        // createOrFindPermission("UPDATE_PATIENT_PRODUCT_USAGE", permissionRepository);
        // // Not implemented
        createOrFindPermission("DELETE_PATIENT_PRODUCT_USAGE", permissionRepository);

        createOrFindPermission("CREATE_BILLING", permissionRepository);
        createOrFindPermission("READ_BILLING", permissionRepository);
        createOrFindPermission("UPDATE_BILLING", permissionRepository);
        createOrFindPermission("DELETE_BILLING", permissionRepository);
        // createOrFindPermission("CREATE_PAYMENT", permissionRepository); // Handled by
        // UPDATE_BILLING for now

        // --- Document Permissions ---
        createOrFindPermission("CREATE_DOCUMENT", permissionRepository);
        createOrFindPermission("READ_DOCUMENT", permissionRepository);
        createOrFindPermission("UPDATE_DOCUMENT", permissionRepository);
        createOrFindPermission("DELETE_DOCUMENT", permissionRepository);

        createOrFindPermission("CREATE_DOCUMENT_TYPE", permissionRepository);
        createOrFindPermission("READ_DOCUMENT_TYPE", permissionRepository); // Assuming Read is needed
        createOrFindPermission("UPDATE_DOCUMENT_TYPE", permissionRepository);
        createOrFindPermission("DELETE_DOCUMENT_TYPE", permissionRepository);

        // --- User Activity & System Permissions ---
        createOrFindPermission("CREATE_USER_ACTIVITY", permissionRepository);
        createOrFindPermission("READ_USER_ACTIVITY", permissionRepository);
        createOrFindPermission("UPDATE_USER_ACTIVITY", permissionRepository);
        createOrFindPermission("DELETE_USER_ACTIVITY", permissionRepository);

        createOrFindPermission("READ_DASHBOARD", permissionRepository); // New

        // --- Role & Permission Management ---
        createOrFindPermission("MANAGE_ROLES", permissionRepository);
        createOrFindPermission("CREATE_ROLE", permissionRepository);
        createOrFindPermission("UPDATE_ROLE", permissionRepository);
        createOrFindPermission("DELETE_ROLE", permissionRepository);

        createOrFindPermission("MANAGE_PERMISSIONS", permissionRepository);
        createOrFindPermission("CREATE_PERMISSION", permissionRepository);
        createOrFindPermission("UPDATE_PERMISSION", permissionRepository);
        createOrFindPermission("DELETE_PERMISSION", permissionRepository);

        // --- Get all defined permissions ---
        List<Permission> allPermissions = permissionRepository.findAll();
        Set<Permission> allPermissionsSet = new HashSet<>(allPermissions);
        log.info("Total permissions defined: {}", allPermissions.size());
        if (allPermissions.isEmpty()) {
            log.warn("No permissions found in the database. Roles will have no permissions.");
        }

        // --- Define Roles and Assign Permissions ---

        // ADMIN Role (Gets all permissions)
        Role adminRole = createOrFindRole("ADMIN", roleRepository, allPermissionsSet);
        log.info("ADMIN role has {} permissions.", adminRole.getPermissions().size());

        // DOCTOR Role
        Set<Permission> doctorPermissions = Stream.of(
                "READ_PATIENT", "UPDATE_PATIENT", // Doctors might update some patient info
                "CREATE_APPOINTMENT", "READ_APPOINTMENT", "UPDATE_APPOINTMENT", "DELETE_APPOINTMENT",
                "CREATE_ASSESSMENT", "READ_ASSESSMENT", "UPDATE_ASSESSMENT", "DELETE_ASSESSMENT",
                "CREATE_PRESCRIPTION", "READ_PRESCRIPTION", "UPDATE_PRESCRIPTION", "DELETE_PRESCRIPTION",
                "CREATE_PRESCRIBED_MEDICATION", "READ_PRESCRIBED_MEDICATION", // Can create/read details
                "READ_LAB_RESULT", "READ_IMAGE_REPORT",
                "READ_VITAL_SIGN", "READ_NURSING_CARE_PLAN",
                "CREATE_DOCUMENT", "READ_DOCUMENT", "UPDATE_DOCUMENT", // Document perms
                "READ_PROCEDURE_LOG", // Can see procedure logs
                "READ_MEDICATION", // Can see medication list
                "READ_MEDICATION_ADMINISTRATION", // Can see administrations
                "READ_USER", // Can see other users (e.g., nurses)
                "READ_DASHBOARD" // Can view dashboard
        )
                .map(name -> findPermissionOrThrow(name, permissionRepository))
                .collect(Collectors.toSet());
        Role doctorRole = createOrFindRole("DOCTOR", roleRepository, doctorPermissions);
        log.info("DOCTOR role has {} permissions.", doctorRole.getPermissions().size());

        // NURSE Role
        Set<Permission> nursePermissions = Stream.of(
                "READ_PATIENT", "UPDATE_PATIENT", // Nurses often update patient info/status
                "READ_APPOINTMENT",
                "CREATE_NURSING_CARE_PLAN", "READ_NURSING_CARE_PLAN", "UPDATE_NURSING_CARE_PLAN",
                "DELETE_NURSING_CARE_PLAN",
                "CREATE_CARE_PLAN_GOAL", "READ_CARE_PLAN_GOAL", "UPDATE_CARE_PLAN_GOAL", "DELETE_CARE_PLAN_GOAL",
                "CREATE_VITAL_SIGN", "READ_VITAL_SIGN", "UPDATE_VITAL_SIGN", "DELETE_VITAL_SIGN",
                "READ_MEDICATION", "READ_PRESCRIPTION", // Can see prescriptions
                "CREATE_MEDICATION_ADMINISTRATION", "READ_MEDICATION_ADMINISTRATION",
                "DELETE_MEDICATION_ADMINISTRATION",
                "ADMINISTER_MEDICATION", // Specific action permission
                "READ_LAB_RESULT", "READ_IMAGE_REPORT",
                "CREATE_DOCUMENT", "READ_DOCUMENT", // Can add/read documents (e.g., notes)
                "CREATE_PATIENT_PRODUCT_USAGE", "READ_PATIENT_PRODUCT_USAGE", "DELETE_PATIENT_PRODUCT_USAGE", // Manage
                                                                                                              // product
                                                                                                              // usage
                "CREATE_PROCEDURE_LOG", "READ_PROCEDURE_LOG", // Can log procedures they perform
                "READ_ASSESSMENT", // Can view assessments
                "READ_USER", // Can see other users
                "READ_DASHBOARD" // Can view dashboard
        )
                .map(name -> findPermissionOrThrow(name, permissionRepository))
                .collect(Collectors.toSet());
        Role nurseRole = createOrFindRole("NURSE", roleRepository, nursePermissions);
        log.info("NURSE role has {} permissions.", nurseRole.getPermissions().size());

        // RECEPTIONIST Role
        Set<Permission> receptionistPermissions = Stream.of(
                "CREATE_PATIENT", "READ_PATIENT", "UPDATE_PATIENT", // Basic patient management
                "CREATE_APPOINTMENT", "READ_APPOINTMENT", "UPDATE_APPOINTMENT", "DELETE_APPOINTMENT", // Manage
                                                                                                      // appointments
                "READ_DOCUMENT", // Can view general documents
                "READ_ADMISSION", "CREATE_ADMISSION", "UPDATE_ADMISSION", // Manage admissions
                "READ_USER", // See users
                "READ_BED", "READ_ROOM", "READ_UNIT" // See location availability
        )
                .map(name -> findPermissionOrThrow(name, permissionRepository))
                .collect(Collectors.toSet());
        Role receptionistRole = createOrFindRole("RECEPTIONIST", roleRepository, receptionistPermissions);
        log.info("RECEPTIONIST role has {} permissions.", receptionistRole.getPermissions().size());

        // BILLING_CLERK Role
        Set<Permission> billingClerkPermissions = Stream.of(
                "READ_PATIENT",
                "CREATE_BILLING", "READ_BILLING", "UPDATE_BILLING", "DELETE_BILLING",
                "READ_ADMISSION" // May need admission info for billing
        )
                .map(name -> findPermissionOrThrow(name, permissionRepository))
                .collect(Collectors.toSet());
        Role billingClerkRole = createOrFindRole("BILLING_CLERK", roleRepository, billingClerkPermissions);
        log.info("BILLING_CLERK role has {} permissions.", billingClerkRole.getPermissions().size());

        // LAB_TECHNICIAN Role
        Set<Permission> labTechnicianPermissions = Stream.of(
                "READ_PATIENT",
                "CREATE_LAB_TEST", "READ_LAB_TEST", "UPDATE_LAB_TEST", "DELETE_LAB_TEST",
                "CREATE_LAB_RESULT", "READ_LAB_RESULT", "UPDATE_LAB_RESULT", "DELETE_LAB_RESULT")
                .map(name -> findPermissionOrThrow(name, permissionRepository))
                .collect(Collectors.toSet());
        Role labTechnicianRole = createOrFindRole("LAB_TECHNICIAN", roleRepository, labTechnicianPermissions);
        log.info("LAB_TECHNICIAN role has {} permissions.", labTechnicianRole.getPermissions().size());

        // RADIOLOGY_TECHNICIAN Role
        Set<Permission> radiologyTechnicianPermissions = Stream.of(
                "READ_PATIENT",
                "CREATE_IMAGE_REPORT", "READ_IMAGE_REPORT", "UPDATE_IMAGE_REPORT", "DELETE_IMAGE_REPORT",
                "CREATE_IMAGE_REPORT_TYPE", "READ_IMAGE_REPORT_TYPE", "UPDATE_IMAGE_REPORT_TYPE",
                "DELETE_IMAGE_REPORT_TYPE")
                .map(name -> findPermissionOrThrow(name, permissionRepository))
                .collect(Collectors.toSet());
        Role radiologyTechnicianRole = createOrFindRole("RADIOLOGY_TECHNICIAN", roleRepository,
                radiologyTechnicianPermissions);
        log.info("RADIOLOGY_TECHNICIAN role has {} permissions.", radiologyTechnicianRole.getPermissions().size());

        // PHARMACY_TECHNICIAN Role
        Set<Permission> pharmacyTechnicianPermissions = Stream.of(
                "READ_PATIENT",
                "READ_MEDICATION", "CREATE_MEDICATION", "UPDATE_MEDICATION", "DELETE_MEDICATION", // Manage medication
                                                                                                  // definitions
                "UPDATE_MEDICATION_STOCK", // Adjust stock
                "READ_MEDICATION_HISTORY", // View history
                "READ_PRESCRIPTION", // View prescriptions to dispense
                "READ_PRESCRIBED_MEDICATION" // View details on prescription
        // "DISPENSE_MEDICATION" // Maybe covered by UPDATE_MEDICATION_STOCK or could be
        // explicit
        )
                .map(name -> findPermissionOrThrow(name, permissionRepository))
                .collect(Collectors.toSet());
        Role pharmacyTechnicianRole = createOrFindRole("PHARMACY_TECHNICIAN", roleRepository,
                pharmacyTechnicianPermissions);
        log.info("PHARMACY_TECHNICIAN role has {} permissions.", pharmacyTechnicianRole.getPermissions().size());

        log.info("Default roles and permissions creation/update process finished.");
    }

    private Permission createOrFindPermission(String permissionName, PermissionRepository permissionRepository) {
        return permissionRepository.findByName(permissionName)
                .orElseGet(() -> {
                    Permission permission = new Permission();
                    permission.setName(permissionName);
                    log.info("Creating new permission: {}", permissionName);
                    return permissionRepository.save(permission);
                });
    }

    // Helper to ensure permission exists during role assignment
    private Permission findPermissionOrThrow(String permissionName, PermissionRepository permissionRepository) {
        return permissionRepository.findByName(permissionName)
                .orElseThrow(() -> {
                    log.error("FATAL: Permission '{}' not found during role assignment!", permissionName);
                    return new IllegalStateException("Permission not found: " + permissionName);
                });
    }

    private Role createOrFindRole(String roleName, RoleRepository roleRepository, Set<Permission> permissions) {
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    log.info("Creating new role: {}", roleName);
                    return newRole; // Save happens after setting permissions
                });
        // Always update permissions in case they changed
        role.setPermissions(permissions);
        return roleRepository.save(role);
    }
}