// src/components/auth/Profile.js
import React from "react";
import { useAuthStore } from "../../services/auth.service";
import { Button, Typography, Space, Alert, Card, Avatar, Tooltip, Row, Col } from "antd";
import { UserOutlined, MedicineBoxOutlined, HeartOutlined, AuditOutlined, CheckCircleOutlined, KeyOutlined } from "@ant-design/icons";
// Removed: motion, AnimatePresence (no longer needed)
import styled from "styled-components";
import { useTranslation } from "react-i18next"; // Import

const { Title, Text, Paragraph } = Typography;

// Keep StyledCard, but remove motion.
const StyledCard = styled(Card)`
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 700px;

	@media (max-width: 768px) {
		max-width: 95%;
	}
`;

// Keep PermissionItem, but remove motion.
const PermissionItem = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 4px;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 0.9rem;

	.anticon {
		margin-right: 8px;
		font-size: 16px;
	}
`;

// Reusing your existing RoleIcon for consistency
const RoleIcon = ({ role }) => {
	const { t } = useTranslation(); // Use in sub-components if needed
	switch (role) {
		case "ADMIN":
			return (
				<Tooltip title={t("administrator")}>
					<AuditOutlined style={{ fontSize: "24px", color: "#40a9ff" }} />
				</Tooltip>
			);
		case "DOCTOR":
			return (
				<Tooltip title={t("doctor")}>
					<MedicineBoxOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
				</Tooltip>
			);
		case "NURSE":
			return (
				<Tooltip title={t("nurse")}>
					<HeartOutlined style={{ fontSize: "24px", color: "#eb2f96" }} />
				</Tooltip>
			);
		case "HEAD_NURSE":
			return (
				<Tooltip title={t("head-nurse")}>
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
	const { t } = useTranslation();

	const handleLogout = () => {
		logout();
		clearError();
	};

	return (
		// Removed: AnimatePresence, motion.div, initial, animate, variants
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<StyledCard>
				{" "}
				{/* Use StyledCard (now just a styled Ant Design Card) */}
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					{/* Removed: motion.div, variants, initial, animate */}
					<Title level={2} style={{ textAlign: "center" }}>
						<Space>
							<KeyOutlined />
							{t("profile")}
						</Space>
					</Title>

					{status === "loading" && <Alert message={t("loading")} type="info" />}
					{error && <Alert message={`${t("error")}: ${error}`} type="error" />}

					{user ? (
						<Space direction="vertical" size="middle" style={{ width: "100%" }}>
							{/* Removed: motion.div, variants */}
							<div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
								{/* Removed: motion.div, variants */}
								<Avatar
									size={128}
									src={user.profilePictureURL ? transformImageUrl(user.profilePictureURL) : null}
									icon={<UserOutlined />}
									style={{
										marginRight: 20,
										backgroundColor: user.profilePictureURL ? undefined : "#f0f2f5",
										color: user.profilePictureURL ? undefined : "#000",
									}}
								/>
								{/* Removed: motion.div, variants */}
								<div>
									<Title level={3} style={{ marginBottom: 0 }}>
										<Text>
											<RoleIcon role={user.roleName} />
											{user.firstName} {user.lastName}
										</Text>
									</Title>
									<Text type="secondary" style={{ fontSize: "1.2rem" }}>
										{t(user.roleName.toLowerCase())}
									</Text>
								</div>
							</div>

							<Row gutter={[16, 16]}>
								{/* Enhanced User Details - Removed Animation */}
								<Col span={24}>
									{/* Removed: motion.div, variants, className, initial, animate */}
									<div
										className="user-details-container"
										style={{
											borderRadius: "8px",
											padding: "16px",
											boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
										}}>
										{[
											{
												label: t("username"),
												value: user.username,
												icon: <UserOutlined style={{ color: "#1890ff" }} />,
											},
											{
												label: t("specialty"),
												value: user.specialty || t("not-specified"),
												icon: <MedicineBoxOutlined style={{ color: "#52c41a" }} />,
											},
										].map((item, index) => (
											// Removed: motion.div, variants, initial, animate, transition, whileHover
											<div
												key={item.label}
												style={{
													display: "flex",
													alignItems: "center",
													padding: "12px 0",
													borderBottom: index === 0 ? "1px dashed var(--border-color, #eaeaea)" : "none",
												}}>
												<div style={{ marginRight: "12px", fontSize: "20px" }}>{item.icon}</div>
												<div>
													<Text type="secondary" style={{ fontSize: "0.9rem", display: "block" }}>
														{item.label}
													</Text>
													<Text strong style={{ fontSize: "1.1rem" }}>
														{item.value}
													</Text>
												</div>
											</div>
										))}
									</div>
								</Col>

								{/* Permissions Section - Removed Animation */}
								<Col span={24}>
									{/* Removed: motion.div, variants */}
									<Card
										title={
											<div style={{ display: "flex", alignItems: "center" }}>
												<AuditOutlined style={{ marginRight: "8px", color: "#722ed1" }} />
												<Text strong>{t("permissions")}</Text>
											</div>
										}
										size="small"
										style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
										{user.authorities && user.authorities.length > 0 ? (
											<div style={{ marginTop: 8 }}>
												{user.authorities.map((permission, index) => (
													// Removed: variants, initial, animate, transition, whileHover
													<PermissionItem
														key={permission}
														style={{
															padding: "8px 12px",
															borderRadius: "4px",
															marginBottom: "4px",
														}}>
														{/* Removed: motion.div, whileHover, transition */}
														<CheckCircleOutlined style={{ color: "green" }} />
														<Text>{t(permission.toLowerCase().replace(/_/g, "-"))}</Text>
													</PermissionItem>
												))}
											</div>
										) : (
											<Text type="secondary">{t("no-permissions-found")}</Text>
										)}
									</Card>
								</Col>
							</Row>
							{/* Removed: motion.div, variants, whileHover, whileTap */}
							<div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
								<Button type="primary" onClick={handleLogout} style={{ width: "200px" }}>
									{t("logout")}
								</Button>
							</div>
						</Space>
					) : (
						// Removed: motion.div, initial, animate, transition
						<Text style={{ textAlign: "center" }}>{t("you-are-not-logged-in")}</Text>
					)}
				</Space>
			</StyledCard>
		</div>
	);
};

export default Profile;
