// --- Register.js ---  (Updated to only include user registration)
import React from "react";
import { Card, Space } from "antd";
import styled from "styled-components";
import UserRegistration from "./UserRegistration"; // Import the separate component

const StyledCard = styled(Card)`
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	transition: box-shadow 0.3s ease;
	width: 100%;
	max-width: 700px;
	margin-bottom: 1rem;
	animation: fadeIn 0.5s ease-out;

	&:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
	}
`;

const Register = () => {
	return (
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<StyledCard>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<UserRegistration />
				</Space>
			</StyledCard>
		</div>
	);
};

export default Register;
