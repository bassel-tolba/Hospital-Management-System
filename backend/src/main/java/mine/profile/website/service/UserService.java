// UserService.java
package mine.profile.website.service;

import java.util.Collections;
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

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.NurseDTO;
import mine.profile.website.dtos.UserDTO;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Role;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.models.User;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.RoomRepository;
import mine.profile.website.repository.UnitRepository;
import mine.profile.website.repository.UserRepository;

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
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private NurseService nurseService; // Inject NurseService

    private Role getRoleFromString(String roleName) {
        try {
            return Role.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            log.error("Invalid role name: {}", roleName);
            throw new IllegalArgumentException("Invalid role name: " + roleName);
        }
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        log.info("Creating user with details: {}", userDTO);
        User user = userDTO.toEntity();

        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        return UserDTO.fromEntity(savedUser);
    }

    @Transactional
    public UserDTO registerUser(UserDTO userDTO) {
        log.info("Registering user with details: {}", userDTO);
        String rawPassword = userDTO.getPassword();
        if (rawPassword == null) {
            throw new IllegalArgumentException("rawPassword cannot be null");
        }
        userDTO.setPassword(passwordEncoder.encode(rawPassword));
        UserDTO createdUserDto = createUser(userDTO);

        // Create nurse if the user role is NURSE
        if (userDTO.getRole().equals("NURSE")) {
            NurseDTO nurseDTO = new NurseDTO();
            User user = createdUserDto.toEntity();
            nurseDTO.setUser(user);

            nurseService.createNurse(nurseDTO);
            log.info("Nurse created for user with ID: {}", createdUserDto.getId());
        }

        return createdUserDto;
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
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
        if (userDTO.getRole() != null) {
            user.setRole(getRoleFromString(userDTO.getRole()));
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

    public List<UserDTO> findByRole(String role) {
        log.info("Searching for users with role: {}", role);
        return userRepository.findByRole(getRoleFromString(role)).stream()
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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                mapRolesToAuthorities(Collections.singletonList(user.getRole())));
    }

    private List<GrantedAuthority> mapRolesToAuthorities(List<Role> roles) {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }
}