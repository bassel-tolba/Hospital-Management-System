package mine.profile.website.models;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Nurse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany
    @JoinTable(name = "nurse_patient", joinColumns = @JoinColumn(name = "nurse_id"), inverseJoinColumns = @JoinColumn(name = "patient_id"))
    private Set<Patient> patients = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "nurse_unit", joinColumns = @JoinColumn(name = "nurse_id"), inverseJoinColumns = @JoinColumn(name = "unit_id"))
    private Set<Unit> units = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "nurse_room", joinColumns = @JoinColumn(name = "nurse_id"), inverseJoinColumns = @JoinColumn(name = "room_id"))
    private Set<Room> rooms = new HashSet<>();

    public Nurse(User user) {
        this.user = user;
    }

}