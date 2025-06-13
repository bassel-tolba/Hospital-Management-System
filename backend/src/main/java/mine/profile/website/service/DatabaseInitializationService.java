package mine.profile.website.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important import

import mine.profile.website.models.AssessmentType;
import mine.profile.website.models.Permission;
import mine.profile.website.models.Role;
import mine.profile.website.repository.AssessmentTypeRepository;
import mine.profile.website.repository.PermissionRepository;
import mine.profile.website.repository.RoleRepository;

@Service // Marks this as a Spring-managed service bean
public class DatabaseInitializationService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializationService.class);

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AssessmentTypeRepository assessmentTypeRepository;

    // Constructor Injection of repositories
    public DatabaseInitializationService(RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            AssessmentTypeRepository assessmentTypeRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.assessmentTypeRepository = assessmentTypeRepository;
    }

    // --- Public Orchestration Method ---
    // This is the single entry point called by the CommandLineRunner.
    // The transaction boundary starts HERE.
    @Transactional
    public void initializeDatabaseContent() {
        log.info("Initializing database roles, permissions, and assessment types via Service...");

        // --- Create Permissions (Ensure specific ones exist) ---
        // Call the private helper method within this service
        createOrFindPermission("MANAGE_ASSESSMENT_TYPES");
        createCorePermissions(); // Calls the private helper below

        // --- Create Roles and Assign Permissions ---
        // Calls the private helper below
        createDefaultRolesAndPermissions();

        // --- Create Default Assessment Types ---
        log.info("Initializing default assessment types...");
        // Calls the private helper below
        createDefaultAssessmentTypes();

        log.info("Database initialization complete via Service.");
    }

    // --- Helper Methods Moved from WebsiteApplication ---
    // --- These are now private and DO NOT need @Transactional ---

    // Helper to create all standard permissions
    private void createCorePermissions() {
        log.debug("Creating core application permissions...");
        Stream.of(
                // Patient
                "CREATE_PATIENT", "READ_PATIENT", "UPDATE_PATIENT", "DELETE_PATIENT",
                // User
                "CREATE_USER", "READ_USER", "UPDATE_USER", "DELETE_USER",
                // Appointment
                "CREATE_APPOINTMENT", "READ_APPOINTPOINTMENT", "UPDATE_APPOINTMENT", "DELETE_APPOINTMENT",
                // START: ==================== MODIFICATION ====================
                // ADDED: Core permissions for Activity as requested.
                "CREATE_ACTIVITY", "READ_ACTIVITY", "UPDATE_ACTIVITY", "DELETE_ACTIVITY",
                // END: ==================== MODIFICATION ====================
                // Medication & Prescription
                "CREATE_MEDICATION", "READ_MEDICATION", "UPDATE_MEDICATION", "DELETE_MEDICATION",
                "UPDATE_MEDICATION_STOCK", "READ_MEDICATION_HISTORY", "DELETE_MEDICATION_HISTORY",
                "CREATE_PRESCRIPTION", "READ_PRESCRIPTION", "UPDATE_PRESCRIPTION", "DELETE_PRESCRIPTION",
                "CREATE_PRESCRIBED_MEDICATION", "READ_PRESCRIBED_MEDICATION", "UPDATE_PRESCRIBED_MEDICATION",
                "DELETE_PRESCRIBED_MEDICATION",
                "CREATE_MEDICATION_ADMINISTRATION", "READ_MEDICATION_ADMINISTRATION",
                "DELETE_MEDICATION_ADMINISTRATION",
                "ADMINISTER_MEDICATION",
                // Location
                "CREATE_UNIT", "READ_UNIT", "UPDATE_UNIT", "DELETE_UNIT",
                "CREATE_ROOM", "READ_ROOM", "UPDATE_ROOM", "DELETE_ROOM",
                "CREATE_BED", "READ_BED", "UPDATE_BED", "DELETE_BED", "MANAGE_BEDS",
                // Admission
                "CREATE_ADMISSION", "READ_ADMISSION", "UPDATE_ADMISSION", "DELETE_ADMISSION", "MANAGE_ADMISSION_TYPES",
                // Clinical Data
                "CREATE_ASSESSMENT", "READ_ASSESSMENT", "UPDATE_ASSESSMENT", "DELETE_ASSESSMENT", // Assessment perms
                "MANAGE_ASSESSMENT_TYPES", // Assessment TYPE perms
                "CREATE_NURSING_CARE_PLAN", "READ_NURSING_CARE_PLAN", "UPDATE_NURSING_CARE_PLAN",
                "DELETE_NURSING_CARE_PLAN",
                "CREATE_CARE_PLAN_GOAL", "READ_CARE_PLAN_GOAL", "UPDATE_CARE_PLAN_GOAL", "DELETE_CARE_PLAN_GOAL",
                "CREATE_VITAL_SIGN", "READ_VITAL_SIGN", "UPDATE_VITAL_SIGN", "DELETE_VITAL_SIGN",
                "CREATE_PROCEDURE", "READ_PROCEDURE", "UPDATE_PROCEDURE", "DELETE_PROCEDURE",
                "CREATE_PROCEDURE_LOG", "READ_PROCEDURE_LOG", "DELETE_PROCEDURE_LOG",
                // Lab & Imaging
                "CREATE_LAB_TEST", "READ_LAB_TEST", "UPDATE_LAB_TEST", "DELETE_LAB_TEST",
                "CREATE_LAB_RESULT", "READ_LAB_RESULT", "UPDATE_LAB_RESULT", "DELETE_LAB_RESULT",
                "CREATE_IMAGE_REPORT", "READ_IMAGE_REPORT", "UPDATE_IMAGE_REPORT", "DELETE_IMAGE_REPORT",
                "CREATE_IMAGE_REPORT_TYPE", "READ_IMAGE_REPORT_TYPE", "UPDATE_IMAGE_REPORT_TYPE",
                "DELETE_IMAGE_REPORT_TYPE",
                // Product & Billing
                "CREATE_PRODUCT", "READ_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT", "UPDATE_PRODUCT_STOCK",
                "READ_PRODUCT_HISTORY", "DELETE_PRODUCT_HISTORY",
                "CREATE_PATIENT_PRODUCT_USAGE", "READ_PATIENT_PRODUCT_USAGE", "DELETE_PATIENT_PRODUCT_USAGE",
                "CREATE_BILLING", "READ_BILLING", "UPDATE_BILLING", "DELETE_BILLING",
                // Document
                "CREATE_DOCUMENT", "READ_DOCUMENT", "UPDATE_DOCUMENT", "DELETE_DOCUMENT",
                "CREATE_DOCUMENT_TYPE", "READ_DOCUMENT_TYPE", "UPDATE_DOCUMENT_TYPE", "DELETE_DOCUMENT_TYPE",
                // System & User Activity
                "CREATE_USER_ACTIVITY", "READ_USER_ACTIVITY", "UPDATE_USER_ACTIVITY", "DELETE_USER_ACTIVITY",
                "READ_DASHBOARD",
                // Role & Permission Management
                "MANAGE_ROLES", "CREATE_ROLE", "UPDATE_ROLE", "DELETE_ROLE",
                "MANAGE_PERMISSIONS", "CREATE_PERMISSION", "UPDATE_PERMISSION", "DELETE_PERMISSION",
                // Gemini API Key
                "MANAGE_GEMINI_API_KEY", "MANAGE_ASSESSMENT_TYPES")
                // Call the local helper method, using the injected repository
                .forEach(this::createOrFindPermission);
        log.debug("Core permissions check/creation complete.");
    }

    private void createDefaultRolesAndPermissions() {
        log.info("Assigning permissions to default roles...");

        // Use the injected repository
        List<Permission> allPermissionsList = this.permissionRepository.findAll();
        Set<Permission> allPermissionsSet = new HashSet<>(allPermissionsList);
        log.info("Total permissions available for assignment: {}", allPermissionsSet.size());
        if (allPermissionsSet.isEmpty()) {
            log.warn("No permissions found in the database. Roles will have no permissions.");
        }

        // ADMIN Role - Call local helper createOrFindRole
        Role adminRole = createOrFindRole("ADMIN", allPermissionsSet);
        log.info("ADMIN role created/updated with {} permissions.", adminRole.getPermissions().size());

        // DOCTOR Role - Call local helpers findPermissionsOrThrow and createOrFindRole
        Set<Permission> doctorPermissions = findPermissionsOrThrow(
                "READ_PATIENT", "UPDATE_PATIENT",
                "CREATE_APPOINTMENT", "READ_APPOINTMENT", "UPDATE_APPOINTMENT", "DELETE_APPOINTMENT",
                "CREATE_ASSESSMENT", "READ_ASSESSMENT", "UPDATE_ASSESSMENT", "DELETE_ASSESSMENT",
                "CREATE_PRESCRIPTION", "READ_PRESCRIPTION", "UPDATE_PRESCRIPTION", "DELETE_PRESCRIPTION",
                "CREATE_PRESCRIBED_MEDICATION", "READ_PRESCRIBED_MEDICATION", "UPDATE_PRESCRIBED_MEDICATION",
                "DELETE_PRESCRIBED_MEDICATION",
                "READ_LAB_RESULT", "READ_IMAGE_REPORT",
                "READ_VITAL_SIGN", "READ_NURSING_CARE_PLAN",
                "CREATE_DOCUMENT", "READ_DOCUMENT", "UPDATE_DOCUMENT",
                "READ_PROCEDURE_LOG",
                "READ_MEDICATION",
                "READ_MEDICATION_ADMINISTRATION",
                "READ_USER",
                "READ_DASHBOARD",
                // START: ==================== MODIFICATION ====================
                "READ_UNIT", "READ_ROOM", "READ_BED", "READ_LAB_TEST"
        // END: ==================== MODIFICATION ====================
        );
        Role doctorRole = createOrFindRole("DOCTOR", doctorPermissions);
        log.info("DOCTOR role created/updated with {} permissions.", doctorRole.getPermissions().size());

        // NURSE Role
        Set<Permission> nursePermissions = findPermissionsOrThrow(
                "READ_PATIENT", "UPDATE_PATIENT",
                "READ_APPOINTMENT",
                "CREATE_ASSESSMENT", "READ_ASSESSMENT", "UPDATE_ASSESSMENT", "DELETE_ASSESSMENT",
                "CREATE_NURSING_CARE_PLAN", "READ_NURSING_CARE_PLAN", "UPDATE_NURSING_CARE_PLAN",
                "DELETE_NURSING_CARE_PLAN",
                "CREATE_CARE_PLAN_GOAL", "READ_CARE_PLAN_GOAL", "UPDATE_CARE_PLAN_GOAL", "DELETE_CARE_PLAN_GOAL",
                "CREATE_VITAL_SIGN", "READ_VITAL_SIGN", "UPDATE_VITAL_SIGN", "DELETE_VITAL_SIGN",
                "READ_MEDICATION", "READ_PRESCRIPTION",
                "CREATE_MEDICATION_ADMINISTRATION", "READ_MEDICATION_ADMINISTRATION",
                "DELETE_MEDICATION_ADMINISTRATION",
                "ADMINISTER_MEDICATION",
                "READ_LAB_RESULT", "READ_IMAGE_REPORT",
                "CREATE_DOCUMENT", "READ_DOCUMENT",
                "CREATE_PATIENT_PRODUCT_USAGE", "READ_PATIENT_PRODUCT_USAGE", "DELETE_PATIENT_PRODUCT_USAGE",
                "CREATE_PROCEDURE_LOG", "READ_PROCEDURE_LOG",
                "READ_USER",
                "READ_DASHBOARD",
                "READ_BED", "READ_ROOM", "READ_UNIT",
                // START: ==================== MODIFICATION ====================
                "READ_LAB_TEST"
        // END: ==================== MODIFICATION ====================
        );
        Role nurseRole = createOrFindRole("NURSE", nursePermissions);
        log.info("NURSE role created/updated with {} permissions.", nurseRole.getPermissions().size());

        // RECEPTIONIST Role
        Set<Permission> receptionistPermissions = findPermissionsOrThrow(
                "CREATE_PATIENT", "READ_PATIENT", "UPDATE_PATIENT",
                "CREATE_APPOINTMENT", "READ_APPOINTMENT", "UPDATE_APPOINTMENT", "DELETE_APPOINTMENT",
                "READ_DOCUMENT",
                "READ_ADMISSION", "CREATE_ADMISSION", "UPDATE_ADMISSION",
                "READ_USER",
                "READ_BED", "READ_ROOM", "READ_UNIT",
                // START: ==================== MODIFICATION ====================
                "READ_LAB_TEST"
        // END: ==================== MODIFICATION ====================
        );
        Role receptionistRole = createOrFindRole("RECEPTIONIST", receptionistPermissions);
        log.info("RECEPTIONIST role created/updated with {} permissions.", receptionistRole.getPermissions().size());

        // BILLING_CLERK Role
        Set<Permission> billingClerkPermissions = findPermissionsOrThrow(
                "READ_PATIENT",
                "CREATE_BILLING", "READ_BILLING", "UPDATE_BILLING", "DELETE_BILLING",
                "READ_ADMISSION",
                // START: ==================== MODIFICATION ====================
                "READ_UNIT", "READ_ROOM", "READ_BED", "READ_LAB_TEST"
        // END: ==================== MODIFICATION ====================
        );
        Role billingClerkRole = createOrFindRole("BILLING_CLERK", billingClerkPermissions);
        log.info("BILLING_CLERK role created/updated with {} permissions.", billingClerkRole.getPermissions().size());

        // LAB_TECHNICIAN Role
        Set<Permission> labTechnicianPermissions = findPermissionsOrThrow(
                "READ_PATIENT",
                "CREATE_LAB_TEST", "READ_LAB_TEST", "UPDATE_LAB_TEST", "DELETE_LAB_TEST",
                "CREATE_LAB_RESULT", "READ_LAB_RESULT", "UPDATE_LAB_RESULT", "DELETE_LAB_RESULT",
                // START: ==================== MODIFICATION ====================
                "READ_UNIT", "READ_ROOM", "READ_BED"
        // END: ==================== MODIFICATION ====================
        );
        Role labTechnicianRole = createOrFindRole("LAB_TECHNICIAN", labTechnicianPermissions);
        log.info("LAB_TECHNICIAN role created/updated with {} permissions.", labTechnicianRole.getPermissions().size());

        // RADIOLOGY_TECHNICIAN Role
        Set<Permission> radiologyTechnicianPermissions = findPermissionsOrThrow(
                "READ_PATIENT",
                "CREATE_IMAGE_REPORT", "READ_IMAGE_REPORT", "UPDATE_IMAGE_REPORT", "DELETE_IMAGE_REPORT",
                "CREATE_IMAGE_REPORT_TYPE", "READ_IMAGE_REPORT_TYPE", "UPDATE_IMAGE_REPORT_TYPE",
                "DELETE_IMAGE_REPORT_TYPE",
                // START: ==================== MODIFICATION ====================
                "READ_UNIT", "READ_ROOM", "READ_BED", "READ_LAB_TEST"
        // END: ==================== MODIFICATION ====================
        );
        Role radiologyTechnicianRole = createOrFindRole("RADIOLOGY_TECHNICIAN",
                radiologyTechnicianPermissions);
        log.info("RADIOLOGY_TECHNICIAN role has {} permissions.", radiologyTechnicianRole.getPermissions().size());

        // PHARMACY_TECHNICIAN Role
        Set<Permission> pharmacyTechnicianPermissions = findPermissionsOrThrow(
                "READ_PATIENT",
                "READ_MEDICATION", "CREATE_MEDICATION", "UPDATE_MEDICATION", "DELETE_MEDICATION",
                "UPDATE_MEDICATION_STOCK",
                "READ_MEDICATION_HISTORY",
                "READ_PRESCRIPTION",
                "READ_PRESCRIBED_MEDICATION",
                // START: ==================== MODIFICATION ====================
                "READ_UNIT", "READ_ROOM", "READ_BED", "READ_LAB_TEST"
        // END: ==================== MODIFICATION ====================
        );
        Role pharmacyTechnicianRole = createOrFindRole("PHARMACY_TECHNICIAN",
                pharmacyTechnicianPermissions);
        log.info("PHARMACY_TECHNICIAN role has {} permissions.", pharmacyTechnicianRole.getPermissions().size());

        log.info("Default roles and permissions assignment process finished.");
    }

    // No @Transactional needed
    private void createDefaultAssessmentTypes() {
        log.debug("Starting creation/check of default assessment types...");
        Map<String, String> templates = getAssessmentTemplateMap(); // Call local helper

        templates.forEach((name, content) -> {
            if (content != null) {
                String displayName = generateDisplayName(name); // Call local helper
                // Call the local helper - runs in the existing transaction
                createOrFindAssessmentType(name, displayName, content);
            } else {
                log.warn("Template content for '{}' is null, skipping.", name);
            }
        });
        log.info("Finished checking/creating default assessment types.");
    }

    // --- Helper method to get the CSS Styles (Identical implementation) ---
    private String getStyles() {
        // Paste the exact string content from your getStyles() JS function here
        // IMPORTANT: Escape any literal % signs within the CSS as well if necessary,
        // although typically CSS uses % correctly. Re-checked the provided styles,
        // and the % signs are for widths, etc., which should be fine as part
        // of the *string* being substituted. The issue was with % in the *template*
        // itself.
        return """
                /* Distinguished Medical Institution Assessment Stylesheet - Ethereal Edition v4.0 */
                :root {
                  --font-primary: 'Crimson Pro', 'Cormorant', 'Garamond Premier Pro', Georgia, serif;
                  --font-headers: 'Americana Std', 'Orpheus Pro', 'Vendetta', 'Times New Roman', serif;
                  --font-secondary: 'Acumin Pro', 'Source Sans Pro', system-ui, sans-serif;
                  --font-mono: 'Pitch Sans', 'Input Mono', 'IBM Plex Mono', monospace;
                  --color-primary: #2c3e50;    /* Deep twilight blue */
                  --color-secondary: #34495e;  /* Mystical slate */
                  --color-accent: #3498db;     /* Celestial blue */
                  --color-subtle: #bdc3c7;     /* Misty gray */
                  --text-color: #2c3e50;       /* Deep text */
                  --text-muted: #7f8c8d;       /* Subtle text */
                  --border-color: #ecf0f1;     /* Soft borders */
                  --table-border-color: #dfe6e9; /* Slightly darker table borders */
                  --text-xs: 0.75rem;  /* 12px */
                  --text-sm: 0.875rem; /* 14px */
                  --text-base: 1rem;   /* 16px */
                  --text-lg: 1.125rem; /* 18px */
                  --text-xl: 1.375rem; /* 22px */
                  --text-2xl: 1.75rem; /* 28px */
                  --text-3xl: 2rem;    /* 32px */
                  --spacing-xxs: 0.125rem; /* 2px */
                  --spacing-xs: 0.25rem;  /* 4px */
                  --spacing-sm: 0.5rem;   /* 8px */
                  --spacing-md: 0.75rem;  /* 12px */
                  --spacing-lg: 1rem;     /* 16px */
                  --spacing-xl: 1.5rem;   /* 24px */
                  --spacing-xxl: 2rem;    /* 32px */
                }
                html { font-size: 11pt; line-height: 1.5; -webkit-text-size-adjust: 100%; }
                body { margin: 0; font-family: var(--font-primary); color: var(--text-color); background: #fff; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
                h1, h2, h3, h4, h5, h6 { font-family: var(--font-headers); line-height: 1.2; color: var(--color-primary); margin-top: var(--spacing-lg); margin-bottom: var(--spacing-sm); page-break-after: avoid; font-weight: 600; }
                h1:first-child, h2:first-child, h3:first-child { margin-top: 0; }
                h1.assessment-title { font-size: var(--text-3xl); letter-spacing: -0.02em; color: var(--color-primary); border-bottom: 2pt solid var(--color-accent); padding-bottom: var(--spacing-sm); margin-bottom: var(--spacing-xl); }
                h2.section-title { font-size: var(--text-xl); color: var(--color-secondary); border-bottom: 1pt solid var(--color-accent); padding-bottom: var(--spacing-xs); margin-top: var(--spacing-xl); margin-bottom: var(--spacing-md); }
                h3.subsection-title { font-size: var(--text-lg); color: var(--color-secondary); border-bottom: 1pt dotted var(--color-subtle); margin-top: var(--spacing-lg); margin-bottom: var(--spacing-sm); font-weight: 600; }
                .assessment-container { max-width: 100%; margin: 0 auto; padding: var(--spacing-lg); position: relative; background-color: #fff; }
                .section { margin-bottom: var(--spacing-xl); padding-left: var(--spacing-xs); border-left: 3px solid var(--color-primary); break-inside: avoid; }
                .subsection { margin-left: var(--spacing-lg); margin-bottom: var(--spacing-lg); padding-left: var(--spacing-md); border-left: 2px solid var(--color-subtle); break-inside: avoid; }
                .section:last-child, .subsection:last-child { margin-bottom: 0; }
                table { width: 100%; border-collapse: collapse; margin: var(--spacing-md) 0; font-size: var(--text-sm); break-inside: avoid; border: 1pt solid var(--table-border-color); }
                thead th { font-family: var(--font-secondary); font-weight: 600; text-align: left; padding: var(--spacing-sm) var(--spacing-md); background-color: var(--color-secondary); color: white; border: 1pt solid var(--table-border-color); }
                td { padding: var(--spacing-sm) var(--spacing-md); border: 1pt solid var(--table-border-color); vertical-align: top; line-height: 1.4; }
                tbody tr:nth-child(even) { background-color: #f8f9fa; }
                tbody tr:last-child td { border-bottom: 1pt solid var(--table-border-color); }
                .patient-info-table .label, .vital-signs-table .label { font-family: var(--font-secondary); font-weight: 600; color: var(--color-secondary); background-color: #e9ecef; width: 20%; white-space: nowrap; }
                .patient-info-table td, .vital-signs-table td { width: 30%; }
                p.paragraph { margin-bottom: var(--spacing-md); line-height: 1.6; }
                ul.list, ol.list { list-style: none; padding-left: 0; margin-bottom: var(--spacing-md); margin-left: var(--spacing-sm); }
                li.list-item { margin-bottom: var(--spacing-sm); position: relative; padding-left: 1.8em; line-height: 1.5; }
                ul.list > li.list-item::before { content: "▪"; position: absolute; left: 0.5em; top: 0.1em; color: var(--color-accent); font-size: 0.9em; }
                ol.list { list-style: decimal; padding-left: 2em; margin-left: 0; }
                ol.list > li.list-item { padding-left: 0; margin-bottom: var(--spacing-sm); }
                ol.list > li.list-item::before { content: ""; }
                .list-label { font-family: var(--font-secondary); font-weight: 600; color: var(--color-secondary); margin-right: var(--spacing-xs); }
                .assessor-info { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--spacing-xs); font-style: italic; }
                @media print {
                  @page { margin: 1.5cm 1cm 1.5cm 1cm; size: A4 portrait; @bottom-center { content: "Page " counter(page) " of " counter(pages); font-family: var(--font-secondary); font-size: var(--text-xs); color: var(--text-muted); } }
                  body { font-size: 10pt; min-width: initial !important; }
                  * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; box-shadow: none !important; }
                  h1, h2, h3, h4, h5, h6, p, table, ul, ol, li, .section, .subsection { page-break-inside: avoid !important; break-inside: avoid !important; }
                  h1, h2, h3 { page-break-after: avoid !important; }
                  table { page-break-inside: auto; }
                  thead { display: table-header-group; }
                  tr { page-break-inside: avoid !important; }
                  a { color: var(--text-color) !important; text-decoration: none !important; }
                  .assessment-container { padding: 0; border: none; }
                  .no-print { display: none !important; }
                }
                .text-center { text-align: center; } .text-right { text-align: right; } .font-bold { font-weight: 600; } .text-muted { color: var(--text-muted); } .monospace { font-family: var(--font-mono); }
                .signature-block { margin-top: var(--spacing-xxl); border-top: 1pt solid var(--border-color); padding-top: var(--spacing-md); }
                .signature-line { border-bottom: 1pt solid var(--text-color); margin-top: var(--spacing-xl); margin-bottom: var(--spacing-xs); width: 250px; }
                .signature-title { font-size: var(--text-sm); color: var(--text-muted); }
                """;
    }

    // --- Helper method to get the initial template data (NOW WITH FULL HTML) ---
    private Map<String, String> getAssessmentTemplateMap() {
        Map<String, String> templates = new HashMap<>();
        String styles = getStyles(); // Get common styles once

        // Embed styles directly into each template string, using the full HTML
        templates.put("childAssessment",
                """
                        <style>
                        %s
                        </style>
                        <div class="assessment-container">
                          <h1 class="assessment-title">Pediatric Assessment</h1>
                          <div class="section">
                            <h2 class="section-title">Patient Information</h2>
                            <table class="patient-info-table">
                                <tr>
                                    <td class="label">Patient Name</td>
                                    <td>[Patient Name]</td>
                                    <td class="label">Date of Birth</td>
                                    <td>[Date of Birth]</td>
                                </tr>
                                <tr>
                                    <td class="label">Medical Record Number</td>
                                    <td>[Medical Record Number]</td>
                                     <td class="label">Gender</td>
                                    <td>[Gender]</td>
                                </tr>
                                  <tr>
                                      <td class="label">Admission Date</td>
                                      <td>[Admission Date]</td>
                                      <td class="label">Current Age</td>
                                     <td>[Current Age]</td>
                                 </tr>
                            </table>
                          </div>
                          <div class="section">
                            <h2 class="section-title">Reason for Admission</h2>
                            <p class="paragraph">[Reason for Admission (Paragraph)]</p>
                          </div>
                            <div class="section">
                                <h2 class="section-title">Chief Complaint</h2>
                                <p class="paragraph">[Chief Complaint (Paragraph)]</p>
                            </div>
                          <div class="section">
                            <h2 class="section-title">History of Present Illness (HPI)</h2>
                            <p class="paragraph">[History of Present Illness (Paragraph)]</p>
                          </div>
                          <div class="section">
                            <h2 class="section-title">Past Medical History (PMH)</h2>
                              <p class="paragraph">[Past Medical History (Paragraph)]</p>
                               <ul class="list">
                                      <li class="list-item"><span class="list-label">Allergies:</span> [Allergies]</li>
                                    <li class="list-item"><span class="list-label">Medications:</span> [Medications]</li>
                                    <li class="list-item"><span class="list-label">Vaccinations:</span> [Vaccinations]</li>
                                    <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries:</span> [Previous Hospitalizations/Surgeries]</li>
                                </ul>
                          </div>
                          <div class="section">
                            <h2 class="section-title">Developmental History</h2>
                              <p class="paragraph">[Developmental History (Paragraph)]</p>
                                <ul class="list">
                                    <li class="list-item"><span class="list-label">Gross Motor Skills:</span> [Gross Motor Skills]</li>
                                    <li class="list-item"><span class="list-label">Fine Motor Skills:</span> [Fine Motor Skills]</li>
                                    <li class="list-item"><span class="list-label">Language Skills:</span> [Language Skills]</li>
                                    <li class="list-item"><span class="list-label">Social Skills:</span> [Social Skills]</li>
                                </ul>
                          </div>
                          <div class="section">
                            <h2 class="section-title">Family History</h2>
                            <p class="paragraph">[Family History (Paragraph)]</p>
                                <ul class="list">
                                      <li class="list-item"><span class="list-label">Relevant Medical History of Family Members:</span> [Relevant Medical History of Family Members]</li>
                                </ul>
                          </div>
                           <div class="section">
                            <h2 class="section-title">Social History</h2>
                            <p class="paragraph">[Social History (Paragraph)]</p>
                               <ul class="list">
                                  <li class="list-item"><span class="list-label">Home Environment:</span> [Home Environment]</li>
                                  <li class="list-item"><span class="list-label">School/Daycare:</span> [School/Daycare]</li>
                                   <li class="list-item"><span class="list-label">Family Support:</span> [Family Support]</li>
                              </ul>
                          </div>
                          <div class="section">
                            <h2 class="section-title">Physical Examination</h2>
                            <div class="subsection">
                                <h3 class="subsection-title">Vital Signs</h3>
                                <table class="vital-signs-table">
                                    <tr>
                                        <td class="label">Temperature</td>
                                        <td>[Temperature]</td>
                                        <td class="label">Heart Rate</td>
                                        <td>[Heart Rate]</td>
                                    </tr>
                                     <tr>
                                        <td class="label">Respiratory Rate</td>
                                        <td>[Respiratory Rate]</td>
                                        <td class="label">Blood Pressure</td>
                                        <td>[Blood Pressure]</td>
                                    </tr>
                                     <tr>
                                        <td class="label">Oxygen Saturation</td>
                                        <td>[Oxygen Saturation]</td>
                                        <td class="label">Pain Scale</td>
                                       <td>[Pain Scale]</td>
                                    </tr>
                                </table>
                              </div>
                               <div class="subsection">
                                <h3 class="subsection-title">General Appearance</h3>
                                <p class="paragraph">[General Appearance (Paragraph)]</p>
                              </div>
                                <div class="subsection">
                                  <h3 class="subsection-title">Head and Neck</h3>
                                   <p class="paragraph">[Head and Neck Exam (Paragraph)]</p>
                                </div>
                                <div class="subsection">
                                   <h3 class="subsection-title">Respiratory</h3>
                                   <p class="paragraph">[Respiratory Exam (Paragraph)]</p>
                                </div>
                                <div class="subsection">
                                     <h3 class="subsection-title">Cardiovascular</h3>
                                    <p class="paragraph">[Cardiovascular Exam (Paragraph)]</p>
                                </div>
                                <div class="subsection">
                                     <h3 class="subsection-title">Gastrointestinal</h3>
                                    <p class="paragraph">[Gastrointestinal Exam (Paragraph)]</p>
                                </div>
                                <div class="subsection">
                                    <h3 class="subsection-title">Genitourinary</h3>
                                     <p class="paragraph">[Genitourinary Exam (Paragraph)]</p>
                                </div>
                                 <div class="subsection">
                                   <h3 class="subsection-title">Musculoskeletal</h3>
                                    <p class="paragraph">[Musculoskeletal Exam (Paragraph)]</p>
                               </div>
                               <div class="subsection">
                                    <h3 class="subsection-title">Neurological</h3>
                                    <p class="paragraph">[Neurological Exam (Paragraph)]</p>
                                </div>
                                 <div class="subsection">
                                   <h3 class="subsection-title">Skin</h3>
                                   <p class="paragraph">[Skin Exam (Paragraph)]</p>
                               </div>
                          </div>
                           <div class="section">
                                <h2 class="section-title">Laboratory Results</h2>
                                 <p class="paragraph">[Laboratory Results (Paragraph)]</p>
                                 <ul class="list">
                                     <li class="list-item"><span class="list-label">CBC:</span> [CBC Results]</li>
                                     <li class="list-item"><span class="list-label">Electrolytes:</span> [Electrolytes Results]</li>
                                      <li class="list-item"><span class="list-label">Blood Culture:</span> [Blood Culture Results]</li>
                                      <li class="list-item"><span class="list-label">Urinalysis:</span> [Urinalysis Results]</li>
                                       <li class="list-item"><span class="list-label">Other Labs:</span> [Other Labs Results]</li>
                                </ul>
                            </div>
                           <div class="section">
                                <h2 class="section-title">Imaging Results</h2>
                                <p class="paragraph">[Imaging Results (Paragraph)]</p>
                                 <ul class="list">
                                       <li class="list-item"><span class="list-label">X-ray:</span> [X-ray Results]</li>
                                     <li class="list-item"><span class="list-label">Ultrasound:</span> [Ultrasound Results]</li>
                                      <li class="list-item"><span class="list-label">CT Scan:</span> [CT Scan Results]</li>
                                      <li class="list-item"><span class="list-label">MRI:</span> [MRI Results]</li>
                                 </ul>
                            </div>
                            <div class="section">
                                <h2 class="section-title">Assessment and Plan</h2>
                                <p class="paragraph">[Assessment and Plan (Paragraph)]</p>
                            </div>
                          <div class="section">
                            <h2 class="section-title">Consultations</h2>
                              <ul class="list">
                                <li class="list-item">[Consultation 1]</li>
                                <li class="list-item">[Consultation 2]</li>
                                 <li class="list-item">[Consultation 3]</li>
                              </ul>
                          </div>
                           <div class="section">
                            <h2 class="section-title">Medications Administered</h2>
                             <p class="paragraph">[Medications Administered (Paragraph)]</p>
                               <ul class="list">
                                <li class="list-item"><span class="list-label">Medication 1:</span> [Medication 1 Details]</li>
                                  <li class="list-item"><span class="list-label">Medication 2:</span> [Medication 2 Details]</li>
                                  <li class="list-item"><span class="list-label">Medication 3:</span> [Medication 3 Details]</li>
                              </ul>
                          </div>
                            <div class="section">
                                <h2 class="section-title">Nursing Notes</h2>
                                <p class="paragraph">[Nursing Notes (Paragraph)]</p>
                              </div>
                           <div class="section">
                            <h2 class="section-title">Discharge Plan</h2>
                               <p class="paragraph">[Discharge Plan (Paragraph)]</p>
                               <ul class="list">
                                <li class="list-item"><span class="list-label">Discharge Instructions:</span> [Discharge Instructions]</li>
                                   <li class="list-item"><span class="list-label">Follow Up Appointments:</span> [Follow Up Appointments]</li>
                              </ul>
                            </div>
                            <div class="section">
                                <h2 class="section-title">Additional Notes</h2>
                                <p class="paragraph">[Additional Notes (Paragraph)]</p>
                            </div>
                           <div class="section">
                              <h2 class="section-title">Assessed by:</h2>
                              <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
                              <p class="assessor-info">Date: [Date]</p>
                           </div>
                        </div>
                        """
                        .formatted(styles));

        templates.put("geriatricAssessment",
                """
                        <style>
                        %s
                        </style>
                         <div class="assessment-container">
                           <h1 class="assessment-title">Geriatric Assessment</h1>
                           <div class="section">
                             <h2 class="section-title">Patient Information</h2>
                               <table class="patient-info-table">
                                 <tr>
                                     <td class="label">Patient Name</td>
                                     <td>[Patient Name]</td>
                                     <td class="label">Date of Birth</td>
                                     <td>[Date of Birth]</td>
                                 </tr>
                                 <tr>
                                     <td class="label">Medical Record Number</td>
                                     <td>[Medical Record Number]</td>
                                     <td class="label">Gender</td>
                                     <td>[Gender]</td>
                                 </tr>
                                   <tr>
                                     <td class="label">Admission Date</td>
                                     <td>[Admission Date]</td>
                                     <td class="label">Current Age</td>
                                      <td>[Current Age]</td>
                                  </tr>
                             </table>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Reason for Admission/Visit</h2>
                             <p class="paragraph">[Reason for Admission/Visit (Paragraph)]</p>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Chief Complaint</h2>
                             <p class="paragraph">[Chief Complaint (Paragraph)]</p>
                           </div>
                           <div class="section">
                             <h2 class="section-title">History of Present Illness (HPI)</h2>
                             <p class="paragraph">[History of Present Illness (Paragraph)]</p>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Past Medical History (PMH)</h2>
                             <p class="paragraph">[Past Medical History (Paragraph)]</p>
                                 <ul class="list">
                                     <li class="list-item"><span class="list-label">Allergies:</span> [Allergies]</li>
                                     <li class="list-item"><span class="list-label">Medications:</span> [Medications]</li>
                                     <li class="list-item"><span class="list-label">Immunizations:</span> [Immunizations]</li>
                                    <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries:</span> [Previous Hospitalizations/Surgeries]</li>
                               </ul>
                           </div>
                           <div class="section">
                              <h2 class="section-title">Functional Assessment</h2>
                              <div class="subsection">
                                   <h3 class="subsection-title">Activities of Daily Living (ADLs)</h3>
                                     <ul class="list">
                                         <li class="list-item"><span class="list-label">Bathing:</span> [Bathing Ability]</li>
                                         <li class="list-item"><span class="list-label">Dressing:</span> [Dressing Ability]</li>
                                         <li class="list-item"><span class="list-label">Toileting:</span> [Toileting Ability]</li>
                                         <li class="list-item"><span class="list-label">Transferring:</span> [Transferring Ability]</li>
                                         <li class="list-item"><span class="list-label">Continence:</span> [Continence Ability]</li>
                                         <li class="list-item"><span class="list-label">Feeding:</span> [Feeding Ability]</li>
                                     </ul>
                             </div>
                               <div class="subsection">
                                 <h3 class="subsection-title">Instrumental Activities of Daily Living (IADLs)</h3>
                                    <ul class="list">
                                         <li class="list-item"><span class="list-label">Using Telephone:</span> [Using Telephone Ability]</li>
                                         <li class="list-item"><span class="list-label">Shopping:</span> [Shopping Ability]</li>
                                         <li class="list-item"><span class="list-label">Preparing Food:</span> [Preparing Food Ability]</li>
                                         <li class="list-item"><span class="list-label">Housekeeping:</span> [Housekeeping Ability]</li>
                                         <li class="list-item"><span class="list-label">Doing Laundry:</span> [Doing Laundry Ability]</li>
                                         <li class="list-item"><span class="list-label">Mode of Transportation:</span> [Mode of Transportation Ability]</li>
                                         <li class="list-item"><span class="list-label">Managing Medications:</span> [Managing Medications Ability]</li>
                                         <li class="list-item"><span class="list-label">Managing Finances:</span> [Managing Finances Ability]</li>
                                     </ul>
                                </div>
                           </div>
                           <div class="section">
                              <h2 class="section-title">Cognitive Assessment</h2>
                              <div class="subsection">
                                 <h3 class="subsection-title">Orientation</h3>
                                  <p class="paragraph">[Orientation Status (e.g., Person, Place, Time)]</p>
                               </div>
                              <div class="subsection">
                                 <h3 class="subsection-title">Memory</h3>
                                 <p class="paragraph">[Memory Assessment (e.g., Short-term, Long-term)]</p>
                               </div>
                              <div class="subsection">
                                 <h3 class="subsection-title">Screening Tool (e.g., MMSE, MoCA)</h3>
                                 <p class="paragraph"><span class="list-label">[Tool Name] Score:</span> [Score]/[Total Possible]</p>
                                 <p class="paragraph">Interpretation: [Interpretation]</p>
                               </div>
                           </div>
                            <div class="section">
                                 <h2 class="section-title">Mood Assessment (e.g., GDS)</h2>
                                 <p class="paragraph"><span class="list-label">[Tool Name] Score:</span> [Score]</p>
                                 <p class="paragraph">Interpretation: [Interpretation/Symptoms Noted]</p>
                            </div>
                           <div class="section">
                             <h2 class="section-title">Falls History</h2>
                             <p class="paragraph">[Falls History (Paragraph)]</p>
                                 <ul class="list">
                                     <li class="list-item"><span class="list-label">Number of Falls (Last 6/12 Months):</span> [Number of Falls]</li>
                                     <li class="list-item"><span class="list-label">Fall Circumstances:</span> [Fall Circumstances]</li>
                                     <li class="list-item"><span class="list-label">Injuries from Falls:</span> [Injuries from Falls]</li>
                                    <li class="list-item"><span class="list-label">Fall Risk Assessment Tool:</span> [Tool Name and Score/Risk Level]</li>
                                 </ul>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Social and Environmental History</h2>
                             <p class="paragraph">[Social and Environmental History (Paragraph)]</p>
                                <ul class="list">
                                     <li class="list-item"><span class="list-label">Living Situation:</span> [Living Situation]</li>
                                     <li class="list-item"><span class="list-label">Social Support/Network:</span> [Social Support]</li>
                                     <li class="list-item"><span class="list-label">Home Safety Assessment:</span> [Home Safety Assessment Notes]</li>
                                     <li class="list-item"><span class="list-label">Advanced Directives/Care Preferences:</span> [Directives Status/Details]</li>
                               </ul>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Nutritional Assessment</h2>
                             <p class="paragraph">[Nutritional Assessment (Paragraph)]</p>
                             <ul class="list">
                                 <li class="list-item"><span class="list-label">Recent Weight Change:</span> [Weight Change Details]</li>
                                 <li class="list-item"><span class="list-label">Appetite:</span> [Appetite Details]</li>
                                 <li class="list-item"><span class="list-label">Dietary Habits/Restrictions:</span> [Dietary Details]</li>
                                  <li class="list-item"><span class="list-label">Oral/Dental Status:</span> [Oral/Dental Status]</li>
                                  <li class="list-item"><span class="list-label">Nutritional Screening Tool (e.g., MNA):</span> [Tool Name and Score/Risk Level]</li>
                             </ul>
                           </div>
                            <div class="section">
                               <h2 class="section-title">Sensory Assessment</h2>
                                <ul class="list">
                                    <li class="list-item"><span class="list-label">Vision:</span> [Vision Assessment/Complaints]</li>
                                    <li class="list-item"><span class="list-label">Hearing:</span> [Hearing Assessment/Complaints]</li>
                                </ul>
                            </div>
                           <div class="section">
                               <h2 class="section-title">Pain Assessment</h2>
                               <p class="paragraph">[Pain Assessment (Paragraph) - Location, Quality, Intensity, Timing]</p>
                                <ul class="list">
                                  <li class="list-item"><span class="list-label">Pain Scale Used:</span> [Scale Name]</li>
                                  <li class="list-item"><span class="list-label">Current Pain Score:</span> [Pain Score]</li>
                                  <li class="list-item"><span class="list-label">Pain Management Plan:</span> [Management Plan]</li>
                                </ul>
                           </div>
                             <div class="section">
                                 <h2 class="section-title">Physical Examination</h2>
                                   <div class="subsection">
                                         <h3 class="subsection-title">Vital Signs</h3>
                                         <table class="vital-signs-table">
                                             <tr>
                                                 <td class="label">Temperature</td>
                                                 <td>[Temperature]</td>
                                                 <td class="label">Heart Rate</td>
                                                 <td>[Heart Rate]</td>
                                             </tr>
                                              <tr>
                                                 <td class="label">Respiratory Rate</td>
                                                 <td>[Respiratory Rate]</td>
                                                 <td class="label">Blood Pressure (Supine/Sitting):</td>
                                                 <td>[BP Supine/Sitting]</td>
                                             </tr>
                                              <tr>
                                                 <td class="label">Blood Pressure (Standing):</td>
                                                 <td>[BP Standing]</td>
                                                  <td class="label">Orthostatic Change:</td>
                                                  <td>[Orthostatic Change Notes]</td>
                                              </tr>
                                              <tr>
                                                 <td class="label">Oxygen Saturation</td>
                                                 <td>[Oxygen Saturation]</td>
                                                  <td class="label">Weight</td>
                                                  <td>[Weight]</td>
                                            </tr>
                                         </table>
                                 </div>
                                   <div class="subsection">
                                     <h3 class="subsection-title">General Appearance</h3>
                                     <p class="paragraph">[General Appearance (Paragraph)]</p>
                                 </div>
                                   <div class="subsection">
                                       <h3 class="subsection-title">HEENT</h3>
                                      <p class="paragraph">[HEENT Exam (Paragraph)]</p>
                                   </div>
                                   <div class="subsection">
                                        <h3 class="subsection-title">Cardiovascular</h3>
                                       <p class="paragraph">[Cardiovascular Exam (Paragraph)]</p>
                                   </div>
                                    <div class="subsection">
                                        <h3 class="subsection-title">Respiratory</h3>
                                        <p class="paragraph">[Respiratory Exam (Paragraph)]</p>
                                    </div>
                                     <div class="subsection">
                                           <h3 class="subsection-title">Abdomen</h3>
                                         <p class="paragraph">[Abdominal Exam (Paragraph)]</p>
                                      </div>
                                      <div class="subsection">
                                           <h3 class="subsection-title">Musculoskeletal (inc. Gait & Balance)</h3>
                                         <p class="paragraph">[Musculoskeletal Exam (Paragraph)]</p>
                                         <p class="paragraph">Gait: [Gait Description]</p>
                                         <p class="paragraph">Balance Test (e.g., Timed Up and Go): [Test Name and Result]</p>
                                      </div>
                                      <div class="subsection">
                                          <h3 class="subsection-title">Neurological</h3>
                                          <p class="paragraph">[Neurological Exam (Paragraph)]</p>
                                      </div>
                                      <div class="subsection">
                                          <h3 class="subsection-title">Skin (inc. Foot Exam)</h3>
                                         <p class="paragraph">[Skin Exam (Paragraph)]</p>
                                         <p class="paragraph">Foot Exam: [Foot Exam Notes]</p>
                                      </div>
                             </div>
                           <div class="section">
                             <h2 class="section-title">Medication Review</h2>
                             <p class="paragraph">[Medication Review Notes (Paragraph)]</p>
                                <ul class="list">
                                  <li class="list-item"><span class="list-label">Number of Medications:</span> [Number of Medications]</li>
                                  <li class="list-item"><span class="list-label">Polypharmacy Concerns:</span> [Polypharmacy Concerns]</li>
                                  <li class="list-item"><span class="list-label">Potentially Inappropriate Medications (e.g., Beers Criteria):</span> [PIMs Noted]</li>
                                   <li class="list-item"><span class="list-label">Medication Adherence Assessment:</span> [Medication Adherence]</li>
                                  </ul>
                           </div>
                             <div class="section">
                                 <h2 class="section-title">Laboratory Results</h2>
                                 <p class="paragraph">[Laboratory Results (Paragraph)]</p>
                                   <ul class="list">
                                       <li class="list-item"><span class="list-label">CBC:</span> [CBC Results]</li>
                                       <li class="list-item"><span class="list-label">Electrolytes:</span> [Electrolytes Results]</li>
                                       <li class="list-item"><span class="list-label">Renal Function (BUN/Cr):</span> [Renal Function Results]</li>
                                       <li class="list-item"><span class="list-label">Liver Function:</span> [Liver Function Results]</li>
                                        <li class="list-item"><span class="list-label">Glucose/A1c:</span> [Glucose/A1c Results]</li>
                                        <li class="list-item"><span class="list-label">Thyroid Function (TSH):</span> [Thyroid Function Results]</li>
                                        <li class="list-item"><span class="list-label">Vitamin B12/Folate:</span> [Vitamin B12/Folate Results]</li>
                                        <li class="list-item"><span class="list-label">Vitamin D:</span> [Vitamin D Results]</li>
                                        <li class="list-item"><span class="list-label">Other Relevant Labs:</span> [Other Labs Results]</li>
                                    </ul>
                             </div>
                             <div class="section">
                                 <h2 class="section-title">Imaging Results</h2>
                                 <p class="paragraph">[Imaging Results (Paragraph)]</p>
                                  <ul class="list">
                                      <li class="list-item"><span class="list-label">X-ray:</span> [X-ray Results]</li>
                                       <li class="list-item"><span class="list-label">Ultrasound:</span> [Ultrasound Results]</li>
                                        <li class="list-item"><span class="list-label">CT Scan:</span> [CT Scan Results]</li>
                                        <li class="list-item"><span class="list-label">MRI:</span> [MRI Results]</li>
                                        <li class="list-item"><span class="list-label">DEXA Scan:</span> [DEXA Scan Results]</li>
                                  </ul>
                             </div>
                             <div class="section">
                                 <h2 class="section-title">Assessment Summary & Problem List</h2>
                                 <p class="paragraph">[Assessment Summary (Paragraph)]</p>
                                 <ol class="list">
                                     <li>[Problem 1]</li>
                                     <li>[Problem 2]</li>
                                     <li>[Problem 3]</li>
                                     <!-- Add more problems as needed -->
                                 </ol>
                             </div>
                              <div class="section">
                                 <h2 class="section-title">Plan of Care</h2>
                                  <p class="paragraph">[Overall Plan (Paragraph)]</p>
                                  <!-- Can detail plan per problem -->
                                  <p class="paragraph">Problem 1 Plan: [Plan for Problem 1]</p>
                                  <p class="paragraph">Problem 2 Plan: [Plan for Problem 2]</p>
                             </div>
                           <div class="section">
                             <h2 class="section-title">Consultations/Referrals</h2>
                               <ul class="list">
                                 <li class="list-item">[Consultation/Referral 1]</li>
                                 <li class="list-item">[Consultation/Referral 2]</li>
                                  <li class="list-item">[Consultation/Referral 3]</li>
                               </ul>
                           </div>
                             <div class="section">
                             <h2 class="section-title">Discharge/Follow-up Plan</h2>
                              <p class="paragraph">[Discharge/Follow-up Plan (Paragraph)]</p>
                               <ul class="list">
                                 <li class="list-item"><span class="list-label">Disposition:</span> [Disposition (Home, Rehab, etc.)]</li>
                                  <li class="list-item"><span class="list-label">Follow Up Appointments:</span> [Follow Up Appointments]</li>
                                  <li class="list-item"><span class="list-label">Patient/Family Education Provided:</span> [Education Provided]</li>
                              </ul>
                           </div>
                             <div class="section">
                                 <h2 class="section-title">Additional Notes</h2>
                                 <p class="paragraph">[Additional Notes (Paragraph)]</p>
                             </div>
                             <div class="section">
                               <h2 class="section-title">Assessed by:</h2>
                               <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
                               <p class="assessor-info">Date: [Date]</p>
                             </div>
                         </div>
                        """
                        .formatted(styles));

        templates.put("womensHealthAssessment",
                """
                        <style>
                        %s
                        </style>
                         <div class="assessment-container">
                           <h1 class="assessment-title">Women's Health Assessment</h1>
                          <div class="section">
                             <h2 class="section-title">Patient Information</h2>
                               <table class="patient-info-table">
                                 <tr>
                                     <td class="label">Patient Name</td>
                                     <td>[Patient Name]</td>
                                     <td class="label">Date of Birth</td>
                                     <td>[Date of Birth]</td>
                                 </tr>
                                 <tr>
                                     <td class="label">Medical Record Number</td>
                                     <td>[Medical Record Number]</td>
                                     <td class="label">Gender</td>
                                     <td>[Gender]</td>
                                 </tr>
                                   <tr>
                                       <td class="label">Date of Visit</td>
                                       <td>[Date of Visit]</td>
                                       <td class="label">Current Age</td>
                                      <td>[Current Age]</td>
                                  </tr>
                             </table>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Reason for Visit</h2>
                             <p class="paragraph">[Reason for Visit (Paragraph)]</p>
                           </div>
                            <div class="section">
                                 <h2 class="section-title">Chief Complaint</h2>
                                 <p class="paragraph">[Chief Complaint (Paragraph)]</p>
                             </div>
                           <div class="section">
                             <h2 class="section-title">History of Present Illness (HPI)</h2>
                             <p class="paragraph">[History of Present Illness (Paragraph)]</p>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Past Medical History (PMH)</h2>
                             <p class="paragraph">[Past Medical History (Paragraph)]</p>
                                <ul class="list">
                                     <li class="list-item"><span class="list-label">Allergies:</span> [Allergies]</li>
                                     <li class="list-item"><span class="list-label">Current Medications:</span> [Current Medications]</li>
                                      <li class="list-item"><span class="list-label">Immunizations (e.g., HPV, Flu):</span> [Immunizations Status]</li>
                                     <li class="list-item"><span class="list-label">Previous Hospitalizations/Surgeries (Non-Gyn):</span> [Previous Hospitalizations/Surgeries]</li>
                                </ul>
                           </div>
                             <div class="section">
                                 <h2 class="section-title">Menstrual History</h2>
                                 <ul class="list">
                                     <li class="list-item"><span class="list-label">Age at Menarche:</span> [Menarche Age]</li>
                                     <li class="list-item"><span class="list-label">Last Menstrual Period (LMP):</span> [Last Menstrual Period Date]</li>
                                     <li class="list-item"><span class="list-label">Cycle Length & Regularity:</span> [Cycle Length & Regularity Details]</li>
                                     <li class="list-item"><span class="list-label">Duration & Flow:</span> [Duration & Flow Details]</li>
                                     <li class="list-item"><span class="list-label">Associated Symptoms (e.g., Dysmenorrhea, PMS):</span> [Associated Symptoms]</li>
                                     <li class="list-item"><span class="list-label">Menopause Status (if applicable):</span> [Menopause Status/Age]</li>
                                     <li class="list-item"><span class="list-label">Hormone Replacement Therapy (HRT) (if applicable):</span> [HRT Details]</li>
                                 </ul>
                             </div>
                             <div class="section">
                                 <h2 class="section-title">Obstetric History (GTPAL)</h2>
                                <p class="paragraph">Gravida: [G] Term: [T] Preterm: [P] Abortions: [A] Living: [L]</p>
                                <p class="paragraph">Details of Pregnancies: [Details (Year, Outcome, Complications)]</p>
                             </div>
                             <div class="section">
                                 <h2 class="section-title">Gynecological History</h2>
                                   <p class="paragraph">[Gynecological History Summary (Paragraph)]</p>
                                     <ul class="list">
                                        <li class="list-item"><span class="list-label">History of Abnormal Pap Smears:</span> [Pap Smear History Details (Date, Result, Follow-up)]</li>
                                        <li class="list-item"><span class="list-label">Date of Last Pap Smear:</span> [Last Pap Smear Date]</li>
                                        <li class="list-item"><span class="list-label">History of STIs:</span> [STI History Details (Type, Treatment)]</li>
                                        <li class="list-item"><span class="list-label">History of Pelvic Inflammatory Disease (PID):</span> [PID History]</li>
                                        <li class="list-item"><span class="list-label">History of Endometriosis/Fibroids/Ovarian Cysts:</span> [History Details]</li>
                                        <li class="list-item"><span class="list-label">Previous Gynecological Surgeries:</span> [Previous Gyn Surgeries]</li>
                                        <li class="list-item"><span class="list-label">Any Current Gynecological Symptoms (e.g., Vaginal Discharge, Itching, Pain):</span> [Current Gyn Symptoms]</li>
                                    </ul>
                             </div>
                              <div class="section">
                                 <h2 class="section-title">Contraceptive History</h2>
                                   <ul class="list">
                                       <li class="list-item"><span class="list-label">Current Method:</span> [Current Method]</li>
                                       <li class="list-item"><span class="list-label">Past Methods Used:</span> [Past Methods]</li>
                                       <li class="list-item"><span class="list-label">Satisfaction/Side Effects:</span> [Satisfaction/Side Effects]</li>
                                        <li class="list-item"><span class="list-label">Future Contraceptive Plans:</span> [Future Plans]</li>
                                   </ul>
                              </div>
                               <div class="section">
                                  <h2 class="section-title">Sexual History</h2>
                                    <ul class="list">
                                        <li class="list-item"><span class="list-label">Sexually Active:</span> [Yes/No/Details]</li>
                                        <li class="list-item"><span class="list-label">Number of Partners (Lifetime/Recent):</span> [Number of Partners]</li>
                                        <li class="list-item"><span class="list-label">Gender of Partners:</span> [Gender of Partners]</li>
                                        <li class="list-item"><span class="list-label">History of Sexual Abuse/Trauma:</span> [History Details or Deferred]</li>
                                        <li class="list-item"><span class="list-label">Any Sexual Concerns (e.g., Dyspareunia, Libido):</span> [Sexual Concerns]</li>
                                    </ul>
                               </div>
                           <div class="section">
                             <h2 class="section-title">Family History</h2>
                              <p class="paragraph">[Family History (Paragraph)]</p>
                               <ul class="list">
                                   <li class="list-item"><span class="list-label">History of Breast/Ovarian/Uterine/Colon Cancer:</span> [Cancer History Details]</li>
                                   <li class="list-item"><span class="list-label">History of Osteoporosis:</span> [Osteoporosis History]</li>
                                   <li class="list-item"><span class="list-label">Other Relevant Family History (e.g., Diabetes, Heart Disease):</span> [Other Relevant History]</li>
                              </ul>
                           </div>
                          <div class="section">
                             <h2 class="section-title">Social History</h2>
                             <p class="paragraph">[Social History (Paragraph)]</p>
                               <ul class="list">
                                    <li class="list-item"><span class="list-label">Occupation:</span> [Occupation Details]</li>
                                    <li class="list-item"><span class="list-label">Relationship Status:</span> [Relationship Status]</li>
                                    <li class="list-item"><span class="list-label">Living Situation/Support System:</span> [Living Situation]</li>
                                    <li class="list-item"><span class="list-label">Tobacco Use:</span> [Tobacco Use Details (Pack-years)]</li>
                                    <li class="list-item"><span class="list-label">Alcohol Use:</span> [Alcohol Use Details (Frequency, Amount)]</li>
                                    <li class="list-item"><span class="list-label">Illicit Drug Use:</span> [Drug Use Details]</li>
                                    <li class="list-item"><span class="list-label">Diet & Exercise Habits:</span> [Diet & Exercise Details]</li>
                                    <li class="list-item"><span class="list-label">Safety Concerns (Domestic Violence Screen):</span> [Safety Screen Results/Notes]</li>
                                 </ul>
                           </div>
                             <div class="section">
                               <h2 class="section-title">Physical Examination</h2>
                                <div class="subsection">
                                 <h3 class="subsection-title">Vital Signs</h3>
                                 <table class="vital-signs-table">
                                     <tr>
                                         <td class="label">Temperature</td>
                                         <td>[Temperature]</td>
                                         <td class="label">Heart Rate</td>
                                         <td>[Heart Rate]</td>
                                     </tr>
                                      <tr>
                                         <td class="label">Respiratory Rate</td>
                                         <td>[Respiratory Rate]</td>
                                         <td class="label">Blood Pressure</td>
                                         <td>[Blood Pressure]</td>
                                     </tr>
                                      <tr>
                                          <td class="label">Height</td>
                                          <td>[Height]</td>
                                          <td class="label">Weight</td>
                                          <td>[Weight]</td>
                                    </tr>
                                     <tr>
                                        <td class="label">BMI</td>
                                        <td>[BMI]</td>
                                         <td class="label">Oxygen Saturation (if indicated)</td>
                                         <td>[Oxygen Saturation]</td>
                                    </tr>
                                 </table>
                                 </div>
                                  <div class="subsection">
                                     <h3 class="subsection-title">General Appearance</h3>
                                      <p class="paragraph">[General Appearance (Paragraph)]</p>
                                  </div>
                                 <div class="subsection">
                                     <h3 class="subsection-title">Thyroid</h3>
                                     <p class="paragraph">[Thyroid Exam Findings]</p>
                                  </div>
                                   <div class="subsection">
                                      <h3 class="subsection-title">Cardiovascular</h3>
                                      <p class="paragraph">[Cardiovascular Exam Findings]</p>
                                   </div>
                                    <div class="subsection">
                                        <h3 class="subsection-title">Respiratory</h3>
                                       <p class="paragraph">[Respiratory Exam Findings]</p>
                                    </div>
                                 <div class="subsection">
                                     <h3 class="subsection-title">Abdomen</h3>
                                     <p class="paragraph">[Abdominal Exam Findings]</p>
                                  </div>
                                 <div class="subsection">
                                    <h3 class="subsection-title">Breast Exam</h3>
                                     <p class="paragraph">Inspection: [Inspection Findings]</p>
                                     <p class="paragraph">Palpation: [Palpation Findings (Masses, Tenderness, Nodes)]</p>
                                     <p class="paragraph">Self-Breast Exam (SBE) Education Provided: [Yes/No]</p>
                                </div>
                                   <div class="subsection">
                                     <h3 class="subsection-title">Pelvic Exam</h3>
                                       <p class="paragraph">External Genitalia: [External Exam Findings]</p>
                                       <p class="paragraph">Vaginal Walls/Cervix (Speculum Exam): [Speculum Exam Findings]</p>
                                       <p class="paragraph">Bimanual Exam (Uterus/Adnexa): [Bimanual Exam Findings]</p>
                                       <p class="paragraph">Rectovaginal Exam (if indicated): [Rectovaginal Exam Findings]</p>
                                       <p class="paragraph">Specimens Collected (e.g., Pap, Cultures): [Specimens Collected]</p>
                                    </div>
                                 <div class="subsection">
                                      <h3 class="subsection-title">Skin</h3>
                                      <p class="paragraph">[Skin Exam Findings (relevant rashes, lesions)]</p>
                                  </div>
                             </div>
                             <div class="section">
                                 <h2 class="section-title">Screening Recommendations Discussed/Ordered</h2>
                                  <ul class="list">
                                      <li class="list-item"><span class="list-label">Cervical Cancer Screening (Pap/HPV):</span> [Status/Plan]</li>
                                      <li class="list-item"><span class="list-label">Breast Cancer Screening (Mammogram/Clinical Exam):</span> [Status/Plan]</li>
                                      <li class="list-item"><span class="list-label">Colorectal Cancer Screening:</span> [Status/Plan]</li>
                                      <li class="list-item"><span class="list-label">STI Screening:</span> [Status/Plan]</li>
                                      <li class="list-item"><span class="list-label">Osteoporosis Screening (DEXA):</span> [Status/Plan]</li>
                                      <li class="list-item"><span class="list-label">Diabetes Screening:</span> [Status/Plan]</li>
                                      <li class="list-item"><span class="list-label">Lipid Screening:</span> [Status/Plan]</li>
                                      <li class="list-item"><span class="list-label">Other Relevant Screenings:</span> [Status/Plan]</li>
                                  </ul>
                             </div>
                             <div class="section">
                                 <h2 class="section-title">Laboratory & Imaging Results (if available)</h2>
                                 <p class="paragraph">[Laboratory Results (Paragraph)]</p>
                                 <ul class="list">
                                    <li class="list-item"><span class="list-label">Pap Smear Result:</span> [Pap Smear Result]</li>
                                    <li class="list-item"><span class="list-label">HPV Result:</span> [HPV Result]</li>
                                    <li class="list-item"><span class="list-label">STI Results:</span> [STI Results]</li>
                                    <li class="list-item"><span class="list-label">CBC/Other Blood Work:</span> [Blood Work Results]</li>
                                    <li class="list-item"><span class="list-label">Urinalysis:</span> [Urinalysis Result]</li>
                                </ul>
                                 <p class="paragraph">[Imaging Results (Paragraph)]</p>
                                  <ul class="list">
                                     <li class="list-item"><span class="list-label">Mammogram Result:</span> [Mammogram Result]</li>
                                     <li class="list-item"><span class="list-label">Pelvic Ultrasound Result:</span> [Ultrasound Result]</li>
                                     <li class="list-item"><span class="list-label">DEXA Scan Result:</span> [DEXA Result]</li>
                                  </ul>
                             </div>
                             <div class="section">
                                 <h2 class="section-title">Assessment and Plan</h2>
                                 <p class="paragraph">[Assessment Summary/Problem List (Paragraph)]</p>
                                 <ol class="list">
                                     <li>[Problem 1]: [Plan for Problem 1]</li>
                                     <li>[Problem 2]: [Plan for Problem 2]</li>
                                     <li>[Problem 3]: [Plan for Problem 3]</li>
                                     <li>Health Maintenance: [Plan for Health Maintenance (Screenings, Immunizations)]</li>
                                 </ol>
                             </div>
                           <div class="section">
                             <h2 class="section-title">Consultations/Referrals Made</h2>
                                <ul class="list">
                                   <li class="list-item">[Consultation/Referral 1]</li>
                                   <li class="list-item">[Consultation/Referral 2]</li>
                                </ul>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Patient Education Provided</h2>
                               <p class="paragraph">[Topics Covered (e.g., Contraception, SBE, Diet, Exercise)]</p>
                           </div>
                           <div class="section">
                             <h2 class="section-title">Follow Up Plan</h2>
                               <p class="paragraph">[Follow Up Instructions (Timing, Reason)]</p>
                           </div>
                             <div class="section">
                                 <h2 class="section-title">Additional Notes</h2>
                                 <p class="paragraph">[Additional Notes (Paragraph)]</p>
                             </div>
                           <div class="section">
                               <h2 class="section-title">Assessed by:</h2>
                               <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
                               <p class="assessor-info">Date: [Date]</p>
                           </div>
                         </div>
                        """
                        .formatted(styles));

        templates.put("criticalCareAssessment",
                """
                        <style>
                        %s
                        </style>
                          <div class="assessment-container">
                            <h1 class="assessment-title">Critical Care Assessment</h1>
                            <div class="section">
                              <h2 class="section-title">Patient Information</h2>
                                <table class="patient-info-table">
                                  <tr>
                                      <td class="label">Patient Name</td>
                                      <td>[Patient Name]</td>
                                      <td class="label">Date of Birth</td>
                                      <td>[Date of Birth]</td>
                                  </tr>
                                  <tr>
                                      <td class="label">Medical Record Number</td>
                                      <td>[Medical Record Number]</td>
                                      <td class="label">Gender</td>
                                      <td>[Gender]</td>
                                  </tr>
                                    <tr>
                                      <td class="label">Admission Date to Hospital</td>
                                      <td>[Hospital Admission Date]</td>
                                        <td class="label">Admission Date to ICU</td>
                                        <td>[ICU Admission Date]</td>
                                    </tr>
                                     <tr>
                                         <td class="label">Current Age</td>
                                          <td>[Current Age]</td>
                                         <td class="label">Code Status</td>
                                         <td>[Code Status]</td>
                                     </tr>
                                     <tr>
                                         <td class="label">Allergies</td>
                                         <td colspan="3">[Allergies]</td>
                                    </tr>
                              </table>
                            </div>

                              <div class="section">
                                <h2 class="section-title">Reason for Admission to ICU</h2>
                                <p class="paragraph">[Reason for Admission to ICU (Paragraph)]</p>
                              </div>

                              <div class="section">
                                <h2 class="section-title">Primary Diagnoses</h2>
                                <ol class="list">
                                     <li>[Diagnosis 1]</li>
                                     <li>[Diagnosis 2]</li>
                                     <!-- Add more as needed -->
                                 </ol>
                              </div>

                            <div class="section">
                              <h2 class="section-title">History of Present Illness (HPI) - ICU Course Summary</h2>
                              <p class="paragraph">[HPI / ICU Course Summary (Paragraph)]</p>
                            </div>

                             <div class="section">
                              <h2 class="section-title">Past Medical History (PMH)</h2>
                                <p class="paragraph">[Relevant Past Medical History (Paragraph)]</p>
                            </div>

                            <div class="section">
                              <h2 class="section-title">Neurological Assessment</h2>
                              <div class="subsection">
                                 <h3 class="subsection-title">Level of Consciousness/Sedation</h3>
                                 <p class="paragraph">[LOC Description (Alert, Lethargic, Obtunded, Comatose)]</p>
                                  <p class="paragraph">Sedation Scale (e.g., RASS): [Scale Name] Score: [Score] ([Interpretation])</p>
                               </div>
                               <div class="subsection">
                                  <h3 class="subsection-title">Glasgow Coma Scale (GCS)</h3>
                                  <p class="paragraph">Eye Opening (E): [E Score]</p>
                                  <p class="paragraph">Verbal Response (V): [V Score]</p>
                                  <p class="paragraph">Motor Response (M): [M Score]</p>
                                  <p class="paragraph">Total GCS: [Total Score]</p>
                              </div>
                               <div class="subsection">
                                    <h3 class="subsection-title">Pupillary Response</h3>
                                    <p class="paragraph">Right Pupil: Size [Size mm], Reaction [Brisk/Sluggish/Nonreactive]</p>
                                    <p class="paragraph">Left Pupil: Size [Size mm], Reaction [Brisk/Sluggish/Nonreactive]</p>
                               </div>
                                <div class="subsection">
                                      <h3 class="subsection-title">Motor Function</h3>
                                    <p class="paragraph">Upper Extremities: [Motor Strength/Response (Follows Commands, Localizes, Withdraws, Flexion, Extension, None)]</p>
                                     <p class="paragraph">Lower Extremities: [Motor Strength/Response]</p>
                               </div>
                                <div class="subsection">
                                    <h3 class="subsection-title">Seizure Activity</h3>
                                    <p class="paragraph">[Seizure Activity Observed/Reported]</p>
                                </div>
                                 <div class="subsection">
                                    <h3 class="subsection-title">Delirium Screen (e.g., CAM-ICU)</h3>
                                    <p class="paragraph">Tool Used: [Tool Name], Result: [Positive/Negative/Unable to Assess]</p>
                                </div>
                            </div>

                            <div class="section">
                              <h2 class="section-title">Cardiovascular Assessment</h2>
                                 <div class="subsection">
                                     <h3 class="subsection-title">Hemodynamics</h3>
                                     <table class="vital-signs-table">
                                         <tr><td class="label">Heart Rate</td><td>[Heart Rate] bpm</td><td class="label">Rhythm</td><td>[Rhythm (e.g., NSR, Afib)]</td></tr>
                                         <tr><td class="label">Blood Pressure (Art/Cuff)</td><td>[Blood Pressure] mmHg</td><td class="label">MAP</td><td>[MAP] mmHg</td></tr>
                                         <tr><td class="label">Central Venous Pressure (CVP)</td><td>[CVP] mmHg</td><td class="label">Pulm Art Pressure (PAP)</td><td>[PAP] mmHg</td></tr>
                                          <tr><td class="label">Cardiac Output/Index (CO/CI)</td><td>[CO/CI] L/min/m²</td><td class="label">SVR</td><td>[SVR] dyn·s/cm⁵</td></tr>
                                     </table>
                                 </div>
                                 <div class="subsection">
                                      <h3 class="subsection-title">Cardiac Exam</h3>
                                     <p class="paragraph">Heart Sounds: [Heart Sounds (S1, S2, Murmurs, Gallops)]</p>
                                      <p class="paragraph">Peripheral Pulses: [Pulse Quality (e.g., +2, Thready) - Radial, Pedal]</p>
                                      <p class="paragraph">Capillary Refill: [< 3 seconds / Delayed]</p>
                                       <p class="paragraph">Edema: [Location and Severity (e.g., +1 Pitting Edema Lower Extremities)]</p>
                                </div>
                                  <div class="subsection">
                                      <h3 class="subsection-title">ECG Findings</h3>
                                        <p class="paragraph">[Significant ECG Findings/Changes (Paragraph)]</p>
                                    </div>
                                     <div class="subsection">
                                         <h3 class="subsection-title">Vasoactive Drips</h3>
                                         <ul class="list">
                                             <li>[Medication 1]: [Dose/Rate]</li>
                                             <li>[Medication 2]: [Dose/Rate]</li>
                                             <!-- Add more as needed -->
                                         </ul>
                                     </div>
                            </div>

                              <div class="section">
                                  <h2 class="section-title">Respiratory Assessment</h2>
                                   <div class="subsection">
                                     <h3 class="subsection-title">Oxygenation & Ventilation</h3>
                                      <table class="vital-signs-table">
                                         <tr><td class="label">Respiratory Rate</td><td>[Respiratory Rate] breaths/min</td><td class="label">Pattern</td><td>[Pattern (e.g., Regular, Labored)]</td></tr>
                                          <tr><td class="label">Oxygen Saturation (SpO2)</td><td>[SpO2] %%</td><td class="label">FiO2</td><td>[FiO2] %%</td></tr>
                                          <tr><td class="label">Mode of Oxygen Delivery</td><td colspan="3">[Mode (e.g., Nasal Cannula, Venturi Mask, Mechanical Ventilator)]</td></tr>
                                      </table>
                                   </div>
                                    <div class="subsection">
                                       <h3 class="subsection-title">Mechanical Ventilation Settings (if applicable)</h3>
                                        <p class="paragraph">Mode: [Vent Mode (e.g., AC, SIMV, PSV)]</p>
                                        <p class="paragraph">Tidal Volume (Vt): [Vt] mL (or mL/kg)</p>
                                        <p class="paragraph">Respiratory Rate (Set): [Set Rate] breaths/min</p>
                                        <p class="paragraph">PEEP: [PEEP] cmH2O</p>
                                        <p class="paragraph">Pressure Support (PS): [PS] cmH2O</p>
                                         <p class="paragraph">Peak Inspiratory Pressure (PIP): [PIP] cmH2O</p>
                                         <p class="paragraph">Plateau Pressure (Pplat): [Pplat] cmH2O</p>
                                   </div>
                                  <div class="subsection">
                                      <h3 class="subsection-title">Respiratory Exam</h3>
                                       <p class="paragraph">Breath Sounds: [Auscultation Findings (e.g., Clear, Crackles, Wheezes, Diminished) - Specify Location]</p>
                                       <p class="paragraph">Work of Breathing: [Accessory Muscle Use, Retractions]</p>
                                       <p class="paragraph">Sputum: [Color, Consistency, Amount]</p>
                                        <p class="paragraph">Artificial Airway (if applicable): Type [ETT/Trach], Size [Size], Position [cm at lip/stoma]</p>
                                       <p class="paragraph">Chest Tube(s) (if applicable): Location [Location], Output [Amount/Character], Air Leak [Yes/No]</p>
                                  </div>
                                   <div class="subsection">
                                      <h3 class="subsection-title">Arterial Blood Gas (ABG) Results</h3>
                                      <p class="paragraph">Date/Time: [ABG Date/Time]</p>
                                      <p class="paragraph">pH: [pH]</p>
                                      <p class="paragraph">PaCO2: [PaCO2] mmHg</p>
                                      <p class="paragraph">PaO2: [PaO2] mmHg</p>
                                      <p class="paragraph">HCO3: [HCO3] mEq/L</p>
                                       <p class="paragraph">Base Excess (BE): [BE]</p>
                                      <p class="paragraph">SaO2: [SaO2] %%</p>
                                      <p class="paragraph">Interpretation: [ABG Interpretation]</p>
                                  </div>
                              </div>

                            <div class="section">
                              <h2 class="section-title">Gastrointestinal Assessment</h2>
                              <div class="subsection">
                                  <h3 class="subsection-title">Abdominal Exam</h3>
                                    <p class="paragraph">Inspection: [Distension, Scars]</p>
                                    <p class="paragraph">Auscultation: [Bowel Sounds (Present, Hypoactive, Hyperactive, Absent)]</p>
                                    <p class="paragraph">Palpation: [Tenderness, Rigidity, Guarding]</p>
                              </div>
                                <div class="subsection">
                                  <h3 class="subsection-title">Nutrition/Feeding</h3>
                                     <p class="paragraph">Route: [PO / NGT / OGT / PEG / TPN / NPO]</p>
                                     <p class="paragraph">Diet/Formula: [Diet Order or Formula Type]</p>
                                     <p class="paragraph">Rate/Goal: [Rate mL/hr or Goal kcal/day]</p>
                                     <p class="paragraph">Residuals (if applicable): [Residual Volume]</p>
                                      <p class="paragraph">Tolerance: [Nausea, Vomiting, Diarrhea, Constipation]</p>
                                </div>
                                  <div class="subsection">
                                      <h3 class="subsection-title">Bowel Management</h3>
                                      <p class="paragraph">Last Bowel Movement: [Date/Character]</p>
                                      <p class="paragraph">Bowel Management Plan: [e.g., Stool Softeners, Laxatives]</p>
                                  </div>
                                  <div class="subsection">
                                      <h3 class="subsection-title">GI Tubes (if applicable)</h3>
                                      <p class="paragraph">Type: [e.g., NGT, OGT], Purpose: [e.g., Decompression, Feeding], Output: [Amount/Character]</p>
                                  </div>
                              </div>


                            <div class="section">
                              <h2 class="section-title">Renal Assessment</h2>
                              <div class="subsection">
                                  <h3 class="subsection-title">Urine Output</h3>
                                   <p class="paragraph">Method: [Foley Catheter / Voiding / Diaper Weight]</p>
                                   <p class="paragraph">Urine Output (Last Hour): [Volume] mL</p>
                                   <p class="paragraph">Urine Output (Last 8/12/24 Hours): [Volume] mL</p>
                                   <p class="paragraph">Urine Color/Character: [Color, Clarity]</p>
                              </div>
                               <div class="subsection">
                                    <h3 class="subsection-title">Fluid Balance</h3>
                                     <p class="paragraph">Intake (Last 8/12/24 Hours): [Total Intake] mL</p>
                                     <p class="paragraph">Output (Last 8/12/24 Hours): [Total Output] mL</p>
                                     <p class="paragraph">Net Fluid Balance: [+ / -] [Balance] mL</p>
                              </div>
                                <div class="subsection">
                                    <h3 class="subsection-title">Renal Function Labs</h3>
                                    <p class="paragraph">BUN: [BUN Value] mg/dL</p>
                                    <p class="paragraph">Creatinine: [Creatinine Value] mg/dL</p>
                                     <p class="paragraph">GFR (estimated): [GFR Value] mL/min/1.73m²</p>
                                </div>
                                 <div class="subsection">
                                    <h3 class="subsection-title">Renal Replacement Therapy (RRT) (if applicable)</h3>
                                    <p class="paragraph">Mode: [e.g., CRRT, IHD], Settings: [Relevant Settings]</p>
                                </div>
                            </div>

                             <div class="section">
                                 <h2 class="section-title">Hematology/Oncology Assessment</h2>
                                  <div class="subsection">
                                      <h3 class="subsection-title">CBC Results</h3>
                                      <p class="paragraph">WBC: [WBC Value] /µL</p>
                                      <p class="paragraph">Hgb: [Hgb Value] g/dL</p>
                                      <p class="paragraph">Hct: [Hct Value] %%</p>
                                      <p class="paragraph">Platelets: [Platelet Value] /µL</p>
                                  </div>
                                   <div class="subsection">
                                      <h3 class="subsection-title">Coagulation Results</h3>
                                      <p class="paragraph">PT: [PT Value] seconds</p>
                                      <p class="paragraph">INR: [INR Value]</p>
                                      <p class="paragraph">PTT: [PTT Value] seconds</p>
                                  </div>
                                  <div class="subsection">
                                       <h3 class="subsection-title">Anticoagulation</h3>
                                       <p class="paragraph">Medication: [e.g., Heparin Drip, Enoxaparin], Dose/Rate: [Dose/Rate], Monitoring Parameter: [e.g., PTT, Anti-Xa]</p>
                                  </div>
                                   <div class="subsection">
                                       <h3 class="subsection-title">Bleeding/Thrombosis</h3>
                                        <p class="paragraph">Signs of Bleeding: [Observed Signs]</p>
                                        <p class="paragraph">Signs of Thrombosis (DVT/PE): [Observed Signs/Prophylaxis]</p>
                                  </div>
                             </div>

                            <div class="section">
                                <h2 class="section-title">Endocrine Assessment</h2>
                                <div class="subsection">
                                     <h3 class="subsection-title">Glucose Control</h3>
                                     <p class="paragraph">Last Blood Glucose: [Glucose Value] mg/dL</p>
                                     <p class="paragraph">Method: [POC / Serum]</p>
                                      <p class="paragraph">Insulin Therapy: [e.g., Insulin Drip, Sliding Scale], Details: [Rate/Dose]</p>
                                </div>
                                <div class="subsection">
                                    <h3 class="subsection-title">Thyroid/Adrenal Function (if relevant)</h3>
                                    <p class="paragraph">[Assessment Findings/Lab Results]</p>
                                </div>
                            </div>

                            <div class="section">
                                <h2 class="section-title">Infectious Disease Assessment</h2>
                                 <div class="subsection">
                                    <h3 class="subsection-title">Temperature</h3>
                                    <p class="paragraph">Current Temperature: [Temperature] °C/°F, Route: [Route]</p>
                                     <p class="paragraph">Temperature Trend: [e.g., Afebrile, Febrile]</p>
                                </div>
                                <div class="subsection">
                                    <h3 class="subsection-title">WBC Trend</h3>
                                     <p class="paragraph">[WBC Trend Notes]</p>
                                </div>
                                <div class="subsection">
                                    <h3 class="subsection-title">Potential Sources of Infection</h3>
                                     <ul class="list">
                                         <li>Lungs: [Clinical Signs/Imaging]</li>
                                         <li>Urine: [Clinical Signs/Urinalysis]</li>
                                         <li>Blood: [Clinical Signs/Blood Cultures Status]</li>
                                          <li>Lines/Tubes: [Signs of Infection at Sites]</li>
                                         <li>Wounds: [Signs of Infection]</li>
                                         <li>Other: [Other Potential Sources]</li>
                                     </ul>
                                </div>
                                 <div class="subsection">
                                    <h3 class="subsection-title">Antibiotic Therapy</h3>
                                     <ul class="list">
                                         <li>[Antibiotic 1]: [Dose/Frequency], Indication: [Indication]</li>
                                          <li>[Antibiotic 2]: [Dose/Frequency], Indication: [Indication]</li>
                                         <!-- Add more as needed -->
                                     </ul>
                                </div>
                                <div class="subsection">
                                    <h3 class="subsection-title">Cultures Status</h3>
                                    <p class="paragraph">Blood Cultures: [Pending/Result]</p>
                                     <p class="paragraph">Sputum Cultures: [Pending/Result]</p>
                                     <p class="paragraph">Urine Cultures: [Pending/Result]</p>
                                     <p class="paragraph">Wound Cultures: [Pending/Result]</p>
                                     <p class="paragraph">Other Cultures: [Pending/Result]</p>
                                </div>
                            </div>

                            <div class="section">
                                <h2 class="section-title">Skin Assessment</h2>
                               <p class="paragraph">Color: [e.g., Pink, Pale, Jaundiced, Cyanotic]</p>
                               <p class="paragraph">Temperature: [e.g., Warm, Cool]</p>
                               <p class="paragraph">Moisture: [e.g., Dry, Diaphoretic]</p>
                               <p class="paragraph">Turgor: [e.g., Good, Poor]</p>
                               <p class="paragraph">Wounds/Incisions: [Location, Description (Size, Drainage, Edges), Dressing Type]</p>
                               <p class="paragraph">Pressure Ulcers/Risk: [Stage/Location of any Ulcers], Braden Score: [Braden Score], Prevention Measures: [Measures in Place]</p>
                               <p class="paragraph">Rashes/Lesions: [Description and Location]</p>
                            </div>

                            <div class="section">
                                <h2 class="section-title">Lines, Tubes, and Drains</h2>
                                <ul class="list">
                                    <li><span class="list-label">Peripheral IV(s):</span> Location: [Location], Size: [Gauge], Patency: [Yes/No], Site Appearance: [Appearance]</li>
                                    <li><span class="list-label">Central Line(s):</span> Type: [e.g., PICC, IJ, Subclavian], Location: [Location], Lumens: [Number], Site Appearance: [Appearance], Dressing Change Due: [Date]</li>
                                    <li><span class="list-label">Arterial Line:</span> Location: [Location], Site Appearance: [Appearance]</li>
                                    <li><span class="list-label">Foley Catheter:</span> Insertion Date: [Date], Secured: [Yes/No], Output: [See Renal Section]</li>
                                    <li><span class="list-label">Nasogastric/Orogastric Tube:</span> Type: [NGT/OGT], Purpose: [Purpose], Placement Confirmed: [Method/Date], Output: [See GI Section]</li>
                                     <li><span class="list-label">Surgical Drain(s):</span> Type: [e.g., JP, Hemovac], Location: [Location], Output: [Amount/Character], Suction: [Yes/No]</li>
                                     <li><span class="list-label">Chest Tube(s):</span> Location: [Location], Output: [Amount/Character], Suction: [cmH2O/Water Seal], Air Leak: [Yes/No]</li>
                                     <!-- Add others as needed -->
                                 </ul>
                            </div>
                             <div class="section">
                                  <h2 class="section-title">Pain Assessment</h2>
                                  <p class="paragraph">Pain Scale Used: [e.g., Numeric Rating Scale (NRS), Behavioral Pain Scale (BPS), CPOT]</p>
                                  <p class="paragraph">Pain Score (Current): [Score]</p>
                                  <p class="paragraph">Location/Character: [Location/Description]</p>
                                  <p class="paragraph">Interventions: [Pharmacologic (Medication/Dose/Time Last Given), Non-pharmacologic]</p>
                                  <p class="paragraph">Effectiveness of Interventions: [Effectiveness]</p>
                              </div>
                               <div class="section">
                                   <h2 class="section-title">Psychosocial Assessment</h2>
                                    <p class="paragraph">Patient Mood/Affect: [Observed Mood/Affect]</p>
                                    <p class="paragraph">Family Presence/Support: [Family Involvement]</p>
                                    <p class="paragraph">Communication Needs/Barriers: [Needs/Barriers]</p>
                                    <p class="paragraph">Consults (e.g., Social Work, Chaplaincy): [Consults Ordered/Completed]</p>
                               </div>

                              <div class="section">
                                  <h2 class="section-title">Medications (Key Scheduled & PRN)</h2>
                                  <!-- Focus on critical meds, infusions, recent changes -->
                                  <p class="paragraph">Scheduled Meds (Highlight Key): [Medication 1 (Dose/Route/Freq)], [Medication 2...]</p>
                                   <p class="paragraph">Continuous Infusions: [See Vasoactive/Sedation Sections or list others here]</p>
                                  <p class="paragraph">PRN Meds Administered (Last 24h): [Medication (Dose/Time/Reason)]</p>
                                  <p class="paragraph">Medication Reconciliation Status: [Completed/Pending]</p>
                              </div>

                              <div class="section">
                                  <h2 class="section-title">Assessment Summary & Plan</h2>
                                   <p class="paragraph">Brief Summary: [One or two sentence summary of patient status]</p>
                                   <h3 class="subsection-title">System-Based Plan:</h3>
                                   <ul class="list">
                                      <li><span class="list-label">Neuro:</span> [Plan]</li>
                                      <li><span class="list-label">Cardio:</span> [Plan]</li>
                                      <li><span class="list-label">Resp:</span> [Plan]</li>
                                      <li><span class="list-label">GI/Nutrition:</span> [Plan]</li>
                                      <li><span class="list-label">Renal/Fluids:</span> [Plan]</li>
                                       <li><span class="list-label">Heme:</span> [Plan]</li>
                                       <li><span class="list-label">Endo:</span> [Plan]</li>
                                       <li><span class="list-label">ID:</span> [Plan]</li>
                                       <li><span class="list-label">Skin/Wound:</span> [Plan]</li>
                                       <li><span class="list-label">Pain/Sedation:</span> [Plan]</li>
                                       <li><span class="list-label">Mobility/Activity:</span> [Plan]</li>
                                       <li><span class="list-label">Psychosocial:</span> [Plan]</li>
                                       <li><span class="list-label">Consults:</span> [Pending/Follow-up]</li>
                                       <li><span class="list-label">Disposition Planning:</span> [Goals/Anticipated Course]</li>
                                   </ul>
                              </div>

                            <div class="section">
                                <h2 class="section-title">Assessed by:</h2>
                                <p class="assessor-info">[Assessor Name], [Assessor Title]</p>
                                <p class="assessor-info">Date/Time: [Date] [Time]</p>
                            </div>
                          </div>
                        """
                        .formatted(styles));

        log.debug("Generated assessment template map with {} entries.", templates.size());
        return templates;
    }

    // Helper to create or find AssessmentType
    // No @Transactional needed here
    private AssessmentType createOrFindAssessmentType(String name, String displayName, String content) {
        // Use injected repository
        // The findByName operation runs within the transaction started by
        // initializeDatabaseContent()
        return this.assessmentTypeRepository.findByName(name)
                .orElseGet(() -> {
                    AssessmentType type = new AssessmentType(name, displayName, content);
                    log.info("Creating new assessment type: '{}' (Name: {})", displayName, name);
                    try {
                        // The save operation runs within the transaction started by
                        // initializeDatabaseContent()
                        return this.assessmentTypeRepository.save(type);
                    } catch (Exception e) {
                        // Log the full stack trace for detailed debugging if save fails
                        log.error("Failed to save assessment type '{}' with name '{}': {}", displayName, name,
                                e.getMessage(), e);
                        // Re-throw a runtime exception to make the initialization fail clearly
                        throw new RuntimeException("FATAL: Failed to save essential assessment type: " + name, e);
                    }
                });
    }

    // Helper to generate display name (Identical implementation)
    private String generateDisplayName(String name) {
        if (name == null || name.isEmpty()) {
            return "Assessment";
        }
        // Improved regex to handle camelCase and potential acronyms better
        String spacedName = name.replaceAll(
                String.format("%s|%s|%s",
                        "(?<=[A-Z])(?=[A-Z][a-z])", // Between uppercase letters followed by lowercase (e.g., CAMICU ->
                                                    // CAM ICU)
                        "(?<=[^A-Z])(?=[A-Z])", // Before an uppercase letter that's preceded by non-uppercase (e.g.,
                                                // childAssessment -> child Assessment)
                        "(?<=[A-Za-z])(?=[^A-Za-z])" // Before a non-letter that's preceded by a letter (rare case)
                ),
                " ");
        String finalName = spacedName.substring(0, 1).toUpperCase() + spacedName.substring(1);

        // Make specific replacements if needed for acronyms or clarity
        finalName = finalName.replace("H P I", "HPI");
        finalName = finalName.replace("P M H", "PMH");
        finalName = finalName.replace("G T P A L", "GTPAL");
        finalName = finalName.replace("A D Ls", "ADLs");
        finalName = finalName.replace("I A D Ls", "IADLs");
        finalName = finalName.replace("G C S", "GCS");
        // Add more specific replacements if the regex isn't perfect

        // Handle the "Assessment" suffix more robustly
        if (finalName.endsWith(" Assessment") && !finalName.equalsIgnoreCase("General Assessment")) {
            // Already ends with " Assessment", looks good
        } else if (finalName.equalsIgnoreCase("assessment")) {
            return "General Assessment"; // Special case
        } else if (!finalName.endsWith(" Assessment")) {
            finalName += " Assessment"; // Add suffix if missing
        }

        return finalName.trim().replaceAll("\\s+", " "); // Trim and normalize spaces
    }

    // Helper methods for Permissions and Roles (Modified to use injected repos)

    // No repository parameter needed
    private Permission createOrFindPermission(String permissionName) {
        // Use injected repository
        return this.permissionRepository.findByName(permissionName)
                .orElseGet(() -> {
                    Permission permission = new Permission();
                    permission.setName(permissionName);
                    log.debug("Creating new permission: {}", permissionName);
                    // Use injected repository
                    return this.permissionRepository.save(permission);
                });
    }

    // No repository parameter needed
    private Set<Permission> findPermissionsOrThrow(String... permissionNames) {
        Set<Permission> permissions = new HashSet<>();
        for (String name : permissionNames) {
            // Use injected repository
            Permission p = this.permissionRepository.findByName(name)
                    .orElseThrow(() -> {
                        String errorMsg = "FATAL: Required permission '" + name + "' not found during role assignment!";
                        log.error(errorMsg);
                        return new IllegalStateException(errorMsg);
                    });
            permissions.add(p);
        }
        return permissions;
    }

    // No repository parameter needed
    private Role createOrFindRole(String roleName, Set<Permission> permissions) {
        // Use injected repository
        Role role = this.roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    log.info("Creating new role: {}", roleName);
                    return newRole;
                });

        // Use equals for Set comparison (order doesn't matter)
        boolean permissionsChanged = !role.getPermissions().equals(permissions);

        if (role.getId() == null || permissionsChanged) { // If new role or permissions differ
            if (role.getId() != null && permissionsChanged) { // Log only if updating existing role
                log.info("Updating permissions for role: {}. Old count: {}, New count: {}",
                        roleName, role.getPermissions().size(), permissions.size());
            }
            role.setPermissions(permissions); // Set the new permissions
            try {
                // Use injected repository
                return this.roleRepository.save(role);
            } catch (Exception e) {
                log.error("Failed to save role '{}': {}", roleName, e.getMessage(), e);
                // Re-throw a runtime exception to make the initialization fail clearly
                throw new RuntimeException("FATAL: Failed to save role: " + roleName, e);
            }
        } else {
            log.debug("Role '{}' already exists with the correct {} permissions.", roleName,
                    role.getPermissions().size());
            return role; // Return the existing role
        }
    }
}