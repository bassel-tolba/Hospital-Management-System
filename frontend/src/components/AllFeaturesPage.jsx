import React from "react";
import { Typography, Row, Col, Tooltip, Space } from "antd"; // Import Space
import styled, { keyframes } from "styled-components";
import { Link as RouterLink } from "react-router-dom";
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
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Paragraph, Text } = Typography;

// Keyframes for wave animation
const waveAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled Components
const ECard = styled.div`
	margin: 8px auto;
	background: transparent;
	box-shadow: 0px 8px 28px -9px rgba(0, 0, 0, 0.45);
	position: relative;
	width: 100%;
	max-width: 280px;
	height: 180px;
	border-radius: 12px;
	overflow: hidden;
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0px 12px 32px -8px rgba(0, 0, 0, 0.5);
	}
`;

const Wave = styled.div`
	position: absolute;
	width: 400px;
	height: 400px;
	opacity: 0.6;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -70%);
	background: linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb);
	border-radius: 40%;
	animation: ${waveAnimation} 55s infinite linear;

	&:nth-child(2) {
		transform: translate(-50%, -70%) rotate(120deg);
		animation-duration: 50s;
	}

	&:nth-child(3) {
		transform: translate(-50%, -70%) rotate(240deg);
		animation-duration: 45s;
	}
`;

const PlayingWave = styled(Wave)`
	animation-duration: 3000ms;
	animation-iteration-count: infinite;
	animation-timing-function: linear;

	&:nth-child(2) {
		animation-duration: 4000ms;
	}

	&:nth-child(3) {
		animation-duration: 5000ms;
	}
`;

const IconWrapper = styled.div`
	width: auto;
	margin: 0 auto;
	padding: 12px 0;

	.anticon {
		font-size: 24px;
	}
`;

const Infotop = styled.div`
	text-align: center;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 90%;
`;

const FeatureName = styled.div`
	font-size: 16px;
	font-weight: 500;
	margin: 8px 0;
	text-transform: capitalize;
`;

const FeatureLink = styled(RouterLink)`
	text-decoration: none;
	display: block;
	height: 100%;

	&:hover {
		color: inherit;
		text-decoration: none;
	}
`;

const StyledCardContent = styled.div`
	/*Keep this to contain the icon, name and text*/
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start; /* Align items to the top */
	align-items: stretch; /* Stretch items to fill the card */
	padding: 2px; /* Reduced padding */
`;
// Utility function to get linear gradient based on index
const getGradient = (index) => {
	const gradients = [
		"linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb)", // Purple/Blue
		"linear-gradient(744deg, #ff6b6b, #f08c00 60%, #ffd700)", // Red/Orange/Yellow
		"linear-gradient(744deg, #4CAF50, #8BC34A 60%, #CDDC39)", // Green shades
		"linear-gradient(744deg, #2196F3, #42A5F5 60%, #90CAF9)", // Blue shades
		"linear-gradient(744deg, #9C27B0, #BA68C8 60%, #E1BEE7)", // Purple shades
		"linear-gradient(744deg, #FF5722, #FF9800 60%, #FFC107)", // Orange Shades
		"linear-gradient(744deg, #009688, #4DB6AC 60%, #B2DFDB)", // Teal shades
	];
	return gradients[index % gradients.length];
};

