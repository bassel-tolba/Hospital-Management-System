// repository/PatientRepository.java
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
public interface PatientRepository
        extends JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {

    List<Patient> findByFirstName(String firstName);

    List<Patient> findByLastName(String lastName);

    List<Patient> findByFirstNameContainingIgnoreCase(String firstName);

    List<Patient> findByLastNameContainingIgnoreCase(String lastName);

    List<Patient> findByDateOfBirth(LocalDate dateOfBirth);

    List<Patient> findByGender(String gender);

    List<Patient> findByEmail(String email);

    List<Patient> findByPhoneNumber(String phoneNumber);

    List<Patient> findByBloodType(String bloodType);

    // Add this method to check for MRN uniqueness
    boolean existsByMedicalRecordNumber(String medicalRecordNumber);

    @Query(value = "SELECT p FROM Patient p WHERE lower(concat(p.firstName,' ',p.lastName)) LIKE lower(:name) AND p.deleted = false")
    List<Patient> searchByFullName(@Param("name") String name);

    @Query(value = "SELECT * FROM patient WHERE YEAR(date_of_birth) = :year AND deleted = false", nativeQuery = true)
    List<Patient> findByYearOfBirth(@Param("year") int year);

    @Query("SELECT p FROM Patient p WHERE "
            + "(LOWER(COALESCE(p.firstName, '') || ' ' || COALESCE(p.lastName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + // Combined name
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.medicalRecordNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND p.deleted = false")
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable); // This is now the main search

    @Query("SELECT p FROM Patient p WHERE "
            + "(LOWER(COALESCE(p.firstName, '') || ' ' || COALESCE(p.lastName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + // Combined name
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.medicalRecordNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND p.deleted = false ORDER BY p.severityLevel ASC")
    Page<Patient> searchPatientsOrderBySeverity(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Patient p ORDER BY p.severityLevel ASC")
    Page<Patient> findAllOrderBySeverityLevelAsc(Pageable pageable);

    Page<Patient> findAll(Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :firstName, '%')) OR "
            + "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :lastName, '%')) OR "
            + "LOWER(p.medicalRecordNumber) LIKE LOWER(CONCAT('%', :medicalRecordNumber, '%'))) AND p.deleted = :deleted")
    List<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMedicalRecordNumberContainingIgnoreCase(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("medicalRecordNumber") String medicalRecordNumber,
            @Param("deleted") boolean deleted);

    @Query("SELECT p FROM Patient p WHERE (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :firstName, '%')) OR "
            + "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :lastName, '%')) OR "
            + "LOWER(p.medicalRecordNumber) LIKE LOWER(CONCAT('%', :medicalRecordNumber, '%'))) AND p.deleted = false")
    Page<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrMedicalRecordNumberContainingIgnoreCase(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("medicalRecordNumber") String medicalRecordNumber,
            Pageable pageable);

    @Query("SELECT p FROM Patient p JOIN p.admissions a JOIN a.bed b JOIN b.room r WHERE r.unit.id = :unitId")
    List<Patient> findPatientsByUnitId(@Param("unitId") Long unitId);

    @Query("SELECT p FROM Patient p JOIN p.admissions a JOIN a.bed b JOIN b.room r WHERE r.id = :roomId")
    List<Patient> findPatientsByRoomId(@Param("roomId") Long roomId);

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

    // New methods to find deleted patients
    @Query("SELECT p FROM Patient p WHERE p.deleted = true")
    Page<Patient> findAllDeleted(Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE "
            + "(LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(p.medicalRecordNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND p.deleted = true")
    Page<Patient> searchDeletedPatients(@Param("search") String search, Pageable pageable);

    List<Patient> findByDeleted(boolean deleted);

    @Query("SELECT p FROM Patient p JOIN p.admissions a JOIN a.bed b JOIN b.room r WHERE r.unit.id = :unitId AND p.deleted = false")
    List<Patient> findPatientsByUnitIdWithFalse(@Param("unitId") Long unitId);

    @Query("SELECT p FROM Patient p JOIN p.admissions a JOIN a.bed b JOIN b.room r WHERE r.id = :roomId AND p.deleted = false")
    List<Patient> findPatientsByRoomIdWithFalse(@Param("roomId") Long roomId);
}