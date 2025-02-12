import React, { useState, useEffect } from "react";
import { Table, Typography, Space, Button } from "antd";
import { useMedicationHistoryStore } from "../../services/history/medication-history.service";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const MedicationHistoryList = () => {
	const { medicationHistory, loading, fetchMedicationHistory, setLoading } = useMedicationHistoryStore();
	const navigate = useNavigate();

	useEffect(() => {
		fetchMedicationData();
	}, []);

	const fetchMedicationData = async () => {
		setLoading(true);
		await fetchMedicationHistory();
		setLoading(false);
	};

	const handleBackToMedicationList = () => {
		navigate("/medications");
	};

	const columns = [
		{
			title: "Medication Name",
			dataIndex: "medicationName",
			key: "medicationName",
		},
		{
			title: "Action",
			dataIndex: "action",
			key: "action",
		},
		{
			title: "User",
			dataIndex: "userName",
			key: "user",
		},
		{
			title: "Timestamp",
			dataIndex: "timestamp",
			key: "timestamp",
			render: (text) => new Date(text).toLocaleString(),
		},
		{
			title: "Changes",
			dataIndex: "changes",
			key: "changes",
			render: (text) => {
				try {
					const changes = JSON.parse(text);
					return (
						<div style={{ maxHeight: "300px", overflowY: "scroll" }}>
							{Object.entries(changes).map(([key, value]) => (
								<div key={key} style={{ padding: "5px" }}>
									<strong>{key}:</strong> {JSON.stringify(value)}
								</div>
							))}
						</div>
					);
				} catch (error) {
					return <div style={{ maxHeight: "300px", overflowY: "scroll" }}>{text}</div>;
				}
			},
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Medication History</Title>
			<Space style={{ marginBottom: 16 }}>
				<Button type="default" onClick={handleBackToMedicationList}>
					Back to Medication List
				</Button>
			</Space>
			<Table columns={columns} dataSource={medicationHistory} loading={loading} rowKey="id" />
		</div>
	);
};

export default MedicationHistoryList;
