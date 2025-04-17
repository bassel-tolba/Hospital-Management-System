import React, { useState, useEffect } from "react";
import { Table, Modal, Typography, Spin, DatePicker, Pagination, Alert } from "antd"; // Added Alert
import { useAuthStore } from "../../services/auth.service"; // Import the hook
import { useMedicationHistoryStore } from "../../services/history/medication-history.service";
import moment from "moment";

const { Title, Text } = Typography; // Added Text
const { RangePicker } = DatePicker;

const MedicationHistory = ({ medicationId, medicationName, visible, onClose }) => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const { medicationHistory, loading, page, size, total, totalPages, fetchMedicationHistory, setPage } = useMedicationHistoryStore();
	const { user, hasAuthority } = useAuthStore(); // Use the hook to get user and hasAuthority

	// Determine if the user has permission to view the history
	const canViewHistory = user && hasAuthority("READ_MEDICATION_HISTORY");

	useEffect(() => {
		// Only fetch if the modal is visible, medicationId is present, AND the user has permission
		if (visible && medicationId && canViewHistory) {
			fetchMedicationHistory(medicationId, startDate, endDate, page, size);
		}
		// If the modal is visible but permission is lacking, we don't fetch.
		// No explicit clearing needed here as the fetch won't run.
	}, [visible, medicationId, startDate, endDate, page, size, canViewHistory, fetchMedicationHistory]); // Added canViewHistory dependency

	const handleDateChange = (dates) => {
		if (dates && dates[0] && dates[1]) {
			const start = dates[0].format("YYYY-MM-DD HH:mm:ss");
			const end = dates[1].format("YYYY-MM-DD HH:mm:ss");
			setStartDate(start);
			setEndDate(end);
		} else {
			setStartDate(null);
			setEndDate(null);
		}
		setPage(0); // Reset page when date changes
	};

	const handlePageChange = (newPage, newSize) => {
		// Only trigger fetch via page change if user has permission
		if (canViewHistory) {
			fetchMedicationHistory(medicationId, startDate, endDate, newPage - 1, newSize);
		}
	};

	const columns = [
		{
			title: "Action",
			dataIndex: "action",
			key: "action",
		},
		{
			title: "Timestamp",
			dataIndex: "timestamp",
			key: "timestamp",
			render: (timestamp) => moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "User",
			dataIndex: "userName", // Assuming 'userName' field exists based on context
			key: "userName",
		},
		{
			title: "Changes",
			dataIndex: "changes",
			key: "changes",
			render: (changes) => {
				try {
					// Basic check if it's already an object (less likely if coming straight from backend JSON string)
					if (typeof changes === "object" && changes !== null) {
						return (
							<ul>
								{Object.entries(changes).map(([key, value]) => (
									<li key={key}>
										<strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : String(value)}
									</li>
								))}
							</ul>
						);
					}
					// Attempt to parse if it's a non-empty string
					if (
						typeof changes === "string" &&
						changes.trim().length > 0 &&
						(changes.trim().startsWith("{") || changes.trim().startsWith("["))
					) {
						const parsedChanges = JSON.parse(changes);
						return (
							<ul>
								{Object.entries(parsedChanges).map(([key, value]) => (
									<li key={key}>
										<strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : String(value)}
									</li>
								))}
							</ul>
						);
					}
					// Otherwise, display as plain text
					return <Text style={{ whiteSpace: "pre-wrap" }}>{changes}</Text>;
				} catch (error) {
					console.error("Error parsing changes JSON:", error);
					return (
						<Text type="warning" style={{ whiteSpace: "pre-wrap" }}>
							Invalid format: {changes}
						</Text>
					); // Show raw changes on error
				}
			},
		},
	];

	return (
		<Modal title={`History for ${medicationName}`} visible={visible} onCancel={onClose} footer={null} width="80%">
			{/* --- Permission Check --- */}
			{canViewHistory ? (
				<>
					{/* Render content only if user has permission */}
					<RangePicker showTime onChange={handleDateChange} style={{ marginBottom: 16 }} />
					{loading ? (
						<div style={{ textAlign: "center", padding: "20px" }}>
							<Spin size="large" />
						</div>
					) : (
						<>
							<Title level={4}>Medication History</Title>
							<Table
								columns={columns}
								dataSource={medicationHistory}
								rowKey="id"
								pagination={false} // Use separate Pagination component
								scroll={{ x: true }} // Add horizontal scroll if content overflows
								style={{ marginTop: 16 }}
								bordered // Optional: adds borders for better readability
							/>
							{total > 0 && ( // Only show pagination if there are items
								<Pagination
									style={{ marginTop: 16, textAlign: "center" }}
									current={page + 1} // Display 1-based page number
									pageSize={size}
									total={total}
									onChange={handlePageChange}
									showSizeChanger // Allow changing page size
									pageSizeOptions={["10", "20", "50", "100"]} // Common page size options
									showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
								/>
							)}
						</>
					)}
				</>
			) : (
				// --- Display message if permission is denied ---
				<Alert message="Access Denied" description="You do not have permission to view medication history." type="error" showIcon />
			)}
		</Modal>
	);
};

export default MedicationHistory;
