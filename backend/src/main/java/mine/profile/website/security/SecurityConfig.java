package mine.profile.website.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
                        // In SecurityConfig
                        .requestMatchers(HttpMethod.POST, "/login").permitAll()
                        .requestMatchers("/login", "/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/dashboard/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "HEAD_NURSE")

                        // *** Patient Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/patients/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "HEAD_NURSE",
                                "LAB_TECHNICIAN",
                                "RADIOLOGIST")
                        .requestMatchers(HttpMethod.POST, "/api/patients/**")
                        .hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/**")
                        .hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/patients-data/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "SOCIAL_WORKER", "HEAD_NURSE")

                        // *** Doctor Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/doctors/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/doctors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/**").hasRole("ADMIN")

                        // *** User Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/users/search")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "SOCIAL_WORKER", "ACCOUNTANT",
                                "LAB_TECHNICIAN", "RADIOLOGIST", "PHARMACIST", "INSURANCE_PROVIDER", "HEAD_NURSE",
                                "PATIENT", "FAMILY_MEMBER")
                        .requestMatchers(HttpMethod.GET, "/api/users/{id}", "/api/users/all",
                                "/api/users/byfirstname/{firstName}", "/api/users/bylastname/{lastName}",
                                "/api/users/byspecialty/{specialty}", "/api/users/byunitid/{unitId}")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "SOCIAL_WORKER", "ACCOUNTANT",
                                "LAB_TECHNICIAN", "RADIOLOGIST", "PHARMACIST", "INSURANCE_PROVIDER", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.GET, "/api/users/byrole/{role}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/{id}",
                                "/api/users/updateunits/{id}", "/api/users/updaterooms/{id}",
                                "/api/users/updatepatients/{id}")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()

                        // *** Department Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/departments/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/departments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**")
                        .hasRole("ADMIN")

                        // *** Appointment Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/appointments/**")
                        .hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**")
                        .hasAnyRole("ADMIN", "RECEPTIONIST", "DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
                        .hasRole("ADMIN")

                        // *** Medication Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/medications/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/medications")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/medications/{id}")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/medications/{id}/increase-stock")
                        .hasAnyRole("ADMIN", "PHARMACIST")
                        .requestMatchers(HttpMethod.PATCH, "/api/medications/{id}/decrease-stock")
                        .hasAnyRole("ADMIN", "PHARMACIST")
                        .requestMatchers(HttpMethod.DELETE, "/api/medications/{id}")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/medications/history")
                        .hasRole("ADMIN")

                        // *** Prescription Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/prescriptions/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/prescriptions/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/prescriptions/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/prescriptions/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/prescribed-medications/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "PHARMACIST", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/prescribed-medications/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/prescribed-medications/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/prescribed-medications/**")
                        .hasRole("ADMIN")

                        // *** Room Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/rooms/**")
                        .hasAnyRole("ADMIN", "NURSE", "RECEPTIONIST", "HEAD_NURSE",
                                "RADIOLOGIST")
                        .requestMatchers(HttpMethod.POST, "/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/rooms/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/rooms/**").hasRole("ADMIN")

                        // *** Bed Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/beds/**")
                        .hasAnyRole("ADMIN", "NURSE", "RECEPTIONIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/beds/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/beds/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/beds/**").hasRole("ADMIN")

                        // *** Admission Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/admissions/**")
                        .hasAnyRole("ADMIN", "NURSE", "RECEPTIONIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/admissions/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/admissions/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/admissions/**")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/admissions/open")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "RECEPTIONIST", "HEAD_NURSE")

                        // *** Assessment Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/assessments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/assessments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.PUT, "/api/assessments/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/assessments/**")
                        .hasRole("ADMIN")

                        // *** Nursing Care Plan Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/nursingCarePlans/**")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/nursingCarePlans/**")
                        .hasAnyRole("ADMIN", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.PUT, "/api/nursingCarePlans/**")
                        .hasAnyRole("ADMIN", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/nursingCarePlans/**")
                        .hasRole("ADMIN")

                        // *** Lab Test Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/lab-tests/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "LAB_TECHNICIAN")
                        .requestMatchers(HttpMethod.POST, "/api/lab-tests/**")
                        .hasAnyRole("ADMIN", "LAB_TECHNICIAN")

                        // *** Lab Result Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/lab-results/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "LAB_TECHNICIAN")
                        .requestMatchers(HttpMethod.POST, "/api/lab-results/**")
                        .hasAnyRole("ADMIN", "LAB_TECHNICIAN")

                        // *** Image Report Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/imagereports/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "RADIOLOGIST")
                        .requestMatchers(HttpMethod.POST, "/api/imagereports/**")
                        .hasAnyRole("ADMIN", "RADIOLOGIST")
                        .requestMatchers(HttpMethod.PUT, "/api/imagereports/**")
                        .hasAnyRole("ADMIN", "RADIOLOGIST")
                        .requestMatchers(HttpMethod.DELETE, "/api/imagereports/**")
                        .hasRole("ADMIN")

                        // *** Medication Administration Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/medication-administrations/**")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "PHARMACIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/medication-administrations/**")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/medication-administrations/**")
                        .hasRole("ADMIN")

                        // *** Product Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/products/**")
                        .hasAnyRole("ADMIN", "PHARMACIST")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // *** Patient Product Usage Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/product-usage/**")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "PHARMACIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/product-usage/**")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/product-usage/**")
                        .hasRole("ADMIN")

                        // *** Procedure Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/procedures/**")
                        .hasAnyRole("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/procedures/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/procedures/**")
                        .hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/procedures/**")
                        .hasRole("ADMIN")

                        // *** Vital Sign Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/vital-signs/**")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/vital-signs/**")
                        .hasAnyRole("ADMIN", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.PUT, "/api/vital-signs/**")
                        .hasAnyRole("ADMIN", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/vital-signs/**")
                        .hasRole("ADMIN")

                        // *** Unit Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/units/**")
                        .hasAnyRole("ADMIN", "RECEPTIONIST", "HEAD_NURSE", "LAB_TECHNICIAN",
                                "RADIOLOGIST")
                        .requestMatchers(HttpMethod.POST, "/api/units/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/units/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/units/**").hasRole("ADMIN")

                        // *** Billing Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/billings/**")
                        .hasAnyRole("ADMIN", "ACCOUNTANT", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.POST, "/api/billings/**")
                        .hasAnyRole("ADMIN", "ACCOUNTANT")
                        .requestMatchers(HttpMethod.PUT, "/api/billings/**", "/api/billings/{id}")
                        .hasAnyRole("ADMIN", "ACCOUNTANT")
                        .requestMatchers(HttpMethod.DELETE, "/api/billings/**").hasRole("ADMIN")

                        // *** Care Plan Goals Endpoints ***
                        .requestMatchers(HttpMethod.GET, "/api/carePlanGoals/**")
                        .hasAnyRole("ADMIN", "NURSE", "DOCTOR", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/carePlanGoals/**")
                        .hasAnyRole("ADMIN", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.PUT, "/api/carePlanGoals/**")
                        .hasAnyRole("ADMIN", "NURSE", "HEAD_NURSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/carePlanGoals/**")
                        .hasRole("ADMIN")

                        // *** Nurse Specific Permissions
                        .requestMatchers(HttpMethod.GET, "/api/nurses/**")
                        .hasAnyRole("ADMIN", "HEAD_NURSE", "NURSE")
                        .requestMatchers(HttpMethod.POST, "/api/nurses/**")
                        .hasAnyRole("ADMIN", "HEAD_NURSE", "NURSE")
                        .requestMatchers(HttpMethod.PUT, "/api/nurses/**")
                        .hasAnyRole("ADMIN", "HEAD_NURSE", "NURSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/nurses/**")
                        .hasAnyRole("ADMIN", "HEAD_NURSE", "NURSE")

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
                "https://*.ngrok-free.app", // allow any subdomain of ngrok
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