// App.js

// --- Core React/Router Imports ---
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// --- State Management & Services ---
import { useAuthStore } from "./services/auth.service";
import { useTranslation } from "react-i18next";
import i18n from "./i18n"; // Assuming i18n setup is here

// --- Ant Design Imports ---
import {
	Layout,
	Menu as AntMenu,
	Breadcrumb,
	Button,
	Drawer,
	ConfigProvider,
	Select,
	theme as antdTheme,
	Space,
	Grid,
	Input,
	Card,
	notification,
	Avatar,
	Radio,
	// Removed duplicate/unused antd components if any
} from "antd";
import {
	MenuOutlined,
	SettingOutlined,
	BulbOutlined,
	DollarCircleOutlined,
	ExperimentOutlined,
	LockOutlined,
	HeartOutlined,
	ShoppingCartOutlined,
	LoginOutlined,
	UserAddOutlined,
	UserOutlined,
	TeamOutlined,
	CalendarOutlined, // Used for Appointments & Activities
	MedicineBoxOutlined,
	MonitorOutlined,
	FileTextOutlined,
	SaveOutlined,
	AppstoreOutlined,
	HomeOutlined,
	RestOutlined,
	SolutionOutlined,
	UsergroupAddOutlined,
	// HistoryOutlined, // Seemed unused
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
import enUS from "antd/es/locale/en_US";
import faIR from "antd/es/locale/fa_IR";
import arEG from "antd/es/locale/ar_EG";
import "antd/dist/reset.css";

// --- Styling Imports ---
import styled, { keyframes, css } from "styled-components";

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
import ImageReportList from "./components/imageReports/ImageReportList";
import LabTestList from "./components/lab/LabTestList";
import LabResultPage from "./components/lab/LabResultPage";
import Dashboard from "./components/dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ImageReportTypeList from "./components/imageReports/ImageReportTypeList";
import BillingPage from "./components/billing/BillingPage";
import ActivityPage from "./pages/ActivityPage";
import AppointmentsPage from "./pages/AppointmentsPage"; // NEW
import AboutUs from "./components/AboutUs";
import DocumentList from "./components/documents/DocumentList";
import DocumentTypeList from "./components/documents/DocumentTypeList";
import AllFeaturesPage from "./components/AllFeaturesPage";
import RoleAndPermissionManagement from "./components/auth/RoleAndPermissionManagement";
import VoiceNavigation from "./VoiceNavigation";
import MyAntdPage from "./antdPage"; // Assuming this is used somewhere

// --- Routes & Config ---
import { appRoutes } from "./routes";
import { colorTokens, darkKillerTheme, ComplexThemeProvider, g2Themes } from "./themeConfig"; // Assuming themes are moved

// --- Constants ---
const { Header, Content, Footer, Sider } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antdTheme;
const { useBreakpoint } = Grid;
const { Search } = Input;

// --- Styled Components (Keep definitions outside components) ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AppWrapper = styled.div`
	min-height: 100vh;
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	// Removed ::before pseudo-element if not actively used for background
`;

const StyledLayout = styled(Layout)`
	min-height: 100vh;
`;

const StyledContent = styled(Content)`
	margin: 12px;
	padding: 16px;
	min-height: 280px;
	border-radius: 8px; // Slightly reduced radius
	transition: box-shadow 0.3s ease;
	z-index: 2;
	flex: 1; // Ensure content grows
	background-color: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"}; // Use theme token

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // Subtle hover
	}

	@media (max-width: 768px) {
		margin: 8px;
		padding: 12px;
	}

	// Animation styles moved to global style tag in App component
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
`;

const LogoImage = styled.img`
	height: 40px;
	width: auto;
	margin-right: 1rem;
	vertical-align: middle; // Align better with text/buttons

	@media (max-width: 576px) {
		height: 32px;
		margin-right: 0.5rem;
	}
`;

const StyledHeader = styled(Header)`
	position: sticky;
	top: 0;
	z-index: 1001; // Ensure above Sider/Drawer overlay
	transition: background-color 0.3s ease, box-shadow 0.3s ease;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-inline: 1rem;
	background-color: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"};
	border-bottom: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "#f0f0f0"};

	// Add subtle shadow on scroll (requires JS or more complex CSS)
	// &.scrolled { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }

	@media (max-width: 768px) {
		padding-inline: 0.75rem;
	}
`;

const StyledSider = styled(Sider)`
	// Use theme tokens for background
	background: ${(props) => props.theme?.token?.colorBgLayout || "#001529"} !important;
	// border-right: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "rgba(255, 255, 255, 0.2)"};
	height: 100vh; // Full height
	position: sticky !important; // Sticky Sider
	top: 0;
	overflow: auto; // Scroll if menu is long

	.ant-menu {
		background: transparent;
		border-right: none !important; // Remove default border
	}

	// Adjust menu item styling using theme tokens where possible
	.ant-menu-item,
	.ant-menu-submenu-title {
		margin: 4px 8px;
		width: calc(100% - 16px); // Ensure full width within padding
		border-radius: ${(props) => props.theme?.token?.borderRadius || 6}px;
		color: ${(props) => props.theme?.token?.colorTextSecondary}; // Adjust text color

		&:hover {
			background: ${(props) => props.theme?.token?.colorBgTextHover || "rgba(255, 255, 255, 0.1)"};
			color: ${(props) => props.theme?.token?.colorText};
		}

		&.ant-menu-item-selected {
			background: ${(props) => props.theme?.token?.colorPrimaryBg || "rgba(255, 255, 255, 0.2)"} !important;
			color: ${(props) => props.theme?.token?.colorPrimary || "#fff"} !important;
		}
	}
	.ant-menu-submenu-arrow {
		color: ${(props) => props.theme?.token?.colorTextSecondary};
	}

	.ant-layout-sider-trigger {
		background: ${(props) => props.theme?.token?.colorBgContainer};
		color: ${(props) => props.theme?.token?.colorText};
	}

	// Mobile styles are handled by Drawer now

	// Custom scrollbar styling
	&::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}

	&::-webkit-scrollbar-track {
		background: ${(props) => props.theme?.token?.colorBgContainer || "#f0f0f0"};
		border-radius: 3px;
	}

	&::-webkit-scrollbar-thumb {
		background: ${(props) => props.theme?.token?.colorBorder || "#d9d9d9"};
		border-radius: 3px;

		&:hover {
			background: ${(props) => props.theme?.token?.colorBorderSecondary || "#bfbfbf"};
		}
	}

	/* Firefox scrollbar styling */
	scrollbar-width: thin;
	scrollbar-color: ${(props) => `${props.theme?.token?.colorBorder || "#d9d9d9"} ${props.theme?.token?.colorBgContainer || "#f0f0f0"}`};