// Function to get card-specific icons
const getCardIcon = (path) => {
	const iconStyle = { fontSize: "20px" };
	switch (path) {
		case "/login":
			return <LoginOutlined style={iconStyle} />;
		case "/register":
			return <UserAddOutlined style={iconStyle} />;
		case "/profile":
			return <UserOutlined style={iconStyle} />;
		case "/patients":
			return <TeamOutlined style={iconStyle} />;
		case "/activities":
			return <CalendarOutlined style={iconStyle} />;
		case "/procedures":
			return <MedicineBoxOutlined style={iconStyle} />;
		case "/vital-signs":
			return <MonitorOutlined style={iconStyle} />;
		case "/assessments":
			return <FileTextOutlined style={iconStyle} />;
		case "/procedure-logs":
			return <SaveOutlined style={iconStyle} />;
		case "/units":
			return <AppstoreOutlined style={iconStyle} />;
		case "/rooms":
			return <HomeOutlined style={iconStyle} />;
		case "/beds":
			return <RestOutlined style={iconStyle} />;
		case "/admissions":
			return <SolutionOutlined style={iconStyle} />;
		case "/users":
			return <UsergroupAddOutlined style={iconStyle} />;
		case "/medications":
			return <MedicineBoxTwoTone style={iconStyle} />;
		case "/medications/history":
			return <HistoryOutlined style={iconStyle} />;
		case "/prescriptions":
			return <FileProtectOutlined style={iconStyle} />;
		case "/medication-administrations":
			return <ThunderboltOutlined style={iconStyle} />;
		case "/product-usages":
			return <BoxPlotOutlined style={iconStyle} />;
		case "/products":
			return <ShopOutlined style={iconStyle} />;
		case "/billings":
			return <AccountBookOutlined style={iconStyle} />;
		case "/image-reports":
			return <FileImageOutlined style={iconStyle} />;
		case "/image-report-types":
			return <FileSearchOutlined style={iconStyle} />;
		case "/documents":
			return <FolderOutlined style={iconStyle} />;
		case "/document-types":
			return <ProfileOutlined style={iconStyle} />;
		case "/lab-tests":
			return <ExperimentTwoTone style={iconStyle} />;
		case "/lab-results":
			return <CheckCircleOutlined style={iconStyle} />;
		default:
			return <SettingOutlined style={iconStyle} />;
	}
};

const getDescription = (path, t) => {
	// Accept 't'
	switch (path) {
		case "/login":
			return t("login-description");
		case "/register":
			return t("register-description");
		case "/profile":
			return t("profile-description");
		case "/patients":
			return t("patients-description");
		case "/activities":
			return t("activities-description");
		case "/procedures":
			return t("procedures-description");
		case "/vital-signs":
			return t("vital-signs-description");
		case "/assessments":
			return t("assessments-description");
		case "/procedure-logs":
			return t("procedure-logs-description");
		case "/units":
			return t("units-description");
		case "/rooms":
			return t("rooms-description");
		case "/beds":
			return t("beds-description");
		case "/admissions":
			return t("admissions-description");
		case "/users":
			return t("users-description");
		case "/medications":
			return t("medications-description");
		case "/medications/history":
			return t("medications-history-description");
		case "/prescriptions":
			return t("prescriptions-description");
		case "/medication-administrations":
			return t("medication-administrations-description");
		case "/product-usages":
			return t("product-usages-description");
		case "/products":
			return t("products-description");
		case "/billings":
			return t("billings-description");
		case "/image-reports":
			return t("image-reports-description");
		case "/image-report-types":
			return t("image-report-types-description");
		case "/documents":
			return t("documents-description");
		case "/document-types":
			return t("document-types-description");
		case "/lab-tests":
			return t("lab-tests-description");
		case "/lab-results":
			return t("lab-results-description");
		case "/inventory":
			return t("inventory-description");
		default:
			return t("explore-feature-description");
	}
};

const getIcon = (title) => {
	const iconStyle = { fontSize: "20px" };
	switch (title) {
		case "Authentications":
			return <LockOutlined style={{ ...iconStyle, color: "#1890ff" }} />;
		case "Patient Management":
			return <HeartOutlined style={{ ...iconStyle, color: "#eb2f96" }} />;
		case "Administration":
			return <SettingOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
		case "Medication & Orders":
			return <BulbOutlined style={{ ...iconStyle, color: "#faad14" }} />;
		case "Billing & Finance":
			return <DollarCircleOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
		case "Diagnostics & Labs":
			return <ExperimentOutlined style={{ ...iconStyle, color: "#13c2c2" }} />;
		case "Inventory":
			return <ShoppingCartOutlined style={{ ...iconStyle, color: "#fa541c" }} />;
		default:
			return <SettingOutlined style={iconStyle} />;
	}
};

