// routes.js
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
import ProductList from "./components/products/ProductList";
import PatientProductUsageList from "./components/products/PatientProductUsageList";
import PatientDetails from "./components/patients/PatientDetails";
import AssessmentList from "./components/assessments/AssessmentList";
import VitalSignList from "./components/vitalSigns/VitalSignList";
import ImageReportList from "./components/imageReports/ImageReportList";
import LabTestList from "./components/lab/LabTestList";
import LabResultPage from "./components/lab/LabResultPage";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import ImageReportTypeList from "./components/imageReports/ImageReportTypeList";
import MedicationHistoryList from "./components/medications/MedicationHistoryList";
import BillingPage from "./components/billing/BillingPage";
import ActivityPage from "./pages/ActivityPage";
import DocumentList from "./components/documents/DocumentList";
import DocumentTypeList from "./components/documents/DocumentTypeList";
import { useAuthStore } from "./services/auth.service"; // Import useAuthStore
import RoleAndPermissionManagement from "./components/auth/RoleAndPermissionManagement";
import AppointmentsPage from "./pages/AppointmentsPage";

// --- NEW IMPORTS (Create these components if they don't exist) ---
import Dashboard from "./components/dashboard/Dashboard"; // ****** IMPORT DASHBOARD ******
// import AdmissionTypeList from "./components/admissions/AdmissionTypeList"; // Example Admission Type Component
// import ProductHistoryList from "./components/products/ProductHistoryList"; // Example Product History Component
// ------------------------------------------------------------------

// Helper function to create a permission-based route
const createPermissionRoute = (path, element, permissions) => ({
	path,
	element: <PrivateRoute permissions={permissions}>{element}</PrivateRoute>,
});

