package mine.profile.website.dtos;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mine.profile.website.models.Patient;

@Getter
@Setter
@NoArgsConstructor
public class PatientDTO {
    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String phoneNumber;
    private String email;

    // NEW: Image URL & File
    private String profilePictureURL;
    private MultipartFile profilePictureFile;

    private String medicalRecordNumber;
    private String bloodType;
    private String allergies;
    private String medicalHistory;
    private List<Long> appointmentIds;
    private List<Long> prescriptionIds;
    private List<Long> admissionIds;
    private List<Long> assessmentIds;
    private List<Long> nursingCarePlanIds;

    public PatientDTO(Long id, @NotBlank(message = "First name is required") String firstName,
            @NotBlank(message = "Last name is required") String lastName, LocalDate dateOfBirth, String gender,
            String address, String phoneNumber, String email, String profilePictureURL, String medicalRecordNumber,
            String bloodType, String allergies, String medicalHistory, List<Long> appointmentIds,
            List<Long> prescriptionIds, List<Long> admissionIds, List<Long> assessmentIds,
            List<Long> nursingCarePlanIds) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.profilePictureURL = profilePictureURL;
        this.medicalRecordNumber = medicalRecordNumber;
        this.bloodType = bloodType;
        this.allergies = allergies;
        this.medicalHistory = medicalHistory;
        this.appointmentIds = appointmentIds;
        this.prescriptionIds = prescriptionIds;
        this.admissionIds = admissionIds;
        this.assessmentIds = assessmentIds;
        this.nursingCarePlanIds = nursingCarePlanIds;
    }

    public Patient toEntity() {
        Patient patient = new Patient();
        patient.setId(this.id);
        patient.setFirstName(this.firstName);
        patient.setLastName(this.lastName);
        patient.setDateOfBirth(this.dateOfBirth);
        patient.setGender(this.gender);
        patient.setAddress(this.address);
        patient.setPhoneNumber(this.phoneNumber);
        patient.setEmail(this.email);
        patient.setProfilePictureURL(this.profilePictureURL); // Set Image url
        patient.setMedicalRecordNumber(this.medicalRecordNumber);
        patient.setBloodType(this.bloodType);
        patient.setAllergies(this.allergies);
        patient.setMedicalHistory(this.medicalHistory);

        return patient;
    }

    public static PatientDTO toDto(Patient patient) {
        PatientDTO patientDTO = new PatientDTO();
        patientDTO.setId(patient.getId());
        patientDTO.setFirstName(patient.getFirstName());
        patientDTO.setLastName(patient.getLastName());
        patientDTO.setDateOfBirth(patient.getDateOfBirth());
        patientDTO.setGender(patient.getGender());
        patientDTO.setAddress(patient.getAddress());
        patientDTO.setPhoneNumber(patient.getPhoneNumber());
        patientDTO.setEmail(patient.getEmail());
        patientDTO.setProfilePictureURL(patient.getProfilePictureURL());
        patientDTO.setMedicalRecordNumber(patient.getMedicalRecordNumber());
        patientDTO.setBloodType(patient.getBloodType());
        patientDTO.setAllergies(patient.getAllergies());
        patientDTO.setMedicalHistory(patient.getMedicalHistory());

        if (patient.getAppointments() != null) {
            patientDTO.setAppointmentIds(patient.getAppointments().stream().map(appointment -> appointment.getId())
                    .collect(Collectors.toList()));
        }
        if (patient.getPrescriptions() != null) {
            patientDTO.setPrescriptionIds(patient.getPrescriptions().stream().map(prescription -> prescription.getId())
                    .collect(Collectors.toList()));
        }
        if (patient.getAdmissions() != null) {
            patientDTO.setAdmissionIds(
                    patient.getAdmissions().stream().map(admission -> admission.getId()).collect(Collectors.toList()));
        }
        if (patient.getAssessments() != null) {
            patientDTO.setAssessmentIds(patient.getAssessments().stream().map(assessment -> assessment.getId())
                    .collect(Collectors.toList()));
        }
        if (patient.getNursingCarePlans() != null) {
            patientDTO.setNursingCarePlanIds(patient.getNursingCarePlans().stream()
                    .map(nursingCarePlan -> nursingCarePlan.getId()).collect(Collectors.toList()));
        }

        return patientDTO;
    }
}