`;

const MobileMenuButton = styled(Button)`
	display: none; // Managed by Grid.useBreakpoint now

	@media (max-width: 767px) {
		// Target Ant Design's 'md' breakpoint precisely
		display: inline-flex; // Use inline-flex for better alignment
		align-items: center;
		justify-content: center;
		font-size: 18px; // Slightly smaller icon
	}
`;

const StyledDrawer = styled(Drawer)`
	.ant-drawer-content-wrapper {
	}

	.ant-drawer-content {
		// Use theme tokens
		background: ${(props) => props.theme?.token?.colorBgElevated || "rgba(0, 21, 41, 0.9)"} !important;
	}
	.ant-drawer-header {
		background: ${(props) => props.theme?.token?.colorBgElevated || "rgba(0, 21, 41, 0.9)"};
		border-bottom: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary};
	}
	.ant-drawer-title,
	.ant-drawer-close {
		color: ${(props) => props.theme?.token?.colorText};
	}

	.ant-drawer-body {
		padding: 0;
		background: transparent;

		// Custom scrollbar styling
		&::-webkit-scrollbar {
			width: 6px;
			height: 6px;
		}

		&::-webkit-scrollbar-track {
			background: ${(props) => props.theme?.token?.colorBgContainer || "#f0f0f0"};
			border-radius: 3px;
		}

		&::-webkit-scrollbar-thumb {
			background: ${(props) => props.theme?.token?.colorBorder || "#d9d9d9"};
			border-radius: 3px;

			&:hover {
				background: ${(props) => props.theme?.token?.colorBorderSecondary || "#bfbfbf"};
			}
		}

		/* Firefox scrollbar styling */
		scrollbar-width: thin;
		scrollbar-color: ${(props) => `${props.theme?.token?.colorBorder || "#d9d9d9"} ${props.theme?.token?.colorBgContainer || "#f0f0f0"}`};
	}

	.ant-menu {
		background: transparent;
		border-right: none !important;
	}

	// Consistent menu item styling with Sider
	.ant-menu-item,
	.ant-menu-submenu-title {
		margin: 4px 8px;
		width: calc(100% - 16px);
		border-radius: ${(props) => props.theme?.token?.borderRadius || 6}px;
		color: ${(props) => props.theme?.token?.colorTextSecondary};

		&:hover {
			background: ${(props) => props.theme?.token?.colorBgTextHover || "rgba(255, 255, 255, 0.1)"};
			color: ${(props) => props.theme?.token?.colorText};
		}

		&.ant-menu-item-selected {
			background: ${(props) => props.theme?.token?.colorPrimaryBg || "rgba(255, 255, 255, 0.2)"} !important;
			color: ${(props) => props.theme?.token?.colorPrimary || "#fff"} !important;
		}
	}
	.ant-menu-submenu-arrow {
		color: ${(props) => props.theme?.token?.colorTextSecondary};
	}
`;

const StyledFooter = styled(Footer)`
	// Use theme tokens
	background: ${(props) => props.theme?.token?.colorBgLayout || "rgba(0, 0, 0, 0.1)"};
	border-top: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "rgba(255, 255, 255, 0.1)"};
	text-align: center;
	padding: 12px 24px; // Adjust padding
	color: ${(props) => props.theme?.token?.colorTextSecondary};
