// In your App.js file: (This is the main file)
import React, { useState, useMemo, useCallback } from "react";
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
	Tooltip,
	Typography,
	Grid,
	Input,
	Card,
	notification,
	Avatar, // Import Avatar
} from "antd";
import ImageReportList from "./components/imageReports/ImageReportList";
import LabTestList from "./components/lab/LabTestList";
import LabResultPage from "./components/lab/LabResultPage";
import { appRoutes } from "./routes"; // Import appRoutes
import Dashboard from "./components/dashboard/Dashboard"; //
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
import RoleAndPermissionManagement from "./components/auth/RoleAndPermissionManagement"; // Import
// Import necessary Ant Design icons
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
import VoiceNavigation from "./VoiceNavigation"; // Import the new component
import { Chart } from "@antv/g2"; // Import Chart from G2

const { Header, Content, Footer, Sider } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antdTheme;
const { useBreakpoint } = Grid;
const { Search } = Input;

// Animation for content transitions
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AnimatedContent = styled(Content)`
	margin: 16px;
	padding: 24px;
	min-height: 280px;
	background: #fff;
	animation: ${fadeIn} 0.3s ease-out;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	border-radius: 8px;
	transition: all 0.2s;
	overflow-x: hidden;

	${({ isDarkMode, theme }) =>
		isDarkMode &&
		css`
			background: #303030;
			box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
		`}
`;

const LogoImage = styled.img`
	width: 120px;
	max-height: 64px;
	margin-right: 1.5rem;
	display: block;
`;

const StyledHeader = styled(Header)`
	padding: 0 24px;
	background: #fff;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

	${({ isDarkMode }) =>
		isDarkMode &&
		css`
			background: #1f1f1f;
			box-shadow: 0 2px 4px rgba(255, 255, 255, 0.05);
		`}
`;

const StyledSider = styled(Sider)`
	display: block;
	transition: all 0.2s;
	background-color: #fff; /* Default light mode background */
	box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05); /* Default light mode box-shadow */

	${({ isDarkMode }) =>
		isDarkMode &&
		css`
			background-color: #1f1f1f; /* Dark mode background */
			box-shadow: 2px 0 4px rgba(255, 255, 255, 0.05); /* Dark mode box-shadow */
		`}
`;

const StyledDrawer = styled(Drawer)`
	.ant-drawer-content-wrapper {
		background-color: #fff;
	}
`;

const StyledFooter = styled(Footer)`
	text-align: center;
	background: #fafafa;
	border-top: 1px solid #e8e8e8;
	color: inherit;

	${({ isDarkMode }) =>
		isDarkMode &&
		css`
			background: #1f1f1f;
			border-top: 1px solid #424242;
			color: #fff;
		`}
`;

