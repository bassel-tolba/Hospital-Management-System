import React, { useState, useEffect, useRef } from "react";
import { Table, Modal, Typography, Spin, DatePicker, Pagination, Button, Popconfirm, message, Alert } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { useMedicationHistoryStore } from "../../services/history/medication-history.service";
import moment from "moment";
import { PrinterOutlined } from "@ant-design/icons"; // Corrected icon import to PrinterOutlined for consistency

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AllMedicationHistory = ({ visible, onClose }) => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	// Ref for the printable content
	const printableContentRef = useRef(null);

	// Use the hook as recommended to get user and hasAuthority
	const { user, hasAuthority } = useAuthStore();

	const { medicationHistory, loading, page, size, total, totalPages, fetchMedicationHistory, setPage, setSize, clearMedicationHistory } =
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
	}, [visible, startDate, endDate, page, size, user, fetchMedicationHistory, setPage, canReadHistory]);

	const handleDateChange = (dates) => {
		if (!canReadHistory) return;

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
		if (!canReadHistory) return;
		setPage(newPage - 1);
		if (newSize !== size) {
			// Update size only if it changed
			setSize(newSize);
		}
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

	const handlePrint = () => {
		if (printableContentRef.current) {
			const printWindow = window.open("", "", "height=600,width=800");
			printWindow.document.write("<html><head><title>Medication History Report</title>");
			// More comprehensive print styles
			printWindow.document.write(`
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
                    h1 {
                        text-align: center;
                        margin-bottom: 25px;
                        color: #0056b3;
                        font-size: 24px;
                        border-bottom: 2px solid #eee;
                        padding-bottom: 10px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 10px 12px;
                        text-align: left;
                        font-size: 14px;
                    }
                    th {
                        background-color: #f8f8f8;
                        font-weight: bold;
                        color: #555;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    ul { list-style-type: none; padding-left: 0; margin: 0; }
                    li { margin-bottom: 3px; }
                    .report-footer {
                        text-align: right;
                        margin-top: 30px;
                        font-size: 12px;
                        color: #777;
                    }
                </style>
            `);
			printWindow.document.write("</head><body>");
			printWindow.document.write("<h1>Medication History Report</h1>"); // Explicit header for print
			printWindow.document.write(printableContentRef.current.innerHTML); // Write the content of the ref
			printWindow.document.write(`<div class="report-footer">Report generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}</div>`);
			printWindow.document.write("</body></html>");
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
		}
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

	// Columns for the print report - without scroll and max height, and potentially simpler rendering
	const printColumns = [
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
					// For print, we might want a simpler representation of changes
					return Object.entries(parsedChanges).map(([key, value]) => (
						<div key={key} style={{ marginBottom: "2px" }}>
							<strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : String(value)}
						</div>
					));
				} catch (error) {
					return changes; // Render as plain text if not valid JSON
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

						<div>
							<Button
								type="default"
								icon={<PrinterOutlined />} // Used PrinterOutlined for the icon
								onClick={handlePrint}
								style={{ marginRight: 8 }}>
								Print Report
							</Button>
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
					</div>

					{loading ? (
						<div style={{ textAlign: "center", padding: "50px 0" }}>
							<Spin size="large" />
						</div>
					) : (
						<>
							{/* This div will be the content printed */}
							<div ref={printableContentRef}>
								{/* The table using printColumns is the content for the report */}
								<Table
									columns={printColumns} // Use printColumns for the content that will be printed
									dataSource={medicationHistory}
									rowKey="id"
									pagination={false} // Use separate Pagination component
									// scroll={{ y: 400 }} // No scroll needed for print
									size="small" // Use smaller size for modal context
								/>
							</div>
							<Pagination
								style={{ marginTop: 16, textAlign: "center" }}
								current={page + 1}
								pageSize={size}
								total={total}
								onChange={handlePageChange}
								showSizeChanger
								showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
								pageSizeOptions={["10", "20", "50", "100"]} // Customized page size options
							/>
						</>
					)}
				</>
			)}
		</Modal>
	);
};

export default AllMedicationHistory;
