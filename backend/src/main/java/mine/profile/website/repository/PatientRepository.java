package mine.profile.website.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {

    List<Patient> findByFirstName(String firstName);

    List<Patient> findByLastName(String lastName);

    List<Patient> findByFirstNameContainingIgnoreCase(String firstName);

    List<Patient> findByLastNameContainingIgnoreCase(String lastName);

    List<Patient> findByDateOfBirth(LocalDate dateOfBirth);

    List<Patient> findByGender(String gender);

    List<Patient> findByEmail(String email);

    List<Patient> findByPhoneNumber(String phoneNumber);

    List<Patient> findByBloodType(String bloodType);

    @Query(value = "SELECT p FROM Patient p WHERE lower(concat(p.firstName,' ',p.lastName)) LIKE lower(:name)")
    List<Patient> searchByFullName(@Param("name") String name);

    @Query(value = "SELECT * FROM patient WHERE YEAR(date_of_birth) = :year", nativeQuery = true)
    List<Patient> findByYearOfBirth(@Param("year") int year);

    @Query("SELECT p FROM Patient p WHERE " +
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.medicalRecordNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable);

    Page<Patient> findAll(Pageable pageable);

    Page<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMedicalRecordNumberContainingIgnoreCase(
            String firstName, String lastName, String medicalRecordNumber, Pageable pageable);

    List<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMedicalRecordNumberContainingIgnoreCase(
            String firstName, String lastName, String medicalRecordNumber);

    @Query("SELECT p FROM Patient p JOIN p.admissions a JOIN a.bed b JOIN b.room r WHERE r.unit.id = :unitId")
    List<Patient> findPatientsByUnitId(@Param("unitId") Long unitId);

    @Query("SELECT p FROM Patient p JOIN p.admissions a JOIN a.bed b JOIN b.room r WHERE r.id = :roomId")
    List<Patient> findPatientsByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT p FROM Patient p JOIN p.nurses n WHERE n.id = :nurseId")
    List<Patient> findPatientsByNurseId(@Param("nurseId") Long nurseId);

    // Dashboard Queries
    @Query("SELECT COUNT(p) FROM Patient p")
    long countAllPatients();

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.gender = 'Male'")
    long countMalePatients();

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.gender = 'Female'")
    long countFemalePatients();

    @Query("SELECT p.bloodType, COUNT(p) FROM Patient p GROUP BY p.bloodType")
    List<Object[]> countPatientsByBloodType();

    @Query(value = "SELECT YEAR(date_of_birth) as year, count(*) from patient group by year", nativeQuery = true)
    List<Object[]> countPatientsByBirthYear();

}