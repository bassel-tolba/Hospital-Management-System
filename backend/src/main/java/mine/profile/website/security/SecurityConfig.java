package mine.profile.website.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize, @PostAuthorize etc.
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // --- Public Endpoints ---
                        .requestMatchers("/api/auth/**").permitAll() // Authentication controller
                        .requestMatchers(HttpMethod.POST, "/login").permitAll() // Explicit login endpoint if separate
                        .requestMatchers("/login", "/register").permitAll() // Assuming these are paths to frontend
                                                                            // pages/components
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll() // File serving must be public

                        // --- Patient & Patient Data ---
                        .requestMatchers(HttpMethod.GET, "/api/patients/search", "/api/patients/filter",
                                "/api/patients/{id}")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/patients").hasAnyAuthority("READ_PATIENT") // List all
                                                                                                          // requires
                                                                                                          // permission
                        .requestMatchers(HttpMethod.GET, "/api/patients/search/name").hasAnyAuthority("READ_PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/patients").hasAnyAuthority("CREATE_PATIENT")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/{id}").hasAnyAuthority("UPDATE_PATIENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/{id}").hasAnyAuthority("DELETE_PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/patients/transcribe").hasAnyAuthority("CREATE_PATIENT") // AI
                                                                                                                        // for
                                                                                                                        // creation
                        .requestMatchers(HttpMethod.GET, "/api/patients-data/**").authenticated() // Aggregate data view

                        // --- User Management ---
                        .requestMatchers(HttpMethod.GET, "/api/users/search",
                                "/api/users/{id}",
                                "/api/users/all", // Consider if 'all' should be restricted more
                                "/api/users/byfirstname/{firstName}",
                                "/api/users/bylastname/{lastName}",
                                "/api/users/byspecialty/{specialty}",
                                "/api/users/byunitid/{unitId}")
                        .authenticated() // General read access for authenticated users
                        .requestMatchers(HttpMethod.GET, "/api/users/byrole/{roleId}").hasAnyAuthority("READ_USER") // Specific
                                                                                                                    // permission
                                                                                                                    // needed
                        .requestMatchers(HttpMethod.POST, "/api/users").hasAnyAuthority("CREATE_USER")
                        .requestMatchers(HttpMethod.PUT, "/api/users/{id}",
                                "/api/users/updateunits/{id}",
                                "/api/users/updaterooms/{id}",
                                "/api/users/updatepatients/{id}")
                        .hasAnyAuthority("UPDATE_USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").hasAnyAuthority("DELETE_USER")
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated() // Current user info

                        // --- Appointments ---
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/appointments").hasAnyAuthority("CREATE_APPOINTMENT")
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/{id}/end")
                        .hasAnyAuthority("UPDATE_APPOINTMENT") // Assuming ending is an update
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/{id}")
                        .hasAnyAuthority("DELETE_APPOINTMENT")
                        // Note: No PUT endpoint defined in AppointmentController, only PATCH

                        // --- Medications, Batches, History ---
                        .requestMatchers(HttpMethod.GET, "/api/medications/search", "/api/medications/{id}",
                                "/api/medications")
                        .hasAnyAuthority("READ_MEDICATION")
                        .requestMatchers(HttpMethod.POST, "/api/medications").hasAnyAuthority("CREATE_MEDICATION")
                        .requestMatchers(HttpMethod.PUT, "/api/medications/{id}").hasAnyAuthority("UPDATE_MEDICATION")
                        .requestMatchers(HttpMethod.POST, "/api/medications/{id}/add-batch")
                        .hasAnyAuthority("UPDATE_MEDICATION_STOCK")
                        .requestMatchers(HttpMethod.PUT, "/api/medications/batches/{batchId}")
                        .hasAnyAuthority("UPDATE_MEDICATION_STOCK")
                        .requestMatchers(HttpMethod.DELETE, "/api/medications/batches/{batchId}")
                        .hasAnyAuthority("UPDATE_MEDICATION_STOCK", "DELETE_MEDICATION") // Allow deletion too
                        .requestMatchers(HttpMethod.GET, "/api/medications/{medicationId}/batches")
                        .hasAnyAuthority("READ_MEDICATION")
                        .requestMatchers(HttpMethod.GET, "/api/medications/history")
                        .hasAnyAuthority("READ_MEDICATION_HISTORY")
                        .requestMatchers(HttpMethod.DELETE, "/api/medications/history")
                        .hasAnyAuthority("DELETE_MEDICATION_HISTORY")
                        .requestMatchers(HttpMethod.DELETE, "/api/medications/{id}")
                        .hasAnyAuthority("DELETE_MEDICATION")
                        // Note: Increase/Decrease stock endpoints removed from controller, using batch
                        // management now

                        // --- Prescriptions & Prescribed Medications ---
                        .requestMatchers(HttpMethod.GET, "/api/prescriptions/**").hasAnyAuthority("READ_PRESCRIPTION")
                        .requestMatchers(HttpMethod.POST, "/api/prescriptions").hasAnyAuthority("CREATE_PRESCRIPTION")
                        .requestMatchers(HttpMethod.PUT, "/api/prescriptions/{id}")
                        .hasAnyAuthority("UPDATE_PRESCRIPTION")
                        .requestMatchers(HttpMethod.DELETE, "/api/prescriptions/{id}")
                        .hasAnyAuthority("DELETE_PRESCRIPTION")

                        .requestMatchers(HttpMethod.GET, "/api/prescribed-medications/**")
                        .hasAnyAuthority("READ_PRESCRIBED_MEDICATION")
                        .requestMatchers(HttpMethod.POST, "/api/prescribed-medications")
                        .hasAnyAuthority("CREATE_PRESCRIBED_MEDICATION")
                        .requestMatchers(HttpMethod.DELETE, "/api/prescribed-medications/{id}")
                        .hasAnyAuthority("DELETE_PRESCRIBED_MEDICATION")
                        // Note: No PUT for prescribed-medications

                        // --- Locations: Units, Rooms, Beds ---
                        .requestMatchers(HttpMethod.GET, "/api/units/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/units").hasAnyAuthority("CREATE_UNIT")
                        .requestMatchers(HttpMethod.PUT, "/api/units/{id}").hasAnyAuthority("UPDATE_UNIT")
                        .requestMatchers(HttpMethod.DELETE, "/api/units/{id}").hasAnyAuthority("DELETE_UNIT")

                        .requestMatchers(HttpMethod.GET, "/api/rooms/**").hasAnyAuthority("READ_ROOM")
                        .requestMatchers(HttpMethod.POST, "/api/rooms").hasAnyAuthority("CREATE_ROOM")
                        .requestMatchers(HttpMethod.PUT, "/api/rooms/{id}").hasAnyAuthority("UPDATE_ROOM")
                        .requestMatchers(HttpMethod.DELETE, "/api/rooms/{id}").hasAnyAuthority("DELETE_ROOM")

                        .requestMatchers(HttpMethod.GET, "/api/beds/**").hasAnyAuthority("READ_BED")
                        .requestMatchers(HttpMethod.POST, "/api/beds").hasAnyAuthority("CREATE_BED")
                        .requestMatchers(HttpMethod.PUT, "/api/beds/{id}").hasAnyAuthority("UPDATE_BED")
                        .requestMatchers(HttpMethod.DELETE, "/api/beds/{id}").hasAnyAuthority("DELETE_BED")
                        .requestMatchers(HttpMethod.POST, "/api/beds/free-expired").hasAnyAuthority("MANAGE_BEDS") // Secure
                                                                                                                   // this
                                                                                                                   // action

                        // --- Admissions & Admission Types ---
                        .requestMatchers(HttpMethod.GET, "/api/admissions/**").hasAnyAuthority("READ_ADMISSION")
                        .requestMatchers(HttpMethod.POST, "/api/admissions").hasAnyAuthority("CREATE_ADMISSION")
                        .requestMatchers(HttpMethod.PUT, "/api/admissions/{id}").hasAnyAuthority("UPDATE_ADMISSION")
                        .requestMatchers(HttpMethod.DELETE, "/api/admissions/{id}").hasAnyAuthority("DELETE_ADMISSION")

                        .requestMatchers("/api/admissionTypes/**").hasAnyAuthority("MANAGE_ADMISSION_TYPES") // Secure
                                                                                                             // Admission
                                                                                                             // Types
                                                                                                             // CRUD

                        // --- Clinical Data: Assessments, Care Plans, Vitals, Procedures, Logs ---
                        .requestMatchers(HttpMethod.GET, "/api/assessments/**").hasAnyAuthority("READ_ASSESSMENT")
                        .requestMatchers(HttpMethod.POST, "/api/assessments").hasAnyAuthority("CREATE_ASSESSMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/assessments/{id}").hasAnyAuthority("UPDATE_ASSESSMENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/assessments/{id}")
                        .hasAnyAuthority("DELETE_ASSESSMENT")
                        .requestMatchers(HttpMethod.POST, "/api/assessments/ai/**")
                        .hasAnyAuthority("CREATE_ASSESSMENT", "UPDATE_ASSESSMENT") // AI linked to assessment
                                                                                   // permissions

                        .requestMatchers(HttpMethod.GET, "/api/nursingCarePlans/**")
                        .hasAnyAuthority("READ_NURSING_CARE_PLAN") // Assuming controller maps to this path
                        .requestMatchers(HttpMethod.POST, "/api/nursingCarePlans/**")
                        .hasAnyAuthority("CREATE_NURSING_CARE_PLAN")
                        .requestMatchers(HttpMethod.PUT, "/api/nursingCarePlans/**")
                        .hasAnyAuthority("UPDATE_NURSING_CARE_PLAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/nursingCarePlans/**")
                        .hasAnyAuthority("DELETE_NURSING_CARE_PLAN")

                        .requestMatchers(HttpMethod.GET, "/api/carePlanGoals/**").hasAnyAuthority("READ_CARE_PLAN_GOAL") // Assuming
                                                                                                                         // controller
                                                                                                                         // maps
                                                                                                                         // to
                                                                                                                         // this
                                                                                                                         // path
                        .requestMatchers(HttpMethod.POST, "/api/carePlanGoals/**")
                        .hasAnyAuthority("CREATE_CARE_PLAN_GOAL")
                        .requestMatchers(HttpMethod.PUT, "/api/carePlanGoals/**")
                        .hasAnyAuthority("UPDATE_CARE_PLAN_GOAL")
                        .requestMatchers(HttpMethod.DELETE, "/api/carePlanGoals/**")
                        .hasAnyAuthority("DELETE_CARE_PLAN_GOAL")

                        .requestMatchers(HttpMethod.GET, "/api/vital-signs/**").hasAnyAuthority("READ_VITAL_SIGN")
                        .requestMatchers(HttpMethod.POST, "/api/vital-signs").hasAnyAuthority("CREATE_VITAL_SIGN")
                        .requestMatchers(HttpMethod.PUT, "/api/vital-signs/{id}").hasAnyAuthority("UPDATE_VITAL_SIGN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vital-signs/{id}")
                        .hasAnyAuthority("DELETE_VITAL_SIGN")

                        .requestMatchers(HttpMethod.GET, "/api/procedures/**").hasAnyAuthority("READ_PROCEDURE")
                        .requestMatchers(HttpMethod.POST, "/api/procedures").hasAnyAuthority("CREATE_PROCEDURE")
                        .requestMatchers(HttpMethod.PUT, "/api/procedures/{id}").hasAnyAuthority("UPDATE_PROCEDURE")
                        .requestMatchers(HttpMethod.DELETE, "/api/procedures/{id}").hasAnyAuthority("DELETE_PROCEDURE")

                        .requestMatchers(HttpMethod.GET, "/api/procedure-logs/**").hasAnyAuthority("READ_PROCEDURE_LOG")
                        .requestMatchers(HttpMethod.POST, "/api/procedure-logs").hasAnyAuthority("CREATE_PROCEDURE_LOG")
                        .requestMatchers(HttpMethod.DELETE, "/api/procedure-logs/{id}")
                        .hasAnyAuthority("DELETE_PROCEDURE_LOG")

                        // --- Labs & Imaging ---
                        .requestMatchers(HttpMethod.GET, "/api/lab-tests/**").hasAnyAuthority("READ_LAB_TEST")
                        .requestMatchers(HttpMethod.POST, "/api/lab-tests").hasAnyAuthority("CREATE_LAB_TEST")
                        .requestMatchers(HttpMethod.PUT, "/api/lab-tests/{id}").hasAnyAuthority("UPDATE_LAB_TEST")
                        .requestMatchers(HttpMethod.DELETE, "/api/lab-tests/{id}").hasAnyAuthority("DELETE_LAB_TEST")

                        .requestMatchers(HttpMethod.GET, "/api/lab-results/**").hasAnyAuthority("READ_LAB_RESULT")
                        .requestMatchers(HttpMethod.POST, "/api/lab-results").hasAnyAuthority("CREATE_LAB_RESULT")
                        .requestMatchers(HttpMethod.PUT, "/api/lab-results/{id}").hasAnyAuthority("UPDATE_LAB_RESULT")
                        .requestMatchers(HttpMethod.DELETE, "/api/lab-results/{id}")
                        .hasAnyAuthority("DELETE_LAB_RESULT")

                        .requestMatchers(HttpMethod.GET, "/api/imagereports/**").hasAnyAuthority("READ_IMAGE_REPORT")
                        .requestMatchers(HttpMethod.POST, "/api/imagereports").hasAnyAuthority("CREATE_IMAGE_REPORT")
                        .requestMatchers(HttpMethod.PUT, "/api/imagereports/{id}")
                        .hasAnyAuthority("UPDATE_IMAGE_REPORT")
                        .requestMatchers(HttpMethod.DELETE, "/api/imagereports/{id}")
                        .hasAnyAuthority("DELETE_IMAGE_REPORT")

                        .requestMatchers(HttpMethod.GET, "/api/imagereporttypes/**")
                        .hasAnyAuthority("READ_IMAGE_REPORT_TYPE") // Allow reading types
                        .requestMatchers(HttpMethod.POST, "/api/imagereporttypes")
                        .hasAnyAuthority("CREATE_IMAGE_REPORT_TYPE")
                        .requestMatchers(HttpMethod.PUT, "/api/imagereporttypes/{id}")
                        .hasAnyAuthority("UPDATE_IMAGE_REPORT_TYPE")
                        .requestMatchers(HttpMethod.DELETE, "/api/imagereporttypes/{id}")
                        .hasAnyAuthority("DELETE_IMAGE_REPORT_TYPE")

                        // --- Products & Usage ---
                        .requestMatchers(HttpMethod.GET, "/api/products/search", "/api/products/{id}", "/api/products")
                        .hasAnyAuthority("READ_PRODUCT")
                        .requestMatchers(HttpMethod.POST, "/api/products").hasAnyAuthority("CREATE_PRODUCT")
                        .requestMatchers(HttpMethod.PUT, "/api/products/{id}").hasAnyAuthority("UPDATE_PRODUCT")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/{id}/increase-stock",
                                "/api/products/{id}/decrease-stock")
                        .hasAnyAuthority("UPDATE_PRODUCT_STOCK") // Secure PATCH for stock
                        .requestMatchers(HttpMethod.GET, "/api/products/history")
                        .hasAnyAuthority("READ_PRODUCT_HISTORY")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/history")
                        .hasAnyAuthority("DELETE_PRODUCT_HISTORY")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/{id}").hasAnyAuthority("DELETE_PRODUCT")

                        .requestMatchers(HttpMethod.GET, "/api/product-usage/**")
                        .hasAnyAuthority("READ_PATIENT_PRODUCT_USAGE")
                        .requestMatchers(HttpMethod.POST, "/api/product-usage")
                        .hasAnyAuthority("CREATE_PATIENT_PRODUCT_USAGE")
                        .requestMatchers(HttpMethod.DELETE, "/api/product-usage/{id}")
                        .hasAnyAuthority("DELETE_PATIENT_PRODUCT_USAGE")

                        // --- Billing & Payments ---
                        .requestMatchers(HttpMethod.GET, "/api/billings/**").hasAnyAuthority("READ_BILLING")
                        .requestMatchers(HttpMethod.POST, "/api/billings").hasAnyAuthority("CREATE_BILLING")
                        .requestMatchers(HttpMethod.PUT, "/api/billings/{id}").hasAnyAuthority("UPDATE_BILLING") // Update
                                                                                                                 // total
                        .requestMatchers(HttpMethod.POST, "/api/billings/{billingId}/payments")
                        .hasAnyAuthority("UPDATE_BILLING") // Add payment updates billing
                        .requestMatchers(HttpMethod.DELETE, "/api/billings/{id}").hasAnyAuthority("DELETE_BILLING")

                        // --- Documents & Types ---
                        .requestMatchers(HttpMethod.GET, "/api/documents/**").hasAnyAuthority("READ_DOCUMENT")
                        .requestMatchers(HttpMethod.POST, "/api/documents").hasAnyAuthority("CREATE_DOCUMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/documents/{id}").hasAnyAuthority("UPDATE_DOCUMENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/documents/{id}").hasAnyAuthority("DELETE_DOCUMENT")

                        .requestMatchers(HttpMethod.GET, "/api/documenttypes/**").authenticated() // Allow authenticated
                                                                                                  // users to see types
                        .requestMatchers(HttpMethod.POST, "/api/documenttypes").hasAnyAuthority("CREATE_DOCUMENT_TYPE")
                        .requestMatchers(HttpMethod.PUT, "/api/documenttypes/{id}")
                        .hasAnyAuthority("UPDATE_DOCUMENT_TYPE")
                        .requestMatchers(HttpMethod.DELETE, "/api/documenttypes/{id}")
                        .hasAnyAuthority("DELETE_DOCUMENT_TYPE")

                        // --- User Activities ---
                        .requestMatchers(HttpMethod.GET, "/api/activities/**").authenticated() // Any authenticated user
                                                                                               // can see activities?
                                                                                               // Adjust if needed.
                        .requestMatchers(HttpMethod.POST, "/api/activities").hasAnyAuthority("CREATE_USER_ACTIVITY")
                        .requestMatchers(HttpMethod.PUT, "/api/activities/{id}/state/{state}")
                        .hasAnyAuthority("UPDATE_USER_ACTIVITY") // State update
                        .requestMatchers(HttpMethod.DELETE, "/api/activities/{id}")
                        .hasAnyAuthority("DELETE_USER_ACTIVITY")

                        // --- AI / Gemini Endpoints ---
                        .requestMatchers(HttpMethod.POST, "/api/gemini/soundtotext").authenticated() // General
                                                                                                     // transcription
                        .requestMatchers(HttpMethod.POST, "/api/gemini/navigate").authenticated() // Navigation help
                        .requestMatchers(HttpMethod.POST, "/api/gemini/transcribe-vitals")
                        .hasAnyAuthority("CREATE_VITAL_SIGN") // AI for vital sign creation
                        .requestMatchers(HttpMethod.POST, "/api/gemini/transcribe-vitals-update/**")
                        .hasAnyAuthority("UPDATE_VITAL_SIGN") // AI for vital sign update

                        // --- Reporting ---
                        .requestMatchers(HttpMethod.GET, "/api/reports/lab-result/{id}")
                        .hasAnyAuthority("READ_LAB_RESULT") // PDF generation linked to reading result

                        // --- Dashboard ---
                        .requestMatchers("/api/dashboard/**").hasAnyAuthority("READ_DASHBOARD") // Secure dashboard
                                                                                                // endpoints

                        // --- Role & Permission Management (Admin Only) ---
                        // Explicitly allow GET requests to roles API
                        .requestMatchers(HttpMethod.GET, "/api/roles/**").permitAll()

                        // Explicitly allow GET requests to permissions API
                        .requestMatchers(HttpMethod.GET, "/api/permissions/**").permitAll()

                        // Secure POST, PUT, DELETE for roles API
                        .requestMatchers(HttpMethod.POST, "/api/roles/**").hasAuthority("MANAGE_ROLES")
                        .requestMatchers(HttpMethod.PUT, "/api/roles/**").hasAuthority("MANAGE_ROLES")
                        .requestMatchers(HttpMethod.DELETE, "/api/roles/**").hasAuthority("MANAGE_ROLES")

                        // Secure POST, PUT, DELETE for permissions API
                        .requestMatchers(HttpMethod.POST, "/api/permissions/**").hasAuthority("MANAGE_PERMISSIONS")
                        .requestMatchers(HttpMethod.PUT, "/api/permissions/**").hasAuthority("MANAGE_PERMISSIONS")
                        .requestMatchers(HttpMethod.DELETE, "/api/permissions/**").hasAuthority("MANAGE_PERMISSIONS")

                        // --- Catch-all: Default Deny (More Secure) ---
                        // .anyRequest().permitAll() // <-- Original Less Secure
                        .anyRequest().authenticated() // <-- More Secure Default: Require authentication if no specific
                                                      // rule matches

                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Consider making allowed origins more specific in production
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://*.share.zrok.io", // Example cloudflared/zrok tunnel
                "https://*.ngrok-free.app", // Example ngrok tunnel
                "http://localhost:[*]", // Allow any port on localhost
                "http://192.168.8.1:[*]", // Allow specific IPs on any port
                "http://192.168.8.9:[*]"
        // Add your frontend deployment domain here e.g., "https://your-app.com"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept")); // Add
                                                                                                                       // 'Accept'
        configuration.setAllowCredentials(true);
        // Optional: Explicitly expose headers if needed by the frontend
        // configuration.setExposedHeaders(Arrays.asList("Authorization",
        // "Content-Disposition"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply CORS to all paths
        return source;
    }
}