const DashboardCard = styled(Card)`
	margin-bottom: 16px;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	transition: all 0.3s;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
		backgroundColor: "#fff",
		textColor: "#fff",
		borderColor: "#95de64",
		paperColor: "#303030", // Consistent dark paper
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

// G2 Theme Definitions.  Make sure these align with your colorTokens.
const g2Themes = {
	light: {
		type: "light", // Use the built-in light theme as a base
		// You can override specific parts:
		color: colorTokens.light.primaryColor, // Example: Use primary color for series
		viewFill: colorTokens.light.backgroundColor,
	},
	dark: {
		type: "classicDark", // Use built-in dark theme
		color: colorTokens.dark.primaryColor,
		viewFill: colorTokens.dark.backgroundColor,
	},
	green: {
		type: "light",
		color: colorTokens.green.primaryColor, // Adjust as needed
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

	// Add more themes as needed
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
			return <MedicineBoxTwoTone style={iconStyle} />; // Already TwoTone
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
			return <ExperimentTwoTone style={iconStyle} />; // Already TwoTone
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

const NavigationMenu = ({ onClose, isMobile, collapsed }) => {
	const { user, hasAuthority } = useAuthStore();
	const [openKeys, setOpenKeys] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();

	const handleMenuItemClick = (path) => {
		navigate(path);
		if (isMobile) {
			onClose();
		}
	};

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
		console.log("Current user:", user); // Log the user object
		const baseItems = [
			{ label: "Login", path: "/login", show: true, category: "Authentications" },
			{ label: "Register", path: "/register", show: true, category: "Authentications" },
		];

		const loggedInItems = user ? [{ label: "Profile", path: "/profile", show: true, category: "Authentications" }] : [];

		const permissionBasedItems = Object.entries(menuPermissions)
			.filter(([path, permissions]) => {
				console.log(`Checking path: ${path}, required permissions:`, permissions);

				if (permissions.length === 0) {
					console.log(`Path ${path} has no permissions, showing.`);
					return true; // Always show if no permissions are required
				}
				if (!user) {
					console.log(`No user logged in, hiding path ${path}.`);
					return false; // No user, hide the item
				}

				// Check hasAuthority for EACH permission and log the result
				const hasPermission = permissions.some((permission) => {
					const result = hasAuthority(permission);
					console.log(`Checking permission ${permission}, result: ${result}`);
					return result;
				});

				console.log(`Final decision for ${path}: ${hasPermission}`);
				return hasPermission;
			})
			.map(([path, _]) => {
				// Extract label from path (customize as needed)
				const label = path
					.split("/")
					.pop()
					.replace(/-/g, " ")
					.replace(/^\w/, (c) => c.toUpperCase());
				let category = "Other"; // Default category

				// Categorize based on path (you can refine this)
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

	// Filter menu items based on search term
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

	return (
		<>
			{isMobile ? null : (
				<Search placeholder="Search features" onChange={(e) => handleSearch(e.target.value)} style={{ width: "100%", marginBottom: 16 }} />
			)}

			<AntMenu
				mode={isMobile ? "vertical" : "inline"}
				openKeys={openKeys}
				onOpenChange={onOpenChange}
				style={{ borderRight: 0, height: "100%" }}
				inlineCollapsed={collapsed}>
				{Object.entries(filteredMenuItems).map(([category, items], index) => (
					<AntMenu.SubMenu key={index} title={category}>
						{items.map((menuItem) => {
							const icon = getMenuIcon(menuItem.path);
							return (
								<AntMenu.Item key={menuItem.label} onClick={() => handleMenuItemClick(menuItem.path)}>
									<span style={{ display: "flex", alignItems: "center" }}>
										{icon}
										<span style={{ marginLeft: 8 }}>{menuItem.label}</span>
									</span>
								</AntMenu.Item>
							);
						})}
					</AntMenu.SubMenu>
				))}
			</AntMenu>
		</>
	);
};

// Placeholder for Dashboard Cards (Replace with actual components)
const AppContent = ({ children, colorMode, setColorMode }) => {
	// Receive setColorMode
	const { user } = useAuthStore();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [desktopOpen, setDesktopOpen] = useState(false); // Initially Collapsed
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

	const handleNavigation = useCallback(
		(pageName) => {
			// Corrected mapping of voice command to route (case-insensitive and trimmed)
			const routeMap = {
				login: "/login", // Lowercase keys
				register: "/register",
				profile: "/profile",
				patients: "/patients",
				activities: "/activities",
				procedures: "/procedures",
				"vital signs": "/vital-signs", // Include spaces
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

			const normalizedPageName = pageName.toLowerCase(); // Convert to lowercase
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
		setColorMode(value); // Update colorMode in App
	};

	return (
		<ConfigProvider theme={antDesignTheme}>
			<Layout style={{ minHeight: "100vh" }}>
				<StyledHeader isDarkMode={isDarkMode}>
					<div style={{ display: "flex", alignItems: "center" }}>
						<LogoImage src="/logo.png" alt="Logo" />
						{!isSmallScreen && (
							<Button
								type="text"
								icon={<MenuOutlined />}
								onClick={handleDesktopDrawerToggle}
								aria-label="Toggle Sidebar"
								style={{ marginLeft: "-8px" }}
							/>
						)}
					</div>

					<Button
						type="text"
						icon={<MenuOutlined />}
						onClick={handleDrawerToggle}
						style={{ display: isSmallScreen ? "block" : "none" }}
						aria-label="Toggle Mobile Menu"
					/>

					<div style={{ display: "flex", alignItems: "center" }}>
						<VoiceNavigation onNavigate={handleNavigation} />
						<Select
							defaultValue="light"
							style={{ width: 120, marginRight: 16 }}
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
						{/* User Avatar and Link to Profile */}
						{user ? (
							<RouterLink to="/profile">
								<Avatar
									size={40}
									src={user.profilePictureURL ? transformImageUrl(user.profilePictureURL) : null}
									icon={!user.profilePictureURL ? <UserOutlined /> : null}
									style={{
										marginLeft: 16,
										cursor: "pointer",
										objectFit: "cover",
										border: "2px solid #ddd",
										borderColor: isDarkMode ? "#fff" : "snow",
									}}
								/>
							</RouterLink>
						) : (
							<Avatar size={40} icon={<UserOutlined />} style={{ marginLeft: 16 }} />
						)}
					</div>
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
						<AnimatedContent key={location.pathname} isDarkMode={isDarkMode}>
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
							{children}
						</AnimatedContent>
						<StyledFooter isDarkMode={isDarkMode}>
							© 2023 GMTS Hospital Model. All rights reserved. |{" "}
							<RouterLink to="/about-us" style={{ color: "inherit" }}>
								About Us
							</RouterLink>
						</StyledFooter>
					</Layout>
				</Layout>
			</Layout>
		</ConfigProvider>
	);
};

const App = () => {
	const [colorMode, setColorMode] = useState("green_dark"); // Add state for colorMode
	const isDarkMode = colorMode.endsWith("dark"); // Determine if it's dark mode

	// IMPORTANT:  Pass the setColorMode function down to AppContent
	//            so that it can be updated when the Select changes.
	return (
		<Router>
			<AppContent colorMode={colorMode} setColorMode={setColorMode}>
				<Routes>
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
			</AppContent>
		</Router>
	);
};

export default App;
