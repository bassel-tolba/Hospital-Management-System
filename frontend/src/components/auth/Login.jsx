import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert, Space, Card } from "antd";
import { useAuthStore } from "../../services/auth.service";
import styled, { keyframes } from "styled-components";
import { LockOutlined, UserOutlined, LoginOutlined } from "@ant-design/icons";

const { Title } = Typography;

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
	max-width: 400px; /* Adjust card size for small screens*/
	margin-bottom: 1rem;
	animation: ${fadeIn} 0.5s ease-out; /* Apply fade-in animation */

	&:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
	}
`;

const StyledForm = styled(Form)`
	margin-top: 10px;
`;

const AnimatedTitle = styled(Title)`
	animation: ${fadeIn} 0.5s ease-out;
	text-align: center;
	margin-bottom: 1rem;
`;

const AnimatedButton = styled(Button)`
	animation: ${fadeIn} 0.5s ease-out;
`;

const AnimatedAlert = styled(Alert)`
	animation: ${fadeIn} 0.5s ease-out;
`;

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { status, error, login, clearError, setSuccess } = useAuthStore();

	const handleSubmit = async () => {
		try {
			await login(username, password);
			clearError();
		} catch (error) {
			console.log(error);
			// error handle by zustand
		}
	};

	return (
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<StyledCard>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<AnimatedTitle level={2}> Login </AnimatedTitle>
					{status === "loading" && <AnimatedAlert message="Loading..." type="info" />}
					{error && <AnimatedAlert message={`Login Failed: ${error}`} type="error" />}
					<StyledForm onFinish={handleSubmit}>
						<Form.Item rules={[{ required: true, message: "Please enter your username!" }]}>
							<Input
								prefix={<UserOutlined />}
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Username"
							/>
						</Form.Item>
						<Form.Item rules={[{ required: true, message: "Please enter your password!" }]}>
							<Input
								prefix={<LockOutlined />}
								type="password"
								value={password}
								placeholder="Password"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</Form.Item>
						<Form.Item style={{ textAlign: "center" }}>
							<AnimatedButton type="primary" htmlType="submit" disabled={status === "loading"}>
								<LoginOutlined /> Login
							</AnimatedButton>
						</Form.Item>
					</StyledForm>
				</Space>
			</StyledCard>
		</div>
	);
};

export default Login;
