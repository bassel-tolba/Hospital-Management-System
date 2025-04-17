// routes.js

// --- Core React/Router Imports ---
import React from "react";

// --- State Management & Services ---
// import { useAuthStore } from "./services/auth.service"; // No longer needed here directly, PrivateRoute handles it

// --- Components & Pages ---
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
import AssessmentList from "./components/assessments/AssessmentList"; // Assuming this exists
import VitalSignList from "./components/vitalSigns/VitalSignList"; // Assuming this exists
import ImageReportList from "./components/imageReports/ImageReportList";
import LabTestList from "./components/lab/LabTestList";
import LabResultPage from "./components/lab/LabResultPage";
import PrivateRoute from "./components/PrivateRoute";
import ImageReportTypeList from "./components/imageReports/ImageReportTypeList";
import MedicationHistoryList from "./components/medications/MedicationHistoryList"; // Assuming this exists
import BillingPage from "./components/billing/BillingPage";
import ActivityPage from "./pages/ActivityPage";
import DocumentList from "./components/documents/DocumentList";
import DocumentTypeList from "./components/documents/DocumentTypeList";
import RoleAndPermissionManagement from "./components/auth/RoleAndPermissionManagement";
import AppointmentsPage from "./pages/AppointmentsPage";
import Dashboard from "./components/dashboard/Dashboard";
import AboutUs from "./components/AboutUs"; // Added import
import AllFeaturesPage from "./components/AllFeaturesPage"; // Added import

// Example components for commented-out routes (create if needed)
// import AdmissionTypeList from "./components/admissions/AdmissionTypeList";
// import ProductHistoryList from "./components/products/ProductHistoryList";

// Helper function to create a permission-based route element
const createPermissionRouteElement = (element, permissions = []) => {
	// If no permissions are required, it's essentially a public route within the authenticated layout,
	// or a route accessible to any logged-in user.
	// If permissions are provided, PrivateRoute will enforce them.
	return <PrivateRoute permissions={permissions}>{element}</PrivateRoute>;
};

