// App.js

// --- Core React/Router Imports ---
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Link as RouterLink } from "react-router-dom";

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
	Avatar,
	Radio,
	Divider,
	Typography,
	Dropdown,
	Badge,
	Modal, // Kept for potential other uses, though SearchOverlay is removed
	Tooltip,
	Affix,
	Segmented,
	List,
	Card,
	notification, // Added for Voice Navigation
} from "antd";
import {
	MenuOutlined,
	SettingOutlined,
	HeartOutlined,
	LoginOutlined,
	LogoutOutlined,
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
	FileSearchOutlined, // Still used for menu items, removing from header
	FolderOutlined,
	ProfileOutlined,
	ExperimentTwoTone,
	CheckCircleOutlined,
	KeyOutlined,
	ApiOutlined,
	LeftOutlined,
	RightOutlined,
	DashboardOutlined,
	MoreOutlined,
	EnvironmentOutlined, // For "On Duty" if kept, removing for now
	ClockCircleOutlined, // For "Shift Time" if kept, removing for now
	MessageOutlined,
} from "@ant-design/icons";
import enUS from "antd/es/locale/en_US";
import faIR from "antd/es/locale/fa_IR";
import arEG from "antd/es/locale/ar_EG";
import "antd/dist/reset.css";

// --- Styling Imports ---
import styled from "styled-components";

// --- Components & Pages ---
import Profile from "./components/auth/Profile";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PatientList from "./components/patients/PatientList";
import AboutUs from "./components/AboutUs";
import VoiceNavigation from "./VoiceNavigation";
import Dashboard from "./components/dashboard/Dashboard";

// --- Routes & Config ---
import { appRoutes } from "./routes";
import { colorTokens, darkKillerTheme, ComplexThemeProvider, g2Themes } from "./themeConfig";

// --- Constants ---
const { Header, Content, Footer, Sider } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antdTheme;
const { useBreakpoint } = Grid;
const { Text, Title, Paragraph } = Typography; // Paragraph might be unused if SearchOverlay is fully removed
const GEMINI_API_CONFIG_URL = `http://localhost:8080/api/gemini/configure-key`;

// --- Styled Components ---
const AppWrapper = styled.div`
	min-height: 100vh;
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	background-color: ${(props) => props.theme?.token?.colorBgLayout || "#f0f2f5"};
`;

const StyledLayout = styled(Layout)`
	min-height: 100vh;
	background-color: transparent !important;
`;

const StyledAppHeader = styled(Header)`
	position: sticky;
	top: 0;
	z-index: 1001;
	height: 64px;
	padding: 0 24px;
	background-color: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"} !important;
	border-bottom: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "#f0f0f0"};
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	display: flex;
	align-items: center;
	justify-content: space-between;
	.logo-area {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.header-center {
		flex-grow: 1;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		overflow: hidden;
		.ant-typography {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
	.header-right {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	@media (max-width: 767px) {
		padding: 0 16px;
		height: 56px;
		.logo-area {
			gap: 8px;
			flex-shrink: 0;
		}
		.header-center {
			display: flex;
			justify-content: flex-start;
			flex-grow: 1;
			margin-left: 8px;
			text-align: left;
		}
		.ant-breadcrumb {
			display: none;
		}
		.header-right {
			gap: 8px;
		}
	}
`;

const LogoImage = styled.img`
	height: 32px;
	width: auto;
	vertical-align: middle;
	@media (max-width: 767px) {
		height: 28px;
	}
`;

const StyledAppSidebar = styled(Sider)`
	height: calc(100vh - 64px);
	position: sticky !important;
	top: 64px;
	left: 0;
	background: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"} !important;
	border-right: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "#f0f0f0"};
	box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
	overflow-y: auto;
	display: flex;
	flex-direction: column;

	.user-context-section {
		padding: 16px;
		border-bottom: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary};
		.user-info {
			display: flex;
			align-items: center;
			gap: 12px;
			margin-bottom: 8px;
		}
		/* Removed .shift-status, .time-date styles as elements are removed */
	}
	.quick-actions-panel {
		padding: 16px;
		border-bottom: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary};
		.ant-btn {
			width: 100%;
			margin-bottom: 8px;
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
	.ant-menu {
		flex-grow: 1;
		background: transparent;
		border-right: none !important;
		padding: 8px 0;
	}
	.ant-menu-item,
	.ant-menu-submenu-title {
		margin: 4px 12px;
		width: calc(100% - 24px);
		border-radius: ${(props) => props.theme?.token?.borderRadiusLG || 8}px;
		&:hover {
			background-color: ${(props) => props.theme.token.controlItemBgHover};
		}
		&.ant-menu-item-selected {
			background-color: ${(props) => props.theme.token.colorPrimaryBg};
			color: ${(props) => props.theme.token.colorPrimary};
			.ant-menu-item-icon {
				color: ${(props) => props.theme.token.colorPrimary};
			}
		}
	}
	.ant-menu-item-group-title {
		padding: 12px 16px 4px 16px;
		font-size: 0.8em;
		font-weight: 600;
		color: ${(props) => props.theme.token.colorTextDescription};
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 8px;
	}
	.sidebar-collapse-toggle {
		border-top: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary};
		padding: 12px 16px;
		button {
			width: 100%;
		}
	}

	&.ant-layout-sider-collapsed {
		.user-context-section {
			padding: 12px 0;
			text-align: center;
			.user-info {
				justify-content: center;
			}
			.ant-avatar {
				margin: 0 auto;
			}
			.user-name-role,
			.shift-status, /* Ensure these are not referenced if removed */
			.time-date, /* Ensure these are not referenced if removed */
			.ant-typography {
				/* This is general, be careful */
				display: none;
			}
		}
		.quick-actions-panel {
			display: none;
		}
		.ant-menu-item-group-title {
			display: none;
		}
		.ant-menu-item .ant-menu-title-content {
			display: none;
		}
		.ant-menu-item {
			padding: 0 !important;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 40px;
			margin: 4px auto !important;
			width: 40px !important;
		}
	}

	&::-webkit-scrollbar {
		width: 6px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background: ${(props) => props.theme.token.colorBorder};
		border-radius: 3px;
	}
	scrollbar-width: thin;
	scrollbar-color: ${(props) => props.theme.token.colorBorder} transparent;
`;

