package mine.profile.website.models;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String firstName;

    private String lastName;

    private String specialty;

    private boolean enabled;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_unit", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "unit_id"))
    private List<Unit> units;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_room", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "room_id"))
    private List<Room> rooms;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_patient", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "patient_id"))
    private List<Patient> patients;

    @OneToMany(mappedBy = "user")
    private List<MedicationAdministration> medicationAdministrations;

}