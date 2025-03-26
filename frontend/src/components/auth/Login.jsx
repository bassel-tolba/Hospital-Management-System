import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Alert, Space, Card } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { LockOutlined, UserOutlined, LoginOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const Login = () => {
	// No longer need useState for username and password here
	const { status, error, login, clearError } = useAuthStore();
	const { t } = useTranslation();
	const [form] = Form.useForm(); // Use Ant Design's Form.useForm hook

	useEffect(() => {
		return () => {
			//any cleanup
		};
	}, []);

	const handleSubmit = async (values) => {
		// Receive form values directly
		try {
			await login(values.username, values.password); // Use values.username, values.password
		} catch (error) {
			console.error("Login component error:", error);
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
							{t("login")}
						</Space>
					</Title>
					{status === "loading" && <Alert message={t("loading")} type="info" showIcon />}
					{status === "success" && <Alert message={t("login-successful")} type="success" showIcon={<CheckCircleOutlined />} />}
					{status === "failed" && error && <Alert message={`${t("login-failed")}: ${error}`} type="error" showIcon />}

					<Form form={form} onFinish={handleSubmit}>
						{" "}
						{/* Pass the form instance */}
						<Form.Item name="username" rules={[{ required: true, message: t("please-enter-username") }]}>
							<Input
								prefix={<UserOutlined />}
								type="text"
								// Remove value and onChange
								placeholder={t("username")}
							/>
						</Form.Item>
						<Form.Item name="password" rules={[{ required: true, message: t("please-enter-password") }]}>
							<Input
								prefix={<LockOutlined />}
								type="password"
								// Remove value and onChange
								placeholder={t("password")}
							/>
						</Form.Item>
						<Form.Item style={{ display: "flex", justifyContent: "center" }}>
							<Button type="primary" htmlType="submit" disabled={status === "loading"} style={{ width: "200px" }}>
								<LoginOutlined /> {t("login")}
							</Button>
						</Form.Item>
					</Form>
				</Space>
			</Card>
		</div>
	);
};

export default Login;
