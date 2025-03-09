import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Tag, Button, Space, Row, Col, Pagination } from "antd";
import { useActivityStore } from "../../services/activity.service";

const ActivityList = () => {
	const { allActivities, loading, error, getAllActivities, updateActivityState } = useActivityStore();
	const [currentPage, setCurrentPage] = useState(1);
	const [expandedCard, setExpandedCard] = useState(null);
	const pageSize = 8;

	useEffect(() => {
		getAllActivities();
	}, [getAllActivities]);

	const getActivityColor = (type) => {
		switch (type) {
			case "LAB_TEST":
				return "#e6f7ff"; // Light blue
			case "IMAGE_REPORT":
				return "#f6ffed"; // Light green
			case "VITAL_SIGNS":
				return "#fff7e6"; // Light orange
			case "MEDICATION_ADMINISTRATION":
				return "#f9f0ff"; // Light purple
			case "ASSESSMENT":
				return "#fff1f0"; // Light red
			case "PRODUCT":
				return "#f0f5ff"; // Light indigo
			default:
				return "#f0f2f5"; // Light gray
		}
	};

	const handleActivityStateChange = async (activityId, newState) => {
		try {
			await updateActivityState(activityId, newState);
			getAllActivities();
		} catch (err) {
			console.error("Failed to update activity state", err);
		}
	};

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

	const paginatedActivities = allActivities.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	return (
		<>
			<Row gutter={[16, 16]}>
				{paginatedActivities.map((activity) => (
					<Col xs={24} sm={12} md={8} lg={6} key={activity.id}>
						<Card
							style={{
								backgroundColor: getActivityColor(activity.activityType),
								height: expandedCard === activity.id ? "auto" : "200px",
							}}
							hoverable
							onClick={() => setExpandedCard(expandedCard === activity.id ? null : activity.id)}>
							<Typography.Title level={5}>{activity.activityType.replace(/_/g, " ")}</Typography.Title>

							{expandedCard === activity.id ? (
								<Space direction="vertical" size="small" style={{ width: "100%" }}>
									<Typography.Paragraph>{activity.description}</Typography.Paragraph>
									<Typography.Text strong>Patient: </Typography.Text>
									<Typography.Text>{activity.patientName}</Typography.Text>
									<Typography.Text strong>Time: </Typography.Text>
									<Typography.Text>{new Date(activity.timestamp).toLocaleString()}</Typography.Text>
									<Space direction="vertical" size="small" style={{ width: "100%", marginTop: 8 }}>
										<Tag
											color={
												activity.state === "completed"
													? "success"
													: activity.state === "inprogress"
													? "processing"
													: "default"
											}>
											{activity.state}
										</Tag>
										{(activity.state === "pending" || activity.state === "inprogress") && (
											<Space>
												{activity.state === "pending" && (
													<Button
														size="small"
														type="default"
														onClick={() => handleActivityStateChange(activity.id, "inprogress")}>
														In Progress
													</Button>
												)}
												<Button
													size="small"
													type="primary"
													onClick={() => handleActivityStateChange(activity.id, "completed")}>
													Complete
												</Button>
											</Space>
										)}
									</Space>
								</Space>
							) : (
								<Space direction="vertical" size="small" style={{ width: "100%" }}>
									<Typography.Paragraph ellipsis={{ rows: 2 }}>{activity.description}</Typography.Paragraph>
									<Typography.Text type="secondary">{activity.patientName}</Typography.Text>
									<Tag
										color={
											activity.state === "completed" ? "success" : activity.state === "inprogress" ? "processing" : "default"
										}>
										{activity.state}
									</Tag>
									<Typography.Text type="secondary">Click to expand</Typography.Text>
								</Space>
							)}
						</Card>
					</Col>
				))}
			</Row>
			<Row justify="center" style={{ marginTop: "20px" }}>
				<Pagination
					current={currentPage}
					onChange={setCurrentPage}
					total={allActivities.length}
					pageSize={pageSize}
					showSizeChanger={false}
				/>
			</Row>
		</>
	);
};

export default ActivityList;
