// frontend/src/components/appointments/UserAppointmentList.js (UPDATED)
import React, { useState, useEffect } from "react";
import { Calendar, Card, Typography, Modal, Badge, theme, ConfigProvider, Button, Dropdown } from "antd";
import { DownOutlined, TagsOutlined } from "@ant-design/icons";
import moment from "moment";
import { Link } from "react-router-dom";
import { useAppointmentStore } from "../../services/appointment.service";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

// Removed unused 'onAppointmentsUpdated' prop
const UserAppointmentList = ({ appointments }) => {
	const { t } = useTranslation();
	const { token } = theme.useToken();
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	// Import the new flexible update function and remove endAppointment
	const { updateAppointment, getUserAppointments } = useAppointmentStore();
	const [localAppointments, setLocalAppointments] = useState(appointments);

	useEffect(() => {
		setLocalAppointments(appointments);
	}, [appointments]);

	const APPOINTMENT_STATUSES_FOR_UPDATE = ["COMPLETED", "MISSED", "CANCELLED"];

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

	const handleAppointmentClick = (appointment) => {
		setSelectedAppointment(appointment);
		setIsModalOpen(true);
	};

	const formatTime = (dateTime) => {
		return moment(dateTime).format("MMM D, YYYY h:mm A");
	};

	const formatShortTime = (dateTime) => {
		return moment(dateTime).format("h:mm A");
	};

	// Renamed and updated to handle any status change
	const handleStatusChange = async (appointmentId, newStatus) => {
		try {
			// Use the new, flexible update function
			await updateAppointment(appointmentId, { status: newStatus });
			setIsModalOpen(false);

			// Refresh the full list to ensure the calendar is accurate
			if (selectedAppointment && selectedAppointment.userId) {
				await getUserAppointments(selectedAppointment.userId);
			}
		} catch (error) {
			console.error("Failed to update appointment status", error);
			// Error notification is already handled by the service
		}
	};

	const dateCellRender = (value) => {
		const dateAppointments = localAppointments.filter(
			(appointment) => moment(appointment.appointmentDateTime).format("YYYY-MM-DD") === value.format("YYYY-MM-DD"),
		);

		return (
			<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
				{dateAppointments.map((appointment) => {
					let badgeStatus = "default";
					let appointmentText = `${appointment.patientFirstName} - ${formatShortTime(appointment.startTime)}`;

					switch (appointment.status) {
						case "COMPLETED":
							badgeStatus = "success";
							break;
						case "MISSED":
							badgeStatus = "warning";
							break;
						case "CANCELLED":
							badgeStatus = "error";
							break;
						case "SCHEDULED":
							if (moment(appointment.endTime).isBefore(moment())) {
								badgeStatus = "warning"; // Overdue
							} else {
								badgeStatus = "processing"; // Upcoming
							}
							break;
						default:
							badgeStatus = "default";
					}

					return (
						<li key={appointment.id} onClick={() => handleAppointmentClick(appointment)} style={{ marginBottom: "2px" }}>
							<Badge
								status={badgeStatus}
								text={appointmentText}
								style={{
									cursor: "pointer",
									fontSize: window.innerWidth < 768 ? "10px" : "14px",
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
									maxWidth: "100%",
								}}
							/>
						</li>
					);
				})}
			</ul>
		);
	};

	const AppointmentModal = () => {
		// Define the menu for the dropdown
		const menuProps = {
			items: APPOINTMENT_STATUSES_FOR_UPDATE.map((status) => ({
				key: status,
				label: getStatusText(status),
				// Disable the option if it's already the current status
				disabled: selectedAppointment?.status === status,
			})),
			onClick: ({ key }) => {
				if (selectedAppointment) {
					handleStatusChange(selectedAppointment.id, key);
				}
			},
		};

		return (
			<Modal
				title="Appointment Details"
				open={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				footer={null} // We are putting our action button inside the card
				width={window.innerWidth < 768 ? "90%" : "520px"}>
				{selectedAppointment && (
					<Card
						actions={
							[
								// Conditionally render the dropdown button
								selectedAppointment.status === "SCHEDULED" && (
									<Dropdown menu={menuProps} trigger={["click"]}>
										<Button>
											<TagsOutlined /> Update Status <DownOutlined />
										</Button>
									</Dropdown>
								),
							].filter(Boolean) // Filter out false values to prevent empty space
						}>
						<Title level={5}>
							<Link to={`/patients/${selectedAppointment.patientId}`}>
								{selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}
							</Link>
						</Title>
						<Text>
							<strong>Doctor/Nurse:</strong> {selectedAppointment.userFirstName} {selectedAppointment.userLastName}
						</Text>
						<br />
						<Text>
							<strong>Start Time: </strong>
							{formatTime(selectedAppointment.startTime)}
						</Text>
						<br />
						<Text>
							<strong>End Time: </strong>
							{formatTime(selectedAppointment.endTime)}
						</Text>
						<br />
						<Text>
							<strong>Type:</strong> {selectedAppointment.productName}
						</Text>
						<br />
						<Text>
							<strong>Status:</strong> {getStatusText(selectedAppointment.status)}
						</Text>
					</Card>
				)}
			</Modal>
		);
	};

	return (
		<ConfigProvider
			theme={{
				components: {
					Calendar: {
						fullBg: token.colorBgContainer,
					},
				},
			}}>
			<div
				style={{
					width: "100%",
					overflow: "auto",
					padding: window.innerWidth < 768 ? "8px" : "24px",
				}}>
				<Calendar
					dateCellRender={dateCellRender}
					style={{
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
					}}
					fullscreen={window.innerWidth >= 768}
				/>
				<AppointmentModal />
			</div>
		</ConfigProvider>
	);
};

export default UserAppointmentList;
