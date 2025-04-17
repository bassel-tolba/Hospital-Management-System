import React, { useState, useEffect } from "react";
import { Table, Typography, Space, Button, Alert } from "antd"; // Added Alert for feedback
import { useMedicationHistoryStore } from "../../services/history/medication-history.service";
import { useAuthStore } from "../../services/auth.service"; // Import useAuthStore
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const MedicationHistoryList = () => {
	// Use auth store to get user and hasAuthority function
	const { user, hasAuthority } = useAuthStore();
	const { medicationHistory, loading, fetchMedicationHistory, setLoading } = useMedicationHistoryStore();
	const navigate = useNavigate();

	// Check if the user has permission to read the history
	const canReadHistory = user && hasAuthority("READ_MEDICATION_HISTORY");

	useEffect(() => {
		// Only fetch data if the user has the necessary permission
		if (canReadHistory) {
			fetchMedicationData();
		}
		// Intentionally not setting loading to false if permission denied,
		// as the table won't render anyway.
		// If you want to show a specific loading state before the permission check,
		// you might need more complex state management.
	}, [canReadHistory]); // Re-run effect if permission status changes (e.g., on login/logout)

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
					// Attempt to parse JSON for structured display
					const changes = JSON.parse(text);
					// Check if it's actually an object before mapping
					if (changes && typeof changes === "object" && !Array.isArray(changes)) {
						return (
							<div style={{ maxHeight: "300px", overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
								{Object.entries(changes).map(([key, value]) => (
									<div key={key} style={{ padding: "2px 0" }}>
										<strong>{key}:</strong> {JSON.stringify(value, null, 2)}
									</div>
								))}
							</div>
						);
					}
					// If not a parsable object, display as text
					return <div style={{ maxHeight: "300px", overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{text}</div>;
				} catch (error) {
					// If JSON parsing fails, display original text
					return <div style={{ maxHeight: "300px", overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{text}</div>;
				}
			},
		},
	];

	// Render content only if the user has permission
	if (!canReadHistory) {
		// Optionally return null or an Access Denied message
		return (
			<div style={{ padding: 20 }}>
				<Alert message="Access Denied" description="You do not have permission to view medication history." type="error" showIcon />
			</div>
		);
	}

	// Render the component content if permission is granted
	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Medication History</Title>
			<Space style={{ marginBottom: 16 }}>
				{/* Button is part of the history view context, so it's hidden if the table is hidden */}
				<Button type="default" onClick={handleBackToMedicationList}>
					Back to Medication List
				</Button>
			</Space>
			<Table
				columns={columns}
				dataSource={medicationHistory}
				loading={loading}
				rowKey="id"
				scroll={{ x: "max-content" }} // Ensure horizontal scroll if content overflows
			/>
		</div>
	);
};

export default MedicationHistoryList;
