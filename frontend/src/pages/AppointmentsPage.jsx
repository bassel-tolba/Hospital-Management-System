import React, { useState, useEffect } from "react";
import { Layout, Typography, Button, Input, Select, Space } from "antd";
import AppointmentsList from "../components/appointments/AppointmentsList";
import AppointmentFormModal from "../components/appointments/AppointmentFormModal";
import { useAppointmentStore } from "../services/appointment.service";
import { useAuthStore } from "../services/auth.service";
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select; // Option might not be needed if using 'options' prop directly

const AppointmentsPage = () => {
	const { t } = useTranslation(); // Initialize useTranslation
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

	// Memoize options to avoid re-creating on every render unless appointments change
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
	}, [page, size, filterParams]); // Dependencies are correct

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
			// Add user-facing error handling if needed, e.g., using message.error(t('appointments.page.error.fetchFailed'))
			console.error("Failed to fetch appointments:", error); // Keep console logs untranslated
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
				// Assuming an updateAppointment function exists or will be added
				// await updateAppointment(selectedAppointment.id, appointmentData);
				console.log("Update appointment (logic TBC):", selectedAppointment.id, appointmentData); // Replace with API call
				// Optionally show success message: message.success(t('appointments.notification.updated'))
			} else {
				await createAppointment(appointmentData);
				// Optionally show success message: message.success(t('appointments.notification.created'))
			}
			await fetchAppointments(); // Refresh the list after successful operation
			setIsModalVisible(false);
		} catch (error) {
			console.error("Failed to save appointment:", error); // Keep console logs untranslated
			// Optionally show error message: message.error(t('appointments.notification.saveFailed'))
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteAppointment(id);
			await fetchAppointments(); // Refresh
			// Optionally show success message: message.success(t('appointments.notification.deleted'))
		} catch (error) {
			console.error("Failed to delete appointment:", error); // Keep console logs untranslated
			// Optionally show error message: message.error(t('appointments.notification.deleteFailed'))
		}
	};

	const handleView = (record) => {
		// This currently re-uses the edit modal.
		// If a dedicated view-only modal is needed, implement it separately.
		console.log("View appointment:", record);
		showModal(record); // Opens the form modal, which isn't strictly "view"
	};

	const handleTableChange = (pagination, filters, sorter) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
		// Reset filters if necessary, or handle sorting/filtering from `filters` and `sorter` args
		// Example: if (sorter.field) { setSortParams({ field: sorter.field, order: sorter.order }); } else { setSortParams({}); }
	};

	const handleSearch = (value) => {
		setFilterParams({}); // Reset dropdown filters when searching
		setPage(0);
		fetchAppointments(value.trim()); // Pass search query to fetch function
	};

	const handleFilterChange = (type, value) => {
		// Clear search term if a filter is applied? Or allow combining? Decide on behavior.
		// This example clears other filters when one is set.
		const newFilterParams = { [type]: value };
		setFilterParams(value ? newFilterParams : {});
		setPage(0); // Reset page when filters change
		// fetchAppointments() will be called by the useEffect hook
	};

	return (
		<Content style={{ padding: "20px" }}>
			<Title level={2}>{t("appointments.page.title")}</Title> {/* Translate */}
			<Space wrap style={{ marginBottom: 16, display: "flex", gap: "10px", width: "100%" }}>
				{" "}
				{/* Added wrap */}
				{hasAuthority("CREATE_APPOINTMENT") && (
					<Button type="primary" onClick={() => showModal()}>
						{t("appointments.page.action.create")} {/* Translate */}
					</Button>
				)}
				<Input.Search
					placeholder={t("appointments.page.filter.searchPlaceholder")} // Translate
					onSearch={handleSearch}
					enterButton
					allowClear // Allow clearing search
					style={{ width: 300 }}
				/>
				<Select
					showSearch
					allowClear
					style={{ width: 200 }}
					placeholder={t("appointments.page.filter.patientPlaceholder")} // Translate
					onChange={(value) => handleFilterChange("patientId", value)}
					optionFilterProp="label" // Filter based on the label text
					filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
					options={patientOptions}
					value={filterParams.patientId} // Control the select value
					notFoundContent={null} // Or display a "not found" message
				/>
				<Select
					showSearch
					allowClear
					style={{ width: 200 }}
					placeholder={t("appointments.page.filter.userPlaceholder")} // Translate
					onChange={(value) => handleFilterChange("userId", value)}
					optionFilterProp="label"
					filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
					options={userOptions}
					value={filterParams.userId} // Control the select value
					notFoundContent={null}
				/>
			</Space>
			<AppointmentsList
				appointments={appointments}
				loading={loading}
				onEdit={showModal} // Assuming clicking Edit should open the same modal
				onDelete={handleDelete}
				onView={handleView} // Assuming clicking View should open the same modal (consider read-only state if possible)
				pagination={{
					current: page + 1,
					pageSize: size,
					total: total,
					showSizeChanger: true, // Optionally allow changing page size
					pageSizeOptions: ["10", "20", "50"], // Example options
					// Optionally add translated text for pagination:
					// locale={{ items_per_page: t('common.pagination.itemsPerPage') }} // Example for AntD locale customization
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
