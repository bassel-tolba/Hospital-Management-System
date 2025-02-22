// src/components/ProductHistory.js
import React, { useState, useEffect } from "react";
import { Table, Modal, Typography, Spin, DatePicker, Pagination } from "antd";
import { useAuthStore } from "../../services/auth.service";
import { useProductHistoryStore } from "../../services/history/product-history.service"; // Import
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ProductHistory = ({ productId, productName, visible, onClose }) => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const { productHistory, loading, page, size, total, totalPages, fetchProductHistory, setPage } = useProductHistoryStore();

	const user = useAuthStore.getState().user;

	useEffect(() => {
		if (visible && productId) {
			fetchProductHistory(productId, startDate, endDate, page, size);
		}
	}, [visible, productId, startDate, endDate, page, size, user, fetchProductHistory]);

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
		fetchProductHistory(productId, startDate, endDate, newPage - 1, newSize);
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
		<Modal title={`History for ${productName}`} visible={visible} onCancel={onClose} footer={null} width="80%">
			<RangePicker showTime onChange={handleDateChange} style={{ marginBottom: 16 }} />
			{loading ? (
				<div style={{ textAlign: "center" }}>
					<Spin />
				</div>
			) : (
				<>
					<Title level={4}>Product History</Title>
					<Table columns={columns} dataSource={productHistory} rowKey="id" pagination={false} />
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

export default ProductHistory;
