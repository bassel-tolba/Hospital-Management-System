// App.js

// --- Core React/Router Imports ---
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
// Animation imports removed

// --- State Management & Services ---
import { useAuthStore } from "./services/auth.service";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
import axios from "axios";

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
	// Card,
	notification,
	Avatar,
	Radio,
	Divider,
	Typography,
} from "antd";
import {
	MenuOutlined,
	SettingOutlined,
	// BulbOutlined, // Keep if used elsewhere, not directly in menu icons below
	// LockOutlined, // Keep if used elsewhere
	HeartOutlined,
	// ShoppingCartOutlined, // Keep if used elsewhere
	LoginOutlined,
	UserAddOutlined,
	UserOutlined,
	TeamOutlined,
	CalendarOutlined,
	MedicineBoxOutlined,
	InfoCircleOutlined,
	MonitorOutlined,
	FileTextOutlined,
	SaveOutlined,
	AppstoreOutlined,
	HomeOutlined,
	RestOutlined,
	SolutionOutlined,
	UsergroupAddOutlined,
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
	ApiOutlined,
} from "@ant-design/icons";
import enUS from "antd/es/locale/en_US";
import faIR from "antd/es/locale/fa_IR";
import arEG from "antd/es/locale/ar_EG";
import "antd/dist/reset.css";

// --- Styling Imports ---
import styled /* { keyframes, css } */ from "styled-components"; // keyframes, css might be unused now

// --- Components & Pages ---
// (Keep necessary imports based on routes.js and components used in App.js structure)
import Profile from "./components/auth/Profile";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PatientList from "./components/patients/PatientList";
// ... other page/component imports ...
import AboutUs from "./components/AboutUs";
import VoiceNavigation from "./VoiceNavigation";
import Dashboard from "./components/dashboard/Dashboard"; // Keep dashboard import

// --- Routes & Config ---
import { appRoutes } from "./routes";
import { colorTokens, darkKillerTheme, ComplexThemeProvider, g2Themes } from "./themeConfig";

// --- Constants ---
const { Header, Content, Footer, Sider } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antdTheme;
const { useBreakpoint } = Grid;
const { Search } = Input;
const { Text } = Typography;
const GEMINI_API_CONFIG_URL = `http://localhost:8080/api/gemini/configure-key`;

// --- Styled Components --- (No changes needed here)
const AppWrapper = styled.div`
	min-height: 100vh;
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
`;
const StyledLayout = styled(Layout)`
	min-height: 100vh;
`;
const StyledContent = styled(Content)`
	margin: 12px;
	padding: 16px;
	min-height: 280px;
	border-radius: 8px;
	transition: box-shadow 0.3s ease;
	z-index: 2;
	flex: 1;
	background-color: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"};
	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	@media (max-width: 768px) {
		margin: 8px;
		padding: 12px;
	}
	/* Removed fade animation classes */
`;
const LogoImage = styled.img`
	height: 40px;
	width: auto;
	margin-right: 1rem;
	vertical-align: middle;
	@media (max-width: 576px) {
		height: 32px;
		margin-right: 0.5rem;
	}
`;
const StyledHeader = styled(Header)`
	position: sticky;
	top: 0;
	z-index: 1001;
	transition: background-color 0.3s ease, box-shadow 0.3s ease;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-inline: 1rem;
	background-color: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"};
	border-bottom: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "#f0f0f0"};
	@media (max-width: 768px) {
		padding-inline: 0.75rem;
	}
`;
const StyledSider = styled(Sider)`
	background: ${(props) => props.theme?.token?.colorBgLayout || "#001529"} !important;
	height: 100vh;
	position: sticky !important;
	top: 0;
	overflow: auto;
	.ant-menu {
		background: transparent;
		border-right: none !important;
	}
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
	.ant-layout-sider-trigger {
		background: ${(props) => props.theme?.token?.colorBgContainer};
		color: ${(props) => props.theme?.token?.colorText};
	}
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
	scrollbar-width: thin;
	scrollbar-color: ${(props) => `${props.theme?.token?.colorBorder || "#d9d9d9"} ${props.theme?.token?.colorBgContainer || "#f0f0f0"}`};
`;
const MobileMenuButton = styled(Button)`
	display: none;
	@media (max-width: 767px) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
	}
`;
const StyledDrawer = styled(Drawer)`
	/* Default width for larger screens (optional, could rely on prop) */
	/* width: 500px; // Example default */

	/* Styles for mobile */
	@media (max-width: 767px) {
		// Adjust breakpoint as needed
		/* Target the root drawer element for width */
		&.ant-drawer {
			// Use the actual class antd applies to the root
			width: 85% !important; // Override width for mobile
			// or width: 100% !important;
		}

		/* Adjust menu item width for smaller drawer if needed */
		.ant-menu-item,
		.ant-menu-submenu-title {
			width: 90%; /* Maybe make menu items wider % inside the narrower drawer */
			margin-left: 5%;
			margin-right: 5%;
		}
	}

	// --- Your existing styles ---
	.ant-drawer-content {
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
		scrollbar-width: thin;
		scrollbar-color: ${(props) => `${props.theme?.token?.colorBorder || "#d9d9d9"} ${props.theme?.token?.colorBgContainer || "#f0f0f0"}`};
	}
	.ant-menu {
		background: transparent;
		border-right: none !important;
	}
	.ant-menu-item,
	.ant-menu-submenu-title {
		margin: 4px 8px;
		width: 100%; // This might look narrow on mobile, consider adjusting in media query above
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
	background: ${(props) => props.theme?.token?.colorBgLayout || "rgba(0, 0, 0, 0.1)"};
	border-top: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "rgba(255, 255, 255, 0.1)"};
	text-align: center;
	padding: 12px 24px;
	color: ${(props) => props.theme?.token?.colorTextSecondary};
`;

