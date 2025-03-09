import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import ProcedureLogList from "./components/procedureLogs/ProcedureLogList";
import ProductList from "./components/products/ProductList";
import PatientProductUsageList from "./components/products/PatientProductUsageList";
import PatientDetails from "./components/patients/PatientDetails";
import { useAuthStore } from "./services/auth.service";
import {
	Layout,
	Menu as AntMenu,
	Breadcrumb,
	Button,
	Drawer,
	ConfigProvider,
	Select,
	theme as antdTheme,
	Typography,
	Grid,
	Input,
	Card,
	notification,
	Avatar,
	Space,
} from "antd";
import MyAntdPage from "./antdPage";
import ImageReportList from "./components/imageReports/ImageReportList";
import LabTestList from "./components/lab/LabTestList";
import LabResultPage from "./components/lab/LabResultPage";
import { appRoutes } from "./routes";
import Dashboard from "./components/dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ImageReportTypeList from "./components/imageReports/ImageReportTypeList";
import MedicationHistoryList from "./components/medications/MedicationHistoryList";
import BillingPage from "./components/billing/BillingPage";
import ActivityPage from "./pages/ActivityPage";
import styled, { keyframes, css } from "styled-components";
import AboutUs from "./components/AboutUs";
import { MenuOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import DocumentList from "./components/documents/DocumentList";
import DocumentTypeList from "./components/documents/DocumentTypeList";
import AllFeaturesPage from "./components/AllFeaturesPage";
import RoleAndPermissionManagement from "./components/auth/RoleAndPermissionManagement";
import {
	BulbOutlined,
	SettingOutlined,
	DollarCircleOutlined,
	ExperimentOutlined,
	LockOutlined,
	HeartOutlined,
	ShoppingCartOutlined,
	LoginOutlined,
	UserAddOutlined,
	UserOutlined,
	TeamOutlined,
	CalendarOutlined,
	MedicineBoxOutlined,
	MonitorOutlined,
	FileTextOutlined,
	SaveOutlined,
	AppstoreOutlined,
	HomeOutlined,
	RestOutlined,
	SolutionOutlined,
	UsergroupAddOutlined,
	HistoryOutlined,
	FileProtectOutlined,
	ThunderboltOutlined,
	BoxPlotOutlined,
	MedicineBoxTwoTone,
	ShopOutlined,
	AccountBookOutlined,
	FileImageOutlined,
	FileSearchOutlined,
	FolderOutlined,
	ProfileOutlined,
	ExperimentTwoTone,
	CheckCircleOutlined,
	KeyOutlined,
} from "@ant-design/icons";
import VoiceNavigation from "./VoiceNavigation";
import { Chart } from "@antv/g2";

import { CSSTransition, TransitionGroup } from "react-transition-group"; // ADDED - Correctly added, but TransitionGroup is also needed

const { Header, Content, Footer, Sider } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antdTheme;
const { useBreakpoint } = Grid;
const { Search } = Input;
// Keyframes remain the same
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AppWrapper = styled.div`
	min-height: 100vh;
	position: relative;
	z-index: 1;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
		z-index: -1;
	}
`;

const StyledLayout = styled(Layout)`
	background: rgba(255, 255, 255, 0.1) !important;
	min-height: 100vh;

	@media (max-width: 768px) {
		backdrop-filter: none !important; /* Removed on smaller screens */
		background: rgba(255, 255, 255, 0.3) !important; /* More opaque background on smaller screens*/
	}
`;

// Removed AnimatedContent wrapper
const StyledContent = styled(Content)`
	// Renamed to StyledContent
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
	margin: 12px;
	padding: 16px;
	min-height: 280px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
	z-index: 2;

	&:hover {
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
	}

	@media (max-width: 768px) {
		margin: 8px; // Reduce margin on smaller screens
		padding: 12px; // Reduce padding on smaller screens.
	}
`;

const LogoImage = styled.img`
	height: 40px;
	width: auto;
	margin-right: 1rem;

	@media (max-width: 576px) {
		height: 32px;
		margin-right: 0.5rem;
	}
`;

const StyledHeader = styled(Header)`
	background: rgba(255, 255, 255, 0.1) !important;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	position: sticky;
	top: 0;
	z-index: 1000;
	transition: all 0.3s ease;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-inline: 1rem;

	@media (max-width: 768px) {
		backdrop-filter: none !important; /* Removed on smaller screens */
		background: rgba(255, 255, 255, 0.3) !important; /* More opaque background */
		padding-inline: 0.5rem; // Reduce padding on smaller screens
	}
`;

const StyledSider = styled(Sider)`
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
	backdrop-filter: blur(2px) !important; /* Reduced blur */
	border-right: 1px solid rgba(255, 255, 255, 0.2);

	.ant-menu {
		background: transparent;
	}

	.ant-menu-item {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
		backdrop-filter: blur(2px); /* Reduced blur */
		margin: 4px 8px;
		border-radius: 6px;

		&:hover {
			background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
		}

		&-selected {
			background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
			color: white !important;
		}
	}
	.ant-menu-submenu-title {
	}

	@media (max-width: 768px) {
		background: rgba(255, 255, 255, 0.3) !important; /*More opaque*/
	}
`;

const MobileMenuButton = styled(Button)`
	display: none;
	margin-left: auto;

	@media (max-width: 768px) {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
	}
`;

const StyledDrawer = styled(Drawer)`
	.ant-drawer-content-wrapper {
		width: 100% !important;
		max-width: 300px;

		@media (max-width: 768px) {
			max-width: 80%; // Adjust as needed, making sure it's not too small
		}
	}

	.ant-drawer-content {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
	}

	.ant-drawer-body {
		padding: 0;
		background: transparent;
	}

	.ant-menu {
		background: transparent;
	}

	.ant-menu-item {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
		margin: 4px 8px;
		border-radius: 6px;

		&:hover {
			background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
		}

		&-selected {
			background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
			color: white !important;
		}
	}

	.ant-menu-submenu-title {
	}

	/* No media query needed here - already handles smaller screens well */

	@media (max-width: 576px) {
		.ant-drawer-content {
			backdrop-filter: none !important;
		}
	}
`;

const StyledFooter = styled(Footer)`
	background: rgba(255, 255, 255, 0.1);
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	text-align: center;
	padding: 12px;
	@media (max-width: 768px) {
		backdrop-filter: none !important; /*Removed blur*/
		background: rgba(255, 255, 255, 0.3) !important; /* More Opaque */
	}
`;

const DashboardCard = styled(Card)`
	margin-bottom: 16px;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	transition: all 0.3s;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		margin-bottom: 12px; // Reduce margin slightly on smaller screens
	}
`;

const colorTokens = {
	light: {
		primaryColor: "#1890ff",
		successColor: "#52c41a",
		warningColor: "#faad14",
		errorColor: "#ff4d4f",
		infoColor: "#1677ff",
		backgroundColor: "#fff",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#d9d9d9",
		paperColor: "#fff",
		dividerColor: "#e8e8e8",
	},
	dark: {
		primaryColor: "#ffd700",
		successColor: "#ffd700",
		warningColor: "#ffe58f",
		errorColor: "#ff7875",
		infoColor: "#ffd700",
		backgroundColor: "#fff", // Keep background white
		textColor: "#fff",
		borderColor: "#ffd700",
		paperColor: "#ffd700",
		dividerColor: "#424242",
	},
	green: {
		primaryColor: "#52c41a",
		successColor: "#b7eb8f",
		warningColor: "#ffe58f",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		backgroundColor: "#f6ffed",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#b7eb8f",
		paperColor: "#f6ffed",
		dividerColor: "#b7eb8f",
	},
	green_dark: {
		primaryColor: "#95de64",
		successColor: "#d9f7be",
		warningColor: "#fff1b8",
		errorColor: "#ffb8b0",
		infoColor: "#bae0ff",
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		textColor: "#fff",
		borderColor: "#95de64",
		paperColor: "rgba(255, 255, 255, 0.1)",
		dividerColor: "#95de64",
	},
	red: {
		primaryColor: "#ff4d4f",
		successColor: "#b7eb8f",
		warningColor: "#ffe58f",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		backgroundColor: "#fff2f0",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#ffccc7",
		paperColor: "#fff2f0",
		dividerColor: "#ffccc7",
	},
	red_dark: {
		primaryColor: "#ff7875",
		successColor: "#ffdfdc",
		warningColor: "#fff1b8",
		errorColor: "#ffb8b0",
		infoColor: "#bae0ff",
		backgroundColor: "#fff", // Keep background white
		textColor: "#fff",
		borderColor: "#ff7875",
		paperColor: "#303030", // Consistent dark paper
		dividerColor: "#ff7875",
	},
	pink: {
		primaryColor: "#eb2f96",
		successColor: "#b7eb8f",
		warningColor: "#ffe58f",
		errorColor: "#ff7875",
		infoColor: "#69b1ff",
		backgroundColor: "#fff0f6",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#f7c0e8",
		paperColor: "#fff0f6",
		dividerColor: "#f7c0e8",
	},
	pink_dark: {
		primaryColor: "#f7c0e8",
		successColor: "#fff2f0",
		warningColor: "#fff1b8",
		errorColor: "#ffb8b0",
		infoColor: "#bae0ff",
		backgroundColor: "#fff", // Keep background white
		textColor: "#fff",
		borderColor: "#f7c0e8",
		paperColor: "#303030", // Consistent dark paper
		dividerColor: "#f7c0e8",
	},
	blue: {
		primaryColor: "#1890ff",
		successColor: "#52c41a",
		warningColor: "#faad14",
		errorColor: "#ff4d4f",
		infoColor: "#1677ff",
		backgroundColor: "#e6f4ff",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#91caff",
		paperColor: "#e6f4ff",
		dividerColor: "#91caff",
	},
	blue_dark: {
		primaryColor: "#69b1ff",
		successColor: "#b7eb8f",
		warningColor: "#ffe58f",
		errorColor: "#ff7875",
		infoColor: "#91caff",
		backgroundColor: "#fff", // Keep background white
		textColor: "#fff",
		borderColor: "#69b1ff",
		paperColor: "#303030", // Consistent dark paper
		dividerColor: "#69b1ff",
	},
	purple: {
		primaryColor: "#722ed1",
		successColor: "#52c41a",
		warningColor: "#faad14",
		errorColor: "#ff4d4f",
		infoColor: "#1677ff",
		backgroundColor: "#f0eafa",
		textColor: "rgba(0, 0, 0, 0.88)",
		borderColor: "#b37feb",
		paperColor: "#f0eafa",
		dividerColor: "#b37feb",
	},
	purple_dark: {
		primaryColor: "#b37feb",
		successColor: "#b7eb8f",
		warningColor: "#ffe58f",
		errorColor: "#ff7875",
		infoColor: "#91caff",
		backgroundColor: "#fff", // Keep background white
		textColor: "#fff",
		borderColor: "#b37feb",
		paperColor: "#303030", // Consistent dark paper
		dividerColor: "#b37feb",
	},
};

const g2Themes = {
	light: {
		type: "light",
		color: colorTokens.light.primaryColor,
		viewFill: colorTokens.light.backgroundColor,
	},
	dark: {
		type: "classicDark",
		color: colorTokens.dark.primaryColor,
		viewFill: colorTokens.dark.backgroundColor,
	},
	green: {
		type: "light",
		color: colorTokens.green.primaryColor,
		viewFill: colorTokens.green.backgroundColor,
	},
	green_dark: {
		type: "classicDark",
		color: colorTokens.green_dark.primaryColor,
		viewFill: colorTokens.green_dark.backgroundColor,
	},
	red: {
		type: "light",
		color: colorTokens.red.primaryColor,
		viewFill: colorTokens.red.backgroundColor,
	},
	red_dark: {
		type: "classicDark",
		color: colorTokens.red_dark.primaryColor,
		viewFill: colorTokens.red_dark.backgroundColor,
	},
	pink: {
		type: "light",
		color: colorTokens.pink.primaryColor,
		viewFill: colorTokens.pink.backgroundColor,
	},
	pink_dark: {
		type: "classicDark",
		color: colorTokens.pink_dark.primaryColor,
		viewFill: colorTokens.pink_dark.backgroundColor,
	},
	blue: {
		type: "light",
		color: colorTokens.blue.primaryColor,
		viewFill: colorTokens.blue.backgroundColor,
	},
	blue_dark: {
		type: "classicDark",
		color: colorTokens.blue_dark.primaryColor,
		viewFill: colorTokens.blue_dark.backgroundColor,
	},
	purple: {
		type: "light",
		color: colorTokens.purple.primaryColor,
		viewFill: colorTokens.purple.backgroundColor,
	},
	purple_dark: {
		type: "classicDark",
		color: colorTokens.purple_dark.primaryColor,
		viewFill: colorTokens.purple_dark.backgroundColor,
	},
};
export { g2Themes };

const getMenuIcon = (path) => {
	const iconStyle = { fontSize: "16px" };

	switch (path) {
		case "/login":
			return <LoginOutlined style={{ ...iconStyle, color: "#1890ff" }} />;
		case "/register":
			return <UserAddOutlined style={{ ...iconStyle, color: "#1890ff" }} />;
		case "/profile":
			return <UserOutlined style={{ ...iconStyle, color: "#1890ff" }} />;
		case "/patients":
			return <TeamOutlined style={{ ...iconStyle, color: "#eb2f96" }} />;
		case "/activities":
			return <CalendarOutlined style={{ ...iconStyle, color: "#eb2f96" }} />;
		case "/procedures":
			return <MedicineBoxOutlined style={{ ...iconStyle, color: "#eb2f96" }} />;
		case "/vital-signs":
			return <MonitorOutlined style={{ ...iconStyle, color: "#eb2f96" }} />;
		case "/assessments":
			return <FileTextOutlined style={{ ...iconStyle, color: "#eb2f96" }} />;
		case "/procedure-logs":
			return <SaveOutlined style={{ ...iconStyle, color: "#eb2f96" }} />;
		case "/units":
			return <AppstoreOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		case "/rooms":
			return <HomeOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		case "/beds":
			return <RestOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		case "/admissions":
			return <SolutionOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		case "/users":
			return <UsergroupAddOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		case "/medications":
			return <MedicineBoxTwoTone style={iconStyle} />;
		case "/medications/history":
			return <HistoryOutlined style={{ ...iconStyle, color: "#faad14" }} />;
		case "/prescriptions":
			return <FileProtectOutlined style={{ ...iconStyle, color: "#faad14" }} />;
		case "/medication-administrations":
			return <ThunderboltOutlined style={{ ...iconStyle, color: "#faad14" }} />;
		case "/product-usages":
			return <BoxPlotOutlined style={{ ...iconStyle, color: "#faad14" }} />;
		case "/products":
			return <ShopOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
		case "/billings":
			return <AccountBookOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
		case "/image-reports":
			return <FileImageOutlined style={{ ...iconStyle, color: "#13c2c2" }} />;
		case "/image-report-types":
			return <FileSearchOutlined style={{ ...iconStyle, color: "#13c2c2" }} />;
		case "/documents":
			return <FolderOutlined style={{ ...iconStyle, color: "#13c2c2" }} />;
		case "/document-types":
			return <ProfileOutlined style={{ ...iconStyle, color: "#13c2c2" }} />;
		case "/lab-tests":
			return <ExperimentTwoTone style={iconStyle} />;
		case "/lab-results":
			return <CheckCircleOutlined style={{ ...iconStyle, color: "#13c2c2" }} />;
		case "/all-features":
			return <AppstoreOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		case "/roles-permissions":
			return <KeyOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		default:
			return <SettingOutlined style={iconStyle} />;
	}
};

const ResponsiveMenu = styled(AntMenu)`
	&.ant-menu-inline {
		.ant-menu-item {
			height: 48px;
			line-height: 48px;
			padding-left: 24px !important;
			margin: 4px 8px;
			border-radius: 6px;

			@media (max-width: 576px) {
				height: 40px;
				line-height: 40px;
				padding-left: 16px !important;
			}
		}
	}
`;

const NavigationMenu = React.memo(({ onClose, isMobile, collapsed }) => {
	// Added React.memo
	const { user, hasAuthority } = useAuthStore();
	const [openKeys, setOpenKeys] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();
	const location = useLocation();

	const handleMenuItemClick = useCallback(
		(path) => {
			// useCallback
			navigate(path);
			if (isMobile) {
				onClose();
			}
		},
		[navigate, onClose, isMobile]
	);

	const onOpenChange = (keys) => {
		const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
		setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
	};
	const menuPermissions = {
		"/login": [],
		"/register": [],
		"/profile": [],
		"/patients": ["READ_PATIENT", "CREATE_PATIENT", "UPDATE_PATIENT", "DELETE_PATIENT"],
		"/activities": ["READ_USER_ACTIVITY", "CREATE_USER_ACTIVITY", "UPDATE_USER_ACTIVITY", "DELETE_USER_ACTIVITY"],
		"/procedures": ["READ_PROCEDURE", "CREATE_PROCEDURE", "UPDATE_PROCEDURE", "DELETE_PROCEDURE"],
		"/vital-signs": ["READ_VITAL_SIGN", "CREATE_VITAL_SIGN", "UPDATE_VITAL_SIGN", "DELETE_VITAL_SIGN"],
		"/assessments": ["READ_ASSESSMENT", "CREATE_ASSESSMENT", "UPDATE_ASSESSMENT", "DELETE_ASSESSMENT"],
		"/procedure-logs": ["READ_PROCEDURE_LOG", "CREATE_PROCEDURE_LOG", "DELETE_PROCEDURE_LOG"],
		"/units": ["READ_UNIT", "CREATE_UNIT", "UPDATE_UNIT", "DELETE_UNIT"],
		"/rooms": ["READ_ROOM", "CREATE_ROOM", "UPDATE_ROOM", "DELETE_ROOM"],
		"/beds": ["READ_BED", "CREATE_BED", "UPDATE_BED", "DELETE_BED"],
		"/admissions": ["READ_ADMISSION", "CREATE_ADMISSION", "UPDATE_ADMISSION", "DELETE_ADMISSION"],
		"/users": ["READ_USER", "CREATE_USER", "UPDATE_USER", "DELETE_USER"],
		"/medications": ["READ_MEDICATION", "CREATE_MEDICATION", "UPDATE_MEDICATION", "DELETE_MEDICATION", "UPDATE_MEDICATION_STOCK"],
		"/medications/history": ["READ_MEDICATION_HISTORY"],
		"/prescriptions": ["READ_PRESCRIPTION", "CREATE_PRESCRIPTION", "UPDATE_PRESCRIPTION", "DELETE_PRESCRIPTION"],
		"/medication-administrations": ["READ_MEDICATION_ADMINISTRATION", "CREATE_MEDICATION_ADMINISTRATION", "DELETE_MEDICATION_ADMINISTRATION"],
		"/product-usages": ["READ_PATIENT_PRODUCT_USAGE", "CREATE_PATIENT_PRODUCT_USAGE", "DELETE_PATIENT_PRODUCT_USAGE"],
		"/products": ["READ_PRODUCT", "CREATE_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT"],
		"/billings": ["READ_BILLING", "CREATE_BILLING", "UPDATE_BILLING", "DELETE_BILLING"],
		"/image-reports": ["READ_IMAGE_REPORT", "CREATE_IMAGE_REPORT", "UPDATE_IMAGE_REPORT", "DELETE_IMAGE_REPORT"],
		"/image-report-types": ["READ_IMAGE_REPORT_TYPE", "CREATE_IMAGE_REPORT_TYPE", "UPDATE_IMAGE_REPORT_TYPE", "DELETE_IMAGE_REPORT_TYPE"],
		"/documents": ["READ_DOCUMENT", "CREATE_DOCUMENT", "UPDATE_DOCUMENT", "DELETE_DOCUMENT"],
		"/document-types": ["READ_DOCUMENT_TYPE", "CREATE_DOCUMENT_TYPE", "UPDATE_DOCUMENT_TYPE", "DELETE_DOCUMENT_TYPE"],
		"/lab-tests": ["READ_LAB_TEST", "CREATE_LAB_TEST"],
		"/lab-results": ["READ_LAB_RESULT", "CREATE_LAB_RESULT", "DELETE_LAB_RESULT"],
		"/all-features": [], // No specific permissions, always show
		"/roles-permissions": ["MANAGE_PERMISSIONS", "MANAGE_ROLES"],
	};

	const menuItems = useMemo(() => {
		// console.log("Current user:", user); // Removed console.log
		const baseItems = [
			{ label: "Login", path: "/login", show: true, category: "Authentications" },
			{ label: "Register", path: "/register", show: true, category: "Authentications" },
		];

		const loggedInItems = user ? [{ label: "Profile", path: "/profile", show: true, category: "Authentications" }] : [];

		const permissionBasedItems = Object.entries(menuPermissions)
			.filter(([path, permissions]) => {
				// console.log(`Checking path: ${path}, required permissions:`, permissions); // Removed console.log

				if (permissions.length === 0) {
					// console.log(`Path ${path} has no permissions, showing.`); // Removed console.log
					return true;
				}
				if (!user) {
					// console.log(`No user logged in, hiding path ${path}.`); // Removed console.log
					return false;
				}

				const hasPermission = permissions.some((permission) => {
					const result = hasAuthority(permission);
					// console.log(`Checking permission ${permission}, result: ${result}`); // Removed console.log
					return result;
				});

				// console.log(`Final decision for ${path}: ${hasPermission}`); // Removed console.log
				return hasPermission;
			})
			.map(([path, _]) => {
				const label = path
					.split("/")
					.pop()
					.replace(/-/g, " ")
					.replace(/^\w/, (c) => c.toUpperCase());
				let category = "Other";

				if (
					path.startsWith("/patients") ||
					path.startsWith("/activities") ||
					path.startsWith("/procedures") ||
					path.startsWith("/vital-signs") ||
					path.startsWith("/assessments") ||
					path.startsWith("/procedure-logs")
				) {
					category = "Patient Management";
				} else if (
					path.startsWith("/units") ||
					path.startsWith("/rooms") ||
					path.startsWith("/beds") ||
					path.startsWith("/admissions") ||
					path.startsWith("/users")
				) {
					category = "Administration";
				} else if (
					path.startsWith("/medications") ||
					path.startsWith("/prescriptions") ||
					path.startsWith("/medication-administrations") ||
					path.startsWith("/product-usages")
				) {
					category = "Medication & Orders";
				} else if (path.startsWith("/products") || path.startsWith("/billings")) {
					category = "Billing & Finance";
				} else if (
					path.startsWith("/image-reports") ||
					path.startsWith("/image-report-types") ||
					path.startsWith("/documents") ||
					path.startsWith("/document-types") ||
					path.startsWith("/lab-tests") ||
					path.startsWith("/lab-results")
				) {
					category = "Diagnostics & Labs";
				} else if (path.startsWith("/roles-permissions")) {
					category = "Security";
				}

				return { label, path, show: true, category };
			});

		return [...baseItems, ...loggedInItems, ...permissionBasedItems];
	}, [user, hasAuthority]);

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

	const filteredMenuItems = useMemo(() => {
		if (!searchTerm) {
			return groupedMenuItems;
		}

		const filtered = {};
		Object.entries(groupedMenuItems).forEach(([category, items]) => {
			const filteredItems = items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
			if (filteredItems.length > 0) {
				filtered[category] = filteredItems;
			}
		});
		return filtered;
	}, [searchTerm, groupedMenuItems]);

	const handleSearch = (value) => {
		setSearchTerm(value);
	};

	const selectedKeys = useMemo(() => {
		const matchingItem = menuItems.find((item) => location.pathname === item.path);
		return matchingItem ? [matchingItem.path] : [];
	}, [location.pathname, menuItems]);

	const renderMenuItem = useCallback(
		(menuItem) => {
			// useCallback for menu item
			const icon = getMenuIcon(menuItem.path);
			return (
				<AntMenu.Item key={menuItem.path} onClick={() => handleMenuItemClick(menuItem.path)}>
					<span style={{ display: "flex", alignItems: "center" }}>
						{icon}
						<span style={{ marginLeft: 8 }}>{menuItem.label}</span>
					</span>
				</AntMenu.Item>
			);
		},
		[handleMenuItemClick]
	);

	return (
		<>
			{isMobile ? null : (
				<Search placeholder="Search features" onChange={(e) => handleSearch(e.target.value)} style={{ width: "100%", marginBottom: 16 }} />
			)}

			<ResponsiveMenu
				mode={isMobile ? "vertical" : "inline"}
				openKeys={openKeys}
				onOpenChange={onOpenChange}
				style={{ borderRight: 0, height: "100%" }}
				inlineCollapsed={collapsed}
				selectedKeys={selectedKeys}>
				{Object.entries(filteredMenuItems).map(([category, items]) => (
					<AntMenu.SubMenu key={category} title={category}>
						{items.map(renderMenuItem)} {/* Use the memoized renderMenuItem */}
					</AntMenu.SubMenu>
				))}
			</ResponsiveMenu>
		</>
	);
});

const AppContent = ({ children, colorMode, setColorMode }) => {
	const { user } = useAuthStore();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [desktopOpen, setDesktopOpen] = useState(false);
	// Removed headerVisible -  header animation handled directly in StyledHeader now.
	const location = useLocation();
	const screens = Grid.useBreakpoint();
	const isSmallScreen = !screens.md;
	const isDarkMode = colorMode.endsWith("dark");
	const navigate = useNavigate();

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleDesktopDrawerToggle = () => {
		setDesktopOpen(!desktopOpen);
	};

	const transformImageUrl = (url) => {
		if (!url) return null;
		let fileUrl = url;
		if (fileUrl.startsWith(".")) {
			fileUrl = fileUrl.substring(1);
		}
		return `${fileUrl}`;
	};

	const breadcrumbItems = useMemo(() => {
		const pathSegments = location.pathname.split("/").filter(Boolean);
		return pathSegments.map((segment, index) => {
			const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
			return {
				title: (
					<RouterLink to={path} style={{ color: "inherit" }}>
						{segment}
					</RouterLink>
				),
			};
		});
	}, [location]);

	const handleNavigation = useCallback(
		(pageName) => {
			const routeMap = {
				login: "/login",
				register: "/register",
				profile: "/profile",
				patients: "/patients",
				activities: "/activities",
				procedures: "/procedures",
				"vital signs": "/vital-signs",
				assessments: "/assessments",
				"procedure logs": "/procedure-logs",
				units: "/units",
				rooms: "/rooms",
				beds: "/beds",
				admissions: "/admissions",
				users: "/users",
				medications: "/medications",
				"medication history": "/medications/history",
				prescriptions: "/prescriptions",
				"medication administrations": "/medication-administrations",
				"product usages": "/product-usages",
				products: "/products",
				billings: "/billings",
				"image reports": "/image-reports",
				"image report types": "/image-report-types",
				documents: "/documents",
				"document types": "/document-types",
				"lab tests": "/lab-tests",
				"lab results": "/lab-results",
				"all features": "/all-features",
				"roles permissions": "/roles-permissions",
				dashboard: "/dashboard",
				home: "/",
			};

			const normalizedPageName = pageName.toLowerCase();
			const route = routeMap[normalizedPageName];

			if (route) {
				navigate(route);
				notification.success({
					message: "Navigating",
					description: `Navigating to ${pageName}`,
				});
			} else {
				notification.error({
					message: "Navigation Error",
					description: `Could not find a page named "${pageName}".`,
				});
			}
		},
		[navigate]
	);

	const handleColorModeChange = (value) => {
		setColorMode(value);
	};

	return (
		<StyledLayout>
			<StyledHeader isDarkMode={isDarkMode}>
				<Space align="middle">
					<LogoImage src="/logo.png" alt="Logo" />
					{!isSmallScreen && <Button type="text" icon={<MenuOutlined />} onClick={handleDesktopDrawerToggle} aria-label="Toggle Sidebar" />}
				</Space>

				<Space align="middle">
					<VoiceNavigation onNavigate={handleNavigation} />
					<Select
						defaultValue="light"
						style={{ width: 120, marginRight: 16, backgroundColor: "transparent" }}
						onChange={handleColorModeChange}
						options={[
							{ value: "light", label: "Light" },
							{ value: "dark", label: "Dark" },
							{ value: "green", label: "Green" },
							{ value: "green_dark", label: "Green Dark" },
							{ value: "red", label: "Red" },
							{ value: "red_dark", label: "Red Dark" },
							{ value: "pink", label: "Pink" },
							{ value: "pink_dark", label: "Pink Dark" },
							{ value: "blue", label: "Blue" },
							{ value: "blue_dark", label: "Blue Dark" },
							{ value: "purple", label: "Purple" },
							{ value: "purple_dark", label: "Purple Dark" },
						]}
					/>
					{user ? (
						<RouterLink to="/profile">
							<Avatar
								size={isSmallScreen ? 32 : 40}
								src={user.profilePictureURL ? transformImageUrl(user.profilePictureURL) : null}
								icon={!user.profilePictureURL ? <UserOutlined /> : null}
								style={{
									cursor: "pointer",
									objectFit: "cover",
									border: "2px solid #ddd",
									borderColor: isDarkMode ? "#fff" : "snow",
								}}
							/>
						</RouterLink>
					) : (
						<Avatar size={isSmallScreen ? 32 : 40} icon={<UserOutlined />} />
					)}
					<MobileMenuButton type="text" icon={<MenuOutlined />} onClick={handleDrawerToggle} aria-label="Toggle Mobile Menu" />
				</Space>
			</StyledHeader>
			<Layout>
				<StyledSider
					width={250}
					collapsed={desktopOpen}
					onCollapse={handleDesktopDrawerToggle}
					breakpoint="md"
					collapsible
					isDarkMode={isDarkMode}
					style={{
						display: isSmallScreen ? "none" : "block",
					}}>
					<NavigationMenu onClose={() => {}} isMobile={false} collapsed={desktopOpen} />
				</StyledSider>
				<StyledDrawer
					title="Menu"
					placement="left"
					width={250}
					onClose={handleDrawerToggle}
					open={mobileOpen}
					style={{
						display: isSmallScreen ? "block" : "none",
					}}>
					<NavigationMenu onClose={handleDrawerToggle} isMobile={true} />
				</StyledDrawer>
				<Layout style={{ padding: "0" }}>
					{/* Wrap routes with TransitionGroup and CSSTransition */}
					<TransitionGroup>
						<CSSTransition key={location.pathname} classNames="fade" timeout={300}>
							<StyledContent isDarkMode={isDarkMode}>
								{breadcrumbItems.length > 0 && (
									<Breadcrumb style={{ marginBottom: 16 }}>
										<Breadcrumb.Item>
											<RouterLink to="/" style={{ color: "inherit" }}>
												Home
											</RouterLink>
										</Breadcrumb.Item>
										{breadcrumbItems.map((item, index) => (
											<Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
										))}
									</Breadcrumb>
								)}
								{/* Render the current route's component here */}
								<Routes location={location}>
									<Route path="/" element={<AllFeaturesPage />} />
									<Route path="/dashboard" element={<Dashboard colorMode={colorMode} />} />
									{appRoutes.map((route, index) => (
										<Route key={index} path={route.path} element={route.element} />
									))}
									<Route
										path="/roles-permissions"
										element={
											<PrivateRoute permissions={["MANAGE_PERMISSIONS", "MANAGE_ROLES"]}>
												<RoleAndPermissionManagement />
											</PrivateRoute>
										}
									/>
									<Route path="/all-features" element={<AllFeaturesPage />} />
									<Route path="/about-us" element={<AboutUs />} />
								</Routes>
							</StyledContent>
						</CSSTransition>
					</TransitionGroup>

					<StyledFooter isDarkMode={isDarkMode}>
						© 2023 GMTS Hospital Model. All rights reserved. |{" "}
						<RouterLink to="/about-us" style={{ color: "inherit" }}>
							About Us
						</RouterLink>
					</StyledFooter>
				</Layout>
			</Layout>
		</StyledLayout>
	);
};

const App = () => {
	const [colorMode, setColorMode] = useState("light");
	const isDarkMode = colorMode.endsWith("dark");

	const antDesignTheme = useMemo(() => {
		const currentTokens = colorTokens[colorMode];
		return {
			algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
			token: {
				colorPrimary: currentTokens.primaryColor,
				colorSuccess: currentTokens.successColor,
				colorWarning: currentTokens.warningColor,
				colorError: currentTokens.errorColor,
				colorInfo: currentTokens.infoColor,
				borderRadius: 6,
			},
		};
	}, [colorMode, isDarkMode]);

	return (
		<AppWrapper>
			{/* CSS for Route Transitions (Place this in your CSS file or within a Styled Component) */}

			<style>{`
                .fade-enter {
                  opacity: 0;
                }
                .fade-enter-active {
                  opacity: 1;
                  transition: opacity 300ms ease-in-out;
                }
                .fade-exit {
                  opacity: 1;
                }
                .fade-exit-active {
                  opacity: 0;
                  transition: opacity 300ms ease-in-out;
                }
            `}</style>
			<ConfigProvider theme={antDesignTheme}>
				<Router>
					<AppContent colorMode={colorMode} setColorMode={setColorMode}>
						{/* Routes are now rendered inside AppContent */}
						{/* No Routes component here */}
					</AppContent>
				</Router>
			</ConfigProvider>
		</AppWrapper>
	);
};

export default App;
