// frontend/src/pages/AppointmentsPage.js
import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Input, Select, Space } from "antd";
import AppointmentsList from "../components/appointments/AppointmentsList";
import AppointmentFormModal from "../components/appointments/AppointmentFormModal";
import { useAppointmentStore } from "../services/appointment.service";
import { useAuthStore } from "../services/auth.service";
const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const AppointmentsPage = () => {
	const {
		appointments,
		loading,
		total,
		getAllAppointments,
		createAppointment,
		deleteAppointment,
		getAppointmentById,
		getAppointmentsByPatientId,
		getAppointmentsByUserId,
		getAppointmentsByPatientIdAndUserId,
		searchAppointments,
		setPage,
		setSize,
		page,
		size,
	} = useAppointmentStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const { hasAuthority } = useAuthStore();
	const [filterParams, setFilterParams] = useState({});

	useEffect(() => {
		fetchAppointments();
	}, [page, size, filterParams]);

	const fetchAppointments = async () => {
		// You can add more sophisticated filtering here based on filterParams
		if (filterParams.patientId && filterParams.userId) {
			await getAppointmentsByPatientIdAndUserId(filterParams.patientId, filterParams.userId, page, size);
		} else if (filterParams.patientId) {
			await getAppointmentsByPatientId(filterParams.patientId, page, size);
		} else if (filterParams.userId) {
			await getAppointmentsByUserId(filterParams.userId, page, size);
		} else {
			await getAllAppointments(page, size);
		}
	};

	const showModal = (appointment = null) => {
		setSelectedAppointment(appointment);
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedAppointment(null);
	};

	const handleCreateOrUpdate = async (appointmentData) => {
		if (selectedAppointment) {
			// Update logic (not yet implemented in the service)
			// You'd likely need an `updateAppointment` action in your store.
			console.log("Update appointment:", appointmentData); // Replace with API call
		} else {
			await createAppointment(appointmentData);
		}
		fetchAppointments(); // Refresh the list
		setIsModalVisible(false);
	};

	const handleDelete = async (id) => {
		await deleteAppointment(id);
		fetchAppointments(); // Refresh
	};

	const handleView = (record) => {
		// Implement view logic (e.g., show a read-only modal)
		console.log("View appointment:", record);
		showModal(record);
	};

	const handleTableChange = (pagination, filters, sorter) => {
		setPage(pagination.current - 1); //page starts from 0 in backend
		setSize(pagination.pageSize);
	};

	const handlePatientChange = (value) => {
		setFilterParams({ ...filterParams, patientId: value });
		setPage(0);
	};
	const handleUserChange = (value) => {
		setFilterParams({ ...filterParams, userId: value });
		setPage(0);
	};

	return (
		<Content style={{ padding: "20px" }}>
			<Title level={2}>Appointments</Title>
			<Space style={{ marginBottom: 16, display: "flex", gap: "10px", width: "100%" }}>
				{hasAuthority("CREATE_APPOINTMENT") && (
					<Button type="primary" onClick={() => showModal()}>
						Create Appointment
					</Button>
				)}
				<Input.Search
					placeholder="Search by Patient name or User name"
					onSearch={(value) => {
						setFilterParams({}); //reset other filters
						setPage(0);
						searchAppointments(value, 0, size);
					}}
					enterButton
					style={{ width: 300 }}
				/>
				<Select
					showSearch
					allowClear
					style={{ width: 200 }}
					placeholder="Filter by Patient"
					onChange={handlePatientChange}
					optionFilterProp="children"
					filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
					options={appointments.map((appointment) => ({
						value: appointment.patientId,
						label: `${appointment.patientFirstName} ${appointment.patientLastName}`,
					}))}
				/>
				<Select
					showSearch
					allowClear
					style={{ width: 200 }}
					placeholder="Filter by User"
					onChange={handleUserChange}
					optionFilterProp="children"
					filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
					options={appointments.map((appointment) => ({
						value: appointment.userId,
						label: `${appointment.userFirstName} ${appointment.userLastName}`,
					}))}
				/>
			</Space>
			<AppointmentsList
				appointments={appointments}
				loading={loading}
				onEdit={showModal}
				onDelete={handleDelete}
				onView={handleView}
				pagination={{
					current: page + 1, //page starts from 1 in frontend
					pageSize: size,
					total: total,
				}}
				onTableChange={handleTableChange}
			/>

			<AppointmentFormModal
				isVisible={isModalVisible}
				onCancel={handleCancel}
				onSubmit={handleCreateOrUpdate}
				selectedAppointment={selectedAppointment}
			/>
		</Content>
	);
};

export default AppointmentsPage;
