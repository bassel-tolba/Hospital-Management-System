import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
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
import ProductList from "./components/ProductList";
import PatientProductUsageList from "./components/PatientProductUsageList";
import PatientDetails from "./components/patients/PatientDetails";
import { useAuthStore } from "./services/auth.service";

import {
	AppBar,
	Toolbar,
	Typography,
	Container,
	Box,
	Switch,
	MenuItem, // Import MenuItem from MUI
	Tooltip,
} from "@mui/material";

import { styled } from "@mui/material/styles";

import useMediaQuery from "@mui/material/useMediaQuery";
import hospitalLogo from "./hospital-logo.svg";
import { ConfigProvider, Layout, Menu as AntMenu, Switch as AntSwitch, Breadcrumb } from "antd";
import ImageReportList from "./components/ImageReportList";
import LabTestList from "./components/lab/LabTestList";
import LabResultPage from "./components/lab/LabResultPage";
import { appRoutes } from "./routes";
import Dashboard from "./components/dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ImageReportTypeList from "./components/ImageReportTypeList";
import HeadNurseDashboard from "./components/HeadNurseDashboard";
import NurseDashboard from "./components/NurseDashboard";
import MedicationHistoryList from "./components/medications/MedicationHistoryList";
import BillingPage from "./components/billing/BillingPage";
import ActivityPage from "./pages/ActivityPage";

// Custom styled components for a fairy-tale vibe
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
	"&:hover": {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		transform: "scale(1.05)",
		transition: "transform 0.2s ease",
	},
	"&.Mui-selected": {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
	},
	"&.Mui-selected:hover": {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
	},
}));

const { Header, Content, Footer } = Layout;

