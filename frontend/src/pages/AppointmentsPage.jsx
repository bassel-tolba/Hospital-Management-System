import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Input, Select, Space } from "antd";
import AppointmentsList from "../components/appointments/AppointmentsList";
import AppointmentFormModal from "../components/appointments/AppointmentFormModal";
import { useAppointmentStore } from "../services/appointment.service";
import { useAuthStore } from "../services/auth.service";
import { useTranslation } from "react-i18next";

const { Content } = Layout;
const { Title } = Typography;

const AppointmentsPage = () => {
	const { t } = useTranslation();
	const {
		appointments,
		loading,
		total,
		getAllAppointments,
		createAppointment,
		updateAppointment,
		deleteAppointment,
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

	const patientOptions = React.useMemo(() => {
		const uniquePatients = new Map();
		appointments.forEach((appt) => {
			if (appt.patientId && !uniquePatients.has(appt.patientId)) {
				uniquePatients.set(appt.patientId, {
					value: appt.patientId,
					label: `${appt.patientFirstName} ${appt.patientLastName}`,
				});
			}
		});
		return Array.from(uniquePatients.values());
	}, [appointments]);

	const userOptions = React.useMemo(() => {
		const uniqueUsers = new Map();
		appointments.forEach((appt) => {
			if (appt.userId && !uniqueUsers.has(appt.userId)) {
				uniqueUsers.set(appt.userId, {
					value: appt.userId,
					label: `${appt.userFirstName} ${appt.userLastName}`,
				});
			}
		});
		return Array.from(uniqueUsers.values());
	}, [appointments]);

	useEffect(() => {
		fetchAppointments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, size, filterParams]);

	const fetchAppointments = async (searchQuery = null) => {
		try {
			if (searchQuery) {
				await searchAppointments(searchQuery, page, size);
			} else if (filterParams.patientId && filterParams.userId) {
				await getAppointmentsByPatientIdAndUserId(filterParams.patientId, filterParams.userId, page, size);
			} else if (filterParams.patientId) {
				await getAppointmentsByPatientId(filterParams.patientId, page, size);
			} else if (filterParams.userId) {
				await getAppointmentsByUserId(filterParams.userId, page, size);
			} else {
				await getAllAppointments(page, size);
			}
		} catch (error) {
			console.error("Failed to fetch appointments:", error);
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
		try {
			if (selectedAppointment) {
				await updateAppointment(selectedAppointment.id, appointmentData);
			} else {
				await createAppointment(appointmentData);
			}
			await fetchAppointments();
			setIsModalVisible(false);
		} catch (error) {
			console.error("Failed to save appointment:", error);
			throw error;
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteAppointment(id);
			await fetchAppointments(); // Refresh
		} catch (error) {
			console.error("Failed to delete appointment:", error);
		}
	};

	const handleStatusChange = async (appointmentId, newStatus) => {
		// --- THIS CONSOLE LOG WILL NOW APPEAR ---
		console.log(`handleStatusChange triggered for ID: ${appointmentId} with status: ${newStatus}`);
		try {
			await updateAppointment(appointmentId, { status: newStatus });
		} catch (error) {
			console.error("Failed to update status from page:", error);
		}
	};

	const handleView = (record) => {
		console.log("View appointment:", record);
		showModal(record);
	};

	const handleTableChange = (pagination, filters, sorter) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const handleSearch = (value) => {
		setFilterParams({});
		setPage(0);
		fetchAppointments(value.trim());
	};

	const handleFilterChange = (type, value) => {
		const newFilterParams = { [type]: value };
		setFilterParams(value ? newFilterParams : {});
		setPage(0);
	};

	return (
		<Content style={{ padding: "20px" }}>
			<Title level={2}>{t("appointments.page.title")}</Title>
			<Space wrap style={{ marginBottom: 16, display: "flex", gap: "10px", width: "100%" }}>
				{hasAuthority("CREATE_APPOINTMENT") && (
					<Button type="primary" onClick={() => showModal()}>
						{t("appointments.page.action.create")}
					</Button>
				)}
				<Input.Search
					placeholder={t("appointments.page.filter.searchPlaceholder")}
					onSearch={handleSearch}
					enterButton
					allowClear
					style={{ width: 300 }}
				/>
				<Select
					showSearch
					allowClear
					style={{ width: 200 }}
					placeholder={t("appointments.page.filter.patientPlaceholder")}
					onChange={(value) => handleFilterChange("patientId", value)}
					optionFilterProp="label"
					filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
					options={patientOptions}
					value={filterParams.patientId}
					notFoundContent={null}
				/>
				<Select
					showSearch
					allowClear
					style={{ width: 200 }}
					placeholder={t("appointments.page.filter.userPlaceholder")}
					onChange={(value) => handleFilterChange("userId", value)}
					optionFilterProp="label"
					filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
					options={userOptions}
					value={filterParams.userId}
					notFoundContent={null}
				/>
			</Space>
			<AppointmentsList
				appointments={appointments}
				loading={loading}
				onEdit={showModal}
				onDelete={handleDelete}
				onView={handleView}
				onStatusChange={handleStatusChange}
				pagination={{
					current: page + 1,
					pageSize: size,
					total: total,
					showSizeChanger: true,
					pageSizeOptions: ["10", "20", "50"],
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
