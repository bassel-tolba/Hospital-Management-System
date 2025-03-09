import React, { useEffect } from "react";
import { Card, Typography, Spin, Tag, Button, Space, Row, Col, Divider, theme } from "antd";
import { useActivityStore } from "../../services/activity.service";
import { useAuthStore } from "../../services/auth.service";
import { Link } from "react-router-dom";

const UserActivityList = () => {
	const { userActivities, loading, error, getAvailableActivitiesForUser, updateActivityState } = useActivityStore();
	const { user } = useAuthStore();
	const { token } = theme.useToken(); // Get the current theme tokens

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

	const getActivityColor = (type) => {
		// Use token.colorFillAlter for a subtle background color that adapts to the theme
		const baseColor = token.colorFillAlter;

		// Adjust the color slightly based on activity type.  We use HSL for easier manipulation
		let hueOffset = 0;
		switch (type) {
			case "LAB_TEST":
				hueOffset = 200; // Blueish
				break;
			case "IMAGE_REPORT":
				hueOffset = 120; // Greenish
				break;
			case "VITAL_SIGNS":
				hueOffset = 30; // Orangish
				break;
			case "MEDICATION_ADMINISTRATION":
				hueOffset = 280; // Purplish
				break;
			case "ASSESSMENT":
				hueOffset = 0; // Redish
				break;
			case "PRODUCT":
				hueOffset = 230; // Light indigo
				break;
			default:
				hueOffset = 0; // Default, no change
				break;
		}

		// Convert hex to HSL, adjust hue, and convert back to hex.
		const hexToHSL = (hex) => {
			let r = parseInt(hex.slice(1, 3), 16) / 255;
			let g = parseInt(hex.slice(3, 5), 16) / 255;
			let b = parseInt(hex.slice(5, 7), 16) / 255;

			let max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			let h,
				s,
				l = (max + min) / 2;

			if (max === min) {
				h = s = 0; // achromatic
			} else {
				let d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}
			return [h * 360, s * 100, l * 100];
		};

		const hslToHex = (h, s, l) => {
			s /= 100;
			l /= 100;
			let c = (1 - Math.abs(2 * l - 1)) * s,
				x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
				m = l - c / 2,
				r = 0,
				g = 0,
				b = 0;

			if (0 <= h && h < 60) {
				r = c;
				g = x;
				b = 0;
			} else if (60 <= h && h < 120) {
				r = x;
				g = c;
				b = 0;
			} else if (120 <= h && h < 180) {
				r = 0;
				g = c;
				b = x;
			} else if (180 <= h && h < 240) {
				r = 0;
				g = x;
				b = c;
			} else if (240 <= h && h < 300) {
				r = x;
				g = 0;
				b = c;
			} else if (300 <= h && h < 360) {
				r = c;
				g = 0;
				b = x;
			}
			r = Math.round((r + m) * 255).toString(16);
			g = Math.round((g + m) * 255).toString(16);
			b = Math.round((b + m) * 255).toString(16);

			if (r.length === 1) r = "0" + r;
			if (g.length === 1) g = "0" + g;
			if (b.length === 1) b = "0" + b;
			return "#" + r + g + b;
		};

		let [h, s, l] = hexToHSL(baseColor);
		h = (h + hueOffset) % 360; // Wrap around 360
		return hslToHex(h, s, l);
	};

	const groupActivitiesByPatient = (activities) => {
		const grouped = activities.reduce((acc, activity) => {
			const patientId = activity.patientIds?.[0] || "unassigned";
			const patientName = activity.patientName || "Unassigned";

			if (!acc[patientId]) {
				acc[patientId] = {
					patientName,
					activities: [],
				};
			}
			acc[patientId].activities.push(activity);
			return acc;
		}, {});

		// Sort activities within each patient group by timestamp
		Object.values(grouped).forEach((group) => {
			group.activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
		});

		return grouped;
	};

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

	const groupedActivities = groupActivitiesByPatient(userActivities);

	return (
		<Space direction="vertical" style={{ width: "100%" }}>
			{Object.entries(groupedActivities).map(([patientId, { patientName, activities }]) => (
				<div key={patientId}>
					<Divider orientation="left">
						{patientId !== "unassigned" ? (
							<Link to={`/patients/${patientId}`}>
								<Typography.Title level={4}>{patientName}</Typography.Title>
							</Link>
						) : (
							<Typography.Title level={4}>{patientName}</Typography.Title>
						)}
					</Divider>
					<Row gutter={[16, 16]}>
						{activities.map((activity) => (
							<Col xs={24} sm={12} md={8} lg={6} key={activity.id}>
								<Card
									style={{
										backgroundColor: getActivityColor(activity.activityType),
										height: "100%",
									}}
									hoverable>
									<Typography.Title level={5}>{activity.activityType.replace(/_/g, " ")}</Typography.Title>
									<Typography.Paragraph>{activity.description}</Typography.Paragraph>
									<Space direction="vertical" size="small" style={{ width: "100%" }}>
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
								</Card>
							</Col>
						))}
					</Row>
				</div>
			))}
		</Space>
	);
};

export default UserActivityList;
