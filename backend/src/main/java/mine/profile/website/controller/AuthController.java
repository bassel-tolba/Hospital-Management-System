// backend/src/main/java/mine/profile/website/controller/AuthController.java
package mine.profile.website.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import mine.profile.website.dtos.AuthRequest;
import mine.profile.website.dtos.UserDTO;
import mine.profile.website.models.Role;
import mine.profile.website.security.JwtTokenProvider;
import mine.profile.website.service.RoleService;
import mine.profile.website.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final RoleService roleService;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider,
            UserService userService, RoleService roleService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.roleService = roleService;
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                authRequest.getUsername(), authRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);

        // Get the user by username
        UserDTO user = userService.getUserByUsername(authRequest.getUsername());

        // Populate the authorities from UserDetails
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        user.setAuthorities(authorities); // Set the authorities
        user.setToken(token); // Set the token

        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> register(@Valid @RequestPart("user") RegisterRequest registerRequest,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {

        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(registerRequest.getUsername());
        userDTO.setPassword(registerRequest.getPassword());
        userDTO.setFirstName(registerRequest.getFirstName());
        userDTO.setLastName(registerRequest.getLastName());
        userDTO.setSpecialty(registerRequest.getSpecialty());

        // --- Role Handling ---
        try {
            Role role = roleService.getRoleById(registerRequest.getRoleId()); // Use role ID
            userDTO.setRoleId(role.getId());
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Or a more specific error response
        }

        UserDTO registeredUser = userService.registerUser(userDTO, profilePicture);

        if (registerRequest.getUnitIds() != null && !registerRequest.getUnitIds().isEmpty()) {
            userService.updateUserUnits(registeredUser.getId(), registerRequest.getUnitIds());
        }
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }
}