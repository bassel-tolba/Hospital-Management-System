// frontend/src/components/appointments/AppointmentsList.js (CORRECTED)
import React from "react";
import { Table, Button, Space, Popconfirm, Badge, Grid, Dropdown } from "antd"; // Removed Menu from import as it's now implicit
import { EditOutlined, DeleteOutlined, EyeOutlined, DownOutlined, TagsOutlined } from "@ant-design/icons";
import moment from "moment";
import { useAuthStore } from "../../services/auth.service";
import { useTranslation } from "react-i18next";

const { useBreakpoint } = Grid;

const AppointmentsList = ({ appointments, loading, onEdit, onDelete, onView, onStatusChange, pagination, onTableChange }) => {
	const { t } = useTranslation();
	const { hasAuthority } = useAuthStore();
	const screens = useBreakpoint();

	const APPOINTMENT_STATUSES = ["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"];

	const getStatusText = (status) => {
		switch (status) {
			case "SCHEDULED":
				return t("appointments.status.scheduled", "Scheduled");
			case "COMPLETED":
				return t("appointments.status.completed", "Completed");
			case "MISSED":
				return t("appointments.status.missed", "Missed");
			case "CANCELLED":
				return t("appointments.status.cancelled", "Cancelled");
			default:
				return status;
		}
	};

	const columns = [
		// ... (all other columns remain exactly the same) ...
		{
			title: t("appointments.list.table.startTime"),
			dataIndex: "startTime",
			key: "startTime",
			render: (text) => (text ? moment(text).format(screens.xs ? "DD/MM HH:mm" : "YYYY-MM-DD HH:mm") : t("common.notAvailable", "N/A")),
			sorter: true,
			ellipsis: screens.xs,
		},
		{
			title: t("appointments.list.table.endTime"),
			dataIndex: "endTime",
			key: "endTime",
			render: (text, record) => {
				if (!text) return t("common.notAvailable", "N/A");
				const mEndTime = moment(text);
				if (record.startTime) {
					const mStartTime = moment(record.startTime);
					if (mStartTime.isValid() && mEndTime.isValid() && mStartTime.isSame(mEndTime, "day")) {
						return mEndTime.format("HH:mm");
					}
				}
				return mEndTime.format(screens.xs ? "DD/MM HH:mm" : "YYYY-MM-DD HH:mm");
			},
			responsive: ["sm"],
		},
		{
			title: t("appointments.list.table.patient"),
			dataIndex: "patient",
			key: "patient",
			render: (text, record) => {
				const firstName = record.patientFirstName || "";
				const lastName = record.patientLastName || "";
				const fullName = `${firstName} ${lastName}`.trim();
				return fullName || t("common.notAvailable", "N/A");
			},
			ellipsis: true,
		},
		{
			title: t("appointments.list.table.appointmentType"),
			dataIndex: "productName",
			key: "productName",
			render: (text) => text || t("common.notAvailable", "N/A"),
			responsive: ["sm"],
			ellipsis: true,
		},
		{
			title: t("appointments.list.table.status"),
			dataIndex: "status",
			key: "status",
			render: (status) => {
				let color = "default";
				switch (status) {
					case "SCHEDULED":
						color = "processing";
						break;
					case "COMPLETED":
						color = "success";
						break;
					case "MISSED":
						color = "warning";
						break;
					case "CANCELLED":
						color = "error";
						break;
					default:
						color = "default";
				}
				return <Badge status={color} text={getStatusText(status)} />;
			},
		},
		{
			title: t("appointments.list.table.user"),
			dataIndex: "user",
			key: "user",
			render: (text, record) => {
				const firstName = record.userFirstName || "";
				const lastName = record.userLastName || "";
				const fullName = `${firstName} ${lastName}`.trim();
				return fullName || t("common.notAvailable", "N/A");
			},
			responsive: ["md"],
			ellipsis: true,
		},
		{
			title: t("appointments.list.table.dateTime"),
			dataIndex: "appointmentDateTime",
			key: "appointmentDateTime",
			render: (text) => (text ? moment(text).format(screens.xs ? "DD/MM HH:mm" : "YYYY-MM-DD HH:mm") : t("common.notAvailable", "N/A")),
			responsive: ["lg"],
		},
		{
			title: t("common.actions"),
			key: "actions",
			fixed: !screens.xs ? "right" : false,
			width: !screens.xs ? 350 : undefined,
			render: (text, record) => {
				// --- THIS IS THE CORRECTED LOGIC for Ant Design v5+ ---
				const menuProps = {
					items: APPOINTMENT_STATUSES.map((status) => ({
						key: status,
						label: getStatusText(status),
						disabled: record.status === status,
					})),
					onClick: ({ key }) => {
						// The onStatusChange call is now part of the menu props object
						onStatusChange(record.id, key);
					},
				};

				return (
					<Space wrap={screens.xs} size="small">
						{hasAuthority("UPDATE_APPOINTMENT") && (
							// Use the 'menu' prop instead of 'overlay'
							<Dropdown menu={menuProps} trigger={["click"]}>
								<Button size="small" icon={screens.xs ? <TagsOutlined /> : null}>
									{screens.xs ? null : t("appointments.list.actions.updateStatus", "Update Status")}
									{!screens.xs && <DownOutlined style={{ marginLeft: 4 }} />}
								</Button>
							</Dropdown>
						)}
						{hasAuthority("READ_APPOINTMENT") && (
							<Button type="primary" icon={<EyeOutlined />} onClick={() => onView(record)} size="small">
								{screens.xs ? null : t("common.view", "View")}
							</Button>
						)}
						{hasAuthority("UPDATE_APPOINTMENT") && (
							<Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} size="small">
								{screens.xs ? null : t("common.edit", "Edit")}
							</Button>
						)}
						{hasAuthority("DELETE_APPOINTMENT") && (
							<Popconfirm
								title={t("appointments.list.confirm.deleteTitle", "Are you sure you want to delete this appointment?")}
								onConfirm={() => onDelete(record.id)}
								okText={t("common.yes", "Yes")}
								cancelText={t("common.no", "No")}>
								<Button type="primary" danger icon={<DeleteOutlined />} size="small">
									{screens.xs ? null : t("common.delete", "Delete")}
								</Button>
							</Popconfirm>
						)}
					</Space>
				);
			},
		},
	];

	return (
		<Table
			columns={columns}
			dataSource={appointments}
			loading={loading}
			rowKey="id"
			pagination={pagination}
			onChange={onTableChange}
			size="small"
			scroll={{ x: "max-content" }}
		/>
	);
};

export default AppointmentsList;