const StyledContentWrapper = styled(Layout)`
	padding: 0;
	overflow-x: hidden;
	background-color: transparent !important;
	@media (max-width: 767px) {
		padding-bottom: 56px;
	}
`;

const StyledAppContent = styled(Content)`
	margin: 24px;
	padding: 24px;
	min-height: calc(100vh - 64px - 48px - 48px);
	background-color: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"};
	border-radius: ${(props) => props.theme?.token?.borderRadiusLG || 8}px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	flex: 1;
	position: relative;
	@media (max-width: 767px) {
		margin: 16px;
		padding: 16px;
		border-radius: ${(props) => props.theme?.token?.borderRadius || 6}px;
		min-height: calc(100vh - 56px - 56px - 32px);
	}
`;

const StyledAppFooter = styled(Footer)`
	height: 48px;
	padding: 0 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	/* FIX: Apply a background from the theme, e.g., colorBgLayout or colorBgContainer */
	background-color: ${(props) => props.theme?.token?.colorBgLayout || "#f0f2f5"};
	color: ${(props) => props.theme?.token?.colorTextSecondary};
	border-top: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "#f0f0f0"};
	font-size: 0.85em;
	@media (max-width: 767px) {
		display: none;
	}
`;

const StyledBottomNav = styled(Affix)`
	.ant-segmented {
		width: 100%;
		height: 56px;
		background-color: ${(props) => props.theme?.token?.colorBgContainer || "#ffffff"};
		box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
		border-top: 1px solid ${(props) => props.theme?.token?.colorBorderSecondary || "#f0f0f0"};
		padding: 0;

		.ant-segmented-item {
			flex: 1;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 4px 0 !important;
		}
		.ant-segmented-item-icon {
			font-size: 20px;
			margin-bottom: 2px;
		}
		.ant-segmented-item-label {
			font-size: 10px;
		}
		.ant-segmented-item-selected {
			.ant-segmented-item-icon,
			.ant-segmented-item-label {
				color: ${(props) => props.theme.token.colorPrimary};
			}
		}
	}
`;

const StyledSettingsDrawer = styled(Drawer)`
	.ant-drawer-content-wrapper {
		max-width: 320px;
	}
	.ant-space-item:last-child {
		width: 100%;
	}
`;

