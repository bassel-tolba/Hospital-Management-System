import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, message } from "antd";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import { useUserStore } from "../../services/user.service";
import { useProductStore } from "../../services/product.service";
import { useAuthStore } from "../../services/auth.service";
import { useTranslation } from "react-i18next"; // Import useTranslation

const { Option } = Select;

const AppointmentFormModal = ({ isVisible, onCancel, onSubmit, selectedAppointment }) => {
	const { t } = useTranslation(); // Initialize useTranslation
	const [form] = Form.useForm();
	const { patients, searchPatients, loading: patientsLoading } = usePatientStore();
	const { users, searchUsers, loading: usersLoading } = useUserStore();
	const { products, getAllProducts, loading: productsLoading } = useProductStore();
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [patientOptions, setPatientOptions] = useState([]);
	const [userOptions, setUserOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const { hasAuthority } = useAuthStore();

	// --- Data Fetching Effects ---
	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			try {
				await getAllProducts();
			} catch (error) {
				console.error("Error fetching products", error); // Keep console logs untranslated
			} finally {
				setLoading(false);
			}
		};
		fetchProducts();
	}, [getAllProducts]);

	useEffect(() => {
		if (products && products.length > 0) {
			const appointmentProducts = products.filter((product) => product.type === "APPOINTMENT");
			setFilteredProducts(appointmentProducts);
		}
	}, [products]);

	// --- Form Initialization and Reset ---
	useEffect(() => {
		if (selectedAppointment) {
			form.setFieldsValue({
				...selectedAppointment,
				appointmentDateTime: moment(selectedAppointment.appointmentDateTime),
				startTime: moment(selectedAppointment.startTime),
				endTime: moment(selectedAppointment.endTime),
				patientId: selectedAppointment.patientId,
				userId: selectedAppointment.userId,
				productId: selectedAppointment.productId,
			});
		} else {
			form.resetFields();
		}
	}, [selectedAppointment, form]);

	// --- Patient Search ---
	const handlePatientSearch = async (value) => {
		if (value) {
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 10 });
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
					})) || []
				);
			} catch (error) {
				console.error("Failed to search patients:", error); // Keep console logs untranslated
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	// --- User Search ---
	const handleUserSearch = async (value) => {
		try {
			const searchParams = { search: value };
			const results = await searchUsers(searchParams);
			setUserOptions(
				results.content.map((user) => ({
					label: `${user.firstName} ${user.lastName}`,
					value: user.id,
				}))
			);
		} catch (error) {
			console.error("Error searching users:", error); // Keep console logs untranslated
			setUserOptions([]);
		}
	};

	// --- Form Submission ---
	const handleFormSubmit = async () => {
		setLoading(true);
		try {
			const values = await form.validateFields();
			const appointmentData = {
				...values,
				appointmentDateTime: values.appointmentDateTime ? values.appointmentDateTime.toISOString() : null,
				startTime: values.startTime ? values.startTime.toISOString() : null,
				endTime: values.endTime ? values.endTime.toISOString() : null,
				patientId: values.patientId,
				userId: values.userId,
				productId: values.productId,
			};

			onSubmit(appointmentData);
			form.resetFields();
		} catch (error) {
			console.error("Form validation failed:", error); // Keep console logs untranslated
			message.error(t("appointments.formModal.error.validationFailed")); // Translate user message
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			// Translate title conditionally
			title={t(selectedAppointment ? "appointments.formModal.title.edit" : "appointments.formModal.title.add")}
			open={isVisible}
			onCancel={onCancel}
			onOk={handleFormSubmit}
			confirmLoading={loading}
			forceRender // Important for dynamic content
			okText={t(selectedAppointment ? "common.update" : "common.save")} // Translate OK button
			cancelText={t("common.cancel")} // Translate Cancel button
		>
			<Form form={form} layout="vertical">
				<Form.Item
					label={t("appointments.formModal.label.dateTime")} // Translate
					name="appointmentDateTime"
					rules={[{ required: true, message: t("appointments.formModal.validation.dateTimeRequired") }]}>
					{" "}
					{/* Translate */}
					<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item
					label={t("appointments.formModal.label.startTime")} // Translate
					name="startTime"
					rules={[{ required: true, message: t("appointments.formModal.validation.startTimeRequired") }]}>
					{" "}
					{/* Translate */}
					<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item
					label={t("appointments.formModal.label.endTime")} // Translate
					name="endTime"
					rules={[{ required: true, message: t("appointments.formModal.validation.endTimeRequired") }]}>
					{" "}
					{/* Translate */}
					<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item
					label={t("appointments.formModal.label.patient")} // Translate
					name="patientId"
					rules={[{ required: true, message: t("appointments.formModal.validation.patientRequired") }]}>
					{" "}
					{/* Translate */}
					<Select
						showSearch
						placeholder={t("appointments.formModal.placeholder.searchPatient")} // Translate
						optionFilterProp="children"
						onSearch={handlePatientSearch}
						filterOption={false}
						loading={patientsLoading}
						options={patientOptions} // Use options prop for AntD v5+
					/>
				</Form.Item>
				<Form.Item
					label={t("appointments.formModal.label.user")} // Translate
					name="userId"
					rules={[{ required: true, message: t("appointments.formModal.validation.userRequired") }]}>
					{" "}
					{/* Translate */}
					<Select
						showSearch
						placeholder={t("appointments.formModal.placeholder.searchUser")} // Translate
						optionFilterProp="children"
						onSearch={handleUserSearch}
						filterOption={false}
						loading={usersLoading}
						options={userOptions} // Use options prop for AntD v5+
					/>
				</Form.Item>
				<Form.Item
					label={t("appointments.formModal.label.appointmentType")} // Translate
					name="productId"
					rules={[{ required: true, message: t("appointments.formModal.validation.appointmentTypeRequired") }]}>
					{" "}
					{/* Translate */}
					<Select
						placeholder={t("appointments.formModal.placeholder.selectAppointmentType")} // Translate
						loading={productsLoading}>
						{filteredProducts.map((product) => (
							<Option key={product.id} value={product.id}>
								{product.name}
							</Option>
						))}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default AppointmentFormModal;
