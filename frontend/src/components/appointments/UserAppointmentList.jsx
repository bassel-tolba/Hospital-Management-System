// frontend/src/components/appointments/UserAppointmentList.js (Corrected)
import React, { useState, useEffect } from "react";
import { Calendar, Card, Typography, Modal, Badge, theme, ConfigProvider, Button } from "antd";
import moment from "moment";
import { Link } from "react-router-dom";
import { useAppointmentStore } from "../../services/appointment.service";

const { Title, Text } = Typography;

const UserAppointmentList = ({ appointments, onAppointmentsUpdated }) => {
	// Added onAppointmentsUpdated
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { token } = theme.useToken();
	const { endAppointment, getUserAppointments } = useAppointmentStore(); // Added getUserAppointments
	const [localAppointments, setLocalAppointments] = useState(appointments); // Local state for appointments

	// Use effect to update the local appointments *only* when the prop 'appointments' changes
	useEffect(() => {
		setLocalAppointments(appointments);
	}, [appointments]);

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

	const handleEndAppointment = async (appointmentId) => {
		try {
			await endAppointment(appointmentId);
			setIsModalOpen(false);

			// Fetch the updated list of appointments. This is crucial for refreshing the calendar.
			// We now get the userId from the selectedAppointment, which should have it.
			if (selectedAppointment && selectedAppointment.userId) {
				await getUserAppointments(selectedAppointment.userId);
			}
			//Alternative local update:
			// const updatedAppointments = localAppointments.map(appt =>
			//     appt.id === appointmentId ? { ...appt, status: 'COMPLETED' } : appt
			// );
			// setLocalAppointments(updatedAppointments); // Update local state
			// if (onAppointmentsUpdated) {
			//   onAppointmentsUpdated(updatedAppointments); // Notify parent
			// }
		} catch (error) {
			console.error("Failed to end appointment", error);
		}
	};

	const dateCellRender = (value) => {
		const dateAppointments = localAppointments.filter(
			// Use localAppointments
			(appointment) => moment(appointment.appointmentDateTime).format("YYYY-MM-DD") === value.format("YYYY-MM-DD")
		);

		return (
			<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
				{dateAppointments.map((appointment) => {
					let badgeStatus = "default"; // Default color
					let appointmentText = `${appointment.patientFirstName} - ${formatShortTime(appointment.startTime)}`;

					switch (appointment.status) {
						case "COMPLETED":
							badgeStatus = "success"; // Green
							appointmentText = `Completed: ${appointment.patientFirstName}`;
							break;
						case "MISSED":
							badgeStatus = "warning"; // Yellow
							appointmentText = `Missed: ${appointment.patientFirstName}`;
							break;
						case "CANCELLED":
							badgeStatus = "error"; // Red
							appointmentText = `Cancelled: ${appointment.patientFirstName}`;
							break;
						case "SCHEDULED":
							// Scheduled, but check if overdue
							if (moment(appointment.endTime).isBefore(moment())) {
								badgeStatus = "warning"; // Yellow for overdue
								appointmentText = `Overdue: ${appointment.patientFirstName}`;
							} else {
								badgeStatus = "processing"; // Blue for scheduled and not overdue
							}
							break;
						default:
							badgeStatus = "default";
					}

					return (
						<li key={appointment.id} onClick={() => handleAppointmentClick(appointment)} style={{ marginBottom: "2px" }}>
							<Badge
								status={badgeStatus} // Use Ant Design's status keywords
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

	const AppointmentModal = () => (
		<Modal
			title="Appointment Details"
			open={isModalOpen}
			onCancel={() => setIsModalOpen(false)}
			footer={null}
			width={window.innerWidth < 768 ? "90%" : "520px"}>
			{selectedAppointment && (
				<Card>
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
						<strong>Status:</strong> {selectedAppointment.status}
					</Text>
					{(selectedAppointment.status === "SCHEDULED" || selectedAppointment.status === "MISSED") && (
						<Button type="primary" onClick={() => handleEndAppointment(selectedAppointment.id)}>
							End Appointment
						</Button>
					)}
				</Card>
			)}
		</Modal>
	);

	return (
		<ConfigProvider
			theme={{
				components: {
					Calendar: {
						fullBg: token.colorBgContainer, // Keep this for overall background
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
