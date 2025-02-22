// src/components/AllProductHistory.js
import React, { useState, useEffect } from "react";
import { Table, Modal, Typography, Spin, DatePicker, Pagination, Button, Popconfirm, message } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { useProductHistoryStore } from "../../services/history/product-history.service"; // Import the store
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AllProductHistory = ({ visible, onClose }) => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const { productHistory, loading, page, size, total, totalPages, fetchProductHistory, setPage, clearProductHistory } = useProductHistoryStore();

	const user = useAuthStore.getState().user;

	useEffect(() => {
		if (visible) {
			fetchProductHistory(null, startDate, endDate, page, size);
		}
	}, [visible, startDate, endDate, page, size, user, fetchProductHistory]);

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
		setPage(0);
	};

	const handlePageChange = (newPage, newSize) => {
		fetchProductHistory(null, startDate, endDate, newPage - 1, newSize);
	};

	const handleClearHistory = async () => {
		try {
			await clearProductHistory();
			message.success("Product history cleared successfully.");
			fetchProductHistory(null, startDate, endDate, 0, size); // Refetch after clearing
		} catch (error) {
			console.error("Failed to clear history", error);
			message.error("Failed to clear product history.");
		}
	};

	const confirmFirst = (e) => {
		//first confirm, do nothing
	};
	const confirmSecond = (e) => {
		handleClearHistory();
	};

	const cancel = (e) => {
		message.error("Clear history cancelled");
	};

	const columns = [
		{
			title: "Product",
			dataIndex: "productName",
			key: "productName",
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
			render: (timestamp) => moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
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
				try {
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
				} catch (error) {
					return changes;
				}
			},
		},
	];

	return (
		<Modal title="All Product History" visible={visible} onCancel={onClose} footer={null} width="80%">
			<RangePicker showTime onChange={handleDateChange} style={{ marginBottom: 16 }} />
			<Popconfirm
				title="Clear History"
				description="Are you sure you want to clear all product history?"
				onConfirm={confirmFirst}
				onCancel={cancel}
				okText="Yes"
				cancelText="No"
				okButtonProps={{ danger: true }}>
				<Popconfirm
					title="Clear History"
					description="Are you absolutely sure? This action cannot be undone."
					onConfirm={confirmSecond}
					onCancel={cancel}
					okText="Yes, I'm sure"
					cancelText="No"
					okButtonProps={{ danger: true }}>
					<Button type="primary" danger style={{ marginLeft: "1rem", marginBottom: "1rem" }}>
						Clear All History
					</Button>
				</Popconfirm>
			</Popconfirm>
			{loading ? (
				<div style={{ textAlign: "center" }}>
					<Spin />
				</div>
			) : (
				<>
					<Title level={4}>All Product History</Title>
					<Table
						columns={columns}
						dataSource={productHistory}
						rowKey="id"
						pagination={false} // Separate Pagination component
					/>
					<Pagination
						style={{ marginTop: 16, textAlign: "center" }}
						current={page + 1}
						pageSize={size}
						total={total}
						onChange={handlePageChange}
						showSizeChanger
						showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items (Pages: ${totalPages})`}
					/>
				</>
			)}
		</Modal>
	);
};

export default AllProductHistory;
