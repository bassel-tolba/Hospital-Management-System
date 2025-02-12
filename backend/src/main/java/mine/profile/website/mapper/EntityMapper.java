package mine.profile.website.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import mine.profile.website.dtos.AdmissionDTO;
import mine.profile.website.dtos.AppointmentDTO;
import mine.profile.website.dtos.AssessmentDTO;
import mine.profile.website.dtos.BedDTO;
import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.CarePlanGoalDTO;
import mine.profile.website.dtos.DepartmentDTO;
import mine.profile.website.dtos.ImageReportDTO;
import mine.profile.website.dtos.ImageReportTypeDTO;
import mine.profile.website.dtos.NursingCarePlanDTO;
import mine.profile.website.dtos.PatientDTO;
import mine.profile.website.dtos.PaymentDTO;
import mine.profile.website.dtos.ProcedureDTO;
import mine.profile.website.dtos.ProcedureLogDTO;
import mine.profile.website.dtos.RoomDTO;
import mine.profile.website.dtos.UnitDTO;
import mine.profile.website.dtos.VitalSignDTO;
import mine.profile.website.models.Admission;
import mine.profile.website.models.Appointment;
import mine.profile.website.models.Assessment;
import mine.profile.website.models.Bed;
import mine.profile.website.models.Billing;
import mine.profile.website.models.CarePlanGoal;
import mine.profile.website.models.Department;
import mine.profile.website.models.ImageReport;
import mine.profile.website.models.ImageReportType;
import mine.profile.website.models.NursingCarePlan;
import mine.profile.website.models.Patient;
import mine.profile.website.models.Payment;
import mine.profile.website.models.Prescription;
import mine.profile.website.models.Procedure;
import mine.profile.website.models.ProcedureLog;
import mine.profile.website.models.Room;
import mine.profile.website.models.Unit;
import mine.profile.website.models.User;
import mine.profile.website.models.VitalSign;

@Component
public class EntityMapper {
    // -------------------- Admission Mapping --------------------
    public AdmissionDTO toDto(Admission admission) {
        if (admission == null) {
            return null;
        }
        AdmissionDTO dto = new AdmissionDTO();
        dto.setId(admission.getId());
        dto.setAdmissionDate(admission.getAdmissionDate());
        dto.setDischargeDate(admission.getDischargeDate());
        if (admission.getPatient() != null) {
            dto.setPatientId(admission.getPatient().getId());
            dto.setPatientName(admission.getPatient().getFirstName() + " " + admission.getPatient().getLastName());
        }
        if (admission.getBed() != null) {
            dto.setBedId(admission.getBed().getId());
        }

        return dto;
    }

    public Admission toEntity(AdmissionDTO dto, Patient patient, Bed bed) {
        if (dto == null) {
            return null;
        }
        Admission entity = new Admission();
        entity.setId(dto.getId());
        entity.setAdmissionDate(dto.getAdmissionDate());
        entity.setDischargeDate(dto.getDischargeDate());
        entity.setPatient(patient);
        entity.setBed(bed);

        return entity;
    }

    public void updateEntity(AdmissionDTO dto, Patient patient, Bed bed, Admission admission) {
        if (dto == null || admission == null) {
            return;
        }
        admission.setAdmissionDate(dto.getAdmissionDate());
        admission.setDischargeDate(dto.getDischargeDate());
        admission.setPatient(patient);
        admission.setBed(bed);
    }

