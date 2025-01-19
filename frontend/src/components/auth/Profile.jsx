import React from "react";
import { useAuthStore } from "../../services/auth.service";
import { Button, Typography, Space, Alert, Card, Avatar, Tooltip } from "antd";
import {
	UserOutlined,
	MedicineBoxOutlined,
	HeartOutlined,
	TeamOutlined,
	IdcardOutlined,
	SolutionOutlined,
	ExperimentOutlined,
	DesktopOutlined,
	WalletOutlined,
	InsuranceOutlined,
	SmileOutlined,
	HomeOutlined,
	FileTextOutlined,
	AuditOutlined,
} from "@ant-design/icons";
import styled, { keyframes } from "styled-components";

const { Title, Text } = Typography;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledCard = styled(Card)`
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	transition: box-shadow 0.3s ease;
	width: 100%;
	max-width: 600px;
	animation: ${fadeIn} 0.5s ease-out; /* Apply fade-in animation */

	&:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
	}
`;

const AnimatedText = styled(Text)`
	animation: ${fadeIn} 0.5s ease-out;
`;

const AnimatedTitle = styled(Title)`
	animation: ${fadeIn} 0.5s ease-out;
	text-align: center;
	margin-bottom: 20px;
`;

const RoleIcon = ({ role }) => {
	switch (role) {
		case "ADMIN":
			return (
				<Tooltip title="Administrator">
					<AuditOutlined style={{ fontSize: "24px", color: "#40a9ff" }} />
				</Tooltip>
			);
		case "DOCTOR":
			return (
				<Tooltip title="Doctor">
					<MedicineBoxOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
				</Tooltip>
			);
		case "NURSE":
			return (
				<Tooltip title="Nurse">
					<HeartOutlined style={{ fontSize: "24px", color: "#eb2f96" }} />
				</Tooltip>
			);
		case "HEAD_NURSE":
			return (
				<Tooltip title="Head Nurse">
					<HeartOutlined style={{ fontSize: "24px", color: "#c41a52" }} />
				</Tooltip>
			);
		case "PATIENT":
			return (
				<Tooltip title="Patient">
					<UserOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
				</Tooltip>
			);
		case "RECEPTIONIST":
			return (
				<Tooltip title="Receptionist">
					<SolutionOutlined style={{ fontSize: "24px", color: "#faad14" }} />
				</Tooltip>
			);
		case "PHARMACIST":
			return (
				<Tooltip title="Pharmacist">
					<ExperimentOutlined style={{ fontSize: "24px", color: "#722ed1" }} />
				</Tooltip>
			);
		case "LAB_TECHNICIAN":
			return (
				<Tooltip title="Lab Technician">
					<ExperimentOutlined style={{ fontSize: "24px", color: "#237804" }} />
				</Tooltip>
			);
		case "RADIOLOGIST":
			return (
				<Tooltip title="Radiologist">
					<DesktopOutlined style={{ fontSize: "24px", color: "#13c2c2" }} />
				</Tooltip>
			);
		case "ACCOUNTANT":
			return (
				<Tooltip title="Accountant">
					<WalletOutlined style={{ fontSize: "24px", color: "#fa8c16" }} />
				</Tooltip>
			);
		case "INSURANCE_PROVIDER":
			return (
				<Tooltip title="Insurance Provider">
					<InsuranceOutlined style={{ fontSize: "24px", color: "#ad8b00" }} />
				</Tooltip>
			);
		case "SOCIAL_WORKER":
			return (
				<Tooltip title="Social Worker">
					<SmileOutlined style={{ fontSize: "24px", color: "#2f54eb" }} />
				</Tooltip>
			);
		default:
			return <UserOutlined />;
	}
};

const Profile = () => {
	const { user, logout, status, error, clearError } = useAuthStore();

	const handleLogout = () => {
		logout();
		clearError();
	};

	console.log("Profile component - user:", user);
	console.log("Profile component - status:", status);
	console.log("Profile component - error:", error);

	return (
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<StyledCard>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<AnimatedTitle level={2}>
						<Space>
							{" "}
							<HomeOutlined />
							Profile
						</Space>
					</AnimatedTitle>
					{status === "loading" && <Alert message="Loading..." type="info" />}
					{error && <Alert message={`Error: ${error}`} type="error" />}
					{user ? (
						<Space direction="vertical" size="middle" style={{ width: "100%" }}>
							<div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
								<Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 15, backgroundColor: "#f0f2f5", color: "#000" }} />

								<div>
									<AnimatedTitle level={4} style={{ marginBottom: 0 }}>
										<Text>
											<RoleIcon role={user.role} />
											Hello, {user.firstName} {user.lastName}
										</Text>
									</AnimatedTitle>
									<AnimatedText type="secondary">{user.role}</AnimatedText>
								</div>
							</div>
							<Space direction="vertical">
								<AnimatedText strong>Username: </AnimatedText>
								<AnimatedText>{user.username}</AnimatedText>
								<AnimatedText strong>Specialty: </AnimatedText>
								<AnimatedText>{user.specialty || "Not Specified"}</AnimatedText>
							</Space>

							<div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
								<Button type="primary" onClick={handleLogout} style={{ width: "200px" }}>
									Logout
								</Button>
							</div>
						</Space>
					) : (
						<Text style={{ textAlign: "center" }}>You are not logged in</Text>
					)}
				</Space>
			</StyledCard>
		</div>
	);
};

export default Profile;