export const appRoutes = [
	// --- Public Routes ---
	{ path: "/login", element: <Login /> },
	{ path: "/register", element: <Register /> }, // Assuming registration is public initially

	// --- Authenticated Routes (Basic) ---
	{
		path: "/profile",
		element: (
			<PrivateRoute>
				<Profile />
			</PrivateRoute>
		),
	}, // Profile requires login

	// --- Role & Permission Management (Admin) ---
	{
		path: "/roles-permissions",
		element: (
			<PrivateRoute permissions={["MANAGE_PERMISSIONS", "MANAGE_ROLES"]}>
				<RoleAndPermissionManagement />
			</PrivateRoute>
		),
	},

	// --- Core Clinical & Operational Routes (Permission-Based) ---
	createPermissionRoute("/patients", <PatientList />, ["READ_PATIENT", "CREATE_PATIENT", "UPDATE_PATIENT", "DELETE_PATIENT"]),
	createPermissionRoute("/patients/:patientId", <PatientDetails />, ["READ_PATIENT"]), // Details view mainly needs READ
	createPermissionRoute("/appointments", <AppointmentsPage />, [
		"READ_APPOINTMENT",
		"CREATE_APPOINTMENT",
		"UPDATE_APPOINTMENT",
		"DELETE_APPOINTMENT",
	]),
	createPermissionRoute("/activities", <ActivityPage />, [
		"READ_USER_ACTIVITY",
		"CREATE_USER_ACTIVITY",
		"UPDATE_USER_ACTIVITY",
		"DELETE_USER_ACTIVITY",
	]),
	createPermissionRoute("/units", <UnitList />, ["READ_UNIT", "CREATE_UNIT", "UPDATE_UNIT", "DELETE_UNIT"]),
	createPermissionRoute("/rooms", <RoomList />, ["READ_ROOM", "CREATE_ROOM", "UPDATE_ROOM", "DELETE_ROOM"]),
	createPermissionRoute("/beds", <BedList />, ["READ_BED", "CREATE_BED", "UPDATE_BED", "DELETE_BED", "MANAGE_BEDS"]), // Added MANAGE_BEDS
	createPermissionRoute("/admissions", <AdmissionList />, ["READ_ADMISSION", "CREATE_ADMISSION", "UPDATE_ADMISSION", "DELETE_ADMISSION"]),
	// createPermissionRoute("/admission-types", <AdmissionTypeList />, ["MANAGE_ADMISSION_TYPES"]), // NEW ROUTE - Needs AdmissionTypeList component

	// --- Medication & Pharmacy ---
	createPermissionRoute("/medications", <MedicationList />, [
		"READ_MEDICATION",
		"CREATE_MEDICATION",
		"UPDATE_MEDICATION",
		"DELETE_MEDICATION",
		"UPDATE_MEDICATION_STOCK", // Added stock permission here
	]),
	createPermissionRoute("/medications/history", <MedicationHistoryList />, ["READ_MEDICATION_HISTORY", "DELETE_MEDICATION_HISTORY"]), // Added delete history permission
	createPermissionRoute("/prescriptions", <PrescriptionList />, [
		"READ_PRESCRIPTION",
		"CREATE_PRESCRIPTION",
		"UPDATE_PRESCRIPTION",
		"DELETE_PRESCRIPTION",
	]),
	createPermissionRoute("/medication-administrations", <MedicationAdministrationList />, [
		"READ_MEDICATION_ADMINISTRATION",
		"CREATE_MEDICATION_ADMINISTRATION",
		"DELETE_MEDICATION_ADMINISTRATION",
		"ADMINISTER_MEDICATION", // Include specific action if needed by component
	]),

	// --- Procedures ---
	createPermissionRoute("/procedures", <ProcedureList />, ["READ_PROCEDURE", "CREATE_PROCEDURE", "UPDATE_PROCEDURE", "DELETE_PROCEDURE"]),
	createPermissionRoute("/procedure-logs", <ProcedureLogList />, ["READ_PROCEDURE_LOG", "CREATE_PROCEDURE_LOG", "DELETE_PROCEDURE_LOG"]),

	// --- Clinical Data ---
	createPermissionRoute("/vital-signs", <VitalSignList />, ["READ_VITAL_SIGN", "CREATE_VITAL_SIGN", "UPDATE_VITAL_SIGN", "DELETE_VITAL_SIGN"]),
	createPermissionRoute("/assessments", <AssessmentList />, ["READ_ASSESSMENT", "CREATE_ASSESSMENT", "UPDATE_ASSESSMENT", "DELETE_ASSESSMENT"]),
	// Add routes for NursingCarePlan, CarePlanGoal if components exist

	// --- Products & Inventory ---
	createPermissionRoute("/products", <ProductList />, [
		"READ_PRODUCT",
		"CREATE_PRODUCT",
		"UPDATE_PRODUCT",
		"DELETE_PRODUCT",
		"UPDATE_PRODUCT_STOCK", // Added stock permission
	]),
	// createPermissionRoute("/products/history", <ProductHistoryList />, ["READ_PRODUCT_HISTORY", "DELETE_PRODUCT_HISTORY"]), // NEW ROUTE - Needs ProductHistoryList component
	createPermissionRoute("/product-usages", <PatientProductUsageList />, [
		"READ_PATIENT_PRODUCT_USAGE",
		"CREATE_PATIENT_PRODUCT_USAGE",
		"DELETE_PATIENT_PRODUCT_USAGE",
	]),

	// --- Billing ---
	createPermissionRoute("/billings", <BillingPage />, ["READ_BILLING", "CREATE_BILLING", "UPDATE_BILLING", "DELETE_BILLING"]),

	// --- Users ---
	createPermissionRoute("/users", <UserList />, ["READ_USER", "CREATE_USER", "UPDATE_USER", "DELETE_USER"]),

	// --- Documents ---
	createPermissionRoute("/documents", <DocumentList />, ["READ_DOCUMENT", "CREATE_DOCUMENT", "UPDATE_DOCUMENT", "DELETE_DOCUMENT"]),
	createPermissionRoute("/document-types", <DocumentTypeList />, [
		"READ_DOCUMENT_TYPE",
		"CREATE_DOCUMENT_TYPE",
		"UPDATE_DOCUMENT_TYPE",
		"DELETE_DOCUMENT_TYPE",
	]),

	// --- Imaging & Labs ---
	createPermissionRoute("/image-reports", <ImageReportList />, [
		"READ_IMAGE_REPORT",
		"CREATE_IMAGE_REPORT",
		"UPDATE_IMAGE_REPORT",
		"DELETE_IMAGE_REPORT",
	]),
	createPermissionRoute("/image-report-types", <ImageReportTypeList />, [
		"READ_IMAGE_REPORT_TYPE",
		"CREATE_IMAGE_REPORT_TYPE",
		"UPDATE_IMAGE_REPORT_TYPE",
		"DELETE_IMAGE_REPORT_TYPE",
	]),
	createPermissionRoute("/lab-tests", <LabTestList />, [
		"READ_LAB_TEST",
		"CREATE_LAB_TEST",
		"UPDATE_LAB_TEST",
		"DELETE_LAB_TEST", // Added Update/Delete
	]),
	createPermissionRoute("/lab-results", <LabResultPage />, [
		"READ_LAB_RESULT",
		"CREATE_LAB_RESULT",
		"UPDATE_LAB_RESULT",
		"DELETE_LAB_RESULT", // Added Update/Delete
	]),

	// --- Dashboard ---
	createPermissionRoute("/dashboard", <Dashboard />, ["READ_DASHBOARD"]), // ****** ADDED DASHBOARD ROUTE ******

	// --- Catch-all or Home Route (Optional) ---
	// { path: "/", element: <PrivateRoute><SomeHomePage /></PrivateRoute> }, // Example home page
];
