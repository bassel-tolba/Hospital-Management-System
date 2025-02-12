import React from "react";
import { Typography, Row, Col, Card, Divider, Space, Tooltip } from "antd";
import styled from "styled-components";
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

const { Title, Paragraph, Text } = Typography;

const FeatureCard = styled(Card)`
	margin-bottom: 12px; /* Reduced margin */
	transition: all 0.3s ease;
	height: 100%; /* Make cards the same height */

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.1);
	}
`;

const FeatureLink = styled(RouterLink)`
	color: inherit;
	text-decoration: none;
	display: block;
	height: 100%;

	&:hover {
		color: inherit;
		text-decoration: none;
	}
`;

const StyledCardContent = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start; /* Align items to the top */
	align-items: stretch; /* Stretch items to fill the card */
	padding: 8px; /* Reduced padding */
`;

const IconWrapper = styled.div`
	font-size: 20px; /* Reduced icon size */
	margin-bottom: 8px; /* Reduced margin */
	color: #1890ff;
	text-align: center; /* Center the icon */
`;

const CategoryTitle = styled(Title)`
	&& {
		margin-bottom: 0.5em;
	}
`;

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

const getDescription = (path) => {
	switch (path) {
		case "/login":
			return "Welcome back! Sign in securely to your account.";
		case "/register":
			return "Join our healthcare family - create your new account here.";
		case "/profile":
			return "Your personal space to manage your information and preferences.";
		case "/patients":
			return "Access and care for your patients with ease.";
		case "/activities":
			return "Keep track of your patients' daily progress and activities.";
		case "/procedures":
			return "Streamline and document patient care procedures.";
		case "/vital-signs":
			return "Monitor your patients' health indicators in real-time.";
		case "/assessments":
			return "Complete thorough patient evaluations with our helpful tools.";
		case "/procedure-logs":
			return "Document patient care seamlessly and efficiently.";
		case "/units":
			return "Navigate and manage hospital departments with ease.";
		case "/rooms":
			return "Find and organize patient rooms effortlessly.";
		case "/beds":
			return "Ensure comfortable accommodation for all patients.";
		case "/admissions":
			return "Smoothly handle patient arrivals and departures.";
		case "/users":
			return "Connect and collaborate with your healthcare team.";
		case "/medications":
			return "Keep track of our medication inventory with ease.";
		case "/medications/history":
			return "Review complete medication histories for better care.";
		case "/prescriptions":
			return "Manage patient prescriptions safely and efficiently.";
		case "/medication-administrations":
			return "Record and track medication delivery to patients.";
		case "/product-usages":
			return "Monitor and manage healthcare supply usage.";
		case "/products":
			return "Access our complete catalog of healthcare supplies.";
		case "/billings":
			return "Handle patient billing with care and efficiency.";
		case "/image-reports":
			return "Access and organize patient imaging results.";
		case "/image-report-types":
			return "Manage different types of imaging studies.";
		case "/documents":
			return "Keep patient records organized and accessible.";
		case "/document-types":
			return "Organize different types of patient documentation.";
		case "/lab-tests":
			return "Order and track laboratory tests easily.";
		case "/lab-results":
			return "Access patient test results quickly and securely.";
		case "/inventory":
			return "Manage hospital supplies efficiently.";
		default:
			return "Explore this helpful feature.";
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
				{ name: "Medication History", path: "/medications/history" },
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
			<Title level={2}>Welcome to GMTS Hospital</Title>
			<Paragraph>
				Everything you need to provide excellent patient care is right here. We've organized all our features to help you work efficiently and
				focus on what matters most - your patients. Click any card below to get started.
			</Paragraph>

			{features.map((featureCategory, index) => (
				<div key={index}>
					<Divider orientation="left">
						<Space align="center">
							{getIcon(featureCategory.title)}
							<CategoryTitle level={4}>{featureCategory.title}</CategoryTitle>
						</Space>
					</Divider>
					<Row gutter={[16, 16]}>
						{featureCategory.items.map((item, i) => (
							<Col xs={12} sm={8} md={6} lg={4} key={i}>
								{" "}
								{/* Increased the number of cards per row */}
								<FeatureCard hoverable size="small">
									<FeatureLink to={item.path}>
										<StyledCardContent>
											<IconWrapper>{getCardIcon(item.path)}</IconWrapper>
											<Title level={5} style={{ marginBottom: "4px", textAlign: "center", fontSize: "14px" }}>
												{item.name}
											</Title>
											<Tooltip title={getDescription(item.path)}>
												<Text type="secondary" ellipsis style={{ fontSize: "12px", textAlign: "center" }}>
													{getDescription(item.path)}
												</Text>
											</Tooltip>
										</StyledCardContent>
									</FeatureLink>
								</FeatureCard>
							</Col>
						))}
					</Row>
				</div>
			))}
		</div>
	);
};

export default AllFeaturesPage;
