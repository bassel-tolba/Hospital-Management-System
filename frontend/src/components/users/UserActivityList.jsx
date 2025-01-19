import React, { useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Box, Button } from "@mui/material";
import { useActivityStore } from "../../services/activity.service";
import { useAuthStore } from "../../services/auth.service";

const UserActivityList = () => {
	const { userActivities, loading, error, getAvailableActivitiesForUser, updateActivityState } = useActivityStore();
	const { user } = useAuthStore();

	useEffect(() => {
		if (user) {
			getAvailableActivitiesForUser(user.id);
		}
	}, [getAvailableActivitiesForUser, user]);

	const handleActivityStateChange = async (activityId, newState) => {
		try {
			await updateActivityState(activityId, newState);
			getAvailableActivitiesForUser(user.id); // Refresh after update
		} catch (err) {
			console.error("Failed to update activity state", err);
		}
	};

	if (!user) {
		return (
			<Box sx={{ p: 1, color: "error.main" }}>
				<Typography color="error" fontSize="0.9rem">
					You must be logged in to view user activities
				</Typography>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
				<CircularProgress size={30} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 1, color: "error.main" }}>
				<Typography color="error" fontSize="0.9rem">
					Error: {error}
				</Typography>
			</Box>
		);
	}

	return (
		<TableContainer sx={{ maxHeight: 400, overflow: "auto" }}>
			<Table sx={{ minWidth: 500 }}>
				<TableHead>
					<TableRow sx={{ backgroundColor: "primary.light" }}>
						<TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.9rem" }}>Activity Type</TableCell>
						<TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.9rem" }}>Description</TableCell>
						<TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.9rem" }}>Patient Name</TableCell>
						<TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.9rem" }}>Timestamp</TableCell>
						<TableCell sx={{ fontWeight: "bold", color: "white", fontSize: "0.9rem" }}>State</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{userActivities.map((activity) => (
						<TableRow key={activity.id} sx={{ "&:nth-of-type(odd)": { backgroundColor: "action.hover" } }}>
							<TableCell sx={{ fontSize: "0.9rem" }}>{activity.activityType}</TableCell>
							<TableCell sx={{ fontSize: "0.9rem" }}>{activity.description}</TableCell>
							<TableCell sx={{ fontSize: "0.9rem" }}>{activity.patientName}</TableCell>
							<TableCell sx={{ fontSize: "0.9rem" }}>{new Date(activity.timestamp).toLocaleString()}</TableCell>
							<TableCell>
								<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
									<Typography
										sx={{
											backgroundColor:
												activity.state === "completed"
													? "success.light"
													: activity.state === "inprogress"
													? "warning.light"
													: "info.light",
											px: 0.5,
											py: 0.3,
											borderRadius: 1,
											fontSize: "0.8rem",
											display: "inline-block",
										}}>
										{activity.state}
									</Typography>
									{(activity.state === "pending" || activity.state === "inprogress") && (
										<Box sx={{ display: "flex", gap: 0.5 }}>
											{activity.state === "pending" && (
												<Button
													size="small"
													variant="outlined"
													color="warning"
													onClick={() => handleActivityStateChange(activity.id, "inprogress")}>
													In Progress
												</Button>
											)}
											<Button
												size="small"
												variant="outlined"
												color="success"
												onClick={() => handleActivityStateChange(activity.id, "completed")}>
												Complete
											</Button>
										</Box>
									)}
								</Box>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default UserActivityList;
