import React, { useEffect } from "react";
import { Table, Typography, Spin, Tag, Button, Space } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { useAuthStore } from "../../services/auth.service";
import { Link } from "react-router-dom";
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

	const columns = [
		{
			title: "Activity Type",
			dataIndex: "activityType",
			key: "activityType",
			responsive: ["md"],
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Patient Name",
			dataIndex: "patientName",
			key: "patientName",
			responsive: ["lg"],
			render: (text, record) => {
				if (record && record.patientIds && record.patientIds.length > 0) {
					const patientId = record.patientIds[0]; // Assuming link to the first patient
					return (
						<Button
							type="default" // Makes the button look like a link
							onClick={(e) => {
								e.preventDefault(); // Prevents button default behavior
								window.location.href = `/patients/${patientId}`; // Navigate using window.location
							}}>
							{text}
						</Button>
					);
				}
				return text; //Fallback for cases where there are no patientIds
			},
		},
		{
			title: "Timestamp",
			dataIndex: "timestamp",
			key: "timestamp",
			render: (timestamp) => new Date(timestamp).toLocaleString(),
			responsive: ["md"],
		},
		{
			title: "State",
			dataIndex: "state",
			key: "state",
			render: (state, record) => (
				<Space>
					<Tag color={state === "completed" ? "success" : state === "inprogress" ? state === "pending" : "volcano"}>{state}</Tag>
					{(state === "pending" || state === "inprogress") && (
						<Space>
							{state === "pending" && (
								<Button size="small" type="default" onClick={() => handleActivityStateChange(record.id, "inprogress")}>
									In Progress
								</Button>
							)}
							<Button size="small" type="default" onClick={() => handleActivityStateChange(record.id, "completed")}>
								Complete
							</Button>
						</Space>
					)}
				</Space>
			),
		},
	];

	if (!user) {
		return <Typography.Text type="danger">You must be logged in to view user activities</Typography.Text>;
	}

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: 20 }}>
				<Spin />
			</div>
		);
	}

	if (error) {
		return <Typography.Text type="danger">Error: {error}</Typography.Text>;
	}

	return <Table columns={columns} dataSource={userActivities} pagination={{ pageSize: 5 }} scroll={{ x: "max-content" }} />;
};

export default UserActivityList;
