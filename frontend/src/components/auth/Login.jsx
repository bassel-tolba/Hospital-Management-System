import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Alert, Space, Card } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { LockOutlined, UserOutlined, LoginOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { status, error, login, clearError } = useAuthStore();

	useEffect(() => {
		return () => {
			//any cleanup
		};
	}, []);

	const handleSubmit = async () => {
		try {
			await login(username, password);
			// No need to call clearError here; it's handled in the store
		} catch (error) {
			// Error handling is now primarily in the auth service
			console.error("Login component error:", error); // More specific error logging
		}
	};

	return (
		<div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
			<Card
				className="login-card"
				style={{
					borderRadius: "10px",
					boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
					width: "100%",
					maxWidth: "400px",
				}}>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<Title level={2} style={{ textAlign: "center" }}>
						<Space>
							<LoginOutlined />
							Login
						</Space>
					</Title>
					{status === "loading" && <Alert message="Loading..." type="info" showIcon />}
					{status === "success" && <Alert message="Login Successful!" type="success" showIcon={<CheckCircleOutlined />} />}{" "}
					{/* Success Alert */}
					{status === "failed" && error && <Alert message={`Login Failed: ${error}`} type="error" showIcon />}{" "}
					{/* Improved error display */}
					<Form onFinish={handleSubmit}>
						<Form.Item
							name="username" // Add name attributes for antd form to work correct
							rules={[{ required: true, message: "Please enter your username!" }]}>
							<Input
								prefix={<UserOutlined />}
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Username"
							/>
						</Form.Item>

						<Form.Item name="password" rules={[{ required: true, message: "Please enter your password!" }]}>
							<Input
								prefix={<LockOutlined />}
								type="password"
								value={password}
								placeholder="Password"
								onChange={(e) => setPassword(e.target.value)}
							/>
						</Form.Item>

						<Form.Item style={{ display: "flex", justifyContent: "center" }}>
							<Button type="primary" htmlType="submit" disabled={status === "loading"} style={{ width: "200px" }}>
								<LoginOutlined /> Login
							</Button>
						</Form.Item>
					</Form>
				</Space>
			</Card>
		</div>
	);
};

export default Login;
