// backend/src/main/java/mine/profile/website/rest/controller/UserController.java
package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import mine.profile.website.dtos.UserDTO;
import mine.profile.website.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<Page<UserDTO>> searchUsers(
            @RequestParam(value = "search", defaultValue = "") String search,
            Pageable pageable) {
        Page<UserDTO> users = userService.searchUsers(search, pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('CREATE_USER')")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestPart("user") UserDTO userDTO,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {
        UserDTO createdUser = userService.createUser(userDTO, profilePicture);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
            @RequestPart("user") @Valid UserDTO userDTO,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestPart(value = "removedProfilePictureUrls", required = false) String removedProfilePictureUrls) {

        UserDTO updatedUser = userService.updateUser(id, userDTO, profilePicture, removedProfilePictureUrls);
        if (updatedUser != null) {
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_USER')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<UserDTO>> getAllUsers() {
        java.util.List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/byrole/{roleId}") // Changed to roleId
    @PreAuthorize("hasAuthority('READ_USER')") // Require permission, not role
    public ResponseEntity<java.util.List<UserDTO>> findByRole(@PathVariable Long roleId) {
        java.util.List<UserDTO> users = userService.findByRole(roleId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/byfirstname/{firstName}")
    public ResponseEntity<java.util.List<UserDTO>> findByFirstName(@PathVariable String firstName) {
        java.util.List<UserDTO> users = userService.findByFirstName(firstName);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/bylastname/{lastName}")
    public ResponseEntity<java.util.List<UserDTO>> findByLastName(@PathVariable String lastName) {
        java.util.List<UserDTO> users = userService.findByLastName(lastName);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/byspecialty/{specialty}")
    public ResponseEntity<java.util.List<UserDTO>> findBySpecialty(@PathVariable String specialty) {
        java.util.List<UserDTO> users = userService.findBySpecialty(specialty);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/byunitid/{unitId}")
    public ResponseEntity<java.util.List<UserDTO>> findByUnitId(@PathVariable Long unitId) {
        java.util.List<UserDTO> users = userService.findByUnitId(unitId);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/updateunits/{id}")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<UserDTO> updateUserUnits(@PathVariable Long id, @RequestBody java.util.List<Long> unitIds) {
        UserDTO updatedUser = userService.updateUserUnits(id, unitIds);
        return ResponseEntity.ok(updatedUser);

    }

    @PutMapping("/updaterooms/{id}")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<UserDTO> updateUserRooms(@PathVariable Long id, @RequestBody java.util.List<Long> roomIds) {
        UserDTO updatedUser = userService.updateUserRooms(id, roomIds);
        return ResponseEntity.ok(updatedUser);

    }

    @PutMapping("/updatepatients/{id}")
    @PreAuthorize("hasAuthority('UPDATE_USER')")
    public ResponseEntity<UserDTO> updateUserPatients(@PathVariable Long id,
            @RequestBody java.util.List<Long> patientIds) {
        UserDTO updatedUser = userService.updateUserPatients(id, patientIds);
        return ResponseEntity.ok(updatedUser);

    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build(); // Unauthorized if not authenticated
        }

        String username = authentication.getName(); // Get username from authentication
        UserDTO user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(user);
    }
}