// frontend/src/components/appointments/AppointmentFormModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, message } from "antd";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import { useUserStore } from "../../services/user.service";
import { useProductStore } from "../../services/product.service";
import { useAuthStore } from "../../services/auth.service";

const { Option } = Select;

const AppointmentFormModal = ({ isVisible, onCancel, onSubmit, selectedAppointment }) => {
	const [form] = Form.useForm();
	const { patients, searchPatients, loading: patientsLoading } = usePatientStore(); // Use searchPatients
	const { users, searchUsers, loading: usersLoading } = useUserStore();
	const { products, getAllProducts, loading: productsLoading } = useProductStore(); // Fetch products
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
				await getAllProducts(); // Fetch all initially, then filter
			} catch (error) {
				console.error("Error fetching products", error);
			} finally {
				setLoading(false);
			}
		};
		fetchProducts();
	}, [getAllProducts]);

	useEffect(() => {
		// Filter products to only include those with type === "APPOINTMENT"
		if (products && products.length > 0) {
			const appointmentProducts = products.filter((product) => product.type === "APPOINTMENT");
			setFilteredProducts(appointmentProducts);
		}
	}, [products]);

	// --- Form Initialization and Reset ---
	useEffect(() => {
		if (selectedAppointment) {
			// Editing existing appointment
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
			// Creating new appointment
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
				console.error("Failed to search patients:", error);
				setPatientOptions([]);
			}
		} else {
			setPatientOptions([]);
		}
	};

	// --- User Search ---
	const handleUserSearch = async (value) => {
		try {
			const searchParams = { search: value }; // Adapt to your searchUsers function
			const results = await searchUsers(searchParams);
			setUserOptions(
				results.content.map((user) => ({
					label: `${user.firstName} ${user.lastName}`,
					value: user.id,
				}))
			);
		} catch (error) {
			console.error("Error searching users:", error);
			setUserOptions([]);
		}
	};

	// --- Form Submission ---
	const handleFormSubmit = async () => {
		setLoading(true);
		try {
			const values = await form.validateFields();
			// Construct the appointment data object
			const appointmentData = {
				...values,
				appointmentDateTime: values.appointmentDateTime ? values.appointmentDateTime.toISOString() : null,
				startTime: values.startTime ? values.startTime.toISOString() : null,
				endTime: values.endTime ? values.endTime.toISOString() : null,
				patientId: values.patientId, // Should already be an ID
				userId: values.userId, // Should already be an ID
				productId: values.productId, // Should already be an ID
			};

			onSubmit(appointmentData); // Pass data to the parent component
			form.resetFields();
		} catch (error) {
			console.error("Form validation failed:", error);
			message.error("Please fill in all required fields correctly.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={selectedAppointment ? "Edit Appointment" : "Create Appointment"}
			open={isVisible}
			onCancel={onCancel}
			onOk={handleFormSubmit}
			confirmLoading={loading} // Disable OK button while loading
			forceRender // Important for dynamic content
		>
			<Form form={form} layout="vertical">
				<Form.Item
					label="Appointment Date and Time"
					name="appointmentDateTime"
					rules={[{ required: true, message: "Please select a date and time" }]}>
					<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item label="Start Time" name="startTime" rules={[{ required: true, message: "Please enter the start time" }]}>
					<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
				</Form.Item>

				<Form.Item label="End Time" name="endTime" rules={[{ required: true, message: "Please enter the end time" }]}>
					<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
					<Select
						showSearch
						placeholder="Search for a patient"
						optionFilterProp="children"
						onSearch={handlePatientSearch}
						filterOption={false} // Disable built-in filtering
						loading={patientsLoading}>
						{patientOptions.map((option) => (
							<Option key={option.value} value={option.value}>
								{option.label}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item label="Doctor/Nurse" name="userId" rules={[{ required: true, message: "Please select a user" }]}>
					<Select
						showSearch
						placeholder="Search for a user"
						optionFilterProp="children"
						onSearch={handleUserSearch}
						filterOption={false}
						loading={usersLoading}>
						{userOptions.map((option) => (
							<Option key={option.value} value={option.value}>
								{option.label}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item label="Appointment Type" name="productId" rules={[{ required: true, message: "Please select an appointment type" }]}>
					<Select placeholder="Select an appointment type" loading={productsLoading}>
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
