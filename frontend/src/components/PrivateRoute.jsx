// components/PrivateRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../services/auth.service";
import { Spin } from "antd"; // Or your preferred loading indicator

const PrivateRoute = ({ children, permissions }) => {
	const { user, status, hasAuthority } = useAuthStore();
	const location = useLocation();

	if (status === "loading") {
		return (
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
				<Spin size="large" />
			</div>
		);
	}

	if (!user) {
		// Not logged in, redirect to login
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// No permissions specified, allow access (original behavior)
	if (!permissions || permissions.length === 0) {
		return children;
	}

	// Check if any of the required permissions are present
	const hasRequiredPermission = permissions.some((permission) => hasAuthority(permission));

	if (!hasRequiredPermission) {
		// User is logged in, but doesn't have any of the required permissions
		return <Navigate to="/" replace />; // Or a 403 page
	}

	// User is logged in and has at least one required permission
	return children;
};

export default PrivateRoute;
