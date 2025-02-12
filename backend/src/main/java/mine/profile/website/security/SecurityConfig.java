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
@EnableMethodSecurity(prePostEnabled = true)
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
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/login").permitAll()
                        .requestMatchers("/login", "/register").permitAll()

                        // *** Patient Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/patients/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/patients/**")
                        .hasAnyAuthority("CREATE_PATIENT", "CREATE_APPOINTMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/**").hasAnyAuthority("UPDATE_PATIENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasAnyAuthority("DELETE_PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/patients-data/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/patients-data/search").authenticated()

                        // *** Doctor Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/doctors/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/doctors/**").hasAnyAuthority("CREATE_DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/**").hasAnyAuthority("UPDATE_DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/**").hasAnyAuthority("DELETE_DOCTOR")

                        // *** User Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/users/search").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/{id}", "/api/users/all",
                                "/api/users/byfirstname/{firstName}", "/api/users/bylastname/{lastName}",
                                "/api/users/byspecialty/{specialty}", "/api/users/byunitid/{unitId}")
                        .authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/byrole/{roleId}").hasAnyAuthority("READ_USER")
                        .requestMatchers(HttpMethod.POST, "/api/users").hasAnyAuthority("CREATE_USER")
                        .requestMatchers(HttpMethod.PUT, "/api/users/{id}", "/api/users/updateunits/{id}",
                                "/api/users/updaterooms/{id}", "/api/users/updatepatients/{id}")
                        .hasAnyAuthority("UPDATE_USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").hasAnyAuthority("DELETE_USER")
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()

                        // *** Appointment Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/appointments/**").hasAnyAuthority("CREATE_APPOINTMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**").hasAnyAuthority("UPDATE_APPOINTMENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
                        .hasAnyAuthority("DELETE_APPOINTMENT")

                        // *** Medication Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/medications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/medications").hasAnyAuthority("CREATE_MEDICATION")
                        .requestMatchers(HttpMethod.PUT, "/api/medications/{id}").hasAnyAuthority("UPDATE_MEDICATION")
                        .requestMatchers(HttpMethod.PATCH, "/api/medications/{id}/increase-stock")
                        .hasAnyAuthority("UPDATE_MEDICATION_STOCK")
                        .requestMatchers(HttpMethod.PATCH, "/api/medications/{id}/decrease-stock")
                        .hasAnyAuthority("UPDATE_MEDICATION_STOCK")
                        .requestMatchers(HttpMethod.DELETE, "/api/medications/{id}")
                        .hasAnyAuthority("DELETE_MEDICATION")
                        .requestMatchers(HttpMethod.GET, "/api/medications/history")
                        .hasAnyAuthority("READ_MEDICATION_HISTORY")

                        // *** Prescription Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/prescriptions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/prescriptions/**")
                        .hasAnyAuthority("CREATE_PRESCRIPTION")
                        .requestMatchers(HttpMethod.PUT, "/api/prescriptions/**").hasAnyAuthority("UPDATE_PRESCRIPTION")
                        .requestMatchers(HttpMethod.DELETE, "/api/prescriptions/**")
                        .hasAnyAuthority("DELETE_PRESCRIPTION")

                        .requestMatchers(HttpMethod.GET, "/api/prescribed-medications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/prescribed-medications/**")
                        .hasAnyAuthority("CREATE_PRESCRIBED_MEDICATION")
                        .requestMatchers(HttpMethod.PUT, "/api/prescribed-medications/**")
                        .hasAnyAuthority("UPDATE_PRESCRIBED_MEDICATION")
                        .requestMatchers(HttpMethod.DELETE, "/api/prescribed-medications/**")
                        .hasAnyAuthority("DELETE_PRESCRIBED_MEDICATION")
                        // *** Room Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/rooms/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/rooms/**").hasAnyAuthority("CREATE_ROOM")
                        .requestMatchers(HttpMethod.PUT, "/rooms/**").hasAnyAuthority("UPDATE_ROOM")
                        .requestMatchers(HttpMethod.DELETE, "/rooms/**").hasAnyAuthority("DELETE_ROOM")

                        // *** Bed Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/beds/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/beds/**").hasAnyAuthority("CREATE_BED")
                        .requestMatchers(HttpMethod.PUT, "/beds/**").hasAnyAuthority("UPDATE_BED")
                        .requestMatchers(HttpMethod.DELETE, "/beds/**").hasAnyAuthority("DELETE_BED")

                        // *** Admission Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/admissions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/admissions/**").hasAnyAuthority("CREATE_ADMISSION")
                        .requestMatchers(HttpMethod.PUT, "/api/admissions/**").hasAnyAuthority("UPDATE_ADMISSION")
                        .requestMatchers(HttpMethod.DELETE, "/api/admissions/**").hasAnyAuthority("DELETE_ADMISSION")
                        .requestMatchers(HttpMethod.GET, "/api/admissions/open").authenticated()

                        // *** Assessment Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/assessments/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/assessments/**").hasAnyAuthority("CREATE_ASSESSMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/assessments/**").hasAnyAuthority("UPDATE_ASSESSMENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/assessments/**").hasAnyAuthority("DELETE_ASSESSMENT")
                        // *** Nursing Care Plan Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/nursingCarePlans/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/nursingCarePlans/**")
                        .hasAnyAuthority("CREATE_NURSING_CARE_PLAN")
                        .requestMatchers(HttpMethod.PUT, "/api/nursingCarePlans/**")
                        .hasAnyAuthority("UPDATE_NURSING_CARE_PLAN")
                        .requestMatchers(HttpMethod.DELETE, "/api/nursingCarePlans/**")
                        .hasAnyAuthority("DELETE_NURSING_CARE_PLAN")

                        // *** Lab Test Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/lab-tests/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/lab-tests/**").hasAnyAuthority("CREATE_LAB_TEST")

                        // *** Lab Result Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/lab-results/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/lab-results/**").hasAnyAuthority("CREATE_LAB_RESULT")
                        .requestMatchers(HttpMethod.DELETE, "/api/lab-results/**").hasAnyAuthority("DELETE_LAB_RESULT")

                        // *** Image Report Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/imagereports/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/imagereports/**").hasAnyAuthority("CREATE_IMAGE_REPORT")
                        .requestMatchers(HttpMethod.PUT, "/api/imagereports/**").hasAnyAuthority("UPDATE_IMAGE_REPORT")
                        .requestMatchers(HttpMethod.DELETE, "/api/imagereports/**")
                        .hasAnyAuthority("DELETE_IMAGE_REPORT")
                        .requestMatchers(HttpMethod.GET, "/api/imagereports/**", "/api/imagereports/patient/**")
                        .authenticated()

                        // *** Image Report Type Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/imagereporttypes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/imagereporttypes/**")
                        .hasAnyAuthority("CREATE_IMAGE_REPORT_TYPE")
                        .requestMatchers(HttpMethod.PUT, "/api/imagereporttypes/**")
                        .hasAnyAuthority("UPDATE_IMAGE_REPORT_TYPE")
                        .requestMatchers(HttpMethod.DELETE, "/api/imagereporttypes/**")
                        .hasAnyAuthority("DELETE_IMAGE_REPORT_TYPE")

                        // *** Medication Administration Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/medication-administrations/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/medication-administrations/**")
                        .hasAnyAuthority("CREATE_MEDICATION_ADMINISTRATION")
                        .requestMatchers(HttpMethod.DELETE, "/api/medication-administrations/**")
                        .hasAnyAuthority("DELETE_MEDICATION_ADMINISTRATION")

                        // *** Product Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/products/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyAuthority("CREATE_PRODUCT")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyAuthority("UPDATE_PRODUCT")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyAuthority("DELETE_PRODUCT")
                        // *** Patient Product Usage Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/product-usage/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/product-usage/**")
                        .hasAnyAuthority("CREATE_PATIENT_PRODUCT_USAGE")
                        .requestMatchers(HttpMethod.DELETE, "/api/product-usage/**")
                        .hasAnyAuthority("DELETE_PATIENT_PRODUCT_USAGE")

                        // *** Procedure Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/procedures/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/procedures/**").hasAnyAuthority("CREATE_PROCEDURE")
                        .requestMatchers(HttpMethod.PUT, "/api/procedures/**").hasAnyAuthority("UPDATE_PROCEDURE")
                        .requestMatchers(HttpMethod.DELETE, "/api/procedures/**").hasAnyAuthority("DELETE_PROCEDURE")

                        // *** Vital Sign Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/vital-signs/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/vital-signs/**").hasAnyAuthority("CREATE_VITAL_SIGN")
                        .requestMatchers(HttpMethod.PUT, "/api/vital-signs/**").hasAnyAuthority("UPDATE_VITAL_SIGN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vital-signs/**").hasAnyAuthority("DELETE_VITAL_SIGN")

                        // *** Unit Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/units/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/units/**").hasAnyAuthority("CREATE_UNIT")
                        .requestMatchers(HttpMethod.PUT, "/api/units/**").hasAnyAuthority("UPDATE_UNIT")
                        .requestMatchers(HttpMethod.DELETE, "/api/units/**").hasAnyAuthority("DELETE_UNIT")

                        // *** Billing Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/billings/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/billings/**").hasAnyAuthority("CREATE_BILLING")
                        .requestMatchers(HttpMethod.PUT, "/api/billings/**", "/api/billings/{id}")
                        .hasAnyAuthority("UPDATE_BILLING")
                        .requestMatchers(HttpMethod.DELETE, "/api/billings/**").hasAnyAuthority("DELETE_BILLING")

                        // *** Care Plan Goals Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/carePlanGoals/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/carePlanGoals/**")
                        .hasAnyAuthority("CREATE_CARE_PLAN_GOAL")
                        .requestMatchers(HttpMethod.PUT, "/api/carePlanGoals/**")
                        .hasAnyAuthority("UPDATE_CARE_PLAN_GOAL")
                        .requestMatchers(HttpMethod.DELETE, "/api/carePlanGoals/**")
                        .hasAnyAuthority("DELETE_CARE_PLAN_GOAL")

                        // In your SecurityConfiguration class
                        .requestMatchers(HttpMethod.GET, "/api/documents/**").hasAnyAuthority("READ_DOCUMENT")
                        .requestMatchers(HttpMethod.POST, "/api/documents/**").hasAnyAuthority("CREATE_DOCUMENT")
                        .requestMatchers(HttpMethod.PUT, "/api/documents/**").hasAnyAuthority("UPDATE_DOCUMENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/documents/**").hasAnyAuthority("DELETE_DOCUMENT")

                        // *** Document Type Endpoints *** (These look fine as they are)
                        .requestMatchers(HttpMethod.GET, "/api/documenttypes/**").permitAll() // Typically, anyone can
                                                                                              // *see* document types
                        .requestMatchers(HttpMethod.POST, "/api/documenttypes/**")
                        .hasAnyAuthority("CREATE_DOCUMENT_TYPE") // added create
                        .requestMatchers(HttpMethod.PUT, "/api/documenttypes/**")
                        .hasAnyAuthority("UPDATE_DOCUMENT_TYPE")
                        .requestMatchers(HttpMethod.DELETE, "/api/documenttypes/**")
                        .hasAnyAuthority("DELETE_DOCUMENT_TYPE")

                        // ... rest of your configuration

                        // *** File Serving Endpoint
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll()

                        // *** Procedure Logs Endpoint
                        .requestMatchers(HttpMethod.GET, "/api/procedure-logs/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/procedure-logs/**")
                        .hasAnyAuthority("CREATE_PROCEDURE_LOG")
                        .requestMatchers(HttpMethod.DELETE, "/api/procedure-logs/**")
                        .hasAnyAuthority("DELETE_PROCEDURE_LOG")

                        // *** User Activities Endpoint ***
                        .requestMatchers(HttpMethod.GET, "/api/activities/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/activities/**").hasAnyAuthority("CREATE_USER_ACTIVITY")
                        .requestMatchers(HttpMethod.PUT, "/api/activities/**").hasAnyAuthority("UPDATE_USER_ACTIVITY")
                        .requestMatchers(HttpMethod.DELETE, "/api/activities/**")
                        .hasAnyAuthority("DELETE_USER_ACTIVITY")

                        // *** Role Endpoints (Admin Interface) ***
                        .requestMatchers(HttpMethod.GET, "/api/roles/**").permitAll()
                        // .requestMatchers("/api/roles/**").hasAnyAuthority("MANAGE_ROLES")

                        .requestMatchers("/api/roles/**").hasAnyAuthority("MANAGE_ROLES")
                        .requestMatchers("/api/roles/{id}").hasAnyAuthority("CREATE_ROLE")
                        // *** Permission Endpoints (Admin Interface) ***
                        .requestMatchers("/api/permissions/**").hasAnyAuthority("MANAGE_PERMISSIONS")
                        // Generic

                        .anyRequest().permitAll())
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
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://*.ngrok-free.app",
                "http://localhost:*",
                "http://192.168.8.1/*",
                "http://192.168.8.9:3000/**",
                "http://192.168.8.9:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(
                Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "application/json",
                        "application/octet-stream", "multipart/form-data"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}