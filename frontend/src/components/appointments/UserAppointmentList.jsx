import React, { useState, useEffect } from "react";
import { Calendar, Card, Typography, Modal, Badge, theme, ConfigProvider, Button, Space } from "antd"; // Added Space
import moment from "moment";
import { Link } from "react-router-dom";
import { useAppointmentStore } from "../../services/appointment.service";
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Title, Text } = Typography;

const UserAppointmentList = ({ appointments, onAppointmentsUpdated }) => {
	const { t } = useTranslation(); // Initialize useTranslation
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { token } = theme.useToken();
	const { endAppointment, getUserAppointments } = useAppointmentStore();
	const [localAppointments, setLocalAppointments] = useState(appointments);

	useEffect(() => {
		setLocalAppointments(appointments);
	}, [appointments]);

	const handleAppointmentClick = (appointment) => {
		setSelectedAppointment(appointment);
		setIsModalOpen(true);
	};

	const formatTime = (dateTime) => {
		// Potentially localize this further using moment locales if needed
		return moment(dateTime).format("MMM D, YYYY h:mm A");
	};

	const formatShortTime = (dateTime) => {
		// Potentially localize this further
		return moment(dateTime).format("h:mm A");
	};

	const handleEndAppointment = async (appointmentId) => {
		try {
			await endAppointment(appointmentId);
			setIsModalOpen(false);
			if (selectedAppointment && selectedAppointment.userId) {
				await getUserAppointments(selectedAppointment.userId);
			}
			// Note: You might want to show a success message here using message.success() and t()
		} catch (error) {
			console.error("Failed to end appointment", error); // Keep console logs untranslated
			// Note: You might want to show an error message here using message.error() and t()
		}
	};

	const dateCellRender = (value) => {
		const dateAppointments = localAppointments.filter(
			(appointment) => moment(appointment.appointmentDateTime).format("YYYY-MM-DD") === value.format("YYYY-MM-DD")
		);

		return (
			<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
				{dateAppointments.map((appointment) => {
					let badgeStatus = "default";
					let appointmentTextKey = "";
					let interpolationParams = {
						patientName: `${appointment.patientFirstName}`, // Only first name for brevity? Or full name?
						time: formatShortTime(appointment.startTime),
					};

					switch (appointment.status) {
						case "COMPLETED":
							badgeStatus = "success";
							appointmentTextKey = "appointments.userList.calendar.statusCompleted";
							interpolationParams = { patientName: `${appointment.patientFirstName}` }; // No time needed
							break;
						case "MISSED":
							badgeStatus = "warning";
							appointmentTextKey = "appointments.userList.calendar.statusMissed";
							interpolationParams = { patientName: `${appointment.patientFirstName}` };
							break;
						case "CANCELLED":
							badgeStatus = "error";
							appointmentTextKey = "appointments.userList.calendar.statusCancelled";
							interpolationParams = { patientName: `${appointment.patientFirstName}` };
							break;
						case "SCHEDULED":
							if (moment(appointment.endTime).isBefore(moment())) {
								badgeStatus = "warning";
								appointmentTextKey = "appointments.userList.calendar.statusOverdue";
								interpolationParams = { patientName: `${appointment.patientFirstName}` };
							} else {
								badgeStatus = "processing";
								appointmentTextKey = "appointments.userList.calendar.statusScheduled";
								// interpolationParams already includes name and time
							}
							break;
						default:
							badgeStatus = "default";
							appointmentTextKey = "appointments.userList.calendar.statusUnknown"; // Add a key for unknown status
							interpolationParams = { patientName: `${appointment.patientFirstName}` };
					}

					return (
						<li key={appointment.id} onClick={() => handleAppointmentClick(appointment)} style={{ marginBottom: "2px" }}>
							<Badge
								status={badgeStatus}
								text={t(appointmentTextKey, interpolationParams)} // Translate text with interpolation
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

	// Helper function to get translated status text for the modal
	const getModalStatusText = (status) => {
		switch (status) {
			case "SCHEDULED":
				return t("appointments.status.scheduled");
			case "COMPLETED":
				return t("appointments.status.completed");
			case "MISSED":
				return t("appointments.status.missed");
			case "CANCELLED":
				return t("appointments.status.cancelled");
			default:
				return status;
		}
	};

	const AppointmentModal = () => (
		<Modal
			title={t("appointments.userList.modal.title")} // Translate
			open={isModalOpen}
			onCancel={() => setIsModalOpen(false)}
			footer={
				// Add Cancel button for consistency
				<Button key="back" onClick={() => setIsModalOpen(false)}>
					{t("common.close")} {/* Use common close */}
				</Button>
			}
			width={window.innerWidth < 768 ? "90%" : "520px"}>
			{selectedAppointment && (
				<Card bordered={false}>
					{" "}
					{/* Remove card border for cleaner modal look */}
					<Title level={5} style={{ marginBottom: 16 }}>
						<Link to={`/patients/${selectedAppointment.patientId}`}>
							{selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}
						</Link>
					</Title>
					<Space direction="vertical" size="middle" style={{ width: "100%" }}>
						{" "}
						{/* Use Space for layout */}
						<Text>
							<strong>{t("appointments.userList.modal.labelUser")}:</strong> {selectedAppointment.userFirstName}{" "}
							{selectedAppointment.userLastName}
						</Text>
						<Text>
							<strong>{t("appointments.userList.modal.labelStartTime")}: </strong>
							{formatTime(selectedAppointment.startTime)}
						</Text>
						<Text>
							<strong>{t("appointments.userList.modal.labelEndTime")}: </strong>
							{formatTime(selectedAppointment.endTime)}
						</Text>
						<Text>
							<strong>{t("appointments.userList.modal.labelType")}:</strong> {selectedAppointment.productName}
						</Text>
						<Text>
							<strong>{t("appointments.userList.modal.labelStatus")}:</strong> {getModalStatusText(selectedAppointment.status)}{" "}
							{/* Translate Status */}
						</Text>
						{(selectedAppointment.status === "SCHEDULED" || selectedAppointment.status === "MISSED") && (
							<Button type="primary" onClick={() => handleEndAppointment(selectedAppointment.id)} style={{ marginTop: 16 }}>
								{t("appointments.userList.modal.actionEnd")} {/* Translate */}
							</Button>
						)}
					</Space>
				</Card>
			)}
		</Modal>
	);

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