`;

// --- Helper Functions ---
const getMenuIcon = (path) => {
	const iconStyle = { fontSize: "16px", marginRight: "8px" }; // Add margin for spacing

	// Simplified - Assuming icons are correctly mapped and used
	const icons = {
		"/login": <LoginOutlined style={iconStyle} />,
		"/register": <UserAddOutlined style={iconStyle} />,
		"/profile": <UserOutlined style={iconStyle} />,
		"/patients": <TeamOutlined style={iconStyle} />,
		"/appointments": <CalendarOutlined style={iconStyle} />,
		"/activities": <CalendarOutlined style={iconStyle} />, // Shared icon
		"/procedures": <MedicineBoxOutlined style={iconStyle} />,
		"/vital-signs": <MonitorOutlined style={iconStyle} />,
		"/assessments": <FileTextOutlined style={iconStyle} />,
		"/procedure-logs": <SaveOutlined style={iconStyle} />,
		"/units": <AppstoreOutlined style={iconStyle} />,
		"/rooms": <HomeOutlined style={iconStyle} />,
		"/beds": <RestOutlined style={iconStyle} />,
		"/admissions": <SolutionOutlined style={iconStyle} />,
		"/users": <UsergroupAddOutlined style={iconStyle} />,
		"/medications": <MedicineBoxTwoTone style={iconStyle} twoToneColor="#faad14" />, // Example two-tone
		"/prescriptions": <FileProtectOutlined style={iconStyle} />,
		"/medication-administrations": <ThunderboltOutlined style={iconStyle} />,
		"/product-usages": <BoxPlotOutlined style={iconStyle} />,
		"/products": <ShopOutlined style={iconStyle} />,
		"/billings": <AccountBookOutlined style={iconStyle} />,
		"/image-reports": <FileImageOutlined style={iconStyle} />,
		"/image-report-types": <FileSearchOutlined style={iconStyle} />,
		"/documents": <FolderOutlined style={iconStyle} />,
		"/document-types": <ProfileOutlined style={iconStyle} />,
		"/lab-tests": <ExperimentTwoTone style={iconStyle} twoToneColor="#13c2c2" />, // Example two-tone
		"/lab-results": <CheckCircleOutlined style={iconStyle} />,
		"/all-features": <AppstoreOutlined style={iconStyle} />,
		"/roles-permissions": <KeyOutlined style={iconStyle} />,
		"/dashboard": <HeartOutlined style={iconStyle} />, // Example: Using Heart for Dashboard
	};

	return icons[path] || <SettingOutlined style={iconStyle} />; // Default icon
};

const transformImageUrl = (url) => {
	if (!url) return null;
	// Basic check if it's a relative path needing prefix or a full URL
	if (url.startsWith("./") || url.startsWith("../")) {
		// Assuming REACT_APP_API_BASE_URL is set for backend assets
		// Adjust this logic based on where your images are served from
		return `${process.env.REACT_APP_API_BASE_URL || ""}${url.replace(/^\./, "")}`;
	}
	return url; // Assume it's a full URL or correct path already
};

// --- NavigationMenu Component ---
const NavigationMenu = React.memo(({ onClose, isMobile, collapsed }) => {
	const { user, hasAuthority } = useAuthStore();
	const [openKeys, setOpenKeys] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { token } = antdTheme.useToken(); // Access theme tokens

	const handleMenuItemClick = useCallback(
		(path) => {
			navigate(path);
			if (isMobile && onClose) {
				onClose();
			}
		},
		[navigate, onClose, isMobile]
	);

	const onOpenChange = useCallback(
		(keys) => {
			const latestOpenKey = keys.find((key) => !openKeys.includes(key));
			setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
		},
		[openKeys]
	);

	// --- Menu Permissions (Consider moving to a separate config file) ---
	const menuPermissions = useMemo(
		() => ({
			// Public
			"/login": [],
			"/register": [],
			"/all-features": [],
			"/about-us": [],
			// Authenticated Base
			"/profile": [],
			"/dashboard": [],
			// Patient Management
			"/patients": ["READ_PATIENT", "CREATE_PATIENT", "UPDATE_PATIENT", "DELETE_PATIENT"],
			"/appointments": ["READ_APPOINTMENT", "CREATE_APPOINTMENT", "UPDATE_APPOINTMENT", "DELETE_APPOINTMENT"],
			"/activities": ["READ_USER_ACTIVITY", "CREATE_USER_ACTIVITY", "UPDATE_USER_ACTIVITY", "DELETE_USER_ACTIVITY"],
			"/procedures": ["READ_PROCEDURE", "CREATE_PROCEDURE", "UPDATE_PROCEDURE", "DELETE_PROCEDURE"],
			"/vital-signs": ["READ_VITAL_SIGN", "CREATE_VITAL_SIGN", "UPDATE_VITAL_SIGN", "DELETE_VITAL_SIGN"],
			"/assessments": ["READ_ASSESSMENT", "CREATE_ASSESSMENT", "UPDATE_ASSESSMENT", "DELETE_ASSESSMENT"],
			"/procedure-logs": ["READ_PROCEDURE_LOG", "CREATE_PROCEDURE_LOG", "DELETE_PROCEDURE_LOG"],
			// Administration
			"/units": ["READ_UNIT", "CREATE_UNIT", "UPDATE_UNIT", "DELETE_UNIT"],
			"/rooms": ["READ_ROOM", "CREATE_ROOM", "UPDATE_ROOM", "DELETE_ROOM"],
			"/beds": ["READ_BED", "CREATE_BED", "UPDATE_BED", "DELETE_BED"],
			"/admissions": ["READ_ADMISSION", "CREATE_ADMISSION", "UPDATE_ADMISSION", "DELETE_ADMISSION"],
			"/users": ["READ_USER", "CREATE_USER", "UPDATE_USER", "DELETE_USER"],
			// Medication & Orders
			"/medications": ["READ_MEDICATION", "CREATE_MEDICATION", "UPDATE_MEDICATION", "DELETE_MEDICATION", "UPDATE_MEDICATION_STOCK"],
			"/prescriptions": ["READ_PRESCRIPTION", "CREATE_PRESCRIPTION", "UPDATE_PRESCRIPTION", "DELETE_PRESCRIPTION"],
			"/medication-administrations": ["READ_MEDICATION_ADMINISTRATION", "CREATE_MEDICATION_ADMINISTRATION", "DELETE_MEDICATION_ADMINISTRATION"],
			"/product-usages": ["READ_PATIENT_PRODUCT_USAGE", "CREATE_PATIENT_PRODUCT_USAGE", "DELETE_PATIENT_PRODUCT_USAGE"],
			// Billing & Finance
			"/products": ["READ_PRODUCT", "CREATE_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT"],
			"/billings": ["READ_BILLING", "CREATE_BILLING", "UPDATE_BILLING", "DELETE_BILLING"],
			// Diagnostics & Labs
			"/image-reports": ["READ_IMAGE_REPORT", "CREATE_IMAGE_REPORT", "UPDATE_IMAGE_REPORT", "DELETE_IMAGE_REPORT"],
			"/image-report-types": ["READ_IMAGE_REPORT_TYPE", "CREATE_IMAGE_REPORT_TYPE", "UPDATE_IMAGE_REPORT_TYPE", "DELETE_IMAGE_REPORT_TYPE"],
			"/documents": ["READ_DOCUMENT", "CREATE_DOCUMENT", "UPDATE_DOCUMENT", "DELETE_DOCUMENT"],
			"/document-types": ["READ_DOCUMENT_TYPE", "CREATE_DOCUMENT_TYPE", "UPDATE_DOCUMENT_TYPE", "DELETE_DOCUMENT_TYPE"],
			"/lab-tests": ["READ_LAB_TEST", "CREATE_LAB_TEST"],
			"/lab-results": ["READ_LAB_RESULT", "CREATE_LAB_RESULT", "DELETE_LAB_RESULT"],
			// Security
			"/roles-permissions": ["MANAGE_PERMISSIONS", "MANAGE_ROLES"],
		}),
		[]
	);

	// --- Menu Item Generation & Filtering ---
	const allMenuItems = useMemo(() => {
		return Object.keys(menuPermissions).map((path) => {
			const labelKey = path === "/" ? "home" : path.substring(path.lastIndexOf("/") + 1);

			const permissions = menuPermissions[path];
			const isPublic = permissions.length === 0 && !["/profile", "/dashboard"].includes(path);
			const requiresAuth = !isPublic;

			let show = false;
			// Modified logic to show login/register only when not authenticated
			if (isPublic) {
				if (["/login", "/register"].includes(path)) {
					show = true; // Show only when user is not logged in
				} else {
					show = true;
				}
			}
			if (requiresAuth && user) {
				if (permissions.length === 0) {
					show = true;
				} else {
					show = permissions.some((p) => hasAuthority(p));
				}
			}

			let categoryKey = "Other";
			// Modified to include login and register in Authentications category
			if (["/login", "/register", "/profile"].includes(path)) {
				categoryKey = "Authentications";
			} else if (
				["/patients", "/appointments", "/activities", "/procedures", "/vital-signs", "/assessments", "/procedure-logs"].includes(path)
			) {
				categoryKey = "Patient Management";
			}
			// ...rest of the categories remain the same...
			else if (["/units", "/rooms", "/beds", "/admissions", "/users"].includes(path)) categoryKey = "Administration";
			else if (["/medications", "/prescriptions", "/medication-administrations", "/product-usages"].includes(path))
				categoryKey = "Medication & Orders";
			else if (["/products", "/billings"].includes(path)) categoryKey = "Billing & Finance";
			else if (["/image-reports", "/image-report-types", "/documents", "/document-types", "/lab-tests", "/lab-results"].includes(path))
				categoryKey = "Diagnostics & Labs";
			else if (["/roles-permissions"].includes(path)) categoryKey = "Security";
			else if (["/dashboard"].includes(path)) categoryKey = "Dashboard";
			else if (["/all-features", "/about-us"].includes(path)) categoryKey = "General";

			return {
				path,
				labelKey,
				show,
				categoryKey,
			};
		});
	}, [user, hasAuthority, menuPermissions]); // Dependencies remain the same

	const groupedAndFilteredMenuItems = useMemo(() => {
		const grouped = {};
		allMenuItems
			.filter((item) => item.show)
			.forEach((item) => {
				const translatedLabel = t(item.labelKey); // Translate using the original labelKey
				if (!searchTerm || translatedLabel.toLowerCase().includes(searchTerm.toLowerCase())) {
					// Group by the original categoryKey
					if (!grouped[item.categoryKey]) {
						grouped[item.categoryKey] = [];
					}
					// Store translatedLabel for direct use in renderMenuItem if needed, or translate again there
					grouped[item.categoryKey].push({ ...item, translatedLabel });
				}
			});

		// Sort categories based on their translated names
		const sortedCategories = Object.keys(grouped).sort((a, b) => t(a).localeCompare(t(b))); // Use original categoryKey for translation/sorting
		const result = {};
		sortedCategories.forEach((key) => {
			result[key] = grouped[key];
		});
		return result;
	}, [allMenuItems, searchTerm, t]);

	const handleSearch = useCallback((e) => {
		setSearchTerm(e.target.value);
	}, []);

	const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);

	const renderMenuItem = useCallback(
		(menuItem) => (
			<AntMenu.Item key={menuItem.path} icon={getMenuIcon(menuItem.path)} onClick={() => handleMenuItemClick(menuItem.path)}>
				{/* Translate the labelKey again here to ensure it reflects current language */}
				{t(menuItem.labelKey)}
			</AntMenu.Item>
		),
		[handleMenuItemClick, t] // t is needed here
	);

	return (
		<>
			{!isMobile && !collapsed && (
				<Search
					allowClear
					placeholder={t("search-features")} // Assuming "search-features" is the translation key you use
					onChange={handleSearch}
					value={searchTerm}
					style={{ margin: "16px 8px", width: "calc(100% - 16px)" }}
				/>
			)}

			<AntMenu
				mode={isMobile ? "vertical" : "inline"}
				// Simplified theme detection (adapt if needed)
				theme={token.Layout?.sider?.colorBgLayout === "#001529" || token.Layout?.sider?.colorBgLayout?.startsWith("#0") ? "dark" : "light"}
				openKeys={openKeys}
				onOpenChange={onOpenChange}
				style={{ borderRight: 0, height: "100%" }}
				inlineCollapsed={!isMobile && collapsed}
				selectedKeys={selectedKeys}>
				{Object.entries(groupedAndFilteredMenuItems).map(([categoryKey, items]) => (
					<AntMenu.SubMenu key={categoryKey} title={t(categoryKey)}>
						{" "}
						{/* Use original categoryKey for translation */}
						{items.map(renderMenuItem)}
					</AntMenu.SubMenu>
				))}
			</AntMenu>
		</>
	);
});

// --- HeaderContent Component ---
const HeaderContent = React.memo(({ onDesktopToggle, onMobileToggle }) => {
	const { user } = useAuthStore();
	const screens = Grid.useBreakpoint();
	const isSmallScreen = !screens.md;
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { token } = antdTheme.useToken();

	const handleNavigation = useCallback(
		(pageName) => {
			const routeMap = {
				// Keep route map localized here or move to constants
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
				appointments: "/appointments",
				dashboard: "/dashboard",
				home: "/",
				"about us": "/about-us", // Added about us
			};
			const normalizedPageName = pageName.toLowerCase();
			const route = routeMap[normalizedPageName];

			if (route) {
				navigate(route);
				notification.success({
					message: t("navigating"),
					description: `${t("navigating_to")} ${t(normalizedPageName.replace(/ /g, "_"))}`,
				});
			} else {
				notification.error({
					message: t("navigation_error"),
					description: `${t("could_not_find_page")} "${pageName}".`,
				});
			}
		},
		[navigate, t]
	);

	return (
		<>
			<Space align="center">
				<RouterLink to={user ? "/dashboard" : "/"}>
					{" "}
					{/* Link logo to dashboard or home */}
					<LogoImage src="/logo.png" alt="Logo" />
				</RouterLink>
				{!isSmallScreen && (
					<Button
						type="text"
						icon={<MenuOutlined />}
						onClick={onDesktopToggle}
						aria-label={t("toggle_sidebar")}
						style={{ color: token.colorText }}
					/>
				)}
			</Space>

			<Space align="center" size="middle">
				<VoiceNavigation onNavigate={handleNavigation} />

				{user ? (
					<RouterLink to="/profile">
						<Avatar
							size={isSmallScreen ? 32 : 40}
							src={user.profilePictureURL ? transformImageUrl(user.profilePictureURL) : undefined}
							icon={!user.profilePictureURL ? <UserOutlined /> : undefined}
							style={{
								cursor: "pointer",
								border: `2px solid ${token.colorBorder}`,
							}}>
							{/* Fallback to initials if no icon/image */}
							{!user.profilePictureURL && user.username ? user.username[0].toUpperCase() : null}
						</Avatar>
					</RouterLink>
				) : (
					!isSmallScreen && ( // Show login/register only if logged out and not on small screen
						<>
							<RouterLink to="/login">
								<Button icon={<LoginOutlined />}>{t("login")}</Button>
							</RouterLink>
							<RouterLink to="/register">
								<Button type="primary" icon={<UserAddOutlined />}>
									{t("register")}
								</Button>
							</RouterLink>
						</>
					)
					// Optionally add a generic avatar or login icon for small screens when logged out
					// <Avatar size={isSmallScreen ? 32 : 40} icon={<UserOutlined />} />
				)}

				{/* Mobile Toggle - Use CSS for display */}
				<MobileMenuButton
					type="text"
					icon={<MenuOutlined />}
					onClick={onMobileToggle}
					aria-label={t("toggle_mobile_menu")}
					style={{ color: token.colorText }}
				/>
			</Space>
		</>
	);
});

// --- AppLayout Component ---
const AppLayout = React.memo(({ children, direction, language, componentSize }) => {
	const { user } = useAuthStore(); // Needed for conditional rendering/logic potentially
	const [mobileOpen, setMobileOpen] = useState(false);
	const [desktopCollapsed, setDesktopCollapsed] = useState(false); // Renamed for clarity
	const { t } = useTranslation();
	const location = useLocation();
	const screens = Grid.useBreakpoint();
	const isSmallScreen = !screens.md;
	const { token } = antdTheme.useToken(); // Access theme tokens

	const handleMobileToggle = useCallback(() => {
		setMobileOpen((prev) => !prev);
	}, []);

	const handleDesktopToggle = useCallback(() => {
		setDesktopCollapsed((prev) => !prev);
	}, []);

	const breadcrumbItems = useMemo(() => {
		const pathSegments = location.pathname.split("/").filter(Boolean);
		const items = [{ title: <RouterLink to="/">{t("home")}</RouterLink> }]; // Start with Home
		pathSegments.forEach((segment, index) => {
			const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
			const labelKey = segment.replace(/-/g, "_"); // Key for t()
			// Avoid linking the last segment (current page)
			const isLast = index === pathSegments.length - 1;
			items.push({
				title: isLast ? t(labelKey) : <RouterLink to={path}>{t(labelKey)}</RouterLink>,
			});
		});
		return items;
	}, [location.pathname, t]);

	return (
		<StyledLayout>
			{/* Pass theme object directly to styled header */}
			<StyledHeader theme={{ token }}>
				<HeaderContent onDesktopToggle={handleDesktopToggle} onMobileToggle={handleMobileToggle} />
			</StyledHeader>
			<Layout>
				{!isSmallScreen && ( // Render Sider only on larger screens
					<StyledSider
						theme={{ token }} // Pass theme object
						width={250}
						collapsible
						collapsed={desktopCollapsed}
						onCollapse={handleDesktopToggle}
						trigger={null} // Use custom button in header now
						breakpoint="md" // Antd internal handling (optional but good practice)
						collapsedWidth={80} // Standard collapsed width
					>
						<NavigationMenu onClose={() => {}} isMobile={false} collapsed={desktopCollapsed} />
					</StyledSider>
				)}
				<StyledDrawer
					theme={{ token }} // Pass theme object
					title={t("menu")}
					placement={direction === "rtl" ? "right" : "left"}
					onClose={handleMobileToggle}
					open={mobileOpen && isSmallScreen} // Ensure drawer only opens on small screens
					// No need for explicit width style if using class default
					bodyStyle={{ padding: 0 }}
					headerStyle={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
					<NavigationMenu onClose={handleMobileToggle} isMobile={true} collapsed={false} />
				</StyledDrawer>

				<Layout style={{ padding: "0", overflowX: "hidden" }}>
					{" "}
					{/* Prevent horizontal scroll on main layout */}
					<StyledContent theme={{ token }}>
						{/* Breadcrumb only if not on dashboard/home */}
						{location.pathname !== "/" && location.pathname !== "/dashboard" && breadcrumbItems.length > 1 && (
							<Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
						)}
						{/* TransitionGroup wraps the Routes content */}
						<TransitionGroup component={null}>
							{/* CSSTransition needs a unique key, pathname is good */}
							<CSSTransition key={location.pathname} classNames="fade" timeout={300}>
								{/* This inner div is required for CSSTransition to track */}
								<div>
									{children} {/* Render the matched route component */}
								</div>
							</CSSTransition>
						</TransitionGroup>
					</StyledContent>
					<StyledFooter theme={{ token }}>
						© {new Date().getFullYear()} GMTS Hospital Model. {t("all_rights_reserved")} |{" "}
						<RouterLink to="/about-us" style={{ color: token.colorPrimary }}>
							{t("about_us")}
						</RouterLink>
					</StyledFooter>
				</Layout>
			</Layout>
		</StyledLayout>
	);
});

// --- SettingsDrawer Component ---
const SettingsDrawer = React.memo(
	({ visible, onClose, language, onLanguageChange, theme, onThemeChange, size, onSizeChange, languageOptions, themeOptions }) => {
		const { t } = useTranslation();

		return (
			<Drawer title={t("settings")} placement="right" onClose={onClose} open={visible} width={300}>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<Space direction="vertical" style={{ width: "100%" }}>
						<label htmlFor="language-select">{t("language")}:</label>
						<Select
							id="language-select"
							value={language}
							options={languageOptions}
							onChange={onLanguageChange}
							style={{ width: "100%" }}
						/>
					</Space>

					<Space direction="vertical" style={{ width: "100%" }}>
						<label htmlFor="theme-select">{t("theme")}:</label>
						<Select id="theme-select" value={theme} options={themeOptions} onChange={onThemeChange} style={{ width: "100%" }} />
					</Space>

					<Space direction="vertical" style={{ width: "100%" }}>
						<label>{t("size")}:</label>
						<Radio.Group value={size} onChange={onSizeChange}>
							<Radio.Button value="small">{t("small")}</Radio.Button>
							<Radio.Button value="middle">{t("middle")}</Radio.Button>
							<Radio.Button value="large">{t("large")}</Radio.Button>
						</Radio.Group>
					</Space>
				</Space>
			</Drawer>
		);
	}
);

// --- Main App Component ---
const App = () => {
	const [direction, setDirection] = useState("ltr");
	const [language, setLanguage] = useState("en");
	const [selectedTheme, setSelectedTheme] = useState("light"); // e.g., 'light', 'dark', 'blue_dark', 'dark_killer'
	const [componentSize, setComponentSize] = useState("middle");
	const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
	const { i18n, t } = useTranslation();

	// --- Theme & Language Options ---
	const themeOptions = useMemo(
		() => [
			...Object.keys(colorTokens).map((name) => ({ value: name, label: t(`theme_${name}`) || name })), // Translate theme names
			{ value: "dark_killer", label: t("theme_dark_killer") || "Dark Killer" },
		],
		[t]
	); // Depend on t for translations

	const languageOptions = useMemo(
		() => [
			{ value: "en", label: "English" },
			{ value: "fa", label: "فارسی" },
			{ value: "ar", label: "العربية" },
		],
		[]
	);

	// --- Ant Design Locale ---
	const antdLocale = useMemo(() => {
		switch (language) {
			case "fa":
				return faIR;
			case "ar":
				return arEG;
			default:
				return enUS;
		}
	}, [language]);

	// --- Calculate Ant Design Theme Config ---
	const antDesignTheme = useMemo(() => {
		if (selectedTheme === "dark_killer" || !colorTokens[selectedTheme]) {
			return {}; // Return empty for complex or invalid themes handled separately
		}
		const currentTokens = colorTokens[selectedTheme];
		const isSystemDark = currentTokens.Button.algorithm; // Infer if it's a dark variant
		return {
			// Use array for dark themes to leverage darkAlgorithm
			algorithm: isSystemDark ? [defaultAlgorithm, darkAlgorithm] : defaultAlgorithm,
			token: {
				colorPrimary: currentTokens.primaryColor,
				colorSuccess: currentTokens.successColor,
				colorWarning: currentTokens.warningColor,
				colorError: currentTokens.errorColor,
				colorInfo: currentTokens.infoColor,
				colorBgLayout: currentTokens.backgroundColor, // Map background
				colorBgContainer: currentTokens.paperColor, // Map container/paper bg
				colorTextBase: currentTokens.textColor, // Map base text color
				colorBorder: currentTokens.borderColor, // Map border color
				colorBorderSecondary: currentTokens.dividerColor, // Map divider/secondary border
				borderRadius: 6,
				// Add more token mappings as needed
			},
			components: {
				// Component-specific overrides
				Button: {
					colorPrimary: currentTokens.Button.colorPrimary,
					algorithm: currentTokens.Button.algorithm, // Needed for button hover/active states
					// Add other button overrides if necessary
				},
				// Add other component overrides...
				Layout: {
					// Ensure Sider background uses theme
					sider: {
						colorBgLayout: currentTokens.backgroundColor,
					},
					header: {
						colorBgHeader: currentTokens.paperColor, // Header background
						colorHeaderTitle: currentTokens.textColor,
					},
					footer: {
						colorBgFooter: currentTokens.backgroundColor,
						colorTextFooter: currentTokens.textColor,
					},
				},
				Menu: {
					// colorItemBg: 'transparent', // Already handled by StyledSider/Drawer?
					colorItemText: currentTokens.textColor, // Base text color
					colorItemTextHover: currentTokens.primaryColor, // Hover text
					colorItemTextSelected: currentTokens.primaryColor, // Selected text
					colorActiveBarHeight: 3,
					colorActiveBarWidth: 0, // Remove underline/bar if not needed
					colorItemBgSelected: isSystemDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.04)", // Adjust selected bg
					// Dark theme specific overrides if needed
					...(isSystemDark
						? {
								colorItemText: "rgba(255, 255, 255, 0.75)",
								colorItemTextHover: "#ffffff",
								colorItemTextSelected: "#ffffff", // Often same as hover in dark
								colorSubmenuArrow: "rgba(255, 255, 255, 0.75)",
						  }
						: {}),
				},
			},
		};
	}, [selectedTheme]);

	// --- Event Handlers ---
	const handleThemeSelectChange = useCallback((value) => {
		setSelectedTheme(value);
	}, []);

	const handleLanguageChange = useCallback(
		(value) => {
			setLanguage(value);
			i18n.changeLanguage(value);
			const newDirection = value === "ar" || value === "fa" ? "rtl" : "ltr";
			setDirection(newDirection);
			// Optionally update document direction
			document.documentElement.dir = newDirection;
			document.documentElement.lang = value;
		},
		[i18n]
	); // Added i18n dependency

	useEffect(() => {
		// Set initial direction and lang on mount
		const initialDirection = language === "ar" || language === "fa" ? "rtl" : "ltr";
		document.documentElement.dir = initialDirection;
		document.documentElement.lang = language;
	}, []); // Run only once on mount

	const handleComponentSizeChange = useCallback((e) => {
		setComponentSize(e.target.value);
	}, []);

	const toggleSettingsDrawer = useCallback(() => {
		setSettingsDrawerVisible((prev) => !prev);
	}, []);

	// --- Settings Button Style (Dynamic based on theme) ---
	const settingsButtonStyles = useMemo(() => {
		let colors = {
			primary: "#1677ff",
			text: "rgba(0, 0, 0, 0.88)",
			background: "#ffffff",
			paper: "#ffffff",
		};

		if (selectedTheme === "dark_killer") {
			colors = {
				primary: darkKillerTheme.token.colorPrimary,
				text: darkKillerTheme.token.colorTextBase,
				background: darkKillerTheme.token.colorBgBase,
				paper: darkKillerTheme.token.colorBgBase, // Assuming paper is same as base bg
			};
		} else if (colorTokens[selectedTheme]) {
			const themeTokens = colorTokens[selectedTheme];
			colors = {
				primary: themeTokens.primaryColor,
				text: themeTokens.textColor,
				background: themeTokens.backgroundColor,
				paper: themeTokens.paperColor,
			};
		}

		// Simplified style object - adjust as needed for specific button look
		return {
			"--setting-btn-bg": colors.paper,
			"--setting-btn-text": colors.primary,
			"--setting-btn-border": colors.primary,
			"--setting-btn-hover-bg": colors.primary,
			"--setting-btn-hover-text": colors.paper, // Or text color depending on contrast needs
		};
	}, [selectedTheme]);

	// --- Determine Theme Provider and Config ---
	const ThemeProviderComponent = selectedTheme === "dark_killer" ? ComplexThemeProvider : ConfigProvider;
	const themeConfig = selectedTheme === "dark_killer" ? { theme: darkKillerTheme } : { theme: antDesignTheme };

	return (
		<AppWrapper>
			{/* Inject global styles and dynamic button styles */}
			<style>{`
                :root {
                    ${Object.entries(settingsButtonStyles)
						.map(([key, value]) => `${key}: ${value};`)
						.join("\n")}
                }
                .settings-button {
                    background-color: var(--setting-btn-bg);
                    color: var(--setting-btn-text);
                    border-color: var(--setting-btn-border);
                    transition: background-color 0.3s, color 0.3s, border-color 0.3s;
                }
                 .settings-button:hover {
                    background-color: var(--setting-btn-hover-bg) !important;
                    color: var(--setting-btn-hover-text) !important;
                    border-color: var(--setting-btn-hover-bg) !important;
                 }

            `}</style>
			<Router>
				<ThemeProviderComponent
					direction={direction}
					locale={antdLocale}
					componentSize={componentSize}
					{...themeConfig} // Spread the calculated theme config
				>
					{/* Pass state down to AppLayout */}
					<AppLayout direction={direction} language={language} componentSize={componentSize}>
						{/* Routes are rendered as children of AppLayout */}
						<Routes>
							{/* Define base routes */}
							<Route path="/" element={<AllFeaturesPage />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/about-us" element={<AboutUs />} />

							{/* Private / Authenticated Routes */}
							<Route
								path="/dashboard"
								element={
									<PrivateRoute>
										<Dashboard />
									</PrivateRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<PrivateRoute>
										<Profile />
									</PrivateRoute>
								}
							/>
							<Route
								path="/patients"
								element={
									<PrivateRoute permissions={["READ_PATIENT"]}>
										<PatientList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/patients/:id"
								element={
									<PrivateRoute permissions={["READ_PATIENT"]}>
										<PatientDetails />
									</PrivateRoute>
								}
							/>
							<Route
								path="/appointments"
								element={
									<PrivateRoute permissions={["READ_APPOINTMENT"]}>
										<AppointmentsPage />
									</PrivateRoute>
								}
							/>
							<Route
								path="/activities"
								element={
									<PrivateRoute permissions={["READ_USER_ACTIVITY"]}>
										<ActivityPage />
									</PrivateRoute>
								}
							/>
							<Route
								path="/procedures"
								element={
									<PrivateRoute permissions={["READ_PROCEDURE"]}>
										<ProcedureList />
									</PrivateRoute>
								}
							/>
							{/* <Route path="/vital-signs" element={<PrivateRoute>...</PrivateRoute>} /> */}
							{/* <Route path="/assessments" element={<PrivateRoute>...</PrivateRoute>} /> */}
							<Route
								path="/procedure-logs"
								element={
									<PrivateRoute permissions={["READ_PROCEDURE_LOG"]}>
										<ProcedureLogList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/units"
								element={
									<PrivateRoute permissions={["READ_UNIT"]}>
										<UnitList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/rooms"
								element={
									<PrivateRoute permissions={["READ_ROOM"]}>
										<RoomList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/beds"
								element={
									<PrivateRoute permissions={["READ_BED"]}>
										<BedList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/admissions"
								element={
									<PrivateRoute permissions={["READ_ADMISSION"]}>
										<AdmissionList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/users"
								element={
									<PrivateRoute permissions={["READ_USER"]}>
										<UserList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/medications"
								element={
									<PrivateRoute permissions={["READ_MEDICATION"]}>
										<MedicationList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/prescriptions"
								element={
									<PrivateRoute permissions={["READ_PRESCRIPTION"]}>
										<PrescriptionList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/medication-administrations"
								element={
									<PrivateRoute permissions={["READ_MEDICATION_ADMINISTRATION"]}>
										<MedicationAdministrationList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/product-usages"
								element={
									<PrivateRoute permissions={["READ_PATIENT_PRODUCT_USAGE"]}>
										<PatientProductUsageList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/products"
								element={
									<PrivateRoute permissions={["READ_PRODUCT"]}>
										<ProductList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/billings"
								element={
									<PrivateRoute permissions={["READ_BILLING"]}>
										<BillingPage />
									</PrivateRoute>
								}
							/>
							<Route
								path="/image-reports"
								element={
									<PrivateRoute permissions={["READ_IMAGE_REPORT"]}>
										<ImageReportList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/image-report-types"
								element={
									<PrivateRoute permissions={["READ_IMAGE_REPORT_TYPE"]}>
										<ImageReportTypeList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/documents"
								element={
									<PrivateRoute permissions={["READ_DOCUMENT"]}>
										<DocumentList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/document-types"
								element={
									<PrivateRoute permissions={["READ_DOCUMENT_TYPE"]}>
										<DocumentTypeList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/lab-tests"
								element={
									<PrivateRoute permissions={["READ_LAB_TEST"]}>
										<LabTestList />
									</PrivateRoute>
								}
							/>
							<Route
								path="/lab-results"
								element={
									<PrivateRoute permissions={["READ_LAB_RESULT"]}>
										<LabResultPage />
									</PrivateRoute>
								}
							/>
							<Route
								path="/all-features"
								element={
									<PrivateRoute>
										<AllFeaturesPage />
									</PrivateRoute>
								}
							/>
							<Route
								path="/roles-permissions"
								element={
									<PrivateRoute permissions={["MANAGE_PERMISSIONS", "MANAGE_ROLES"]}>
										<RoleAndPermissionManagement />
									</PrivateRoute>
								}
							/>
							{/* Add other routes from appRoutes if they aren't covered above */}
							{/* Example:
                            {appRoutes.map((route, index) => (
                                <Route key={index} path={route.path} element={route.element} />
                            ))}
                            */}

							{/* Catch-all or 404 route (optional) */}
							{/* <Route path="*" element={<NotFoundPage />} /> */}
						</Routes>
					</AppLayout>
				</ThemeProviderComponent>
			</Router>

			{/* Settings Drawer and Toggle Button */}
			<SettingsDrawer
				visible={settingsDrawerVisible}
				onClose={toggleSettingsDrawer}
				language={language}
				onLanguageChange={handleLanguageChange}
				theme={selectedTheme}
				onThemeChange={handleThemeSelectChange}
				size={componentSize}
				onSizeChange={handleComponentSizeChange}
				languageOptions={languageOptions}
				themeOptions={themeOptions}
			/>

			<Button
				className="settings-button" // Apply dynamic styles via class
				type="primary" // Base type, styling overridden by CSS vars
				shape="circle"
				icon={<SettingOutlined />}
				size="large"
				onClick={toggleSettingsDrawer}
				aria-label={t("settings")}
				style={{
					position: "fixed",
					bottom: 20,
					right: direction === "ltr" ? 20 : "auto",
					left: direction === "rtl" ? 20 : "auto",
					zIndex: 1002, // Ensure above header/content
					boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
				}}
			/>
		</AppWrapper>
	);
};

export { g2Themes };

export default App;
