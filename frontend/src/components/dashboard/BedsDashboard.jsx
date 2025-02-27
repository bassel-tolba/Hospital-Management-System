// src/components/Dashboard/BedsDashboard.js
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Typography, Table, Alert, Statistic, Progress, Badge, Tag, Descriptions } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, BellOutlined } from "@ant-design/icons";
import { useDashboardStore } from "../../services/dashboardStore.service";
import "./Dashboard.css";

const { Title, Text } = Typography;

const BedsDashboard = ({ isOpen }) => {
	// Add isOpen prop
	const { fetchBedAvailability, fetchOccupancyByUnit, fetchCriticalCapacityAlerts, fetchBedCountsByRoomTypeAndUnit } = useDashboardStore();

	const [bedAvailability, setBedAvailability] = useState(null);
	const [occupancyData, setOccupancyData] = useState([]);
	const [alerts, setAlerts] = useState([]);
	const [bedCounts, setBedCounts] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const availability = await fetchBedAvailability();
				setBedAvailability(availability);

				const occupancy = await fetchOccupancyByUnit();
				setOccupancyData(occupancy);

				const criticalAlerts = await fetchCriticalCapacityAlerts();
				setAlerts(criticalAlerts);

				const counts = await fetchBedCountsByRoomTypeAndUnit();
				setBedCounts(counts);
			} catch (err) {
				setError("Error fetching bed data.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		if (isOpen) {
			//check if the panel is open
			fetchData();
		}
	}, [fetchBedAvailability, fetchOccupancyByUnit, fetchCriticalCapacityAlerts, fetchBedCountsByRoomTypeAndUnit, isOpen]); //Add isOpen

	if (loading) {
		return (
			<div className="loading-container">
				<Spin size="large" tip="Loading dashboard data..." />
			</div>
		);
	}

	if (error) {
		return <Alert message="Dashboard Error" description={error} type="error" showIcon />;
	}

	const occupancyPercentage = bedAvailability ? Math.round((bedAvailability.occupiedBeds / bedAvailability.totalBeds) * 100) : 0;

	const getStatusColor = (percentage) => {
		if (percentage >= 90) return "red";
		if (percentage >= 75) return "orange";
		return "green";
	};

	const occupancyColumns = [
		{
			title: "Unit",
			dataIndex: "unitName",
			key: "unitName",
			sorter: (a, b) => a.unitName.localeCompare(b.unitName),
		},
		{
			title: "Total Beds",
			dataIndex: "totalBeds",
			key: "totalBeds",
			sorter: (a, b) => a.totalBeds - b.totalBeds,
		},
		{
			title: "Occupied",
			dataIndex: "occupiedBeds",
			key: "occupiedBeds",
			sorter: (a, b) => a.occupiedBeds - b.occupiedBeds,
		},
		{
			title: "Occupancy",
			dataIndex: "occupancyRate",
			key: "occupancyRate",
			sorter: (a, b) => a.occupancyRate - b.occupancyRate,
			render: (rate) => {
				const formattedRate = rate.toFixed(1);
				const color = getStatusColor(rate);
				return (
					<Progress
						type="circle"
						percent={parseFloat(formattedRate)}
						width={60}
						strokeColor={color === "red" ? "#ff4d4f" : color === "orange" ? "#faad14" : "#52c41a"}
						format={(percent) => `${percent}%`}
					/>
				);
			},
		},
		{
			title: "Status",
			key: "status",
			render: (_, record) => {
				if (record.occupancyRate >= 90) {
					return (
						<Tag color="red" icon={<ExclamationCircleOutlined />}>
							Critical
						</Tag>
					);
				} else if (record.occupancyRate >= 75) {
					return (
						<Tag color="orange" icon={<ExclamationCircleOutlined />}>
							High
						</Tag>
					);
				} else {
					return (
						<Tag color="green" icon={<CheckCircleOutlined />}>
							Normal
						</Tag>
					);
				}
			},
		},
	];

	const alertsColumns = [
		{
			title: "Unit",
			dataIndex: "unitName",
			key: "unitName",
			sorter: (a, b) => a.unitName.localeCompare(b.unitName),
		},
		{
			title: "Occupancy Rate",
			dataIndex: "occupancyRate",
			key: "occupancyRate",
			sorter: (a, b) => a.occupancyRate - b.occupancyRate,
			render: (rate) => {
				const formattedRate = rate.toFixed(1);
				return (
					<Progress
						type="circle"
						percent={parseFloat(formattedRate)}
						width={60}
						strokeColor={"#ff4d4f"}
						format={(percent) => `${percent}%`}
					/>
				);
			},
		},
		{
			title: "Action Required",
			key: "action",
			render: () => <Tag color="volcano">Immediate Attention</Tag>,
		},
	];

	return (
		<Card className="dashboard-card">
			<Title level={2} className="dashboard-title">
				<span style={{ marginRight: "8px" }}>Beds Dashboard</span>
				{alerts.length > 0 && <Badge count={alerts.length} style={{ backgroundColor: "#ff4d4f" }} />}
			</Title>

			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} md={8} lg={6} xl={4}>
					<Card className="stat-card">
						<Statistic
							title="Total Beds"
							value={bedAvailability?.totalBeds || 0}
							prefix={<span style={{ color: "#1890ff" }}>🏥</span>}
							valueStyle={{ color: "#1890ff" }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6} xl={4}>
					<Card className="stat-card">
						<Statistic
							title="Occupied Beds"
							value={bedAvailability?.occupiedBeds || 0}
							prefix={<span style={{ color: "#ff4d4f" }}>🛌</span>}
							valueStyle={{ color: "#ff4d4f" }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={8} lg={6} xl={4}>
					<Card className="stat-card">
						<Statistic
							title="Available Beds"
							value={bedAvailability?.availableBeds || 0}
							prefix={<span style={{ color: "#52c41a" }}>✓</span>}
							valueStyle={{ color: "#52c41a" }}
						/>
					</Card>
				</Col>

				<Col span={24}>
					<Card title="Overall Occupancy Status">
						<Row gutter={16} align="middle">
							<Col flex="auto">
								<Progress
									percent={occupancyPercentage}
									status={occupancyPercentage >= 90 ? "exception" : "normal"}
									strokeColor={occupancyPercentage >= 75 && occupancyPercentage < 90 ? "#faad14" : undefined}
								/>
							</Col>
							<Col>
								<Statistic
									value={occupancyPercentage}
									suffix="%"
									valueStyle={{
										color: occupancyPercentage >= 90 ? "#ff4d4f" : occupancyPercentage >= 75 ? "#faad14" : "#52c41a",
									}}
								/>
							</Col>
						</Row>
					</Card>
				</Col>

				<Col span={24}>
					<Card
						title={
							<>
								<BellOutlined style={{ color: "#ff4d4f", marginRight: "8px" }} />
								<span>Critical Capacity Alerts</span>
							</>
						}
						className={alerts.length > 0 ? "alert-card" : ""}
						style={alerts.length > 0 ? { borderLeft: "5px solid #ff4d4f" } : {}}>
						{alerts.length > 0 ? (
							<Table columns={alertsColumns} dataSource={alerts} rowKey="unitId" pagination={false} />
						) : (
							<Alert message="No critical capacity alerts at this time." type="success" showIcon icon={<CheckCircleOutlined />} />
						)}
					</Card>
				</Col>

				<Col span={24}>
					<Card title="Occupancy by Unit" extra={<Text type="secondary">{occupancyData.length} units</Text>}>
						<Table columns={occupancyColumns} dataSource={occupancyData} rowKey="unitId" pagination={{ pageSize: 5 }} />
					</Card>
				</Col>

				<Col span={24}>
					<Card title="Bed Distribution by Room Type">
						{Object.keys(bedCounts).length > 0 ? (
							<Row gutter={[16, 24]}>
								{Object.entries(bedCounts).map(([unitName, roomTypes]) => (
									<Col xs={24} sm={12} md={8} lg={6} key={`bed-distribution-${unitName}`}>
										<Descriptions title={unitName} bordered column={1} size="small">
											{Object.entries(roomTypes).map(([roomType, count]) => (
												<Descriptions.Item label={roomType} key={`bed-distribution-${unitName}-${roomType}`}>
													<Tag color="blue">{count}</Tag>
												</Descriptions.Item>
											))}
										</Descriptions>
									</Col>
								))}
							</Row>
						) : (
							<Alert message="No room type distribution data available." type="info" showIcon />
						)}
					</Card>
				</Col>
			</Row>
		</Card>
	);
};

export default BedsDashboard;
