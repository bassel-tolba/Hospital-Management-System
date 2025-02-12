// backend/src/main/java/mine/profile/website/service/UserService.java
package mine.profile.website.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.UserDTO;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Role;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.models.User;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.RoleRepository;
import mine.profile.website.repository.RoomRepository;
import mine.profile.website.repository.UnitRepository;
import mine.profile.website.repository.UserRepository;
import mine.profile.website.util.FileHandler;

@Service
public class UserService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UnitRepository unitRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private RoleRepository roleRepository; // Inject RoleRepository
    @Autowired
    private FileHandler fileHandler;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public UserDTO createUser(UserDTO userDTO, MultipartFile profilePictureFile) {
        log.info("Creating user with details: {}", userDTO);
        User user = userDTO.toEntity();

        // Set the role based on the provided roleId
        if (userDTO.getRoleId() != null) {
            Role role = roleRepository.findById(userDTO.getRoleId())
                    .orElseThrow(() -> new EntityNotFoundException("Role not found with ID: " + userDTO.getRoleId()));
            user.setRole(role);
        }

        // Handle profile picture upload
        if (profilePictureFile != null && !profilePictureFile.isEmpty()) {
            try {
                String imageUrl = fileHandler.saveFile(profilePictureFile);
                user.setProfilePictureURL(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save profile picture: " + e.getMessage(), e);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        return UserDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserDTO registerUser(UserDTO userDTO, MultipartFile profilePictureFile) {
        log.info("Registering user with details: {}", userDTO);
        String rawPassword = userDTO.getPassword();
        if (rawPassword == null) {
            throw new IllegalArgumentException("rawPassword cannot be null");
        }
        userDTO.setPassword(passwordEncoder.encode(rawPassword));
        UserDTO createdUserDto = createUser(userDTO, profilePictureFile);

        return createdUserDto;
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO, MultipartFile profilePictureFile,
            String removedProfilePictureUrl) {
        log.info("Updating user with ID: {} and details: {}", id, userDTO);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new EntityNotFoundException("User not found with ID: " + id);
                });

        // Update provided fields only, leave others untouched
        if (userDTO.getUsername() != null) {
            user.setUsername(userDTO.getUsername());
        }
        if (userDTO.getFirstName() != null) {
            user.setFirstName(userDTO.getFirstName());
        }
        if (userDTO.getLastName() != null) {
            user.setLastName(userDTO.getLastName());
        }
        if (userDTO.getSpecialty() != null) {
            user.setSpecialty(userDTO.getSpecialty());
        }
        if (userDTO.getRoleId() != null) {
            Role role = roleRepository.findById(userDTO.getRoleId())
                    .orElseThrow(() -> new EntityNotFoundException("Role not found with ID: " + userDTO.getRoleId()));
            user.setRole(role);
        }
        // Handle profile picture update/removal
        if (removedProfilePictureUrl != null && user.getProfilePictureURL() != null
                && user.getProfilePictureURL().equals(removedProfilePictureUrl)) {
            user.setProfilePictureURL(null);
        }

        if (profilePictureFile != null && !profilePictureFile.isEmpty()) {
            try {
                String imageUrl = fileHandler.saveFile(profilePictureFile);
                user.setProfilePictureURL(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save profile picture: " + e.getMessage(), e);
            }
        }
        // Only encode the password if a new password was provided.
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        User savedUser = userRepository.save(user);
        log.info("User updated successfully with ID: {}", savedUser.getId());
        return UserDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserDTO getUserById(Long id) {
        log.info("Fetching user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new EntityNotFoundException("User not found with ID: " + id);
                });

        return UserDTO.fromEntity(user);
    }

    public UserDTO getUserByUsername(String username) {
        log.info("Fetching user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found with username: {}", username);
                    return new EntityNotFoundException("User not found with username: " + username);
                });

        return UserDTO.fromEntity(user);
    }

    public List<UserDTO> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            log.error("User not found with ID: {}", id);
            throw new EntityNotFoundException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
        log.info("User deleted successfully with ID: {}", id);
    }

    public List<UserDTO> findByRole(Long roleId) { // Changed parameter to Long roleId
        log.info("Searching for users with role ID: {}", roleId);
        Role role = roleRepository.findById(roleId) // Find the role first
                .orElseThrow(() -> new EntityNotFoundException("Role not found with ID: " + roleId));
        return userRepository.findByRole(role).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findByFirstName(String firstName) {
        log.info("Searching for users with first name: {}", firstName);
        return userRepository.findByFirstNameContainingIgnoreCase(firstName).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findByLastName(String lastName) {
        log.info("Searching for users with last name: {}", lastName);
        return userRepository.findByLastNameContainingIgnoreCase(lastName).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findBySpecialty(String specialty) {
        log.info("Searching for users with specialty: {}", specialty);
        return userRepository.findBySpecialty(specialty).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDTO> findByUnitId(Long unitId) {
        log.info("Searching for users with unit id: {}", unitId);
        return userRepository.findByUnitId(unitId).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserUnits(Long id, List<Long> unitIds) {
        log.info("Updating user {} units to {}", id, unitIds);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new EntityNotFoundException("User not found with ID: " + id);
                });

        List<Unit> units = unitIds.stream().map(unitId -> {
            Unit unit = unitRepository.findById(unitId)
                    .orElseThrow(() -> {
                        log.error("Unit not found with ID: {}", unitId);
                        return new EntityNotFoundException("Unit not found with ID: " + unitId);
                    });
            return unit;
        }).collect(Collectors.toList());

        user.setUnits(units);
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserDTO updateUserRooms(Long id, List<Long> roomIds) {
        log.info("Updating user {} rooms to {}", id, roomIds);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new EntityNotFoundException("User not found with ID: " + id);
                });

        List<Room> rooms = roomIds.stream().map(roomId -> {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> {
                        log.error("Room not found with ID: {}", roomId);
                        return new EntityNotFoundException("Room not found with ID: " + roomId);
                    });
            return room;
        }).collect(Collectors.toList());

        user.setRooms(rooms);
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserDTO updateUserPatients(Long id, List<Long> patientIds) {
        log.info("Updating user {} patients to {}", id, patientIds);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new EntityNotFoundException("User not found with ID: " + id);
                });

        List<Patient> patients = patientIds.stream().map(patientId -> {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> {
                        log.error("Patient not found with ID: {}", patientId);
                        return new EntityNotFoundException("Patient not found with ID: " + patientId);
                    });
            return patient;
        }).collect(Collectors.toList());

        user.setPatients(patients);
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    public Page<UserDTO> searchUsers(String search, Pageable pageable) {
        log.info("Searching users with search term: {} and pageable: {}", search, pageable);
        Page<User> usersPage = userRepository.searchUsers(search, pageable);
        return usersPage.map(UserDTO::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        List<GrantedAuthority> authorities = user.getRole().getPermissions().stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                true, // ADD THIS! Pass the value from your User entity.
                true, // accountNonExpired (usually true)
                true, // credentialsNonExpired (usually true)
                true, // accountNonLocked (usually true)
                authorities);
    }
}