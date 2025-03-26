// Register.jsx
import React from "react";
import { Card, Space, Typography } from "antd"; // Import Typography
import styled from "styled-components";
// Removed: motion, AnimatePresence
import UserRegistration from "./UserRegistration";
import { useTranslation } from "react-i18next"; // Import
import { UserAddOutlined } from "@ant-design/icons";

// StyledCard (kept, but now using Ant Design's Card directly)
const StyledCard = styled(Card)`
	// Directly style the antd Card
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	width: 100%;
	max-width: 700px;

	@media (max-width: 768px) {
		max-width: 95%;
	}
`;
const { Title } = Typography;

const Register = () => {
	const { t } = useTranslation();
	return (
		// Removed: AnimatePresence, motion.div
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<StyledCard>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<Title level={2} style={{ textAlign: "center" }}>
						<Space>
							<UserAddOutlined />
							{t("register-user")}
						</Space>
					</Title>
					<UserRegistration />
				</Space>
			</StyledCard>
		</div>
	);
};

export default Register;
