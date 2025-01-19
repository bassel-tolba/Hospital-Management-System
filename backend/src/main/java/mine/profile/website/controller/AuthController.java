package mine.profile.website.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.AuthRequest;
import mine.profile.website.dtos.UserDTO;
import mine.profile.website.security.JwtTokenProvider;
import mine.profile.website.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final JwtTokenProvider jwtTokenProvider;

    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider,
            UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                authRequest.getUsername(), authRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userDetails);

        UserDTO user = userService.getUserByUsername(authRequest.getUsername());
        // Include token in the user DTO
        user.setToken(token);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterRequest registerRequest) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(registerRequest.getUsername());
        userDTO.setPassword(registerRequest.getPassword());
        userDTO.setRole(registerRequest.getRole());
        userDTO.setFirstName(registerRequest.getFirstName());
        userDTO.setLastName(registerRequest.getLastName());
        userDTO.setSpecialty(registerRequest.getSpecialty());
        UserDTO registeredUser = userService.registerUser(userDTO);
        if (registerRequest.getUnitIds() != null && !registerRequest.getUnitIds().isEmpty()) {
            userService.updateUserUnits(registeredUser.getId(), registerRequest.getUnitIds());
        }
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
    }

}