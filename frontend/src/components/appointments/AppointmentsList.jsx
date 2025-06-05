import React from "react";
import { Table, Button, Space, Popconfirm, Typography, Badge, Grid } from "antd"; // Added Grid
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { useAuthStore } from "../../services/auth.service";
import { useTranslation } from "react-i18next";

// const { Text } = Typography; // Text component is not used in this version
const { useBreakpoint } = Grid; // Hook for responsive design

const AppointmentsList = ({ appointments, loading, onEdit, onDelete, onView, pagination, onTableChange }) => {
	const { t } = useTranslation();
	const { hasAuthority } = useAuthStore();
	const screens = useBreakpoint(); // Object like { xs: true, sm: false, ... }

	// Helper function to get translated status text
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
				return status; // Fallback to original status
		}
	};

	const columns = [
		{
			title: t("appointments.list.table.startTime"), // Assumed to be the primary event time
			dataIndex: "startTime",
			key: "startTime",
			render: (text) =>
				text
					? moment(text).format(screens.xs ? "DD/MM HH:mm" : "YYYY-MM-DD HH:mm") // Compact format for xs
					: t("common.notAvailable", "N/A"),
			sorter: true,
			ellipsis: screens.xs, // Ellipsis for xs screens if content is too long
		},
		{
			title: t("appointments.list.table.endTime"),
			dataIndex: "endTime",
			key: "endTime",
			render: (text, record) => {
				if (!text) return t("common.notAvailable", "N/A");
				const mEndTime = moment(text);
				// Show only time if endTime is on the same day as startTime
				if (record.startTime) {
					const mStartTime = moment(record.startTime);
					if (mStartTime.isValid() && mEndTime.isValid() && mStartTime.isSame(mEndTime, "day")) {
						return mEndTime.format("HH:mm");
					}
				}
				// Otherwise, show full date and time, with responsive formatting
				return mEndTime.format(screens.xs ? "DD/MM HH:mm" : "YYYY-MM-DD HH:mm");
			},
			responsive: ["sm"], // Hide this column on 'xs' screens
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
			ellipsis: true, // Enable ellipsis for long patient names
		},
		{
			title: t("appointments.list.table.appointmentType"),
			dataIndex: "productName",
			key: "productName",
			render: (text) => text || t("common.notAvailable", "N/A"),
			responsive: ["sm"], // Hide on 'xs'
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
			title: t("appointments.list.table.user"), // Assigned user/practitioner
			dataIndex: "user",
			key: "user",
			render: (text, record) => {
				const firstName = record.userFirstName || "";
				const lastName = record.userLastName || "";
				const fullName = `${firstName} ${lastName}`.trim();
				return fullName || t("common.notAvailable", "N/A");
			},
			responsive: ["md"], // Hide on 'xs' and 'sm'
			ellipsis: true,
		},
		{
			title: t("appointments.list.table.dateTime"), // Original 'appointmentDateTime', possibly booking time
			dataIndex: "appointmentDateTime",
			key: "appointmentDateTime",
			render: (text) => (text ? moment(text).format(screens.xs ? "DD/MM HH:mm" : "YYYY-MM-DD HH:mm") : t("common.notAvailable", "N/A")),
			responsive: ["lg"], // Show only on 'lg' screens and above
		},
		{
			title: t("common.actions"),
			key: "actions",
			fixed: !screens.xs ? "right" : false, // Fix column to the right on non-xs screens
			width: !screens.xs ? 240 : undefined, // Provide a width for fixed column, auto for non-fixed (xs)
			// Adjust 240px based on button text length in various languages.
			// undefined width for xs allows it to fit content (icon buttons).
			render: (text, record) => (
				<Space wrap={screens.xs} size="small">
					{" "}
					{/* Allow buttons to wrap on xs if needed */}
					{hasAuthority("READ_APPOINTMENT") && (
						<Button type="primary" icon={<EyeOutlined />} onClick={() => onView(record)} size="small">
							{screens.xs ? null : t("common.view", "View")} {/* Icon only on xs */}
						</Button>
					)}
					{hasAuthority("UPDATE_APPOINTMENT") && (
						<Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)} size="small">
							{screens.xs ? null : t("common.edit", "Edit")} {/* Icon only on xs */}
						</Button>
					)}
					{hasAuthority("DELETE_APPOINTMENT") && (
						<Popconfirm
							title={t("appointments.list.confirm.deleteTitle", "Are you sure you want to delete this appointment?")}
							onConfirm={() => onDelete(record.id)}
							okText={t("common.yes", "Yes")}
							cancelText={t("common.no", "No")}>
							<Button type="primary" danger icon={<DeleteOutlined />} size="small">
								{screens.xs ? null : t("common.delete", "Delete")} {/* Icon only on xs */}
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
			onChange={onTableChange}
			size="small" // Reduces cell padding for a more compact table
			scroll={{ x: "max-content" }} // Enables horizontal scrolling if content overflows
			// This ensures table is usable even if all columns don't fit.
			// The "little to no margin" aspect for the table itself is usually handled
			// by the container this component is placed in. Ant Design Table default styles
			// do not add significant outer margins.
			// If you need to force zero margin for the table container on small screens,
			// you might wrap this Table in a div with conditional styling:
			// <div style={screens.xs ? { margin: 0, padding: '4px' } : {}}> <Table ... /> </div>
			// or apply a className to the Table and target it with CSS.
		/>
	);
};

export default AppointmentsList;
