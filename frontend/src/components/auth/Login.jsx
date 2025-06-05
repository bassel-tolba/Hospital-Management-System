// components/auth/Login.js
import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Alert, Space, Card } from "antd";
import { useAuthStore } from "../../services/auth.service"; // Adjust path if necessary
import { LockOutlined, UserOutlined, LoginOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const { Title } = Typography;

const Login = () => {
	const navigate = useNavigate(); // Get the navigate function
	const { status, error, login, clearError } = useAuthStore();
	const { t } = useTranslation();
	const [form] = Form.useForm();

	useEffect(() => {
		// Clear any previous login errors when the component mounts or if status changes
		if (status !== "failed") {
			clearError();
		}
		// Optional: If already logged in (e.g., user navigates to /login manually while logged in), redirect
		// This depends on whether you want this behavior. If so, you'd need to access the user from the store.
		// const currentUser = useAuthStore.getState().user;
		// if (currentUser) {
		//    navigate('/profile', { replace: true });
		// }

		return () => {
			// Cleanup if needed, e.g., clearError on unmount if preferred
			// clearError();
		};
	}, [status, clearError]); // Rerun effect if status or clearError function changes

	const handleSubmit = async (values) => {
		try {
			// Pass the navigate function to the login action
			await login(values.username, values.password, navigate);
			// Navigation to '/profile' will be handled within the login action (in auth.service.js)
			// if successful.
		} catch (error) {
			// Error is set in the store and displayed by the Alert component.
			// The Form's onFinishFailed can also handle field-specific errors if needed.
			console.error("Login component error:", error.message); // Log the error message
		}
	};

	// Redirect if already logged in and login was successful
	// This handles the case where the component re-renders after status becomes 'success'
	useEffect(() => {
		if (status === "success" && useAuthStore.getState().user) {
			// The actual navigation to '/profile' is now handled inside the login action.
			// This useEffect could be used for other side-effects post-login if needed,
			// or to redirect if the user somehow lands here while already logged in.
			// For now, the primary navigation to '/profile' happens via the navigate prop passed to login().
		}
	}, [status, navigate]);

	return (
		<div
			style={{
				padding: 20,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "calc(100vh - 128px)" /* Adjust based on header/footer height */,
			}}>
			<Card
				className="login-card"
				style={{
					borderRadius: "10px",
					boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
					width: "100%",
					maxWidth: "400px",
				}}>
				<Space direction="vertical" size="large" style={{ width: "100%" }}>
					<Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
						<Space>
							<LoginOutlined />
							{t("login", "Login")}
						</Space>
					</Title>

					{/* Display messages based on auth status */}
					{status === "loading" && <Alert message={t("logging-in", "Logging in...")} type="info" showIcon style={{ marginBottom: 16 }} />}
					{/* Success message might be briefly shown before redirect. Or remove if redirect is instant. */}
					{/* {status === "success" && (
						<Alert message={t("login-successful", "Login Successful!")} type="success" showIcon={<CheckCircleOutlined />} style={{ marginBottom: 16 }} />
					)} */}
					{status === "failed" && error && (
						<Alert message={error} type="error" showIcon closable onClose={clearError} style={{ marginBottom: 16 }} />
					)}

					<Form form={form} name="login_form" onFinish={handleSubmit} autoComplete="off" layout="vertical">
						<Form.Item
							name="username"
							label={t("username", "Username")}
							rules={[{ required: true, message: t("please-enter-username", "Please enter your username!") }]}>
							<Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder={t("username", "Username")} size="large" />
						</Form.Item>
						<Form.Item
							name="password"
							label={t("password", "Password")}
							rules={[{ required: true, message: t("please-enter-password", "Please enter your password!") }]}>
							<Input.Password
								prefix={<LockOutlined className="site-form-item-icon" />}
								placeholder={t("password", "Password")}
								size="large"
							/>
						</Form.Item>
						<Form.Item style={{ marginTop: 24 }}>
							<Button type="primary" htmlType="submit" loading={status === "loading"} block size="large" icon={<LoginOutlined />}>
								{t("login", "Login")}
							</Button>
						</Form.Item>
						<div style={{ textAlign: "center" }}>
							{t("no-account", "Don't have an account?")}{" "}
							<Button type="link" onClick={() => navigate("/register")}>
								{t("register-now", "Register now!")}
							</Button>
						</div>
					</Form>
				</Space>
			</Card>
		</div>
	);
};

export default Login;
