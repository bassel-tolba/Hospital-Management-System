// components/PrivateRoute.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../services/auth.service";
import { Box, CircularProgress } from "@mui/material";

const PrivateRoute = ({ children, roles }) => {
	const navigate = useNavigate();
	const { user, status } = useAuthStore();

	useEffect(() => {
		if (!user && status !== "loading") {
			navigate("/login");
		}
		if (user && roles && !roles.includes(user?.role)) {
			navigate("/login");
		}
	}, [user, navigate, status, roles]);

	if (status === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
				<CircularProgress />
			</Box>
		);
	}

	return roles ? (roles.includes(user?.role) ? children : null) : children;
};

export default PrivateRoute;