const AllFeaturesPage = () => {
	const { t } = useTranslation();
	const features = [
		{
			title: "Authentications",
			items: [
				{ name: "Login", path: "/login" },
				{ name: "Register", path: "/register" },
				{ name: "Profile", path: "/profile" },
			],
		},
		{
			title: "Patient Management",
			items: [
				{ name: "Patients", path: "/patients" },
				{ name: "Activities", path: "/activities" },
				{ name: "Procedures", path: "/procedures" },
				{ name: "Vital Signs", path: "/vital-signs" },
				{ name: "Assessments", path: "/assessments" },
				{ name: "Procedure Logs", path: "/procedure-logs" },
			],
		},
		{
			title: "Administration",
			items: [
				{ name: "Units", path: "/units" },
				{ name: "Rooms", path: "/rooms" },
				{ name: "Beds", path: "/beds" },
				{ name: "Admissions", path: "/admissions" },
				{ name: "Users", path: "/users" },
			],
		},
		{
			title: "Medication & Orders",
			items: [
				{ name: "Prescriptions", path: "/prescriptions" },
				{ name: "Medication Administrations", path: "/medication-administrations" },
				{ name: "Product Usages", path: "/product-usages" },
			],
		},
		{
			title: "Inventory",
			items: [
				{ name: "Medication", path: "/medications" },
				{ name: "Products", path: "/products" },
			],
		},
		{
			title: "Billing & Finance",
			items: [{ name: "Billings", path: "/billings" }],
		},
		{
			title: "Diagnostics & Labs",
			items: [
				{ name: "Image Reports", path: "/image-reports" },
				{ name: "Image Report Types", path: "/image-report-types" },
				{ name: "Documents", path: "/documents" },
				{ name: "Document Types", path: "/document-types" },
				{ name: "Lab Tests", path: "/lab-tests" },
				{ name: "Lab Results", path: "/lab-results" },
			],
		},
	];

	return (
		<div style={{ padding: "24px" }}>
			<Title level={2} style={{ marginBottom: "24px" }}>
				{t("welcome-to-gmts")}
			</Title>
			<Paragraph style={{ marginBottom: "32px" }}>{t("all-features-page-description")}</Paragraph>

			{features.map((featureCategory, index) => (
				<div key={index} style={{ marginBottom: "48px" }}>
					<Typography.Title
						level={4}
						style={{
							marginBottom: "24px",
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}>
						{getIcon(featureCategory.title)}
						{t(featureCategory.title.toLowerCase().replace(/ /g, "-"))}
					</Typography.Title>
					<Row gutter={[24, 24]}>
						{" "}
						{/* Increased gutter spacing */}
						{featureCategory.items.map((item, i) => {
							const cardIndex = index * featureCategory.items.length + i; // Unique index for each card
							return (
								<Col xs={24} sm={12} md={8} lg={6} key={i}>
									<ECard>
										<FeatureLink to={item.path}>
											<PlayingWave style={{ background: getGradient(cardIndex) }} />
											<PlayingWave style={{ background: getGradient(cardIndex) }} />
											<PlayingWave style={{ background: getGradient(cardIndex) }} />

											<StyledCardContent>
												<Infotop>
													<IconWrapper>{getCardIcon(item.path)}</IconWrapper>
													<FeatureName>{t(item.name.toLowerCase().replace(/ /g, "-"))}</FeatureName>
													<Tooltip title={getDescription(item.path, t)}>
														<Text
															type="secondary"
															ellipsis
															style={{ fontSize: "12px", textAlign: "center", color: "white" }}>
															{getDescription(item.path, t)}
														</Text>
													</Tooltip>
												</Infotop>
											</StyledCardContent>
										</FeatureLink>
									</ECard>
								</Col>
							);
						})}
					</Row>
				</div>
			))}
		</div>
	);
};

export default AllFeaturesPage;
