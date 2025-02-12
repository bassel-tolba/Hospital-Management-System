import React, { useEffect } from "react";
import { Table, Typography, Spin, Tag, Button, Space } from "antd";
import { useActivityStore } from "../../services/activity.service";

const ActivityList = () => {
	const { allActivities, loading, error, getAllActivities, updateActivityState } = useActivityStore();

	useEffect(() => {
		getAllActivities();
	}, [getAllActivities]);

	const handleActivityStateChange = async (activityId, newState) => {
		try {
			await updateActivityState(activityId, newState);
			getAllActivities(); // Refresh after update
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

	return <Table columns={columns} dataSource={allActivities} pagination={{ pageSize: 5 }} scroll={{ x: "max-content" }} />;
};

export default ActivityList;
