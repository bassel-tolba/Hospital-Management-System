// src/components/Dashboard/PatientStatusDashboard.js
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Typography, Table, Progress } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useDashboardStore } from "../../services/dashboardStore.service"; // Import your store
import "./Dashboard.css";

const { Title } = Typography;

const getSeverityColor = (percent) => {
	if (percent >= 100) return "#ff0000";
	if (percent >= 80) return "#ff4d4d";
	if (percent >= 60) return "#ff9933";
	if (percent >= 40) return "#ffcc00";
	return "#87d068";
};

const PatientStatusDashboard = ({ isOpen }) => {
	//Add isOpen prop
	const { fetchPatientStatusOverview } = useDashboardStore();
	const [overviewData, setOverviewData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchPatientStatusOverview();
				setOverviewData(data);
			} catch (err) {
				setError("Failed to fetch patient status overview.");
			} finally {
				setLoading(false);
			}
		};
		if (isOpen) {
			fetchData();
		}
	}, [fetchPatientStatusOverview, isOpen]); //Add isOpen to useEffect dependencies

	if (loading) {
		return (
			<div className="loading-container">
				<Spin size="large" />
			</div>
		);
	}
	if (error) {
		return (
			<Card title="Patient Status Overview" className="dashboard-card">
				<p className="error-message">{error}</p>
			</Card>
		);
	}

	const columns = [
		{
			title: "Severity Level",
			dataIndex: "severityLevel",
			key: "severityLevel",
			sorter: (a, b) => a.severityLevel - b.severityLevel,
			render: (level) => {
				const percent = level * 20;
				const color = getSeverityColor(percent);
				return (
					<div className={`severity-circle ${percent >= 100 ? "danger-pulse" : ""}`} style={{ padding: "3px" }}>
						<Progress
							type="circle"
							percent={percent}
							width={50}
							strokeColor={{
								"0%": getSeverityColor(percent - 20),
								"100%": color,
							}}
						/>
					</div>
				);
			},
		},
		{
			title: "Number of Patients",
			dataIndex: "count",
			key: "count",
		},
	];
	const severityData = overviewData
		? Object.entries(overviewData.patientsBySeverityLevel).map(([level, count]) => ({
				severityLevel: parseInt(level, 10),
				count: count,
		  }))
		: [];
	return (
		<Card className="dashboard-card">
			<Title level={2} className="dashboard-title">
				Patient Status Overview
			</Title>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card>
						<div style={{ display: "flex", alignItems: "center" }}>
							<UserOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
							<Title level={4} style={{ margin: 0 }}>
								Active Patients: {overviewData?.activePatientsCount || 0}
							</Title>
						</div>
					</Card>
				</Col>
				<Col span={24}>
					<Table columns={columns} dataSource={severityData} rowKey="severityLevel" pagination={false} />
				</Col>
			</Row>
		</Card>
	);
};

export default PatientStatusDashboard;
