// src/components/Dashboard/PatientStatusDashboard.js
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Typography, Table, Progress } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useDashboardStore } from "../../services/dashboardStore.service"; // Import your store
import "./Dashboard.css";

const { Title } = Typography;

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
			render: (level) => (
				<Progress
					type="circle"
					percent={level * 20} // Assuming severity is 1-5, so multiply by 20 for percentage
					width={50}
					strokeColor={{
						"0%": "#108ee9",
						"100%": "#87d068",
					}}
				/>
			),
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
