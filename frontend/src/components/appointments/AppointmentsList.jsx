// frontend/src/components/appointments/AppointmentsList.js (Modified)

import React from "react";
import { Table, Button, Space, Popconfirm, Typography, Badge } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { useAuthStore } from "../../services/auth.service";
const { Text } = Typography;
const AppointmentsList = ({ appointments, loading, onEdit, onDelete, onView, pagination, onTableChange }) => {
	const { hasAuthority } = useAuthStore();
	const columns = [
		{
			title: "Date and Time",
			dataIndex: "appointmentDateTime",
			key: "appointmentDateTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null),
			sorter: true, // Enable sorting
		},
		{
			title: "Start Time",
			dataIndex: "startTime",
			key: "startTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null),
		},
		{
			title: "End Time",
			dataIndex: "endTime",
			key: "endTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null),
		},
		{
			title: "Patient",
			dataIndex: "patient",
			key: "patient",
			render: (text, record) => `${record.patientFirstName} ${record.patientLastName}`,
		},
		{
			title: "Doctor/Nurse",
			dataIndex: "user",
			key: "user",
			render: (text, record) => `${record.userFirstName} ${record.userLastName}`,
		},
		{
			title: "Appointment Type",
			dataIndex: "productName", // Assuming you have this in your DTO
			key: "productName",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color = "default"; // Default color (e.g., for cancelled)
				switch (status) {
					case "SCHEDULED":
						color = "blue"; // Or 'processing'
						break;
					case "COMPLETED":
						color = "green"; // Or 'success'
						break;
					case "MISSED":
						color = "gold"; // Or 'warning'
						break;
					// 'CANCELLED' will use default color
				}
				return <Badge status={color} text={status} />;
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space>
					{hasAuthority("READ_APPOINTMENT") && (
						<Button type="primary" icon={<EyeOutlined />} onClick={() => onView(record)} size="small">
							View
						</Button>
					)}
					{hasAuthority("UPDATE_APPOINTMENT") && (
						<Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} size="small">
							Edit
						</Button>
					)}
					{hasAuthority("DELETE_APPOINTMENT") && (
						<Popconfirm
							title="Are you sure you want to delete this appointment?"
							onConfirm={() => onDelete(record.id)}
							okText="Yes"
							cancelText="No">
							<Button type="primary" danger icon={<DeleteOutlined />} size="small">
								Delete
							</Button>
						</Popconfirm>
					)}
				</Space>
			),
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={appointments}
			loading={loading}
			rowKey="id"
			pagination={pagination}
			onChange={onTableChange} // Handle pagination, sorting, filtering
		/>
	);
};

export default AppointmentsList;
