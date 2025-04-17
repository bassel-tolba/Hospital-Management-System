import React from "react";
import { Table, Button, Space, Popconfirm, Typography, Badge } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { useAuthStore } from "../../services/auth.service";
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Text } = Typography;

const AppointmentsList = ({ appointments, loading, onEdit, onDelete, onView, pagination, onTableChange }) => {
	const { t } = useTranslation(); // Initialize useTranslation
	const { hasAuthority } = useAuthStore();

	// Helper function to get translated status text
	const getStatusText = (status) => {
		switch (status) {
			case "SCHEDULED":
				return t("appointments.status.scheduled");
			case "COMPLETED":
				return t("appointments.status.completed");
			case "MISSED":
				return t("appointments.status.missed");
			case "CANCELLED": // Assuming CANCELLED is a possible status
				return t("appointments.status.cancelled");
			default:
				return status; // Fallback to original status if no translation key matches
		}
	};

	const columns = [
		{
			title: t("appointments.list.table.dateTime"), // Translate
			dataIndex: "appointmentDateTime",
			key: "appointmentDateTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null),
			sorter: true,
		},
		{
			title: t("appointments.list.table.startTime"), // Translate
			dataIndex: "startTime",
			key: "startTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null),
		},
		{
			title: t("appointments.list.table.endTime"), // Translate
			dataIndex: "endTime",
			key: "endTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : null),
		},
		{
			title: t("appointments.list.table.patient"), // Translate
			dataIndex: "patient",
			key: "patient",
			render: (text, record) => `${record.patientFirstName} ${record.patientLastName}`,
		},
		{
			title: t("appointments.list.table.user"), // Translate
			dataIndex: "user",
			key: "user",
			render: (text, record) => `${record.userFirstName} ${record.userLastName}`,
		},
		{
			title: t("appointments.list.table.appointmentType"), // Translate
			dataIndex: "productName",
			key: "productName",
		},
		{
			title: t("appointments.list.table.status"), // Translate
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color = "default";
				switch (status) {
					case "SCHEDULED":
						color = "processing"; // Use 'processing' for blue
						break;
					case "COMPLETED":
						color = "success"; // Use 'success' for green
						break;
					case "MISSED":
						color = "warning"; // Use 'warning' for gold/yellow
						break;
					case "CANCELLED": // Assuming CANCELLED maps to error/red or default
						color = "error"; // Or keep 'default'
						break;
				}
				return <Badge status={color} text={getStatusText(status)} />; // Translate text
			},
		},
		{
			title: t("common.actions"), // Translate (using common key)
			key: "actions",
			render: (text, record) => (
				<Space>
					{hasAuthority("READ_APPOINTMENT") && (
						<Button type="primary" icon={<EyeOutlined />} onClick={() => onView(record)} size="small">
							{t("common.view")} {/* Translate */}
						</Button>
					)}
					{hasAuthority("UPDATE_APPOINTMENT") && (
						<Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} size="small">
							{t("common.edit")} {/* Translate (using common key) */}
						</Button>
					)}
					{hasAuthority("DELETE_APPOINTMENT") && (
						<Popconfirm
							title={t("appointments.list.confirm.deleteTitle")} // Translate
							onConfirm={() => onDelete(record.id)}
							okText={t("common.yes")} // Translate (using common key)
							cancelText={t("common.no")}>
							{" "}
							{/* Translate (using common key) */}
							<Button type="primary" danger icon={<DeleteOutlined />} size="small">
								{t("common.delete")} {/* Translate (using common key) */}
							</Button>
						</Popconfirm>
					)}
				</Space>
			),
		},
	];

	return <Table columns={columns} dataSource={appointments} loading={loading} rowKey="id" pagination={pagination} onChange={onTableChange} />;
};

export default AppointmentsList;
