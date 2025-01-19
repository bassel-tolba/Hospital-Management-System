// UserController.java
package mine.profile.website.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.UserDTO;
import mine.profile.website.models.Role;
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

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.createUser(userDTO);
        return ResponseEntity.ok(createdUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<UserDTO>> getAllUsers() {
        java.util.List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/byrole/{role}")
    public ResponseEntity<java.util.List<UserDTO>> findByRole(@PathVariable String role) {
        java.util.List<UserDTO> users = userService.findByRole(role);
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
    public ResponseEntity<UserDTO> updateUserUnits(@PathVariable Long id, @RequestBody java.util.List<Long> unitIds) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {

             UserDTO updatedUser = userService.updateUserUnits(id, unitIds);
             return ResponseEntity.ok(updatedUser);
        }
         return ResponseEntity.status(403).build();

    }

    @PutMapping("/updaterooms/{id}")
     public ResponseEntity<UserDTO> updateUserRooms(@PathVariable Long id, @RequestBody java.util.List<Long> roomIds) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
       if (authentication != null && authentication.getAuthorities().stream()
                 .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {

            UserDTO updatedUser = userService.updateUserRooms(id, roomIds);
            return ResponseEntity.ok(updatedUser);
         }
         return ResponseEntity.status(403).build();

    }

    @PutMapping("/updatepatients/{id}")
    public ResponseEntity<UserDTO> updateUserPatients(@PathVariable Long id,
            @RequestBody java.util.List<Long> patientIds) {
          Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {

            UserDTO updatedUser = userService.updateUserPatients(id, patientIds);
             return ResponseEntity.ok(updatedUser);
        }
         return ResponseEntity.status(403).build();

    }
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build(); // Unauthorized if not authenticated
        }

        String username = authentication.getName(); // Get username from authentication
        UserDTO user = userService.getUserByUsername(username);
       if(user == null){
           return ResponseEntity.status(404).build();
       }
        return ResponseEntity.ok(user);
    }
}