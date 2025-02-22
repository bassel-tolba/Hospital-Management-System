// --- Profile.js --- (Updated)
import React from "react";
import { useAuthStore } from "../../services/auth.service";
import { Button, Typography, Space, Alert, Card, Avatar, Tooltip, Row, Col } from "antd";
import { UserOutlined, MedicineBoxOutlined, HeartOutlined, AuditOutlined, CheckCircleOutlined, KeyOutlined } from "@ant-design/icons";
import styled, { keyframes } from "styled-components";

const { Title, Text, Paragraph } = Typography;

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
	max-width: 700px;
	animation: ${fadeIn} 0.5s ease-out;

	&:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 768px) {
		/* Responsive adjustments for smaller screens */
		max-width: 95%;
	}
`;

const AnimatedText = styled(Text)`
	animation: ${fadeIn} 0.5s ease-out;
	font-size: 1rem; /* Consistent font size */
	line-height: 1.5;
`;

const AnimatedTitle = styled(Title)`
	animation: ${fadeIn} 0.5s ease-out;
	text-align: center;
	margin-bottom: 20px;
	font-size: 2rem; /* Larger title */
	font-weight: 600;
`;

const PermissionItem = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 4px;
	padding: 4px 8px;
	border-radius: 4px;
	background-color: #fafafa;
	font-size: 0.9rem; /* Slightly smaller font for permissions */

	.anticon {
		margin-right: 8px;
		font-size: 16px;
	}
`;

// Reusing your existing RoleIcon for consistency
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
		// ... (rest of your RoleIcon cases)
		default:
			return <UserOutlined />;
	}
};
const transformImageUrl = (url) => {
	if (!url) return null;
	let fileUrl = url;
	if (fileUrl.startsWith(".")) {
		fileUrl = fileUrl.substring(1);
	}
	return `${fileUrl}`;
};
const Profile = () => {
	const { user, logout, status, error, clearError } = useAuthStore();

	const handleLogout = () => {
		logout();
		clearError();
	};

	return (
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<StyledCard>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<AnimatedTitle level={2}>
						<Space>
							<KeyOutlined />
							Profile
						</Space>
					</AnimatedTitle>
					{status === "loading" && <Alert message="Loading..." type="info" />}
					{error && <Alert message={`Error: ${error}`} type="error" />}

					{user ? (
						<Space direction="vertical" size="middle" style={{ width: "100%" }}>
							<div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
								{/* Larger Avatar */}
								<Avatar
									size={128} // Increased size
									src={user.profilePictureURL ? transformImageUrl(user.profilePictureURL) : null}
									icon={<UserOutlined />}
									style={{
										marginRight: 20,
										backgroundColor: user.profilePictureURL ? undefined : "#f0f2f5",
										color: user.profilePictureURL ? undefined : "#000",
									}}
								/>
								<div>
									<AnimatedTitle level={3} style={{ marginBottom: 0 }}>
										<Text>
											<RoleIcon role={user.roleName} />
											{user.firstName} {user.lastName}
										</Text>
									</AnimatedTitle>
									<AnimatedText type="secondary" style={{ fontSize: "1.2rem" }}>
										{user.roleName}
									</AnimatedText>{" "}
									{/* Larger role name */}
								</div>
							</div>

							{/* Responsive Row/Col for User Details */}
							<Row gutter={[16, 16]}>
								<Col xs={24} sm={12}>
									<AnimatedText strong>Username:</AnimatedText>
								</Col>
								<Col xs={24} sm={12}>
									<AnimatedText>{user.username}</AnimatedText>
								</Col>

								<Col xs={24} sm={12}>
									<AnimatedText strong>Specialty:</AnimatedText>
								</Col>
								<Col xs={24} sm={12}>
									<AnimatedText>{user.specialty || "Not Specified"}</AnimatedText>
								</Col>

								{/* Permissions Section */}
								<Col span={24}>
									<AnimatedText strong>Permissions:</AnimatedText>
									{user.authorities && user.authorities.length > 0 ? (
										<div style={{ marginTop: 8 }}>
											{user.authorities.map((permission) => (
												<PermissionItem key={permission}>
													<CheckCircleOutlined style={{ color: "green" }} />
													<Text>{permission}</Text>
												</PermissionItem>
											))}
										</div>
									) : (
										<AnimatedText type="secondary">No permissions found.</AnimatedText>
									)}
								</Col>
							</Row>

							<div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
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