const NavigationMenu = () => {
	const { user } = useAuthStore();
	const [openKeys, setOpenKeys] = useState([]);

	const navigate = useNavigate();

	const handleMenuItemClick = (path) => {
		navigate(path);
	};
	const onOpenChange = (keys) => {
		const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
		setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
	};

	const menuItems = useMemo(() => {
		const baseItems = [
			{ label: "Login", path: "/login", show: true, category: "General" },
			{ label: "Register", path: "/register", show: true, category: "General" },
		];

		const loggedInItems = user ? [{ label: "Profile", path: "/profile", show: true, category: "General" }] : [];

		const roleBasedItems = [];
		if (user) {
			if (["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "LAB_TECHNICIAN", "RADIOLOGIST"].includes(user.role)) {
				roleBasedItems.push({ label: "Patients", path: "/patients", show: true, category: "Patient Care" });
				roleBasedItems.push({ label: "Activities", path: "/activities", show: true, category: "Patient Care" });
			}
			if (["ADMIN", "RECEPTIONIST"].includes(user.role)) {
				roleBasedItems.push({ label: "Units", path: "/units", show: true, category: "Administrative" });
			}
			if (["ADMIN", "NURSE", "RECEPTIONIST"].includes(user.role)) {
				roleBasedItems.push({ label: "Rooms", path: "/rooms", show: true, category: "Administrative" });
				roleBasedItems.push({ label: "Beds", path: "/beds", show: true, category: "Administrative" });
				roleBasedItems.push({ label: "Admissions", path: "/admissions", show: true, category: "Administrative" });
			}
			if (["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"].includes(user.role)) {
				roleBasedItems.push({
					label: "Medications",
					path: "/medications",
					show: true,
					category: "Medication Management",
				});
				roleBasedItems.push({
					label: "Medication History",
					path: "/medications/history",
					show: true,
					category: "Medication Management",
				});
				roleBasedItems.push({
					label: "Prescriptions",
					path: "/prescriptions",
					show: true,
					category: "Medication Management",
				});
				roleBasedItems.push({
					label: "Medication Administrations",
					path: "/medication-administrations",
					show: true,
					category: "Medication Management",
				});
			}
			if (["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"].includes(user.role)) {
				roleBasedItems.push({ label: "Procedures", path: "/procedures", show: true, category: "Patient Care" });
			}
			if (["ADMIN", "DOCTOR", "NURSE"].includes(user.role)) {
				roleBasedItems.push({ label: "Procedure Logs", path: "/procedure-logs", show: true, category: "Patient Care" });
			}
			if (["ADMIN", "PHARMACIST"].includes(user.role)) {
				roleBasedItems.push({ label: "Products", path: "/products", show: true, category: "Inventory" });
			}

			if (["ADMIN", "NURSE", "DOCTOR", "PHARMACIST"].includes(user.role)) {
				roleBasedItems.push({
					label: "Product Usages",
					path: "/product-usages",
					show: true,
					category: "Medication Management",
				});
			}
			if (["ADMIN", "NURSE", "DOCTOR"].includes(user.role)) {
				roleBasedItems.push({ label: "Vital Signs", path: "/vital-signs", show: true, category: "Patient Care" });
				roleBasedItems.push({ label: "Assessments", path: "/assessments", show: true, category: "Patient Care" });
			}
			if (["ADMIN", "DOCTOR", "RADIOLOGIST"].includes(user.role)) {
				roleBasedItems.push({ label: "Image Reports", path: "/image-reports", show: true, category: "Diagnostics" });
				roleBasedItems.push({ label: "Image Report Types", path: "/image-report-types", show: true, category: "Diagnostics" });
			}

			if (["ADMIN", "DOCTOR", "LAB_TECHNICIAN"].includes(user.role)) {
				roleBasedItems.push({ label: "Lab Tests", path: "/lab-tests", show: true, category: "Diagnostics" });
				roleBasedItems.push({ label: "Lab Results", path: "/lab-results", show: true, category: "Diagnostics" });
			}

			if (user.role === "ADMIN") {
				roleBasedItems.push({ label: "Users", path: "/users", show: true, category: "Administrative" });
			}
			if (user.role === "HEAD_NURSE" || user.role === "ADMIN") {
				roleBasedItems.push({ label: "Head Nurse", path: "/head-nurse", show: true, category: "Nursing" });
			}
			if (user.role === "NURSE" || user.role === "ADMIN" || user.role === "HEAD_NURSE") {
				roleBasedItems.push({ label: "Nurse", path: "/nurse", show: true, category: "Nursing" });
			}
			if (["ADMIN", "RECEPTIONIST"].includes(user.role)) {
				roleBasedItems.push({ label: "Billings", path: "/billings", show: true, category: "Billing" });
			}
		}

		return [...baseItems, ...loggedInItems, ...roleBasedItems];
	}, [user]);

	const groupedMenuItems = useMemo(() => {
		return menuItems.reduce((acc, item) => {
			if (!item.show) return acc;
			if (!acc[item.category]) {
				acc[item.category] = [];
			}
			acc[item.category].push(item);
			return acc;
		}, {});
	}, [menuItems]);

	return (
		<AntMenu theme="dark" mode="inline" openKeys={openKeys} onOpenChange={onOpenChange} style={{ borderRight: 0, height: "100%" }}>
			{Object.entries(groupedMenuItems).map(([category, items], index) => {
				return (
					<AntMenu.SubMenu key={index} title={category !== "General" ? category : null}>
						{items.map((menuItem) => (
							<AntMenu.Item key={menuItem.label} onClick={() => handleMenuItemClick(menuItem.path)}>
								{menuItem.label}
							</AntMenu.Item>
						))}
					</AntMenu.SubMenu>
				);
			})}
		</AntMenu>
	);
};

const App = () => {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const [mode, setMode] = useState(prefersDarkMode ? "dark" : "light");
	const { user } = useAuthStore();

	const toggleDarkMode = () => {
		setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
		document.body.classList.toggle("dark-mode");
	};

	return (
		<ConfigProvider>
			<Router>
				<AppContent user={user} toggleDarkMode={toggleDarkMode} mode={mode} />
			</Router>
		</ConfigProvider>
	);
};

const AppContent = ({ user, toggleDarkMode, mode }) => {
	const location = useLocation();

	const breadcrumbItems = useMemo(() => {
		const pathSegments = location.pathname.split("/").filter(Boolean);
		return pathSegments.map((segment, index) => {
			const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
			return {
				title: (
					<RouterLink to={path} color="inherit">
						{segment}
					</RouterLink>
				),
			};
		});
	}, [location]);

	const { Header, Content, Footer, Sider } = Layout;

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider theme="dark" width={250} style={{ overflow: "auto" }}>
				<Box display="flex" flexDirection="column" alignItems="center" p={2}>
					<img
						src={hospitalLogo}
						alt="Hospital Logo"
						style={{ height: "40px", filter: "drop-shadow(0 0 4px rgba(0,0,0,0.2))", marginBottom: "10px" }}
					/>
					<Typography variant="h6" component="div" sx={{ fontWeight: 700, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
						Enchanted Grove Hospital
					</Typography>
				</Box>
				<NavigationMenu />
			</Sider>
			<Layout className="site-layout">
				<Header
					style={{
						padding: "0 20px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}>
					<Box display="flex" alignItems="center">
						{user && (
							<Tooltip title={user.role} placement="bottom">
								<Typography variant="body2" sx={{ marginRight: 2, fontWeight: 500 }}>
									{user.role}
								</Typography>
							</Tooltip>
						)}
						<AntSwitch checked={mode === "dark"} onChange={toggleDarkMode} />
					</Box>
				</Header>
				<Content
					style={{
						margin: "16px",
						padding: 24,
						minHeight: 280,
					}}>
					{breadcrumbItems.length > 0 && (
						<Breadcrumb style={{ marginBottom: 16 }}>
							<Breadcrumb.Item>
								<RouterLink to="/" color="inherit">
									Home
								</RouterLink>
							</Breadcrumb.Item>
							{breadcrumbItems.map((item, index) => (
								<Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
							))}
						</Breadcrumb>
					)}
					<Routes>
						<Route path="/" element={<Dashboard />} />
						{appRoutes.map((route, index) => (
							<Route key={index} path={route.path} element={route.element} />
						))}
						<Route
							path="/head-nurse"
							element={
								<PrivateRoute>
									<HeadNurseDashboard />
								</PrivateRoute>
							}
						/>
						<Route
							path="/nurse"
							element={
								<PrivateRoute>
									<NurseDashboard />
								</PrivateRoute>
							}
						/>
						<Route
							path="/medications/history"
							element={
								<PrivateRoute roles={["ADMIN", "DOCTOR", "NURSE", "PHARMACIST"]}>
									<MedicationHistoryList />
								</PrivateRoute>
							}
						/>
					</Routes>
				</Content>
				<Footer style={{ textAlign: "center" }}>© 2023 Pro Hospital. All rights reserved.</Footer>
			</Layout>
		</Layout>
	);
};

export default App;