    public List<AdmissionDTO> toAdmissionDtoList(List<Admission> admissions) {
        if (admissions == null) {
            return new ArrayList<>();
        }
        return admissions.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- Appointment Mapping --------------------
    public AppointmentDTO toDto(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        if (appointment.getPatient() != null) {
            dto.setPatientId(appointment.getPatient().getId());
        }
        if (appointment.getUser() != null) {
            dto.setUserId(appointment.getUser().getId());
        }
        return dto;
    }

    public Appointment toEntity(AppointmentDTO dto, Patient patient, User user) {
        if (dto == null) {
            return null;
        }
        Appointment entity = new Appointment();
        entity.setId(dto.getId());
        entity.setAppointmentDateTime(dto.getAppointmentDateTime());
        entity.setPatient(patient);
        entity.setUser(user);

        return entity;
    }

    public List<AppointmentDTO> toAppointmentDtoList(List<Appointment> appointments) {
        if (appointments == null) {
            return new ArrayList<>();
        }
        return appointments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- Assessment Mapping --------------------
    public AssessmentDTO toDto(Assessment assessment) {
        if (assessment == null) {
            return null;
        }
        AssessmentDTO dto = new AssessmentDTO();
        dto.setId(assessment.getId());
        dto.setAssessmentDateTime(assessment.getAssessmentDateTime());
        dto.setNotes(assessment.getNotes());
        if (assessment.getPatient() != null) {
            dto.setPatientId(assessment.getPatient().getId());
        }
        return dto;
    }

    public Assessment toEntity(AssessmentDTO dto, Patient patient) {
        if (dto == null) {
            return null;
        }
        Assessment entity = new Assessment();
        entity.setId(dto.getId());
        entity.setAssessmentDateTime(dto.getAssessmentDateTime());
        entity.setNotes(dto.getNotes());
        entity.setPatient(patient);

        return entity;
    }

    public List<AssessmentDTO> toAssessmentDtoList(List<Assessment> assessments) {
        if (assessments == null) {
            return new ArrayList<>();
        }
        return assessments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- Bed Mapping --------------------
    public BedDTO toDto(Bed bed) {
        if (bed == null) {
            return null;
        }
        BedDTO dto = new BedDTO();
        dto.setId(bed.getId());
        dto.setBedNumber(bed.getBedNumber());
        dto.setOccupied(bed.isOccupied());
        if (bed.getRoom() != null) {
            dto.setRoomId(bed.getRoom().getId());
        }
        return dto;
    }

    public Bed toEntity(BedDTO dto, Room room) {
        if (dto == null) {
            return null;
        }
        Bed entity = new Bed();
        entity.setId(dto.getId());
        entity.setBedNumber(dto.getBedNumber());
        entity.setOccupied(dto.isOccupied());
        entity.setRoom(room);

        return entity;
    }

    public List<BedDTO> toBedDtoList(List<Bed> beds) {
        if (beds == null) {
            return new ArrayList<>();
        }
        return beds.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- Billing Mapping --------------------
    public BillingDTO toDto(Billing billing) {
        if (billing == null) {
            return null;
        }
        BillingDTO dto = new BillingDTO();
        dto.setId(billing.getId());
        dto.setBillDate(billing.getBillDate());
        dto.setTotalAmount(billing.getTotalAmount());
        dto.setPaid(billing.isPaid());
        if (billing.getPatient() != null) {
            dto.setPatientId(billing.getPatient().getId());
        }

        if (billing.getPayments() != null) {
            dto.setPaymentIds(billing.getPayments().stream().map(Payment::getId).collect(Collectors.toList()));
        }
        if (billing.getProcedureLogs() != null) {
            dto.setProcedureLogIds(
                    billing.getProcedureLogs().stream().map(ProcedureLog::getId).collect(Collectors.toList()));
        }
        return dto;
    }

    public Billing toEntity(BillingDTO dto, Patient patient) {
        if (dto == null) {
            return null;
        }
        Billing entity = new Billing();
        entity.setId(dto.getId());
        entity.setBillDate(dto.getBillDate());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setPaid(dto.isPaid());
        entity.setPatient(patient);

        return entity;
    }

    public List<BillingDTO> toBillingDtoList(List<Billing> billings) {
        if (billings == null) {
            return new ArrayList<>();
        }
        return billings.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- CarePlanGoal Mapping --------------------
    public CarePlanGoalDTO toDto(CarePlanGoal carePlanGoal) {
        if (carePlanGoal == null) {
            return null;
        }
        CarePlanGoalDTO dto = new CarePlanGoalDTO();
        dto.setId(carePlanGoal.getId());
        dto.setDescription(carePlanGoal.getDescription());
        dto.setTargetOutcome(carePlanGoal.getTargetOutcome());
        if (carePlanGoal.getNursingCarePlan() != null) {
            dto.setNursingCarePlanId(carePlanGoal.getNursingCarePlan().getId());
        }
        return dto;
    }

    public CarePlanGoal toEntity(CarePlanGoalDTO dto, NursingCarePlan nursingCarePlan) {
        if (dto == null) {
            return null;
        }
        CarePlanGoal entity = new CarePlanGoal();
        entity.setId(dto.getId());
        entity.setDescription(dto.getDescription());
        entity.setTargetOutcome(dto.getTargetOutcome());
        entity.setNursingCarePlan(nursingCarePlan);

        return entity;
    }

    public List<CarePlanGoalDTO> toCarePlanGoalDtoList(List<CarePlanGoal> carePlanGoals) {
        if (carePlanGoals == null) {
            return new ArrayList<>();
        }
        return carePlanGoals.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- Department Mapping --------------------
    public DepartmentDTO toDto(Department department) {
        if (department == null) {
            return null;
        }
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(department.getId());
        dto.setName(department.getName());
        return dto;
    }

    public Department toEntity(DepartmentDTO dto) {
        if (dto == null) {
            return null;
        }
        Department entity = new Department();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        return entity;
    }

    public List<DepartmentDTO> toDepartmentDtoList(List<Department> departments) {
        if (departments == null) {
            return new ArrayList<>();
        }
        return departments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // // -------------------- MedicationAdministration Mapping --------------------
    // public MedicationAdministrationDTO toMedicationAdministrationDto(
    // MedicationAdministration medicationAdministration) {
    // if (medicationAdministration == null) {
    // return null;
    // }
    // MedicationAdministrationDTO dto = new MedicationAdministrationDTO();
    // dto.setId(medicationAdministration.getId());
    // dto.setAdministrationTime(medicationAdministration.getAdministrationTime());
    // dto.setAmount(medicationAdministration.getAmount());
    // dto.setCalculatedPrice(medicationAdministration.getCalculatedPrice());
    // if (medicationAdministration.getPatient() != null) {
    // dto.setPatientId(medicationAdministration.getPatient().getId());
    // }

    // if (medicationAdministration.getPrescription() != null) {
    // dto.setPrescriptionId(medicationAdministration.getPrescription().getId());
    // }
    // if (medicationAdministration.getUser() != null) {
    // dto.setUserId(medicationAdministration.getUser().getId());
    // }
    // if (medicationAdministration.getMedication() != null) {
    // dto.setMedicationId(medicationAdministration.getMedication().getId());
    // }

    // return dto;
    // }

    // public MedicationAdministration
    // toMedicationAdministration(MedicationAdministrationDTO dto) {
    // if (dto == null) {
    // return null;
    // }
    // MedicationAdministration entity = new MedicationAdministration();
    // entity.setId(dto.getId());
    // entity.setAdministrationTime(dto.getAdministrationTime());
    // entity.setAmount(dto.getAmount());
    // entity.setCalculatedPrice(dto.getCalculatedPrice());
    // return entity;
    // }

    // public MedicationAdministration
    // toMedicationAdministration(MedicationAdministrationDTO dto,
    // Prescription prescription, User user,
    // Patient patient, Medication medication) {
    // if (dto == null) {
    // return null;
    // }
    // MedicationAdministration entity = new MedicationAdministration();
    // entity.setId(dto.getId());
    // entity.setAdministrationTime(dto.getAdministrationTime());
    // entity.setAmount(dto.getAmount());
    // entity.setCalculatedPrice(dto.getCalculatedPrice());
    // entity.setPatient(patient);
    // entity.setPrescription(prescription);
    // entity.setUser(user);
    // entity.setMedication(medication);

    // return entity;
    // }

    // public List<MedicationAdministrationDTO> toMedicationAdministrationDtoList(
    // List<MedicationAdministration> medicationAdministrations) {
    // if (medicationAdministrations == null) {
    // return new ArrayList<>();
    // }
    // return
    // medicationAdministrations.stream().map(this::toMedicationAdministrationDto).collect(Collectors.toList());
    // }

    // public Page<MedicationAdministrationDTO> toMedicationAdministrationDtoPage(
    // Page<MedicationAdministration> medicationAdministrations) {
    // return medicationAdministrations.map(this::toMedicationAdministrationDto);
    // }

    // -------------------- NursingCarePlan Mapping --------------------
    public NursingCarePlanDTO toDto(NursingCarePlan nursingCarePlan) {
        if (nursingCarePlan == null) {
            return null;
        }
        NursingCarePlanDTO dto = new NursingCarePlanDTO();
        dto.setId(nursingCarePlan.getId());
        dto.setStartDate(nursingCarePlan.getStartDate());
        dto.setNotes(nursingCarePlan.getNotes());
        if (nursingCarePlan.getPatient() != null) {
            dto.setPatientId(nursingCarePlan.getPatient().getId());
        }
        if (nursingCarePlan.getCarePlanGoals() != null) {
            dto.setCarePlanGoalIds(
                    nursingCarePlan.getCarePlanGoals().stream().map(CarePlanGoal::getId).collect(Collectors.toList()));
        }

        return dto;
    }

    public NursingCarePlan toEntity(NursingCarePlanDTO dto, Patient patient) {
        if (dto == null) {
            return null;
        }
        NursingCarePlan entity = new NursingCarePlan();
        entity.setId(dto.getId());
        entity.setStartDate(dto.getStartDate());
        entity.setNotes(dto.getNotes());
        entity.setPatient(patient);

        return entity;
    }

    public List<NursingCarePlanDTO> toNursingCarePlanDtoList(List<NursingCarePlan> nursingCarePlans) {
        if (nursingCarePlans == null) {
            return new ArrayList<>();
        }
        return nursingCarePlans.stream().map(this::toDto).collect(Collectors.toList());
    }

    // -------------------- Patient Mapping --------------------
    public PatientDTO toDto(Patient patient) {
        if (patient == null) {
            return null;
        }
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setAddress(patient.getAddress());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setEmail(patient.getEmail());
        dto.setProfilePictureURL(patient.getProfilePictureURL());
        dto.setMedicalRecordNumber(patient.getMedicalRecordNumber());
        dto.setBloodType(patient.getBloodType());
        dto.setAllergies(patient.getAllergies());
        dto.setMedicalHistory(patient.getMedicalHistory());
        if (patient.getAppointments() != null) {
            dto.setAppointmentIds(
                    patient.getAppointments().stream().map(Appointment::getId).collect(Collectors.toList()));
        }
        if (patient.getPrescriptions() != null) {
            dto.setPrescriptionIds(
                    patient.getPrescriptions().stream().map(Prescription::getId).collect(Collectors.toList()));
        }
        if (patient.getAdmissions() != null) {
            dto.setAdmissionIds(patient.getAdmissions().stream().map(Admission::getId).collect(Collectors.toList()));
        }
        if (patient.getAssessments() != null) {
            dto.setAssessmentIds(patient.getAssessments().stream().map(Assessment::getId).collect(Collectors.toList()));
        }
        if (patient.getNursingCarePlans() != null) {
            dto.setNursingCarePlanIds(
                    patient.getNursingCarePlans().stream().map(NursingCarePlan::getId).collect(Collectors.toList()));
        }
        return dto;
    }

    public Patient toEntity(PatientDTO dto) {
        if (dto == null) {
            return null;
        }
        Patient entity = new Patient();
        entity.setId(dto.getId());
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setGender(dto.getGender());
        entity.setAddress(dto.getAddress());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        entity.setProfilePictureURL(dto.getProfilePictureURL());
        entity.setMedicalRecordNumber(dto.getMedicalRecordNumber());
        entity.setBloodType(dto.getBloodType());
        entity.setAllergies(dto.getAllergies());
        entity.setMedicalHistory(dto.getMedicalHistory());
        return entity;
    }

    public List<PatientDTO> toPatientDtoList(List<Patient> patients) {
        if (patients == null) {
            return new ArrayList<>();
        }
        return patients.stream().map(this::toDto).collect(Collectors.toList());
    }

    // -------------------- Payment Mapping --------------------
    public PaymentDTO toDto(Payment payment) {
        if (payment == null) {
            return null;
        }
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        if (payment.getBilling() != null) {
            dto.setBillingId(payment.getBilling().getId());
        }
        return dto;
    }

    public Payment toEntity(PaymentDTO dto, Billing billing) {
        if (dto == null) {
            return null;
        }
        Payment entity = new Payment();
        entity.setId(dto.getId());
        entity.setPaymentDate(dto.getPaymentDate());
        entity.setAmount(dto.getAmount());
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setBilling(billing);
        return entity;
    }

    public List<PaymentDTO> toPaymentDtoList(List<Payment> payments) {
        if (payments == null) {
            return new ArrayList<>();
        }
        return payments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // // -------------------- Prescription Mapping --------------------
    // public PrescriptionDTO toDto(Prescription prescription) {
    // if (prescription == null) {
    // return null;
    // }
    // PrescriptionDTO dto = new PrescriptionDTO();
    // dto.setId(prescription.getId());
    // dto.setPrescriptionDate(prescription.getPrescriptionDate());
    // dto.setNote(prescription.getNote());
    // if (prescription.getPatient() != null) {
    // dto.setPatientId(prescription.getPatient().getId());
    // }
    // if (prescription.getMedication() != null) {
    // dto.setMedicationId(prescription.getMedication().getId());
    // }
    // return dto;
    // }

    // public Prescription toEntity(PrescriptionDTO dto, Patient patient, Medication
    // medication) {
    // if (dto == null) {
    // return null;
    // }
    // Prescription entity = new Prescription();
    // entity.setId(dto.getId());
    // entity.setNote(dto.getNote());
    // entity.setPrescriptionDate(dto.getPrescriptionDate());
    // entity.setPatient(patient);
    // entity.setMedication(medication);
    // return entity;
    // }

    // public List<PrescriptionDTO> toPrescriptionDtoList(List<Prescription>
    // prescriptions) {
    // if (prescriptions == null) {
    // return new ArrayList<>();
    // }
    // return prescriptions.stream()
    // .map(this::toDto)
    // .collect(Collectors.toList());
    // }

    // -------------------- Procedure Mapping --------------------
    public ProcedureDTO toDto(Procedure procedure) {
        if (procedure == null) {
            return null;
        }
        ProcedureDTO dto = new ProcedureDTO();
        dto.setId(procedure.getId());
        dto.setCode(procedure.getCode());
        dto.setName(procedure.getName());
        dto.setPrice(procedure.getPrice());
        return dto;
    }

    public Procedure toEntity(ProcedureDTO dto) {
        if (dto == null) {
            return null;
        }
        Procedure entity = new Procedure();
        entity.setId(dto.getId());
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setPrice(dto.getPrice());
        return entity;
    }

    public List<ProcedureDTO> toProcedureDtoList(List<Procedure> procedures) {
        if (procedures == null) {
            return new ArrayList<>();
        }
        return procedures.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- ProcedureLog Mapping --------------------
    public ProcedureLogDTO toDto(ProcedureLog procedureLog) {
        if (procedureLog == null) {
            return null;
        }
        ProcedureLogDTO dto = new ProcedureLogDTO();
        dto.setId(procedureLog.getId());
        dto.setStartTime(procedureLog.getStartTime());
        dto.setEndTime(procedureLog.getEndTime());
        if (procedureLog.getUser() != null) {
            dto.setUserId(procedureLog.getUser().getId());
        }
        if (procedureLog.getProcedure() != null) {
            dto.setProcedureId(procedureLog.getProcedure().getId());
        }
        if (procedureLog.getBilling() != null) {
            dto.setBillingId(procedureLog.getBilling().getId());
        }
        return dto;
    }

    public ProcedureLog toEntity(ProcedureLogDTO dto, User user, Procedure procedure, Billing billing) {
        if (dto == null) {
            return null;
        }
        ProcedureLog entity = new ProcedureLog();
        entity.setId(dto.getId());
        entity.setStartTime(dto.getStartTime());
        entity.setEndTime(dto.getEndTime());
        entity.setUser(user);
        entity.setProcedure(procedure);
        entity.setBilling(billing);
        return entity;
    }

    public List<ProcedureLogDTO> toProcedureLogDtoList(List<ProcedureLog> procedureLogs) {
        if (procedureLogs == null) {
            return new ArrayList<>();
        }
        return procedureLogs.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- Room Mapping --------------------
    public RoomDTO toDto(Room room) {
        if (room == null) {
            return null;
        }
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        if (room.getUnit() != null) {
            dto.setUnitId(room.getUnit().getId());
        }
        if (room.getBeds() != null) {
            dto.setBedIds(room.getBeds().stream().map(Bed::getId).collect(Collectors.toList()));
        }
        return dto;
    }

    public Room toEntity(RoomDTO dto, Unit unit) {
        if (dto == null) {
            return null;
        }
        Room entity = new Room();
        entity.setId(dto.getId());
        entity.setRoomNumber(dto.getRoomNumber());
        entity.setRoomType(dto.getRoomType());
        entity.setUnit(unit);
        return entity;
    }

    public List<RoomDTO> toRoomDtoList(List<Room> rooms) {
        if (rooms == null) {
            return new ArrayList<>();
        }
        return rooms.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- Unit Mapping --------------------
    public UnitDTO toDto(Unit unit) {
        if (unit == null) {
            return null;
        }
        UnitDTO dto = new UnitDTO();
        dto.setId(unit.getId());
        dto.setName(unit.getUnitType().name()); // map the enum to a string
        if (unit.getRooms() != null) {
            dto.setRoomIds(unit.getRooms().stream().map(Room::getId).collect(Collectors.toList()));
        }
        return dto;
    }

    public Unit toEntity(UnitDTO dto) {
        if (dto == null) {
            return null;
        }
        Unit entity = new Unit();
        entity.setId(dto.getId());
        entity.setUnitType(mine.profile.website.models.UnitType.valueOf(dto.getName())); // map string to enum
        return entity;
    }

    public List<UnitDTO> toUnitDtoList(List<Unit> units) {
        if (units == null) {
            return new ArrayList<>();
        }
        return units.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- User Mapping --------------------
    // public UserDTO toDto(User user) {
    // if (user == null) {
    // return null;
    // }
    // UserDTO dto = new UserDTO();
    // dto.setId(user.getId());
    // dto.setUsername(user.getUsername());
    // dto.setPassword(user.getPassword());
    // dto.setRole(user.getRole().toString());
    // dto.setFirstName(user.getFirstName());
    // dto.setLastName(user.getLastName());
    // dto.setSpecialty(user.getSpecialty());
    // if (user.getUnits() != null) {
    // dto.setUnitIds(user.getUnits().stream().map(Unit::getId).collect(Collectors.toList()));
    // }
    // return dto;
    // }

    // public User toEntity(UserDTO dto) {
    // if (dto == null) {
    // return null;
    // }
    // User entity = new User();
    // entity.setId(dto.getId());
    // entity.setUsername(dto.getUsername());
    // entity.setPassword(dto.getPassword());
    // if (dto.getRole() != null) {
    // entity.setRole(Role.valueOf(dto.getRole()));
    // }
    // entity.setFirstName(dto.getFirstName());
    // entity.setLastName(dto.getLastName());
    // entity.setSpecialty(dto.getSpecialty());
    // return entity;
    // }

    // public List<UserDTO> toUserDtoList(List<User> users) {
    // if (users == null) {
    // return new ArrayList<>();
    // }
    // return users.stream()
    // .map(this::toDto)
    // .collect(Collectors.toList());
    // }

    // -------------------- VitalSign Mapping --------------------
    public VitalSignDTO toDto(VitalSign vitalSign) {
        if (vitalSign == null) {
            return null;
        }
        VitalSignDTO dto = new VitalSignDTO();
        dto.setId(vitalSign.getId());
        dto.setTimestamp(vitalSign.getTimestamp());
        dto.setHeartRate(vitalSign.getHeartRate());
        dto.setBloodPressureSystolic(vitalSign.getBloodPressureSystolic());
        dto.setBloodPressureDiastolic(vitalSign.getBloodPressureDiastolic());
        dto.setTemperature(vitalSign.getTemperature());
        dto.setRespiratoryRate(vitalSign.getRespiratoryRate());
        if (vitalSign.getPatient() != null) {
            dto.setPatientId(vitalSign.getPatient().getId());
        }
        return dto;
    }

    public VitalSign toEntity(VitalSignDTO dto, Patient patient) {
        if (dto == null) {
            return null;
        }
        VitalSign entity = new VitalSign();
        entity.setId(dto.getId());
        entity.setTimestamp(dto.getTimestamp());
        entity.setHeartRate(dto.getHeartRate());
        entity.setBloodPressureSystolic(dto.getBloodPressureSystolic());
        entity.setBloodPressureDiastolic(dto.getBloodPressureDiastolic());
        entity.setTemperature(dto.getTemperature());
        entity.setRespiratoryRate(dto.getRespiratoryRate());
        entity.setPatient(patient);
        return entity;
    }

    public List<VitalSignDTO> toVitalSignDtoList(List<VitalSign> vitalSigns) {
        if (vitalSigns == null) {
            return new ArrayList<>();
        }
        return vitalSigns.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // -------------------- ImageReport Mapping --------------------
    public ImageReportDTO toDto(ImageReport imageReport) {
        if (imageReport == null) {
            return null;
        }
        ImageReportDTO dto = new ImageReportDTO();
        dto.setId(imageReport.getId());
        dto.setReportDateTime(imageReport.getReportDateTime());
        dto.setDescription(imageReport.getDescription());
        dto.setReportText(imageReport.getReportText());
        dto.setImageUrls(imageReport.getImageUrls()); // Set the list of URLs
        if (imageReport.getPatient() != null) {
            dto.setPatientId(imageReport.getPatient().getId());
        }
        if (imageReport.getPerformedBy() != null) {
            dto.setPerformedById(imageReport.getPerformedBy().getId());
            dto.setPerformedByName(imageReport.getPerformedBy().getUsername());
        }
        if (imageReport.getImageReportType() != null) {
            dto.setImageReportTypeId(imageReport.getImageReportType().getId());
            dto.setImageType(imageReport.getImageReportType().getName());
        }
        if (imageReport.getBilling() != null) {
            dto.setBillingId(imageReport.getBilling().getId());
        }

        return dto;
    }

    public ImageReport toEntity(ImageReportDTO dto, Patient patient, User user, ImageReportType imageReportType,
            Billing billing) {
        if (dto == null) {
            return null;
        }
        ImageReport entity = new ImageReport();
        entity.setId(dto.getId());
        entity.setReportDateTime(dto.getReportDateTime());
        entity.setDescription(dto.getDescription());
        entity.setReportText(dto.getReportText());
        entity.setImageUrls(dto.getImageUrls()); // Set the list of URLs
        entity.setPatient(patient);
        entity.setPerformedBy(user);
        entity.setImageReportType(imageReportType);
        entity.setBilling(billing);

        return entity;
    }

    // -------------------- ImageReportType Mapping --------------------
    public ImageReportTypeDTO toDto(ImageReportType imageReportType) {
        if (imageReportType == null) {
            return null;
        }
        ImageReportTypeDTO dto = new ImageReportTypeDTO();
        dto.setId(imageReportType.getId());
        dto.setName(imageReportType.getName());
        dto.setPrice(imageReportType.getPrice());
        return dto;
    }

    public ImageReportType toEntity(ImageReportTypeDTO dto) {
        if (dto == null) {
            return null;
        }
        ImageReportType entity = new ImageReportType();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPrice(dto.getPrice());

        return entity;
    }

}