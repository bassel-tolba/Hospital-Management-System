import React, { useState, useEffect } from "react";
import { Table, Modal, Typography, Spin, DatePicker, Pagination, Button, Popconfirm, message, Alert } from "antd"; // Added Alert
import { useAuthStore } from "../../services/auth.service";
import { useMedicationHistoryStore } from "../../services/history/medication-history.service";
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AllMedicationHistory = ({ visible, onClose }) => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	// Use the hook as recommended to get user and hasAuthority
	const { user, hasAuthority } = useAuthStore();

	const { medicationHistory, loading, page, size, total, totalPages, fetchMedicationHistory, setPage, clearMedicationHistory } =
		useMedicationHistoryStore();

	// Permissions checks
	const canReadHistory = user && hasAuthority("READ_MEDICATION_HISTORY");
	const canDeleteHistory = user && hasAuthority("DELETE_MEDICATION_HISTORY");

	useEffect(() => {
		// Only fetch if the modal is visible AND the user has permission to read
		if (visible && canReadHistory) {
			fetchMedicationHistory(null, startDate, endDate, page, size);
		}
		// If visibility changes or permission is lost, reset pagination (optional but good practice)
		if (!visible || !canReadHistory) {
			setPage(0);
		}
	}, [visible, startDate, endDate, page, size, user, fetchMedicationHistory, setPage, canReadHistory]); // Added canReadHistory dependency

	const handleDateChange = (dates) => {
		if (!canReadHistory) return; // Don't do anything if user can't read

		if (dates && dates[0] && dates[1]) {
			const start = dates[0].format("YYYY-MM-DD HH:mm:ss");
			const end = dates[1].format("YYYY-MM-DD HH:mm:ss");

			setStartDate(start);
			setEndDate(end);
		} else {
			setStartDate(null);
			setEndDate(null);
		}
		setPage(0); // Reset page on date change
	};

	const handlePageChange = (newPage, newSize) => {
		if (!canReadHistory) return; // Don't do anything if user can't read
		// Fetch is called within useEffect based on page/size change
		// Directly setting page/size state triggers the useEffect
		// fetchMedicationHistory(null, startDate, endDate, newPage - 1, newSize); // Direct call removed, let useEffect handle it
		setPage(newPage - 1); // Update page state, useEffect will refetch
	};

	const handleClearHistory = async () => {
		if (!canDeleteHistory) {
			message.error("You do not have permission to clear history.");
			return;
		}
		try {
			await clearMedicationHistory();
			message.success("Medication history cleared successfully.");
			// Refetch after clearing (useEffect will handle this if page=0)
			if (page === 0) {
				fetchMedicationHistory(null, startDate, endDate, 0, size);
			} else {
				setPage(0); // Trigger refetch via useEffect
			}
		} catch (error) {
			console.error("Failed to clear history", error);
			message.error("Failed to clear medication history.");
		}
	};

	const confirmFirst = (e) => {
		// first confirm, do nothing, second confirm will trigger action
	};
	const confirmSecond = (e) => {
		handleClearHistory();
	};

	const cancel = (e) => {
		message.error("Clear history cancelled");
	};

	const columns = [
		{
			title: "Medication",
			dataIndex: "medicationName",
			key: "medicationName",
		},
		{
			title: "Action",
			dataIndex: "action",
			key: "action",
		},
		{
			title: "Timestamp",
			dataIndex: "timestamp",
			key: "timestamp",
			render: (timestamp) => (timestamp ? moment(timestamp).format("YYYY-MM-DD HH:mm:ss") : "N/A"),
		},
		{
			title: "User",
			dataIndex: "userName",
			key: "userName",
		},
		{
			title: "Changes",
			dataIndex: "changes",
			key: "changes",
			render: (changes) => {
				if (!changes) return null;
				try {
					const parsedChanges = JSON.parse(changes);
					// Limit displayed changes for brevity if necessary, or render as is
					return (
						<ul style={{ paddingLeft: "15px", margin: 0, maxHeight: "100px", overflowY: "auto" }}>
							{Object.entries(parsedChanges).map(([key, value]) => (
								<li key={key}>
									<strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : String(value)}
								</li>
							))}
						</ul>
					);
				} catch (error) {
					// Render as plain text if not valid JSON
					return <div style={{ maxHeight: "100px", overflowY: "auto", whiteSpace: "pre-wrap" }}>{changes}</div>;
				}
			},
		},
	];

	return (
		<Modal title="All Medication History" visible={visible} onCancel={onClose} footer={null} width="80%">
			{/* Check if user has permission to read history */}
			{!canReadHistory && (
				<Alert message="Permission Denied" description="You do not have permission to view medication history." type="warning" showIcon />
			)}

			{/* Only render the main content if user has read permission */}
			{canReadHistory && (
				<>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
						<RangePicker showTime onChange={handleDateChange} />

						{/* Only show Clear History button if user has delete permission */}
						{canDeleteHistory && (
							<Popconfirm
								title="Clear History"
								description="Are you sure you want to clear all medication history?"
								onConfirm={confirmFirst}
								onCancel={cancel}
								okText="Yes"
								cancelText="No"
								okButtonProps={{ danger: true }}>
								<Popconfirm
									title="Confirm Clear History"
									description="Are you absolutely sure? This action cannot be undone."
									onConfirm={confirmSecond}
									onCancel={cancel}
									okText="Yes, I'm sure"
									cancelText="No"
									okButtonProps={{ danger: true }}>
									<Button type="primary" danger>
										Clear All History
									</Button>
								</Popconfirm>
							</Popconfirm>
						)}
					</div>

					{loading ? (
						<div style={{ textAlign: "center", padding: "50px 0" }}>
							<Spin size="large" />
						</div>
					) : (
						<>
							{/* <Title level={4}>All Medication History</Title> */} {/* Title might be redundant with Modal title */}
							<Table
								columns={columns}
								dataSource={medicationHistory}
								rowKey="id"
								pagination={false} // Use separate Pagination component
								scroll={{ y: 400 }} // Add scroll for potentially long tables
								size="small" // Use smaller size for modal context
							/>
							<Pagination
								style={{ marginTop: 16, textAlign: "center" }}
								current={page + 1}
								pageSize={size}
								total={total}
								onChange={handlePageChange}
								showSizeChanger
								showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
								// totalPages is available but not directly used by AntD Pagination `total` prop expects total items
							/>
						</>
					)}
				</>
			)}
		</Modal>
	);
};

export default AllMedicationHistory;
