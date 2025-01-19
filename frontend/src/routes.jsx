import Profile from "./components/auth/Profile";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PatientList from "./components/patients/PatientList";
import UnitList from "./components/units/UnitList";
import UserList from "./components/users/UserList";
import RoomList from "./components/rooms/RoomList";
import BedList from "./components/beds/BedList";
import AdmissionList from "./components/admissions/AdmissionList";
import MedicationList from "./components/medications/MedicationList";
import PrescriptionList from "./components/prescriptions/PrescriptionList";
import MedicationAdministrationList from "./components/medicationAdministrations/MedicationAdministrationList";
import ProcedureList from "./components/procedures/ProcedureList";
import ProcedureLogList from "./components/procedureLogs/ProcedureLogList";
import ProductList from "./components/ProductList";
import PatientProductUsageList from "./components/PatientProductUsageList";
import PatientDetails from "./components/patients/PatientDetails";
import AssessmentList from "./components/assessments/AssessmentList";
import VitalSignList from "./components/vitalSigns/VitalSignList";
import ImageReportList from "./components/ImageReportList";
import LabTestList from "./components/lab/LabTestList";
import LabResultPage from "./components/lab/LabResultPage";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import ImageReportTypeList from "./components/ImageReportTypeList"; // Import new component
import HeadNurseDashboard from "./components/HeadNurseDashboard"; // Import HeadNurseDashboard
import NurseDashboard from "./components/NurseDashboard"; // Import NurseDashboard
import MedicationHistoryList from "./components/medications/MedicationHistoryList";
import BillingPage from "./components/billing/BillingPage"; // Import the BillingPage
import ActivityPage from "./pages/ActivityPage"; // Import the ActivityPage

export const appRoutes = [
	{ path: "/login", element: <Login /> },
	{ path: "/register", element: <Register /> },
	{ path: "/profile", element: <Profile /> },
	{
		path: "/patients",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}>
				<PatientList />
			</PrivateRoute>
		),
	},
	{
		path: "/activities",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "LAB_TECHNICIAN", "RADIOLOGIST"]}>
				<ActivityPage />
			</PrivateRoute>
		),
	},
	{
		path: "/patients/:patientId",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}>
				<PatientDetails />
			</PrivateRoute>
		),
	},
	{
		path: "/units",
		element: (
			<PrivateRoute roles={["ADMIN", "RECEPTIONIST"]}>
				<UnitList />
			</PrivateRoute>
		),
	},
	{
		path: "/rooms",
		element: (
			<PrivateRoute roles={["ADMIN", "NURSE", "RECEPTIONIST"]}>
				<RoomList />
			</PrivateRoute>
		),
	},
	{
		path: "/beds",
		element: (
			<PrivateRoute roles={["ADMIN", "NURSE", "RECEPTIONIST"]}>
				<BedList />
			</PrivateRoute>
		),
	},
	{
		path: "/admissions",
		element: (
			<PrivateRoute roles={["ADMIN", "NURSE", "RECEPTIONIST"]}>
				<AdmissionList />
			</PrivateRoute>
		),
	},
	{
		path: "/medications",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"]}>
				<MedicationList />
			</PrivateRoute>
		),
	},
	{
		path: "/medications/history",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"]}>
				<MedicationHistoryList />
			</PrivateRoute>
		),
	},
	{
		path: "/billings", // Added billing route
		element: (
			<PrivateRoute roles={["ADMIN", "RECEPTIONIST"]}>
				<BillingPage />
			</PrivateRoute>
		),
	},
	{
		path: "/prescriptions",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"]}>
				<PrescriptionList />
			</PrivateRoute>
		),
	},
	{
		path: "/medication-administrations",
		element: (
			<PrivateRoute roles={["ADMIN", "NURSE", "DOCTOR", "PHARMACIST"]}>
				<MedicationAdministrationList />
			</PrivateRoute>
		),
	},
	{
		path: "/procedures",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}>
				<ProcedureList />
			</PrivateRoute>
		),
	},
	{
		path: "/procedure-logs",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE"]}>
				<ProcedureLogList />
			</PrivateRoute>
		),
	},
	{
		path: "/vital-signs",
		element: (
			<PrivateRoute roles={["ADMIN", "NURSE", "DOCTOR"]}>
				<VitalSignList />
			</PrivateRoute>
		),
	},
	{
		path: "/assessments",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE"]}>
				<AssessmentList />
			</PrivateRoute>
		),
	},
	{
		path: "/products",
		element: (
			<PrivateRoute roles={["ADMIN", "PHARMACIST"]}>
				<ProductList />
			</PrivateRoute>
		),
	},
	{
		path: "/product-usages",
		element: (
			<PrivateRoute roles={["ADMIN", "NURSE", "DOCTOR", "PHARMACIST"]}>
				<PatientProductUsageList />
			</PrivateRoute>
		),
	},
	{
		path: "/users",
		element: (
			<PrivateRoute roles={["ADMIN"]}>
				<UserList />
			</PrivateRoute>
		),
	},
	{
		path: "/image-reports",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "RADIOLOGIST"]}>
				<ImageReportList />
			</PrivateRoute>
		),
	},
	{
		path: "/image-report-types",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "RADIOLOGIST"]}>
				<ImageReportTypeList />
			</PrivateRoute>
		),
	},
	{
		path: "/lab-tests",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "LAB_TECHNICIAN"]}>
				<LabTestList />
			</PrivateRoute>
		),
	},
	{
		path: "/lab-results",
		element: (
			<PrivateRoute roles={["ADMIN", "DOCTOR", "LAB_TECHNICIAN"]}>
				<LabResultPage />
			</PrivateRoute>
		),
	},
	{
		path: "/head-nurse",
		element: (
			<PrivateRoute roles={["HEAD_NURSE", "ADMIN"]}>
				<HeadNurseDashboard />
			</PrivateRoute>
		),
	},
	{
		path: "/nurse",
		element: (
			<PrivateRoute roles={["NURSE", "ADMIN", "HEAD_NURSE"]}>
				<NurseDashboard />
			</PrivateRoute>
		),
	},
];