// --- Helper Functions ---
const getMenuIcon = (path) => {
	const iconStyle = { fontSize: "16px", marginRight: "8px" };
	const icons = {
		"/login": <LoginOutlined style={iconStyle} />,
		"/register": <UserAddOutlined style={iconStyle} />,
		"/profile": <UserOutlined style={iconStyle} />,
		"/patients": <TeamOutlined style={iconStyle} />,
		"/appointments": <CalendarOutlined style={iconStyle} />,
		"/activities": <CalendarOutlined style={iconStyle} />, // Consider different icon?
		"/procedures": <MedicineBoxOutlined style={iconStyle} />,
		"/vital-signs": <MonitorOutlined style={iconStyle} />,
		"/assessments": <FileTextOutlined style={iconStyle} />,
		"/procedure-logs": <SaveOutlined style={iconStyle} />,
		"/units": <AppstoreOutlined style={iconStyle} />,
		"/rooms": <HomeOutlined style={iconStyle} />,
		"/beds": <RestOutlined style={iconStyle} />,
		"/admissions": <SolutionOutlined style={iconStyle} />,
		"/users": <UsergroupAddOutlined style={iconStyle} />,
		"/medications": <MedicineBoxTwoTone style={iconStyle} twoToneColor="#faad14" />,
		"/prescriptions": <FileProtectOutlined style={iconStyle} />,
		"/medication-administrations": <ThunderboltOutlined style={iconStyle} />,
		"/product-usages": <BoxPlotOutlined style={iconStyle} />,
		"/products": <ShopOutlined style={iconStyle} />,
		"/billings": <AccountBookOutlined style={iconStyle} />,
		"/image-reports": <FileImageOutlined style={iconStyle} />,
		"/image-report-types": <FileSearchOutlined style={iconStyle} />,
		"/documents": <FolderOutlined style={iconStyle} />,
		"/document-types": <ProfileOutlined style={iconStyle} />,
		"/lab-tests": <ExperimentTwoTone style={iconStyle} twoToneColor="#13c2c2" />,
		"/lab-results": <CheckCircleOutlined style={iconStyle} />,
		"/all-features": <AppstoreOutlined style={iconStyle} />,
		"/roles-permissions": <KeyOutlined style={iconStyle} />,
		"/dashboard": <HeartOutlined style={iconStyle} />,
		"/about-us": <InfoCircleOutlined style={iconStyle} />,
		"/": <HomeOutlined style={iconStyle} />,
	};
	const basePath = path.split("/:")[0];
	return icons[path] || icons[basePath] || <SettingOutlined style={iconStyle} />;
};

const transformImageUrl = (url) => {
	if (!url) return null;
	if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
		return url;
	}
	const baseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
	const imagePath = url.startsWith("/") ? url : `/${url}`;
	return `${baseUrl}${imagePath}`;
};

