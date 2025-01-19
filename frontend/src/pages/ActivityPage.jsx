import React, { useState, useRef, useEffect } from "react";
import { Container, Box, Paper, Typography, Divider, Button, Collapse } from "@mui/material";
import ActivityList from "../components/users/ActivityList";
import CreateActivityForm from "../components/users/CreateActivityForm";
import UserActivityList from "../components/users/UserActivityList";
import { useActivityStore } from "../services/activity.service";
import { useAuthStore } from "../services/auth.service"; // Import useAuthStore

const ActivityPage = () => {
	const { getAllActivities } = useActivityStore();
	const [formVisible, setFormVisible] = useState(false);
	const formRef = useRef(null);
	const [initialRender, setInitialRender] = useState(true);
	const { user } = useAuthStore(); // Get user from useAuthStore

	const isAdminOrHeadNurse = user && (user.role === "ADMIN" || user.role === "HEAD_NURSE");

	useEffect(() => {
		if (initialRender && formRef.current) {
			setFormVisible(false);
			setInitialRender(false);
		}
	}, [initialRender]);

	const handleToggleForm = () => {
		setFormVisible(!formVisible);
	};

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			{isAdminOrHeadNurse && (
				<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Typography variant="h5" component="h1" gutterBottom>
							Create New Activity
						</Typography>
						<Button variant="contained" color="primary" onClick={handleToggleForm}>
							{formVisible ? "Hide Form" : "Show Form"}
						</Button>
					</Box>

					<Divider sx={{ mb: 3 }} />
					<Collapse in={formVisible} timeout="auto">
						<div ref={formRef}>
							<CreateActivityForm onActivityCreated={getAllActivities} />
						</div>
					</Collapse>
				</Paper>
			)}

			{isAdminOrHeadNurse && (
				<Paper elevation={3} sx={{ p: 3, mb: 4 }}>
					<Typography variant="h5" component="h2" gutterBottom>
						All Activities
					</Typography>
					<Divider sx={{ mb: 3 }} />
					<ActivityList />
				</Paper>
			)}

			<Paper elevation={3} sx={{ p: 3 }}>
				<Typography variant="h5" component="h2" gutterBottom>
					User Activities
				</Typography>
				<Divider sx={{ mb: 3 }} />
				<UserActivityList />
			</Paper>
		</Container>
	);
};

export default ActivityPage;