// --- Helper Functions ---
const getMenuIcon = (path) => {
	const iconStyle = { fontSize: "18px" }; // Matched to new design if it was 18px
	const icons = {
		"/login": <LoginOutlined style={iconStyle} />,
		"/register": <UserAddOutlined style={iconStyle} />,
		"/profile": <UserOutlined style={iconStyle} />,
		"/patients": <TeamOutlined style={iconStyle} />,
		"/appointments": <CalendarOutlined style={iconStyle} />,
		"/activities": <CalendarOutlined style={iconStyle} />,
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
		"/dashboard": <DashboardOutlined style={iconStyle} />,
		"/about-us": <InfoCircleOutlined style={iconStyle} />,
		"/": <HomeOutlined style={iconStyle} />,
		"/more": <MoreOutlined style={iconStyle} />,
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

// --- Child Components ---

const NavigationMenu = React.memo(({ onClose, isMobile, mode = "inline", inDrawer = false, collapsed = false }) => {
	const { user, hasAuthority } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();
	const { t } = useTranslation();
	const { token } = antdTheme.useToken();

	const handleMenuItemClick = useCallback(
		(path) => {
			navigate(path);
			if (onClose) onClose();
		},
		[navigate, onClose],
	);

	const menuConfig = useMemo(
		() => ({
			dashboard: [{ path: "/dashboard", labelKey: "dashboard", permissions: ["READ_DASHBOARD"], authOnly: true }],
			"patient-management": [
				{ path: "/patients", labelKey: "patients", permissions: ["READ_PATIENT"], authOnly: true },
				{ path: "/admissions", labelKey: "admissions", permissions: ["READ_ADMISSION"], authOnly: true },
				// UPDATED: Now uses the new READ_ACTIVITY permission from the backend.
				{ path: "/activities", labelKey: "activities", permissions: ["READ_ACTIVITY"], authOnly: true },
				{ path: "/procedures", labelKey: "procedures", permissions: ["READ_PROCEDURE"], authOnly: true },
			],
			"medical-records-diagnostics": [
				{ path: "/vital-signs", labelKey: "vital-signs", permissions: ["READ_VITAL_SIGN"], authOnly: true },
				{ path: "/assessments", labelKey: "assessments", permissions: ["READ_ASSESSMENT"], authOnly: true },
				{ path: "/procedure-logs", labelKey: "procedure-logs", permissions: ["READ_PROCEDURE_LOG"], authOnly: true },
				{ path: "/documents", labelKey: "documents", permissions: ["READ_DOCUMENT"], authOnly: true },
				{ path: "/document-types", labelKey: "document-types", permissions: ["READ_DOCUMENT_TYPE"], authOnly: true },
				{ path: "/lab-tests", labelKey: "lab-tests", permissions: ["READ_LAB_TEST"], authOnly: true },
				{ path: "/lab-results", labelKey: "lab-results", permissions: ["READ_LAB_RESULT"], authOnly: true },
				{ path: "/image-reports", labelKey: "image-reports", permissions: ["READ_IMAGE_REPORT"], authOnly: true },
				{ path: "/image-report-types", labelKey: "image-report-types", permissions: ["READ_IMAGE_REPORT_TYPE"], authOnly: true },
			],
			"medication-inventory": [
				{ path: "/medications", labelKey: "medications", permissions: ["READ_MEDICATION"], authOnly: true },
				{ path: "/prescriptions", labelKey: "prescriptions", permissions: ["READ_PRESCRIPTION"], authOnly: true },
				{
					path: "/medication-administrations",
					labelKey: "medication-administrations",
					permissions: ["READ_MEDICATION_ADMINISTRATION"],
					authOnly: true,
				},
				{ path: "/products", labelKey: "products", permissions: ["READ_PRODUCT"], authOnly: true },
				{ path: "/product-usages", labelKey: "product-usages", permissions: ["READ_PATIENT_PRODUCT_USAGE"], authOnly: true },
			],
			administration: [
				{ path: "/users", labelKey: "users", permissions: ["READ_USER"], authOnly: true },
				{ path: "/units", labelKey: "units", permissions: ["READ_UNIT"], authOnly: true },
				{ path: "/rooms", labelKey: "rooms", permissions: ["READ_ROOM"], authOnly: true },
				{ path: "/beds", labelKey: "beds", permissions: ["READ_BED"], authOnly: true },
			],
			"billing-finance": [{ path: "/billings", labelKey: "billings", permissions: ["READ_BILLING"], authOnly: true }],
			security: [
				{ path: "/roles-permissions", labelKey: "roles-permissions", permissions: ["MANAGE_PERMISSIONS", "MANAGE_ROLES"], authOnly: true },
			],
			general: [
				{ path: "/about-us", labelKey: "about-us", public: true },
				{ path: "/all-features", labelKey: "all-features", public: true },
			],
			authentication: [
				{ path: "/login", labelKey: "login", showIfLoggedOut: true },
				{ path: "/register", labelKey: "register", showIfLoggedOut: true },
			],
		}),
		[],
	);

	const generateMenuItems = useCallback(() => {
		const items = [];
		for (const categoryKey in menuConfig) {
			const categoryItems = menuConfig[categoryKey]
				.filter((item) => {
					if (item.showIfLoggedOut) return !user;
					if (item.public && !item.authOnly) return true;
					if (item.authOnly && !user) return false;
					if (user && item.permissions && item.permissions.length > 0) return item.permissions.some((p) => hasAuthority(p));
					return user; // Show if authOnly and user exists, and no specific permissions required
				})
				.map((item) => ({
					key: item.path,
					icon: getMenuIcon(item.path),
					label: t(item.labelKey, { defaultValue: item.labelKey.replace(/-/g, " ") }),
					onClick: () => handleMenuItemClick(item.path),
				}));

			if (categoryItems.length > 0) {
				if (
					mode === "inline" &&
					!inDrawer &&
					!collapsed &&
					categoryKey !== "authentication" &&
					categoryKey !== "dashboard" /* dashboard is usually standalone */
				) {
					items.push({
						type: "group",
						label: t(`category-${categoryKey}`, { defaultValue: categoryKey.replace(/-/g, " ").toUpperCase() }),
						key: `group-${categoryKey}`,
						children: categoryItems,
					});
				} else {
					items.push(...categoryItems);
					if (
						categoryKey !== Object.keys(menuConfig)[Object.keys(menuConfig).length - 1] &&
						mode === "vertical" && // typically for drawers or mobile menus
						categoryItems.length > 0 &&
						!collapsed
					) {
						items.push({ type: "divider", key: `divider-${categoryKey}` });
					}
				}
			}
		}
		return items;
	}, [user, hasAuthority, t, menuConfig, handleMenuItemClick, mode, inDrawer, collapsed]);

	const selectedKeys = useMemo(() => {
		const currentPath = location.pathname;
		let bestMatch = null;
		let maxMatchLength = 0;
		Object.values(menuConfig)
			.flat()
			.forEach((item) => {
				const itemBasePath = item.path.split("/:")[0];
				if (currentPath.startsWith(itemBasePath)) {
					if (itemBasePath.length > maxMatchLength) {
						maxMatchLength = itemBasePath.length;
						bestMatch = item.path;
					}
				}
			});
		if (user && currentPath === "/") return ["/dashboard"]; // Default to dashboard if logged in and at root
		return bestMatch ? [bestMatch] : [currentPath];
	}, [location.pathname, menuConfig, user]);

	return (
		<AntMenu
			mode={mode}
			theme={
				token.Layout?.sider?.colorBgSider === "#001529" ||
				(token.Layout?.sider?.colorBgSider && token.Layout.sider.colorBgSider.startsWith("rgb(0,")) ||
				(token.Layout?.sider?.colorBgSider && token.Layout.sider.colorBgSider.startsWith("#0"))
					? "dark"
					: "light"
			}
			style={{ borderRight: 0, width: "100%" }}
			selectedKeys={selectedKeys}
			items={generateMenuItems()}
			inlineCollapsed={collapsed && mode === "inline"}
		/>
	);
});

const AppHeaderComponent = React.memo(
	({ onMobileMenuToggle, /* REMOVED: onSearchToggle */ pageTitleFromRoute, breadcrumbItemsFromRoute, onSettingsToggle }) => {
		const { user, logout } = useAuthStore();
		const { t } = useTranslation();
		const navigate = useNavigate();
		const { token } = antdTheme.useToken();
		const screens = useBreakpoint();
		const isMobile = !screens.md;

		// FIX: Implement Voice Navigation logic
		const handleVoiceNavigation = useCallback(
			(pageName) => {
				const routeMap = appRoutes.reduce(
					(acc, route) => {
						let key = route.path.substring(1);
						if (route.path === "/") key = "home";

						if (key && !acc[key]) {
							acc[key] = route.path;
							acc[key.replace(/-/g, " ")] = route.path;
						}
						if (key === "patients") acc["patient"] = route.path;
						if (key === "users") acc["user"] = route.path;
						return acc;
					},
					{
						login: "/login",
						register: "/register",
						profile: "/profile",
						dashboard: "/dashboard",
						home: "/",
						about: "/about-us",
						features: "/all-features",
					},
				);

				const normalizedPageName = pageName.toLowerCase().trim();
				const route = routeMap[normalizedPageName];

				if (route) {
					navigate(route);
					const routeInfo = appRoutes.find((r) => r.path === route);
					let label = pageName;
					if (routeInfo) {
						let labelKey = routeInfo.path.substring(1);
						if (routeInfo.path === "/") labelKey = "home";
						if (routeInfo.titleKey) labelKey = routeInfo.titleKey; // Prefer titleKey if available from new appRoutes structure
						label = t(labelKey, { defaultValue: labelKey.replace(/-/g, " ") }) || pageName;
					}
					notification.success({ message: t("navigating", "Navigating..."), description: `${t("navigating-to", "Going to")} ${label}` });
				} else {
					notification.error({
						message: t("navigation-error", "Navigation Error"),
						description: `${t("could-not-find-page", "Could not find page:")} "${pageName}".`,
					});
				}
			},
			[navigate, t], // appRoutes is stable and available in parent scope
		);

		const userMenuItems = [
			{ key: "profile", label: t("profile"), icon: <UserOutlined />, onClick: () => navigate("/profile") },
			{ key: "settings", label: t("settings"), icon: <SettingOutlined />, onClick: onSettingsToggle },
			{ type: "divider" },
			{ key: "logout", label: t("logout"), icon: <LogoutOutlined />, onClick: logout },
		];

		return (
			<StyledAppHeader theme={{ token }}>
				<div className="logo-area">
					{isMobile && user && (
						<Button type="text" icon={<MenuOutlined />} onClick={onMobileMenuToggle} aria-label={t("toggle-mobile-menu")} />
					)}
					<RouterLink to={user ? "/dashboard" : "/"}>
						<LogoImage src="/logo.png" alt={t("logo-alt-text", "GMTS Logo")} />
					</RouterLink>
					{!isMobile && breadcrumbItemsFromRoute && breadcrumbItemsFromRoute.length > 0 && (
						<Breadcrumb items={breadcrumbItemsFromRoute} style={{ marginLeft: 8 }} />
					)}
				</div>

				<div className="header-center">
					<Title level={isMobile ? 5 : 4} style={{ margin: 0, fontWeight: 500 }}>
						{pageTitleFromRoute || t("app-name", "GMTS")}
					</Title>
				</div>

				<div className="header-right">
					{!isMobile && <VoiceNavigation onNavigate={handleVoiceNavigation} />}
					{/* REMOVED: Search button and Tooltip 
				<Tooltip title={t("search")}>
					<Button type="text" shape="circle" icon={<FileSearchOutlined />} onClick={onSearchToggle} aria-label={t("search")} />
				</Tooltip>
                */}
					{user ? (
						<Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
							<Space style={{ cursor: "pointer" }}>
								<Avatar
									size={isMobile ? 30 : 36}
									src={user.profilePictureURL ? transformImageUrl(user.profilePictureURL) : undefined}
									icon={!user.profilePictureURL ? <UserOutlined /> : undefined}>
									{!user.profilePictureURL && user.username ? user.username[0].toUpperCase() : null}
								</Avatar>
								{!isMobile && (
									<Text strong style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{user.username || "User"}
									</Text>
								)}
							</Space>
						</Dropdown>
					) : (
						!isMobile && (
							<Space>
								<Button onClick={() => navigate("/login")}>{t("login")}</Button>
								<Button type="primary" onClick={() => navigate("/register")}>
									{t("register")}
								</Button>
							</Space>
						)
					)}
				</div>
			</StyledAppHeader>
		);
	},
);

const AppSidebarComponent = React.memo(({ collapsed, onCollapse }) => {
	const { user } = useAuthStore();
	const { t } = useTranslation();
	const { token } = antdTheme.useToken();
	// REMOVED: currentTime state and effect as "Shift Time" is removed
	// const [currentTime, setCurrentTime] = useState(new Date());
	// useEffect(() => {
	// 	const timer = setInterval(() => setCurrentTime(new Date()), 60000);
	// 	return () => clearInterval(timer);
	// }, []);

	const quickActions = [];

	if (!user) return null;

	return (
		<StyledAppSidebar theme={{ token }} collapsible collapsed={collapsed} onCollapse={onCollapse} trigger={null} width={280} collapsedWidth={72}>
			<div className="user-context-section">
				<Tooltip title={!collapsed ? "" : user.fullName || user.username} placement="right">
					<div className="user-info">
						<Avatar size={collapsed ? 36 : 48} src={transformImageUrl(user.profilePictureURL)} icon={<UserOutlined />} />
						{!collapsed && (
							<div style={{ overflow: "hidden" }}>
								<Text
									strong
									className="user-name-role"
									style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
									{user.fullName || user.username}
								</Text>
								<Text type="secondary" style={{ display: "block", fontSize: "0.9em" }}>
									{user.role || t("user-role-placeholder", "Role")}
								</Text>
							</div>
						)}
					</div>
				</Tooltip>
				{/* REMOVED: "On Duty" and "Shift Time" sections
				{!collapsed && (
					<>
						<Text className="shift-status" style={{ display: "block", fontSize: "0.8em", marginTop: 4 }}>
							<EnvironmentOutlined /> {user.department || t("on-duty", "On Duty")}
						</Text>
						<Text className="time-date" style={{ display: "block", fontSize: "0.8em", marginTop: 2 }}>
							<ClockCircleOutlined /> {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
							{currentTime.toLocaleDateString()}
						</Text>
					</>
				)}
                */}
			</div>

			{!collapsed && quickActions.length > 0 && (
				<div className="quick-actions-panel">
					{quickActions.map((action) => (
						<Button
							key={action.key}
							icon={action.icon}
							type={action.type || "default"}
							danger={action.danger}
							onClick={action.onClick}
							block>
							{t(action.labelKey)}
						</Button>
					))}
				</div>
			)}

			<NavigationMenu isMobile={false} mode="inline" collapsed={collapsed} />

			<div className="sidebar-collapse-toggle">
				<Button type="text" onClick={onCollapse} block icon={collapsed ? <RightOutlined /> : <LeftOutlined />}>
					{!collapsed && t("collapse-sidebar", "Collapse")}
				</Button>
			</div>
		</StyledAppSidebar>
	);
});

const BottomNavComponent = React.memo(({ currentPath, onTabChange }) => {
	const { t } = useTranslation();
	const { token } = antdTheme.useToken();

	const tabs = [
		{ value: "/dashboard", label: t("dashboard", "Dashboard"), icon: <DashboardOutlined /> },
		{ value: "/patients", label: t("patients", "Patients"), icon: <TeamOutlined /> },
		{ value: "/more", label: t("more", "More"), icon: <MoreOutlined /> },
	];

	let activeTab = tabs[0].value;
	const currentBase = `/${currentPath.split("/")[1]}`; // Ensure leading slash for comparison
	const matchedTab = tabs.find((tab) => tab.value === currentBase);

	if (matchedTab) {
		activeTab = matchedTab.value;
	} else if (currentPath === "/" && tabs.some((t) => t.value === "/dashboard")) {
		activeTab = "/dashboard";
	} else if (!tabs.some((tab) => tab.value === currentBase) && currentPath !== "/") {
		// If no direct match and not on dashboard, default to 'More' or first tab if 'More' doesn't exist
		activeTab = tabs.find((t) => t.value === "/more")?.value || (tabs.length > 0 ? tabs[0].value : currentPath);
	}

	return (
		<StyledBottomNav offsetBottom={0} theme={{ token }}>
			<Segmented
				value={activeTab}
				options={tabs.map((tab) => ({
					value: tab.value,
					label: tab.label,
					icon: tab.icon,
				}))}
				onChange={onTabChange}
				block
			/>
		</StyledBottomNav>
	);
});

const MobileDrawerComponent = React.memo(({ open, onClose, onSettingsToggle, onLogout }) => {
	const { user } = useAuthStore();
	const { t } = useTranslation();
	const { token } = antdTheme.useToken();

	if (!user) return null;

	return (
		<Drawer
			title={
				<Space>
					<Avatar src={transformImageUrl(user.profilePictureURL)} icon={<UserOutlined />} />
					<Text strong>{user.fullName || user.username}</Text>
				</Space>
			}
			placement="left"
			onClose={onClose}
			open={open}
			width="80%"
			styles={{ body: { padding: 0, overflowX: "hidden" }, header: { borderBottom: `1px solid ${token.colorBorderSecondary}` } }}>
			<NavigationMenu isMobile={true} mode="vertical" onClose={onClose} inDrawer={true} />
			<div style={{ padding: "16px", borderTop: `1px solid ${token.colorBorderSecondary}`, marginTop: "auto" }}>
				<Button
					block
					icon={<SettingOutlined />}
					onClick={() => {
						onSettingsToggle();
						onClose();
					}}
					style={{ marginBottom: "8px" }}>
					{t("settings")}
				</Button>
				<Button
					block
					danger
					icon={<LogoutOutlined />}
					onClick={() => {
						onLogout();
						onClose();
					}}>
					{t("logout")}
				</Button>
			</div>
		</Drawer>
	);
});

// REMOVED: SearchOverlay component
// const SearchOverlay = ({ visible, onClose }) => { ... };

const SettingsDrawerComponent = React.memo(
	({ visible, onClose, language, onLanguageChange, theme, onThemeChange, size, onSizeChange, languageOptions, themeOptions }) => {
		const { t } = useTranslation();
		const { hasAuthority } = useAuthStore();
		const userToken = useAuthStore((state) => state.token); // Use the direct token from the store
		const [geminiApiKey, setGeminiApiKey] = useState("");
		const [isSaving, setIsSaving] = useState(false);
		const [saveError, setSaveError] = useState(null);
		const canManageApiKey = hasAuthority("MANAGE_GEMINI_API_KEY");

		const handleSaveApiKey = useCallback(async () => {
			// Using direct notification import now
			if (!geminiApiKey) {
				notification.error({ message: t("error"), description: t("api-key-required", "API Key cannot be empty.") });
				return;
			}
			if (!userToken) {
				notification.error({ message: t("error"), description: t("auth-token-missing", "Authentication token is missing.") });
				return;
			}
			setIsSaving(true);
			setSaveError(null);
			try {
				await axios.post(
					GEMINI_API_CONFIG_URL,
					{ apiKey: geminiApiKey },
					{ headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` } },
				);
				notification.success({ message: t("success"), description: t("gemini-api-key-saved", "Gemini API Key saved successfully.") });
			} catch (error) {
				console.error("Error saving Gemini API key:", error);
				const errorMessage = error.response?.data?.message || error.message || t("api-key-save-failed", "Failed to save API Key.");
				setSaveError(errorMessage);
				notification.error({ message: t("error"), description: errorMessage });
			} finally {
				setIsSaving(false);
			}
		}, [geminiApiKey, userToken, t]);

		const handleApiKeyChange = (e) => {
			setGeminiApiKey(e.target.value);
			if (saveError) setSaveError(null);
		};

		return (
			<StyledSettingsDrawer title={t("settings", "Settings")} placement="right" onClose={onClose} open={visible}>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<Space direction="vertical" style={{ width: "100%" }}>
						<Text>{t("language", "Language")}:</Text>
						<Select
							aria-label={t("language")}
							value={language}
							options={languageOptions}
							onChange={onLanguageChange}
							style={{ width: "100%" }}
						/>
					</Space>
					<Space direction="vertical" style={{ width: "100%" }}>
						<Text>{t("theme", "Theme")}:</Text>
						<Select aria-label={t("theme")} value={theme} options={themeOptions} onChange={onThemeChange} style={{ width: "100%" }} />
					</Space>
					<Space direction="vertical" style={{ width: "100%" }}>
						<Text>{t("size", "Component Size")}:</Text>
						<Radio.Group value={size} onChange={onSizeChange}>
							<Radio.Button value="small">{t("small", "Small")}</Radio.Button>
							<Radio.Button value="middle">{t("middle", "Middle")}</Radio.Button>
							<Radio.Button value="large">{t("large", "Large")}</Radio.Button>
						</Radio.Group>
					</Space>
					{canManageApiKey && (
						<>
							{" "}
							<Divider />
							<Space direction="vertical" style={{ width: "100%" }}>
								<Text strong>
									<ApiOutlined /> {t("gemini-api-key", "Gemini API Key")}:
								</Text>
								<Input.Password
									placeholder={t("enter-gemini-api-key", "Enter Gemini API Key")}
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
									{isSaving ? t("saving", "Saving...") : t("save-api-key", "Save API Key")}
								</Button>
							</Space>
						</>
					)}
				</Space>
			</StyledSettingsDrawer>
		);
	},
);

const AppLayout = React.memo(({ children, direction, language, componentSize, onSettingsToggle, onLogout }) => {
	const { user } = useAuthStore();
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const screens = useBreakpoint();
	const isMobile = !screens.md;
	const { token } = antdTheme.useToken();

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	// REMOVED: searchOverlayVisible state
	// const [searchOverlayVisible, setSearchOverlayVisible] = useState(false);

	const handleSidebarCollapse = useCallback(() => setSidebarCollapsed((prev) => !prev), []);
	const handleMobileDrawerToggle = useCallback(() => setMobileDrawerOpen((prev) => !prev), []);
	// REMOVED: handleSearchToggle
	// const handleSearchToggle = useCallback(() => setSearchOverlayVisible((prev) => !prev), []);

	const { pageTitleFromRoute, breadcrumbItemsFromRoute } = useMemo(() => {
		const pathSegments = location.pathname.split("/").filter(Boolean);
		let derivedTitle = t("app-name", "GMTS");
		const currentRouteConfig = appRoutes.find((route) => {
			const routeBasePath = route.path.split("/:")[0];
			const currentPathBase = location.pathname.split("/:")[0];
			return currentPathBase === routeBasePath;
		});

		if (currentRouteConfig?.titleKey) {
			// Use optional chaining
			derivedTitle = t(currentRouteConfig.titleKey, { defaultValue: currentRouteConfig.titleKey.replace(/-/g, " ") });
		} else if (pathSegments.length > 0) {
			const lastSegmentKey = pathSegments[pathSegments.length - 1];
			// Attempt to find a more specific key from appRoutes if the last segment is a base path
			const segmentRouteConfig = appRoutes.find(
				(route) => route.path === `/${lastSegmentKey}` || route.path.split("/:")[0] === `/${lastSegmentKey}`,
			);
			const titleKeyToUse = segmentRouteConfig?.titleKey || lastSegmentKey;
			derivedTitle = t(titleKeyToUse, { defaultValue: titleKeyToUse.replace(/-/g, " ") });
		}

		if (location.pathname === "/" || (user && location.pathname === "/dashboard")) {
			derivedTitle = t("dashboard", "Dashboard");
		}

		const items = [{ title: <RouterLink to={user ? "/dashboard" : "/"}>{t("home", "Home")}</RouterLink>, key: "home" }];
		// Add dashboard to breadcrumb start if not on dashboard
		if (user && location.pathname !== "/dashboard" && location.pathname !== "/") {
			items[0] = { title: <RouterLink to="/dashboard">{t("dashboard", "Dashboard")}</RouterLink>, key: "dashboard_link" };
		} else if (!user && location.pathname !== "/") {
			// For non-logged-in users, 'Home' is the root.
		} else {
			// If on root or dashboard, items might be empty or just the current page.
			// The logic below will handle not showing breadcrumbs if items.length <=1
		}

		let currentPath = "";
		pathSegments.forEach((segment, index) => {
			currentPath += `/${segment}`;
			if (user && currentPath === "/dashboard") return; // Don't repeat dashboard if it's already the root

			let labelKey = segment;
			const routeMatchForBreadcrumb = appRoutes.find((route) => {
				const routeBasePath = route.path.split("/:")[0];
				return currentPath === routeBasePath || currentPath === route.path;
			});
			if (routeMatchForBreadcrumb?.titleKey) {
				// Use optional chaining
				labelKey = routeMatchForBreadcrumb.titleKey;
			}

			const isLast = index === pathSegments.length - 1;
			const segTitle = t(labelKey, { defaultValue: segment.replace(/-/g, " ") });

			const isParamLike =
				/^\d+$/.test(segment) ||
				/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(segment) ||
				(segment.length > 15 && !segment.includes(" ") && !appRoutes.some((r) => r.path.includes(segment))); // Added check against known paths

			if (currentPath === (user ? "/dashboard" : "/")) {
				// Avoid adding home/dashboard again if it's the current segment
				if (items.length === 1 && items[0].key === (user ? "dashboard_link" : "home")) {
					// if it's the only item and it's already the root, do nothing
				} else if (!isLast) {
					// if it's not the last segment, make it a link
					items.push({ key: currentPath, title: <RouterLink to={currentPath}>{segTitle}</RouterLink> });
				} else {
					// if it's the last segment, just text
					items.push({ key: currentPath, title: segTitle });
				}
			} else if (!isParamLike) {
				items.push({
					key: currentPath,
					title: isLast ? segTitle : <RouterLink to={currentPath}>{segTitle}</RouterLink>,
				});
			} else if (isParamLike && isLast && items.length > 0) {
				// If the last segment is a param, make the previous breadcrumb item non-clickable text
				const prevItem = items[items.length - 1];
				if (prevItem && prevItem.title && typeof prevItem.title === "object" && prevItem.title.props && prevItem.title.props.to) {
					// Only update if it was a RouterLink
					items[items.length - 1] = { key: prevItem.key, title: prevItem.title.props.children };
				}
				// Optionally, add the param itself as non-clickable text if needed, but often not desired
				// items.push({ key: "param", title: segTitle });
			}
		});

		// Filter out the initial "Home" or "Dashboard" link if it's the only item (i.e., we are on that page)
		const finalBreadcrumbItems =
			(items.length <= 1 && (location.pathname === "/" || location.pathname === "/dashboard")) || items.length === 0 ? [] : items;
		return { pageTitleFromRoute: derivedTitle, breadcrumbItemsFromRoute: finalBreadcrumbItems };
	}, [location.pathname, t, user, appRoutes]);

	const handleMobileTabChange = (value) => {
		if (value === "/more") {
			setMobileDrawerOpen(true);
		} else {
			navigate(value);
		}
	};

	return (
		<StyledLayout>
			<AppHeaderComponent
				onMobileMenuToggle={handleMobileDrawerToggle}
				// onSearchToggle={handleSearchToggle} // REMOVED
				pageTitleFromRoute={pageTitleFromRoute}
				breadcrumbItemsFromRoute={breadcrumbItemsFromRoute}
				onSettingsToggle={onSettingsToggle}
			/>
			<Layout>
				{!isMobile && user && <AppSidebarComponent collapsed={sidebarCollapsed} onCollapse={handleSidebarCollapse} />}
				<StyledContentWrapper theme={{ token }}>
					{/* Breadcrumb moved to header for desktop, can be conditionally rendered here for content area if design prefers */}
					{/* {!isMobile && user && breadcrumbItemsFromRoute && breadcrumbItemsFromRoute.length > 0 && (
                        <Breadcrumb items={breadcrumbItemsFromRoute} style={{ margin: '16px 24px 0' }} />
                    )} */}
					<StyledAppContent theme={{ token }}>
						<div>{children}</div>
					</StyledAppContent>
					<StyledAppFooter theme={{ token }}>
						© {new Date().getFullYear()} GMTS Hospital Model. {t("all-rights-reserved", "All rights reserved.")} |{" "}
						<RouterLink to="/about-us" style={{ color: token.colorPrimary }}>
							{t("about-us", "About Us")}
						</RouterLink>
					</StyledAppFooter>
				</StyledContentWrapper>
			</Layout>

			{user && (
				<MobileDrawerComponent
					open={mobileDrawerOpen && isMobile}
					onClose={handleMobileDrawerToggle}
					onSettingsToggle={onSettingsToggle}
					onLogout={onLogout}
				/>
			)}
			{/* REMOVED: SearchOverlay component instance */}
			{/* <SearchOverlay visible={searchOverlayVisible} onClose={handleSearchToggle} /> */}
			{isMobile && user && <BottomNavComponent currentPath={location.pathname} onTabChange={handleMobileTabChange} />}
		</StyledLayout>
	);
});

const App = () => {
	const [direction, setDirection] = useState(() => localStorage.getItem("appDir") || "ltr");
	const [language, setLanguage] = useState(() => localStorage.getItem("i18nextLng") || "en");
	const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem("appTheme") || "light");
	const [componentSize, setComponentSize] = useState(() => localStorage.getItem("appComponentSize") || "middle");
	const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
	const { logout } = useAuthStore();
	const { i18n: i18nInstance, t } = useTranslation();

	const themeOptions = useMemo(
		() => [
			...Object.keys(colorTokens).map((name) => ({ value: name, label: t(`theme-${name}`, { defaultValue: name }) })),
			{ value: "dark_killer", label: t("theme-dark-killer", { defaultValue: "Dark Killer" }) },
		],
		[t],
	);
	const languageOptions = useMemo(
		() => [
			{ value: "en", label: "English" },
			{ value: "fa", label: "فارسی" },
			{ value: "ar", label: "العربية" },
		],
		[],
	);
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

	const antDesignTheme = useMemo(() => {
		let currentTokens = colorTokens["light"]; // Default to light
		let isSystemDark = false;

		if (selectedTheme === "dark_killer") {
			const baseDark = colorTokens["dark"] || {}; // Ensure 'dark' theme exists in colorTokens for fallback
			return {
				...darkKillerTheme, // from themeConfig
				algorithm: darkAlgorithm,
				token: {
					...baseDark, // Provide base dark tokens
					...darkKillerTheme.token, // Override with specific darkKiller tokens
					// Ensure crucial tokens like colorBgLayout are present in darkKillerTheme.token or baseDark
					colorBgLayout: darkKillerTheme.token?.layoutBackground || baseDark?.layoutBackground || "#141414",
					colorBgContainer: darkKillerTheme.token?.paperColor || baseDark?.paperColor || "#1f1f1f",
				},
			};
		} else if (colorTokens[selectedTheme]) {
			currentTokens = colorTokens[selectedTheme];
			isSystemDark = currentTokens.isDark === true;
		} else {
			console.warn(`Invalid theme "${selectedTheme}", falling back to "light".`);
			// currentTokens remains colorTokens["light"]
			// selectedTheme is not changed here to avoid re-render loop, localStorage will persist invalid theme until changed by user
		}

		return {
			algorithm: isSystemDark ? darkAlgorithm : defaultAlgorithm,
			token: {
				colorPrimary: currentTokens.primaryColor,
				colorSuccess: currentTokens.successColor,
				colorWarning: currentTokens.warningColor,
				colorError: currentTokens.errorColor,
				colorInfo: currentTokens.infoColor,
				colorBgLayout: currentTokens.layoutBackground || (isSystemDark ? "#141414" : "#f0f2f5"),
				colorBgContainer: currentTokens.paperColor || (isSystemDark ? "#1f1f1f" : "#ffffff"),
				colorBgElevated: currentTokens.paperColor || (isSystemDark ? "#262626" : "#ffffff"), // Often same as paperColor
				colorTextBase: currentTokens.textColor || (isSystemDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)"),
				colorTextSecondary: currentTokens.textSecondaryColor || (isSystemDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.65)"),
				colorTextDescription: currentTokens.textDescriptionColor || (isSystemDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)"),
				colorBorder: currentTokens.borderColor || (isSystemDark ? "#303030" : "#d9d9d9"),
				colorBorderSecondary: currentTokens.dividerColor || (isSystemDark ? "#303030" : "#f0f0f0"), // often a lighter border
				borderRadius: currentTokens.borderRadius || 6,
				borderRadiusLG: currentTokens.borderRadiusLG || 8, // For larger elements like cards, modals
				controlItemBgHover: currentTokens.controlItemBgHover || (isSystemDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)"),
				colorPrimaryBg: currentTokens.primaryColorBg || (isSystemDark ? "rgba(22, 119, 255, 0.2)" : "#e6f4ff"), // Light background for primary elements
			},
			components: {
				Layout: {
					// Specific component overrides
					sider: { colorBgSider: currentTokens.paperColor || (isSystemDark ? "#1f1f1f" : "#ffffff") }, // Sider often uses paper/container color
					header: { colorBgHeader: currentTokens.paperColor || (isSystemDark ? "#1f1f1f" : "#ffffff") }, // Header too
				},
				Menu: {
					// Menu specific tokens
					colorItemText: currentTokens.textColor,
					colorItemTextSelected: currentTokens.primaryColor, // Or specific selected text color
					colorItemBgSelected: currentTokens.primaryColorBg,
					colorItemBgHover: currentTokens.controlItemBgHover,
					...(isSystemDark && {
						// Overrides for dark menu
						colorItemText: "rgba(255, 255, 255, 0.75)",
						colorItemTextSelected: "#ffffff", // Brighter selected text for dark
						colorItemBgSelected: currentTokens.primaryColor, // Often a solid primary color for dark selected
						colorItemTextHover: "#ffffff",
						colorItemBgHover: "rgba(255, 255, 255, 0.1)",
					}),
				},
				// Add other component specific tokens as needed
			},
		};
	}, [selectedTheme]); // Only selectedTheme is needed here if colorTokens and darkKillerTheme are stable

	const handleThemeSelectChange = useCallback((value) => {
		setSelectedTheme(value);
		localStorage.setItem("appTheme", value);
	}, []);
	const handleLanguageChange = useCallback(
		(value) => {
			setLanguage(value);
			i18nInstance.changeLanguage(value);
			const newDirection = value === "ar" || value === "fa" ? "rtl" : "ltr";
			setDirection(newDirection);
			document.documentElement.dir = newDirection;
			document.documentElement.lang = value;
			localStorage.setItem("i18nextLng", value);
			localStorage.setItem("appDir", newDirection);
		},
		[i18nInstance],
	);
	useEffect(() => {
		const initialDirection = localStorage.getItem("appDir") || (language === "ar" || language === "fa" ? "rtl" : "ltr");
		document.documentElement.dir = initialDirection;
		document.documentElement.lang = language;
		if (i18nInstance.language !== language) {
			i18nInstance.changeLanguage(language);
		}
		setDirection(initialDirection);
	}, [language, i18nInstance]);

	const handleComponentSizeChange = useCallback((e) => {
		const newSize = e.target.value;
		setComponentSize(newSize);
		localStorage.setItem("appComponentSize", newSize);
	}, []);

	const toggleGlobalSettingsDrawer = useCallback(() => {
		setSettingsDrawerVisible((prev) => !prev);
	}, []);

	const handleLogout = useCallback(() => {
		logout();
		// Optionally navigate to login page
		// navigate('/login'); // if navigate is available here or passed down
	}, [logout]);

	const ThemeProviderComponent = selectedTheme === "dark_killer" ? ComplexThemeProvider : ConfigProvider;
	const themeProviderProps = selectedTheme === "dark_killer" ? { theme: antDesignTheme } : { theme: antDesignTheme };

	return (
		<AppWrapper theme={{ token: antDesignTheme.token }}>
			<ThemeProviderComponent direction={direction} locale={antdLocale} componentSize={componentSize} {...themeProviderProps}>
				<AppLayout
					direction={direction}
					language={language}
					componentSize={componentSize}
					onSettingsToggle={toggleGlobalSettingsDrawer}
					onLogout={handleLogout}>
					<Routes>
						{appRoutes.map((route, index) => (
							<Route key={index} path={route.path} element={route.element} />
						))}
						{/* <Route path="*" element={<NotFoundPage />} /> */}
					</Routes>
				</AppLayout>
				<SettingsDrawerComponent
					visible={settingsDrawerVisible}
					onClose={toggleGlobalSettingsDrawer}
					language={language}
					onLanguageChange={handleLanguageChange}
					theme={selectedTheme}
					onThemeChange={handleThemeSelectChange}
					size={componentSize}
					onSizeChange={handleComponentSizeChange}
					languageOptions={languageOptions}
					themeOptions={themeOptions}
				/>
			</ThemeProviderComponent>
		</AppWrapper>
	);
};

const RootApp = () => (
	<Router>
		<App />
	</Router>
);

export { g2Themes };
export default RootApp;