// --- NavigationMenu Component ---
const NavigationMenu = React.memo(({ onClose, isMobile, collapsed }) => {
	const { user, hasAuthority } = useAuthStore();
	const [openKeys, setOpenKeys] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { token } = antdTheme.useToken();
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

	const menuPermissions = useMemo(
		() => ({
			// Uses route paths as keys
			"/login": [],
			"/register": [],
			"/about-us": [],
			"/all-features": [],
			"/profile": [],
			"/dashboard": ["READ_DASHBOARD"],
			"/patients": ["READ_PATIENT"],
			"/appointments": ["READ_APPOINTMENT"],
			"/activities": ["READ_USER_ACTIVITY"],
			"/procedures": ["READ_PROCEDURE"],
			"/vital-signs": ["READ_VITAL_SIGN"],
			"/assessments": ["READ_ASSESSMENT"],
			"/procedure-logs": ["READ_PROCEDURE_LOG"],
			"/units": ["READ_UNIT"],
			"/rooms": ["READ_ROOM"],
			"/beds": ["READ_BED"],
			"/admissions": ["READ_ADMISSION"],
			"/users": ["READ_USER"],
			"/medications": ["READ_MEDICATION"],
			"/prescriptions": ["READ_PRESCRIPTION"],
			"/medication-administrations": ["READ_MEDICATION_ADMINISTRATION"],
			"/products": ["READ_PRODUCT"],
			"/product-usages": ["READ_PATIENT_PRODUCT_USAGE"],
			"/billings": ["READ_BILLING"],
			"/image-reports": ["READ_IMAGE_REPORT"],
			"/image-report-types": ["READ_IMAGE_REPORT_TYPE"],
			"/documents": ["READ_DOCUMENT"],
			"/document-types": ["READ_DOCUMENT_TYPE"],
			"/lab-tests": ["READ_LAB_TEST"],
			"/lab-results": ["READ_LAB_RESULT"],
			"/roles-permissions": ["MANAGE_PERMISSIONS", "MANAGE_ROLES"],
			"/": [],
		}),
		[]
	);

	const allMenuItems = useMemo(() => {
		return Object.keys(menuPermissions).map((path) => {
			// *** CORRECTED KEY GENERATION: Use path directly (minus slash) as key ***
			// This assumes keys in JSON match path names (e.g., "roles-permissions" for "/roles-permissions")
			let labelKey = path.substring(1); // Remove leading slash
			if (path === "/") labelKey = "home"; // Special case for root

			// --- Permission Logic (Unchanged) ---
			const permissions = menuPermissions[path] || [];
			const isPublicAuth = ["/login", "/register"].includes(path);
			const isGeneralPublic = ["/about-us", "/all-features", "/"].includes(path);
			const needsAuth = !isPublicAuth && !isGeneralPublic;
			let show = false;
			if (isPublicAuth) {
				show = !user;
			} else if (isGeneralPublic) {
				show = path === "/" && user ? false : true;
			} else if (needsAuth && user) {
				show = permissions.length === 0 || permissions.some((p) => hasAuthority(p));
			} else if (path === "/profile" && user) {
				show = true;
			}

			// *** CORRECTED CATEGORY KEYS to match JSON (using hyphens where needed) ***
			let categoryKey = "general"; // Default
			if (["/login", "/register", "/profile"].includes(path)) categoryKey = "authentications"; // Matches JSON key
			else if (["/patients", "/appointments", "/activities", "/procedures", "/vital-signs", "/assessments", "/procedure-logs"].includes(path))
				categoryKey = "patient-management"; // Matches JSON key
			else if (["/units", "/rooms", "/beds", "/admissions", "/users"].includes(path)) categoryKey = "administration"; // Matches JSON key
			else if (["/medications", "/prescriptions", "/medication-administrations"].includes(path))
				categoryKey = "medication-&-orders"; // Matches JSON key
			else if (["/products", "/product-usages", "/billings"].includes(path))
				categoryKey = "inventory-billing"; // Matches JSON key (if this key exists - CHECK YOUR JSON) - otherwise use "billing-&-finance"?
			else if (["/image-reports", "/image-report-types", "/documents", "/document-types", "/lab-tests", "/lab-results"].includes(path))
				categoryKey = "diagnostics-labs-docs"; // Matches JSON key
			else if (["/roles-permissions"].includes(path)) categoryKey = "security"; // Matches JSON key
			else if (["/dashboard"].includes(path)) categoryKey = "dashboard"; // Matches JSON key
			// General category remains for /about-us, /all-features, /

			return { path, labelKey, show, categoryKey };
		});
	}, [user, hasAuthority, menuPermissions]); // Dependencies

	const groupedAndFilteredMenuItems = useMemo(() => {
		const grouped = {};
		allMenuItems
			.filter((item) => item.show)
			.forEach((item) => {
				// *** Use default value in t() function as fallback ***
				const translatedLabel = t(item.labelKey, { defaultValue: item.labelKey.replace(/-/g, " ") }) || item.labelKey.replace(/-/g, " ");
				if (!searchTerm || translatedLabel.toLowerCase().includes(searchTerm.toLowerCase()) || item.path.includes(searchTerm)) {
					const category = item.categoryKey || "other";
					if (!grouped[category]) {
						grouped[category] = [];
					}
					grouped[category].push({ ...item, translatedLabel });
				}
			});

		// *** CORRECTED CATEGORY ORDER KEYS to match JSON/Assigned Keys ***
		const categoryOrder = [
			"dashboard",
			"patient-management",
			"medication-&-orders",
			"inventory-billing", // Ensure inventory-billing is a valid JSON key
			"diagnostics-labs-docs",
			"administration",
			"security",
			"authentications",
			"general",
			"other",
		];

		const sortedCategories = Object.keys(grouped).sort((a, b) => {
			const indexA = categoryOrder.indexOf(a);
			const indexB = categoryOrder.indexOf(b);
			// *** Use default value for category comparison fallback ***
			if (indexA === -1 && indexB === -1) return t(a, { defaultValue: a }).localeCompare(t(b, { defaultValue: b }));
			if (indexA === -1) return 1;
			if (indexB === -1) return -1;
			return indexA - indexB;
		});

		const result = {};
		sortedCategories.forEach((key) => {
			result[key] = grouped[key].sort((a, b) => a.translatedLabel.localeCompare(b.translatedLabel));
		});
		return result;
	}, [allMenuItems, searchTerm, t]);

	const handleSearch = useCallback((e) => {
		setSearchTerm(e.target.value);
	}, []);

	const selectedKeys = useMemo(() => {
		// (Selection Logic unchanged - relies on paths)
		const currentPath = location.pathname;
		let bestMatch = "/";
		let maxMatchLength = 0;

		Object.keys(menuPermissions).forEach((menuPath) => {
			if (menuPath === "/" && currentPath !== "/") return;
			if (currentPath.startsWith(menuPath)) {
				if (menuPath.length > maxMatchLength) {
					maxMatchLength = menuPath.length;
					bestMatch = menuPath;
				}
			}
		});

		if (user && currentPath === "/") {
			// Default to dashboard or profile if logged in on root
			const dashboardItem = allMenuItems.find((item) => item.path === "/dashboard");
			const profileItem = allMenuItems.find((item) => item.path === "/profile");
			if (dashboardItem?.show) return ["/dashboard"];
			if (profileItem?.show) return ["/profile"];
		} else if (currentPath === "/") {
			return ["/"];
		}

		const matchedItem = allMenuItems.find((item) => item.path === bestMatch);
		if (matchedItem && matchedItem.show) {
			return [bestMatch];
		}
		return [currentPath];
	}, [location.pathname, menuPermissions, allMenuItems, user]);

	const renderMenuItem = useCallback(
		(menuItem) => (
			<AntMenu.Item key={menuItem.path} icon={getMenuIcon(menuItem.path)} onClick={() => handleMenuItemClick(menuItem.path)}>
				{menuItem.translatedLabel}
			</AntMenu.Item>
		),
		[handleMenuItemClick] // removed 't' as it's not directly used here anymore
	);

	return (
		<>
			{!isMobile && !collapsed && (
				<Search
					allowClear
					placeholder={t("search-features")} // *** CORRECTED key ***
					onChange={handleSearch}
					value={searchTerm}
					style={{ margin: "16px 8px", width: "calc(100% - 16px)" }}
				/>
			)}
			<AntMenu
				mode={isMobile ? "vertical" : "inline"}
				theme={
					token.Layout?.sider?.colorBgLayout === "#001529" ||
					token.Layout?.sider?.colorBgLayout?.startsWith("rgb(0,") ||
					token.Layout?.sider?.colorBgLayout?.startsWith("#0")
						? "dark"
						: "light"
				}
				openKeys={openKeys}
				onOpenChange={onOpenChange}
				style={{ borderRight: 0, height: collapsed || isMobile ? "100%" : "calc(100% - 60px)", overflowY: "auto", overflowX: "hidden" }}
				inlineCollapsed={!isMobile && collapsed}
				selectedKeys={selectedKeys}>
				{user && groupedAndFilteredMenuItems["dashboard"] && groupedAndFilteredMenuItems["dashboard"].map(renderMenuItem)}

				{Object.entries(groupedAndFilteredMenuItems)
					.filter(([categoryKey]) => categoryKey !== "dashboard")
					.map(([categoryKey, items]) => (
						<AntMenu.SubMenu key={categoryKey} title={t(categoryKey, { defaultValue: categoryKey.replace(/-/g, " ") })}>
							{" "}
							{/* Fallback for category title */}
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
			const routeMap = appRoutes.reduce(
				(acc, route) => {
					// *** Use path itself (minus slash) as potential key ***
					let key = route.path.substring(1);
					if (route.path === "/") key = "home";

					if (key && !acc[key]) {
						// Map variations (hyphenated, spaced if applicable)
						acc[key] = route.path; // e.g., roles-permissions -> /roles-permissions
						acc[key.replace(/-/g, " ")] = route.path; // e.g., roles permissions -> /roles-permissions
					}
					// Add specific singular/plural or common variations
					if (key === "patients") acc["patient"] = route.path;
					if (key === "users") acc["user"] = route.path;

					return acc;
				},
				{
					// Add manual aliases/common commands
					login: "/login",
					register: "/register",
					profile: "/profile",
					dashboard: "/dashboard",
					home: "/",
					about: "/about-us",
					features: "/all-features", // Common aliases
					// Add more specific voice command mappings if needed
				}
			);

			const normalizedPageName = pageName.toLowerCase().trim();
			const route = routeMap[normalizedPageName];

			if (route) {
				navigate(route);
				const routeInfo = appRoutes.find((r) => r.path === route);
				let label = pageName; // Fallback to spoken name
				if (routeInfo) {
					// *** Use path (minus slash) directly as key for translation ***
					let labelKey = routeInfo.path.substring(1);
					if (routeInfo.path === "/") labelKey = "home";
					label = t(labelKey, { defaultValue: labelKey.replace(/-/g, " ") }) || pageName; // Translate, fallback nicely
				}
				notification.success({ message: t("navigating"), description: `${t("navigating-to")} ${label}` });
			} else {
				notification.error({ message: t("navigation-error"), description: `${t("could-not-find-page")} "${pageName}".` });
			}
		},
		[navigate, t] // Keep dependencies
	);

	return (
		// Structure unchanged
		<>
			<Space align="center">
				<RouterLink to={user ? "/dashboard" : "/"}>
					{" "}
					<LogoImage src="/logo.png" alt="Logo" />{" "}
				</RouterLink>
				{!isSmallScreen && user && (
					<Button
						type="text"
						icon={<MenuOutlined />}
						onClick={onDesktopToggle}
						aria-label={t("toggle-sidebar")}
						style={{ color: token.colorText }}
					/>
				)}
			</Space>
			<Space align="center" size="middle">
				<VoiceNavigation onNavigate={handleNavigation} />
				{user ? (
					<RouterLink to="/profile">
						{" "}
						<Avatar
							size={isSmallScreen ? 32 : 40}
							src={user.profilePictureURL ? transformImageUrl(user.profilePictureURL) : undefined}
							icon={!user.profilePictureURL ? <UserOutlined /> : undefined}
							style={{ cursor: "pointer", border: `2px solid ${token.colorBorder}` }}>
							{" "}
							{!user.profilePictureURL && user.username ? user.username[0].toUpperCase() : null}{" "}
						</Avatar>{" "}
					</RouterLink>
				) : (
					!isSmallScreen && (
						<>
							{" "}
							<RouterLink to="/login">
								{" "}
								<Button icon={<LoginOutlined />}>{t("login")}</Button>{" "}
							</RouterLink>{" "}
							<RouterLink to="/register">
								{" "}
								<Button type="primary" icon={<UserAddOutlined />}>
									{" "}
									{t("register")}{" "}
								</Button>{" "}
							</RouterLink>{" "}
						</>
					)
				)}
				<MobileMenuButton
					type="text"
					icon={<MenuOutlined />}
					onClick={onMobileToggle}
					aria-label={t("toggle-mobile-menu")}
					style={{ color: token.colorText }}
				/>
			</Space>
		</>
	);
});

// --- AppLayout Component ---
const AppLayout = React.memo(({ children, direction, language, componentSize }) => {
	const { user } = useAuthStore();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [desktopCollapsed, setDesktopCollapsed] = useState(false);
	const { t } = useTranslation();
	const location = useLocation();
	const screens = Grid.useBreakpoint();
	const isSmallScreen = !screens.md;
	const { token } = antdTheme.useToken();
	// nodeRef removed

	const handleMobileToggle = useCallback(() => {
		setMobileOpen((prev) => !prev);
	}, []);
	const handleDesktopToggle = useCallback(() => {
		setDesktopCollapsed((prev) => !prev);
	}, []);

	const breadcrumbItems = useMemo(() => {
		const pathSegments = location.pathname.split("/").filter(Boolean);
		const rootPath = user ? "/dashboard" : "/";
		const rootLabelKey = user ? "dashboard" : "home";
		const items = [{ title: <RouterLink to={rootPath}>{t(rootLabelKey)}</RouterLink> }]; // t() used for root label

		let currentPath = "";
		pathSegments.forEach((segment, index) => {
			currentPath += `/${segment}`;
			if (user && currentPath === "/dashboard") return; // Don't repeat dashboard

			// *** CORRECTED: Use segment directly as potential key ***
			// Fallback to segment if translation not found
			let labelKey = segment;
			// Attempt to find a route match to potentially use a more accurate base path key
			const routeMatch = appRoutes.find((route) => route.path === currentPath || route.path.split("/:")[0] === currentPath);
			if (routeMatch) {
				// Use the label key derived from the route definition path for consistency
				const pathKey = routeMatch.path.substring(1);
				if (pathKey && pathKey !== labelKey) {
					// Prefer pathKey if it's different and non-empty
					labelKey = pathKey;
				}
			}

			const isLast = index === pathSegments.length - 1;
			// Use default value for t() fallback
			const title = t(labelKey, { defaultValue: segment.replace(/-/g, " ") }); // Use segment if key not found

			const isParamLike = /^\d+$/.test(segment) || /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(segment) || segment.length === 24;

			if (isParamLike && isLast) {
				if (items.length > 0) {
					const lastItem = items[items.length - 1];
					const lastTitle = lastItem.title?.props?.children || lastItem.title;
					items[items.length - 1] = { title: lastTitle };
				}
			} else if (!isParamLike) {
				items.push({
					title: isLast ? title : <RouterLink to={currentPath}>{title}</RouterLink>,
				});
			}
		});

		if (items.length <= 1 || location.pathname === rootPath) return [];
		return items;
	}, [location.pathname, t, user]);

	return (
		// Structure Unchanged, removed animation wrappers
		<StyledLayout>
			<StyledHeader theme={{ token }}>
				{" "}
				<HeaderContent onDesktopToggle={handleDesktopToggle} onMobileToggle={handleMobileToggle} />{" "}
			</StyledHeader>
			<Layout>
				{!isSmallScreen && user && (
					<StyledSider
						theme={{ token }}
						width={250}
						collapsible
						collapsed={desktopCollapsed}
						onCollapse={handleDesktopToggle}
						trigger={null}
						breakpoint="md"
						collapsedWidth={80}>
						{" "}
						<NavigationMenu onClose={() => {}} isMobile={false} collapsed={desktopCollapsed} />{" "}
					</StyledSider>
				)}
				{user && (
					<StyledDrawer
						width={210}
						theme={{ token }}
						title={t("menu")}
						placement={direction === "rtl" ? "right" : "left"}
						onClose={handleMobileToggle}
						open={mobileOpen && isSmallScreen}
						styles={{ body: { padding: 0 }, header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}>
						{" "}
						<NavigationMenu onClose={handleMobileToggle} isMobile={true} collapsed={false} />{" "}
					</StyledDrawer>
				)}

				<Layout style={{ padding: "0", overflowX: "hidden" }}>
					<StyledContent theme={{ token }}>
						{user && location.pathname !== "/dashboard" && location.pathname !== "/" && breadcrumbItems.length > 0 && (
							<Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
						)}
						{/* No TransitionGroup/CSSTransition */}
						<div> {children} </div>
					</StyledContent>
					<StyledFooter theme={{ token }}>
						© {new Date().getFullYear()} GMTS Hospital Model. {t("all-rights-reserved")} {/* CORRECTED key */} |{" "}
						<RouterLink to="/about-us" style={{ color: token.colorPrimary }}>
							{t("about-us")} {/* CORRECTED key */}
						</RouterLink>
					</StyledFooter>
				</Layout>
			</Layout>
		</StyledLayout>
	);
});

// --- SettingsDrawer Component --- (Keys seem ok, assuming gemini_api_key etc are not in provided JSON)
const SettingsDrawer = React.memo(
	({ visible, onClose, language, onLanguageChange, theme, onThemeChange, size, onSizeChange, languageOptions, themeOptions }) => {
		const { t } = useTranslation();
		const hasAuthority = useAuthStore((state) => state.hasAuthority);
		const userToken = useAuthStore((state) => state.token || state.user?.token);

		const [geminiApiKey, setGeminiApiKey] = useState("");
		const [isSaving, setIsSaving] = useState(false);
		const [saveError, setSaveError] = useState(null);

		const canManageApiKey = hasAuthority("MANAGE_GEMINI_API_KEY");

		const handleSaveApiKey = useCallback(async () => {
			if (!geminiApiKey) {
				/* ... error handling ... */ return;
			}
			if (!userToken) {
				/* ... error handling ... */ return;
			}
			setIsSaving(true);
			setSaveError(null);
			try {
				await axios.post(
					GEMINI_API_CONFIG_URL,
					{ apiKey: geminiApiKey },
					{ headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` } }
				);
				notification.success({ message: t("success"), description: t("gemini_api_key_saved") });
			} catch (error) {
				console.error("Error saving Gemini API key:", error);
				const errorMessage = error.response?.data?.message || error.message || t("api_key_save_failed");
				setSaveError(errorMessage);
				notification.error({ message: t("error"), description: errorMessage });
			} finally {
				setIsSaving(false);
			}
		}, [geminiApiKey, userToken, t]); // Keep t dependency

		const handleApiKeyChange = (e) => {
			setGeminiApiKey(e.target.value);
			if (saveError) setSaveError(null);
		};

		return (
			<Drawer title={t("settings")} placement="right" onClose={onClose} open={visible} width={300}>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<Space direction="vertical" style={{ width: "100%" }}>
						{" "}
						<Text>{t("language")}:</Text>{" "}
						<Select
							aria-label={t("language")}
							value={language}
							options={languageOptions}
							onChange={onLanguageChange}
							style={{ width: "100%" }}
						/>{" "}
					</Space>
					<Space direction="vertical" style={{ width: "100%" }}>
						{" "}
						<Text>{t("theme")}:</Text>{" "}
						<Select aria-label={t("theme")} value={theme} options={themeOptions} onChange={onThemeChange} style={{ width: "100%" }} />{" "}
					</Space>
					<Space direction="vertical" style={{ width: "100%" }}>
						{" "}
						<Text>{t("size")}:</Text>{" "}
						<Radio.Group value={size} onChange={onSizeChange}>
							{" "}
							<Radio.Button value="small">{t("small")}</Radio.Button> <Radio.Button value="middle">{t("middle")}</Radio.Button>{" "}
							<Radio.Button value="large">{t("large")}</Radio.Button>{" "}
						</Radio.Group>{" "}
					</Space>
					{canManageApiKey && (
						<>
							<Divider />
							<Space direction="vertical" style={{ width: "100%" }}>
								<Text strong>
									{" "}
									<ApiOutlined /> {t("gemini_api_key")}:
								</Text>{" "}
								{/* Assuming key is gemini_api_key */}
								<Input.Password
									placeholder={t("enter_gemini_api_key")}
									value={geminiApiKey}
									onChange={handleApiKeyChange}
									status={saveError ? "error" : ""}
									aria-label={t("gemini_api_key")}
								/>
								{saveError && <Text type="danger">{saveError}</Text>}
								<Button
									type="primary"
									onClick={handleSaveApiKey}
									loading={isSaving}
									icon={<SaveOutlined />}
									style={{ width: "100%", marginTop: "8px" }}
									disabled={!geminiApiKey || isSaving}>
									{isSaving ? t("saving") : t("save_api_key")} {/* Assuming key is save_api_key */}
								</Button>
							</Space>
						</>
					)}
				</Space>
			</Drawer>
		);
	}
);

// --- Main App Component ---
const App = () => {
	const [direction, setDirection] = useState("ltr");
	const [language, setLanguage] = useState(() => localStorage.getItem("i18nextLng") || "en");
	const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem("appTheme") || "light");
	const [componentSize, setComponentSize] = useState(() => localStorage.getItem("appComponentSize") || "middle");
	const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
	const { i18n, t } = useTranslation();

	const themeOptions = useMemo(
		() => [
			// Assuming theme keys in JSON would follow convention like theme-light, theme-dark, etc.
			// Adjust this if your JSON uses underscores (theme_light).
			...Object.keys(colorTokens).map((name) => ({ value: name, label: t(`theme-${name}`, { defaultValue: name }) })),
			{ value: "dark_killer", label: t("theme-dark-killer", { defaultValue: "Dark Killer" }) }, // Adjust key if needed
		],
		[t]
	);
	const languageOptions = useMemo(
		// This seems fine
		() => [
			{ value: "en", label: "English" },
			{ value: "fa", label: "فارسی" },
			{ value: "ar", label: "العربية" },
		],
		[]
	);

	const antdLocale = useMemo(() => {
		// Fine
		switch (language) {
			case "fa":
				return faIR;
			case "ar":
				return arEG;
			default:
				return enUS;
		}
	}, [language]);

	const antDesignTheme = useMemo(() => {
		// Theme logic unchanged
		let currentTokens = colorTokens["light"];
		let isSystemDark = false;
		if (selectedTheme === "dark_killer") {
			return { algorithm: darkAlgorithm, token: darkKillerTheme.token, components: darkKillerTheme.components };
		} else if (colorTokens[selectedTheme]) {
			currentTokens = colorTokens[selectedTheme];
			isSystemDark = currentTokens.isDark === true;
		} else {
			setSelectedTheme("light");
		} // Fallback if invalid theme
		const config = {
			/* ... (theme token/component config based on currentTokens/isSystemDark) ... */
			algorithm: isSystemDark ? darkAlgorithm : defaultAlgorithm,
			token: {
				colorPrimary: currentTokens.primaryColor,
				colorSuccess: currentTokens.successColor,
				colorWarning: currentTokens.warningColor,
				colorError: currentTokens.errorColor,
				colorInfo: currentTokens.infoColor,
				colorBgLayout: currentTokens.backgroundColor,
				colorBgContainer: currentTokens.paperColor,
				colorBgElevated: currentTokens.paperColor,
				colorTextBase: currentTokens.textColor,
				colorBorder: currentTokens.borderColor,
				colorBorderSecondary: currentTokens.dividerColor,
				borderRadius: 6,
			},
			components: {
				Layout: {
					sider: { colorBgLayout: currentTokens.backgroundColor },
					header: { colorBgHeader: currentTokens.paperColor, colorHeaderTitle: currentTokens.textColor },
					footer: { colorBgFooter: currentTokens.backgroundColor, colorTextFooter: currentTokens.textColor },
				},
				Menu: {
					colorItemText: currentTokens.textColor,
					colorItemTextHover: currentTokens.primaryColor,
					colorSubmenuArrow: currentTokens.textColor,
					...(isSystemDark
						? {
								colorItemText: "rgba(255, 255, 255, 0.75)",
								colorItemTextSelected: "#ffffff",
								colorItemBgSelected: currentTokens.primaryColor,
								colorItemTextHover: "#ffffff",
								colorItemBgHover: "rgba(255, 255, 255, 0.1)",
								colorSubmenuArrow: "rgba(255, 255, 255, 0.75)",
						  }
						: {
								colorItemTextSelected: currentTokens.primaryColor,
								colorItemBgSelected: currentTokens.primaryColor + "1A",
								colorItemBgHover: "rgba(0, 0, 0, 0.04)",
						  }),
				},
				Drawer: { colorBgElevated: currentTokens.paperColor },
				Input: { colorBgContainer: currentTokens.paperColor },
				Select: { colorBgContainer: currentTokens.paperColor },
				Card: { colorBgContainer: currentTokens.paperColor, colorBorderSecondary: currentTokens.borderColor },
			},
		};
		return config;
	}, [selectedTheme, setSelectedTheme]); // Added setSelectedTheme dependency

	// --- Event Handlers (Unchanged) ---
	const handleThemeSelectChange = useCallback((value) => {
		setSelectedTheme(value);
		localStorage.setItem("appTheme", value);
	}, []);
	const handleLanguageChange = useCallback(
		(value) => {
			setLanguage(value);
			i18n.changeLanguage(value);
			const newDirection = value === "ar" || value === "fa" ? "rtl" : "ltr";
			setDirection(newDirection);
			document.documentElement.dir = newDirection;
			document.documentElement.lang = value;
			localStorage.setItem("i18nextLng", value);
		},
		[i18n]
	);
	useEffect(() => {
		const initialDirection = language === "ar" || language === "fa" ? "rtl" : "ltr";
		document.documentElement.dir = initialDirection;
		document.documentElement.lang = language;
		if (i18n.language !== language) {
			i18n.changeLanguage(language);
		}
	}, [language, i18n]);
	const handleComponentSizeChange = useCallback((e) => {
		const newSize = e.target.value;
		setComponentSize(newSize);
		localStorage.setItem("appComponentSize", newSize);
	}, []);
	const toggleSettingsDrawer = useCallback(() => {
		setSettingsDrawerVisible((prev) => !prev);
	}, []);

	const settingsButtonStyles = useMemo(() => {
		// Style calculation unchanged
		const currentThemeConfig = antDesignTheme;
		const colors = {
			primary: currentThemeConfig.token?.colorPrimary || "#1677ff",
			paper: currentThemeConfig.token?.colorBgContainer || "#ffffff",
			border: currentThemeConfig.token?.colorPrimary || "#1677ff",
		};
		return {
			"--setting-btn-bg": colors.paper,
			"--setting-btn-text": colors.primary,
			"--setting-btn-border": colors.border,
			"--setting-btn-hover-bg": colors.primary,
			"--setting-btn-hover-text": colors.paper,
		};
	}, [antDesignTheme]);

	const ThemeProviderComponent = selectedTheme === "dark_killer" ? ComplexThemeProvider : ConfigProvider;
	const themeProviderProps = selectedTheme === "dark_killer" ? { theme: darkKillerTheme } : { theme: antDesignTheme };

	return (
		<AppWrapper>
			<style>{` :root { ${Object.entries(settingsButtonStyles)
				.map(([key, value]) => `${key}: ${value};`)
				.join(
					"\n"
				)} } .settings-button { background-color: var(--setting-btn-bg); color: var(--setting-btn-text); border: 1px solid var(--setting-btn-border); transition: background-color 0.3s, color 0.3s, border-color 0.3s; } .settings-button:hover, .settings-button:focus { background-color: var(--setting-btn-hover-bg) !important; color: var(--setting-btn-hover-text) !important; border-color: var(--setting-btn-hover-bg) !important; } /* Removed fade animation styles */ `}</style>
			<ThemeProviderComponent direction={direction} locale={antdLocale} componentSize={componentSize} {...themeProviderProps}>
				<AppLayout direction={direction} language={language} componentSize={componentSize}>
					<Routes>
						{appRoutes.map((route, index) => (
							<Route key={index} path={route.path} element={route.element} />
						))}
						{/* <Route path="*" element={<NotFoundPage />} /> */}
					</Routes>
				</AppLayout>
			</ThemeProviderComponent>
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
				className="settings-button"
				type="default"
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
					zIndex: 1002,
					boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
				}}
			/>
		</AppWrapper>
	);
};

// --- Root App with Router ---
const RootApp = () => (
	<Router>
		{" "}
		<App />{" "}
	</Router>
);

export { g2Themes };
export default RootApp;