export const appRoutes = [
	// --- Public Routes (Rendered within the main layout but accessible without login) ---
	// Note: For truly public routes outside the main layout (like a landing page),
	// you might need a different setup or conditional rendering in App.js.
	// These routes are public *content* pages within the app structure.
	{ path: "/login", element: <Login /> },
	{ path: "/register", element: <Register /> },
	{ path: "/about-us", element: <AboutUs /> }, // Added About Us route

	// --- Authenticated Routes ---
	// Using createPermissionRouteElement ensures PrivateRoute wraps protected components.
	// Empty array [] for permissions means the user just needs to be logged in.

	// --- General Authenticated Routes ---
	{ path: "/", element: <AllFeaturesPage /> }, // Default route (now public within layout)
	{ path: "/all-features", element: <AllFeaturesPage /> }, // Explicit All Features route (public within layout)
	{ path: "/profile", element: createPermissionRouteElement(<Profile />) }, // Needs login
	{ path: "/dashboard", element: createPermissionRouteElement(<Dashboard />, ["READ_DASHBOARD"]) }, // Needs login + permission

	// --- Role & Permission Management (Admin) ---
	{
		path: "/roles-permissions",
		element: createPermissionRouteElement(<RoleAndPermissionManagement />, ["MANAGE_PERMISSIONS", "MANAGE_ROLES"]),
	},

	// --- Core Clinical & Operational Routes (Permission-Based) ---
	{
		path: "/patients",
		element: createPermissionRouteElement(<PatientList />, ["READ_PATIENT"]), // Simplified from App.js, adjust if needed
	},
	{
		path: "/patients/:id", // Changed from :patientId for consistency with App.js
		element: createPermissionRouteElement(<PatientDetails />, ["READ_PATIENT"]),
	},
	{
		path: "/appointments",
		element: createPermissionRouteElement(<AppointmentsPage />, ["READ_APPOINTMENT"]), // Simplified from App.js
	},
	{
		path: "/activities",
		element: createPermissionRouteElement(<ActivityPage />, ["READ_USER_ACTIVITY"]), // Simplified from App.js
	},
	{
		path: "/units",
		element: createPermissionRouteElement(<UnitList />, ["READ_UNIT"]), // Simplified from App.js
	},
	{
		path: "/rooms",
		element: createPermissionRouteElement(<RoomList />, ["READ_ROOM"]), // Simplified from App.js
	},
	{
		path: "/beds",
		element: createPermissionRouteElement(<BedList />, ["READ_BED"]), // Simplified from App.js
	},
	{
		path: "/admissions",
		element: createPermissionRouteElement(<AdmissionList />, ["READ_ADMISSION"]), // Simplified from App.js
	},
	// { path: "/admission-types", element: createPermissionRouteElement(<AdmissionTypeList />, ["MANAGE_ADMISSION_TYPES"]) }, // Example

	// --- Medication & Pharmacy ---
	{
		path: "/medications",
		element: createPermissionRouteElement(<MedicationList />, ["READ_MEDICATION"]), // Simplified from App.js
	},
	// { path: "/medications/history", element: createPermissionRouteElement(<MedicationHistoryList />, ["READ_MEDICATION_HISTORY"]) }, // Example if component exists
	{
		path: "/prescriptions",
		element: createPermissionRouteElement(<PrescriptionList />, ["READ_PRESCRIPTION"]), // Simplified from App.js
	},
	{
		path: "/medication-administrations",
		element: createPermissionRouteElement(<MedicationAdministrationList />, ["READ_MEDICATION_ADMINISTRATION"]), // Simplified from App.js
	},

	// --- Procedures ---
	{
		path: "/procedures",
		element: createPermissionRouteElement(<ProcedureList />, ["READ_PROCEDURE"]), // Simplified from App.js
	},
	{
		path: "/procedure-logs",
		element: createPermissionRouteElement(<ProcedureLogList />, ["READ_PROCEDURE_LOG"]), // Simplified from App.js
	},

	// --- Clinical Data ---
	{
		path: "/vital-signs",
		element: createPermissionRouteElement(<VitalSignList />, ["READ_VITAL_SIGN"]), // Assuming this route/component exists
	},
	{
		path: "/assessments",
		element: createPermissionRouteElement(<AssessmentList />, ["READ_ASSESSMENT"]), // Assuming this route/component exists
	},

	// --- Products & Inventory ---
	{
		path: "/products",
		element: createPermissionRouteElement(<ProductList />, ["READ_PRODUCT"]), // Simplified from App.js
	},
	// { path: "/products/history", element: createPermissionRouteElement(<ProductHistoryList />, ["READ_PRODUCT_HISTORY"]) }, // Example
	{
		path: "/product-usages",
		element: createPermissionRouteElement(<PatientProductUsageList />, ["READ_PATIENT_PRODUCT_USAGE"]), // Simplified from App.js
	},

	// --- Billing ---
	{
		path: "/billings",
		element: createPermissionRouteElement(<BillingPage />, ["READ_BILLING"]), // Simplified from App.js
	},

	// --- Users ---
	{
		path: "/users",
		element: createPermissionRouteElement(<UserList />, ["READ_USER"]), // Simplified from App.js
	},

	// --- Documents ---
	{
		path: "/documents",
		element: createPermissionRouteElement(<DocumentList />, ["READ_DOCUMENT"]), // Simplified from App.js
	},
	{
		path: "/document-types",
		element: createPermissionRouteElement(<DocumentTypeList />, ["READ_DOCUMENT_TYPE"]), // Simplified from App.js
	},

	// --- Imaging & Labs ---
	{
		path: "/image-reports",
		element: createPermissionRouteElement(<ImageReportList />, ["READ_IMAGE_REPORT"]), // Simplified from App.js
	},
	{
		path: "/image-report-types",
		element: createPermissionRouteElement(<ImageReportTypeList />, ["READ_IMAGE_REPORT_TYPE"]), // Simplified from App.js
	},
	{
		path: "/lab-tests",
		element: createPermissionRouteElement(<LabTestList />, ["READ_LAB_TEST"]), // Simplified from App.js
	},
	{
		path: "/lab-results",
		element: createPermissionRouteElement(<LabResultPage />, ["READ_LAB_RESULT"]), // Simplified from App.js
	},

	// --- Add other routes as needed ---

	// --- Catch-all or Not Found Route (Optional) ---
	// { path: "*", element: <NotFoundPage /> }, // Example: Create a NotFoundPage component
];
