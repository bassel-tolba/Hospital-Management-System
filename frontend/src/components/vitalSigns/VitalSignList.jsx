// VitalSignList.js
import React, { useState, useEffect } from "react";
import {
	Table,
	Input,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	DatePicker,
	InputNumber,
	notification,
	AutoComplete,
	Pagination,
	Select,
	Row,
	Col,
	Spin,
} from "antd";
// Import useAuthStore
import { useAuthStore } from "../../services/auth.service";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import { useVitalSignStore } from "../../services/vitalSign.service";
import VoiceToVitalSigns from "../../components/ai/VoiceToVitalSigns"; // Import the AI component

const { Title } = Typography;

const VitalSignList = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedVitalSign, setSelectedVitalSign] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [total, setTotal] = useState(0);
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const { patients, searchPatients } = usePatientStore();
	const { createVitalSign, updateVitalSign, deleteVitalSign, loading, setVitalSigns, vitalSigns } = useVitalSignStore();

	// Use the auth store hook
	const { user, hasAuthority } = useAuthStore();
	const API_BASE_URL = `http://localhost:8080/api/vital-signs`;

	// --- Permission Checks ---
	// Check if user can perform basic read/view (required for fetching data)
	// Note: Actual fetch blocking happens backend-side. This is for potential UI adjustments if needed, though not strictly used to hide elements below based on READ alone.
	const canReadVitalSigns = user && hasAuthority("READ_VITAL_SIGN");
	// Check for Create permission
	const canCreateVitalSigns = user && hasAuthority("CREATE_VITAL_SIGN");
	// Check for Update permission
	const canUpdateVitalSigns = user && hasAuthority("UPDATE_VITAL_SIGN");
	// Check for Delete permission
	const canDeleteVitalSigns = user && hasAuthority("DELETE_VITAL_SIGN");

	// Determine if the form/modal submit action is allowed based on context (Create vs Update)
	const canSubmitModal = selectedVitalSign ? canUpdateVitalSigns : canCreateVitalSigns;

	useEffect(() => {
		// Fetch data only if the user is logged in (user object exists)
		// The backend will enforce READ_VITAL_SIGN
		if (user) {
			fetchVitalSignsData();
		} else {
			setVitalSigns([]); // Clear data if user logs out
			setTotal(0);
		}
	}, [page, size, searchParams, user]); // Add user dependency

	const fetchVitalSignsData = async () => {
		console.log("fetchVitalSignsData called.  Page:", page, "Size:", size, "SearchParams:", searchParams);
		if (!searchParams?.patientId) {
			console.log("No patientId in searchParams.  Clearing vital signs.");
			setVitalSigns([]);
			setTotal(0); // Also reset total when clearing
			return;
		}
		try {
			const response = await axios.get(`${API_BASE_URL}/patient/${searchParams?.patientId}`, {
				headers: {
					// Use user?.token cautiously as user might be null briefly during logout/login transitions
					Authorization: `Bearer ${user?.token}`,
				},
				params: {
					page: page - 1,
					size,
				},
			});
			console.log("fetchVitalSignsData response:", response.data);
			// Assuming backend correctly returns empty list or 403 if user lacks READ_VITAL_SIGN
			setVitalSigns(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			console.error("Failed to fetch vital signs:", error);
			// Check if it was an authorization error (e.g., 403 Forbidden)
			if (error.response && error.response.status === 403) {
				notification.error({
					message: "Permission Denied",
					description: "You do not have permission to view vital signs for this patient.",
				});
				setVitalSigns([]); // Clear data on permission error
				setTotal(0);
			} else {
				notification.error({
					message: "Error",
					description: `Failed to fetch vital signs: ${error.message}`,
				});
			}
		}
	};

	const showModal = (vitalSign) => {
		// Prevent opening modal if user lacks the necessary permission for the action
		if (vitalSign && !canUpdateVitalSigns) {
			notification.warning({ message: "Permission Denied", description: "You do not have permission to edit vital signs." });
			return;
		}
		if (!vitalSign && !canCreateVitalSigns) {
			notification.warning({ message: "Permission Denied", description: "You do not have permission to add vital signs." });
			return;
		}

		console.log("showModal called with vitalSign:", vitalSign);
		setSelectedVitalSign(vitalSign);
		if (vitalSign) {
			form.setFieldsValue({
				// ... (rest of the fields remain the same)
				...vitalSign,
				timestamp: moment(vitalSign.timestamp),
				patientId: vitalSign.patientId,
				heartRate: vitalSign.heartRate || null,
				bloodPressureSystolic: vitalSign.bloodPressureSystolic || null,
				bloodPressureDiastolic: vitalSign.bloodPressureDiastolic || null,
				temperature: vitalSign.temperature || null,
				respiratoryRate: vitalSign.respiratoryRate || null,
				oxygenSaturation: vitalSign.oxygenSaturation || null,
				painLevel: vitalSign.painLevel || null,
				height: vitalSign.height || null,
				heightUnit: vitalSign.heightUnit || "cm", // Default value
				weight: vitalSign.weight || null,
				weightUnit: vitalSign.weightUnit || "kg", // Default value
				glucose: vitalSign.glucose || null,
				glucoseUnit: vitalSign.glucoseUnit || "mg/dL", // Default value
				posture: vitalSign.posture || null,
				capillaryRefillTime: vitalSign.capillaryRefillTime || null,
				notes: vitalSign.notes || null,
				method: vitalSign.method || null,
			});
			setSelectedPatientId(vitalSign.patientId);
		} else {
			form.resetFields();
			setSelectedPatientId(null);
			form.setFieldsValue({
				heightUnit: "cm", // Default value
				weightUnit: "kg", // Default value
				glucoseUnit: "mg/dL", // Default value
			});
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const handleCancel = () => {
		console.log("handleCancel called");
		setIsModalVisible(false);
		setSelectedVitalSign(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientId(null);
	};

	const handlePatientSearch = async (value) => {
		// Patient search requires only authentication (handled by login)
		console.log("handlePatientSearch called with value:", value);
		setPatientSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchPatients({
					searchTerm: value,
					page: 0,
					size: 10,
				});
				console.log("Patient search results:", searchResults);
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

	const handlePatientSelect = (patientId) => {
		console.log("handlePatientSelect called with patientId:", patientId);
		setSelectedPatientId(patientId);
	};

	const handleFormSubmit = async () => {
		// Double-check permission before attempting submission
		if (!canSubmitModal) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to save these changes." });
			return;
		}
		console.log("handleFormSubmit called");
		try {
			const values = await form.validateFields();
			console.log("Form values after validation:", values);

			const formattedTimestamp = values.timestamp ? values.timestamp.format("YYYY-MM-DDTHH:mm:ss") : null;

			// Function to handle the conversion of empty InputNumber values
			const convertEmptyToNull = (value) => {
				return value === undefined || value === "" ? null : value;
			};

			const vitalSignData = {
				// ... (rest of the fields remain the same)
				...values,
				timestamp: formattedTimestamp,
				patientId: selectedPatientId,
				heartRate: convertEmptyToNull(values.heartRate),
				bloodPressureSystolic: convertEmptyToNull(values.bloodPressureSystolic),
				bloodPressureDiastolic: convertEmptyToNull(values.bloodPressureDiastolic),
				temperature: convertEmptyToNull(values.temperature),
				respiratoryRate: convertEmptyToNull(values.respiratoryRate),
				oxygenSaturation: convertEmptyToNull(values.oxygenSaturation),
				painLevel: convertEmptyToNull(values.painLevel),
				height: convertEmptyToNull(values.height),
				weight: convertEmptyToNull(values.weight),
				glucose: convertEmptyToNull(values.glucose),
				//No need to convert the unit, because we convert the input to null if it's empty.
				posture: values.posture || null,
				capillaryRefillTime: convertEmptyToNull(values.capillaryRefillTime),
				notes: values.notes || null,
				method: values.method || null,
			};

			// Corrected filtering logic
			const filteredVitalSignData = Object.fromEntries(
				Object.entries(vitalSignData).filter(([_, v]) => v !== null && v !== undefined && v !== "")
			);

			console.log("Filtered Vital Sign Data:", filteredVitalSignData);

			if (selectedVitalSign) {
				console.log("Updating vital sign with ID:", selectedVitalSign.id);
				await updateVitalSign(selectedVitalSign.id, filteredVitalSignData);
			} else {
				console.log("Creating new vital sign");
				await createVitalSign(filteredVitalSignData);
			}

			fetchVitalSignsData(); // Refetch data after successful save/update
			setIsModalVisible(false);
			form.resetFields();
			setSelectedVitalSign(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedPatientId(null);
		} catch (error) {
			console.error("Failed to save vital sign:", error);
			notification.error({
				message: "Error",
				description: `Failed to save vital sign: ${error.message}`,
			});
		}
	};

	const handleDelete = async (vitalSignId) => {
		// Check permission before attempting delete
		if (!canDeleteVitalSigns) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to delete vital signs." });
			return;
		}
		console.log("handleDelete called with vitalSignId:", vitalSignId);
		// Consider adding a confirmation dialog here for better UX
		Modal.confirm({
			title: "Are you sure you want to delete this vital sign record?",
			content: "This action cannot be undone.",
			okText: "Yes, Delete",
			okType: "danger",
			cancelText: "No",
			onOk: async () => {
				try {
					await deleteVitalSign(vitalSignId);
					fetchVitalSignsData(); // Refetch data after successful delete
					notification.success({ message: "Success", description: "Vital sign record deleted successfully." });
				} catch (error) {
					console.error("Error deleting vital sign:", error);
					notification.error({
						message: "Error",
						description: `Failed to delete vital sign: ${error.message}`,
					});
				}
			},
		});
	};

	const handleSearchPatientFilter = (patientId) => {
		console.log("handleSearchPatientFilter called with patientId:", patientId);
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(1);
	};

	const handlePaginationChange = (pageNumber, pageSize) => {
		console.log("handlePaginationChange called. Page:", pageNumber, "Size:", pageSize);
		setPage(pageNumber);
		setSize(pageSize);
	};

	const handleDataExtracted = (data) => {
		// AI component interaction - ensure user has permission for the underlying action (Create or Update)
		if (!canSubmitModal) {
			notification.warning({ message: "Permission Denied", description: "Cannot populate data as saving is not permitted." });
			return;
		}
		console.log("handleDataExtracted called with data:", data);
		// Determine if this is a create or update operation
		const isCreate = !selectedVitalSign;

		const formData = { ...data };

		// Convert timestamp to moment object if it exists and is not "did not get"
		if (formData.timestamp && formData.timestamp !== "did not get") {
			formData.timestamp = moment(formData.timestamp, "YYYY-MM-DDTHH:mm:ss");
		} else if (formData.timestamp === "did not get") {
			formData.timestamp = null; // Set to null if AI couldn't get it
		}

		// Convert height, weight and glucose units, only if NOT updating
		if (isCreate) {
			formData.heightUnit = data.heightUnit === "did not get" ? "cm" : data.heightUnit;
			formData.weightUnit = data.weightUnit === "did not get" ? "kg" : data.weightUnit;
			formData.glucoseUnit = data.glucoseUnit === "did not get" ? "mg/dL" : data.glucoseUnit;
		}

		// Set "did not get" values to null for form binding (InputNumber expects number or null)
		Object.keys(formData).forEach((key) => {
			if (formData[key] === "did not get") {
				formData[key] = null;
			}
		});

		// Update form with the processed data
		console.log("Setting form fields with data:", formData);
		form.setFieldsValue(formData);
	};

	const columns = [
		// ... (columns definition remains the same, except for Actions) ...
		{
			title: "Timestamp",
			dataIndex: "timestamp",
			key: "timestamp",
			render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Heart Rate",
			dataIndex: "heartRate",
			key: "heartRate",
		},
		{
			title: "Blood Pressure (Systolic)",
			dataIndex: "bloodPressureSystolic",
			key: "bloodPressureSystolic",
		},
		{
			title: "Blood Pressure (Diastolic)",
			dataIndex: "bloodPressureDiastolic",
			key: "bloodPressureDiastolic",
		},
		{
			title: "Temperature",
			dataIndex: "temperature",
			key: "temperature",
		},
		{
			title: "Respiratory Rate",
			dataIndex: "respiratoryRate",
			key: "respiratoryRate",
		},
		{
			title: "Oxygen Saturation",
			dataIndex: "oxygenSaturation",
			key: "oxygenSaturation",
		},
		{
			title: "Pain Level",
			dataIndex: "painLevel",
			key: "painLevel",
		},
		{
			title: "Height",
			dataIndex: "height",
			key: "height",
			render: (text, record) => (text ? `${text} ${record.heightUnit}` : "N/A"),
		},
		{
			title: "Weight",
			dataIndex: "weight",
			key: "weight",
			render: (text, record) => (text ? `${text} ${record.weightUnit}` : "N/A"),
		},
		{
			title: "Glucose",
			dataIndex: "glucose",
			key: "glucose",
			render: (text, record) => (text ? `${text} ${record.glucoseUnit}` : "N/A"),
		},
		{
			title: "Posture",
			dataIndex: "posture",
			key: "posture",
		},
		{
			title: "Capillary Refill Time",
			dataIndex: "capillaryRefillTime",
			key: "capillaryRefillTime",
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
		},
		{
			title: "Method",
			dataIndex: "method",
			key: "method",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{/* Show Edit button only if user has UPDATE permission */}
					{canUpdateVitalSigns && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{/* Show Delete button only if user has DELETE permission */}
					{canDeleteVitalSigns && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	// Show loading spinner centered if loading
	if (loading && !vitalSigns.length) {
		// Show spinner only if loading and no data is present yet
		return (
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div style={{ padding: "20px" }}>
			<Title level={2}>Vital Signs Management</Title>
			<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					{/* Patient search doesn't require specific permission beyond login */}
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						placeholder="Search and select patient to view/add vitals"
						filterOption={false}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					{/* Show Add button only if user has CREATE permission */}
					{canCreateVitalSigns && (
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => showModal(null)}
							// Disable button if no patient is selected in the filter
							disabled={!searchParams?.patientId}>
							Add New Vital Sign
						</Button>
					)}
				</Col>
			</Row>

			{/* Only render table and pagination if a patient is selected */}
			{searchParams?.patientId ? (
				<>
					<div style={{ margin: "0 -16px" }}>
						{/* Table data fetching is implicitly protected by READ_VITAL_SIGN via the API call */}
						<Table
							columns={columns}
							dataSource={vitalSigns}
							loading={loading}
							rowKey="id"
							pagination={false}
							scroll={{ x: "max-content" }}
						/>
					</div>
					<Pagination
						current={page}
						pageSize={size}
						total={total}
						onChange={handlePaginationChange}
						style={{ marginTop: 16, textAlign: "right" }}
						showSizeChanger // Good practice to allow changing page size
						pageSizeOptions={["10", "20", "50"]} // Example options
					/>
				</>
			) : (
				<Typography.Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: "20px" }}>
					Please search for and select a patient to view their vital signs.
				</Typography.Text>
			)}

			<Modal
				title={selectedVitalSign ? "Edit Vital Sign" : "Add Vital Sign"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					// Disable submit button if user lacks the required permission (Create or Update)
					<Button key="submit" type="primary" onClick={handleFormSubmit} disabled={!canSubmitModal}>
						{selectedVitalSign ? "Update" : "Save"}
					</Button>,
				]}
				width={"90%"}
				bodyStyle={{ overflowX: "auto" }}>
				<Form form={form} layout="vertical" disabled={!canSubmitModal}>
					{" "}
					{/* Disable entire form if cannot submit */}
					{/* Conditionally render VoiceToVitalSigns based on permission */}
					{canSubmitModal && ( // Show AI component only if user can save/update
						<Form.Item>
							<VoiceToVitalSigns
								onDataExtracted={handleDataExtracted}
								disabled={!selectedPatientId} // Keep disabled if no patient selected in form
								isUpdate={!!selectedVitalSign} // Pass isUpdate prop
								originalData={selectedVitalSign || {}} // Pass originalData
							/>
						</Form.Item>
					)}
					{/* Patient selection should remain enabled to potentially change patient for a *new* record */}
					<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder="Search for a patient"
							filterOption={false}
							onSelect={(patientId, option) => {
								setSelectedPatientId(patientId);
								// Update the form field value explicitly if needed, though AutoComplete usually handles this
								form.setFieldsValue({ patientId: patientId });
							}}
							// Disable patient selection only when editing an existing record
							disabled={!!selectedVitalSign}
						/>
					</Form.Item>
					{/* Rest of the form items will inherit disabled state from <Form disabled={!canSubmitModal}> */}
					<Form.Item label="Timestamp" name="timestamp" rules={[{ required: true, message: "Please select the timestamp" }]}>
						<DatePicker style={{ width: "100%" }} showTime />
					</Form.Item>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Heart Rate" name="heartRate">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Blood Pressure (Systolic)" name="bloodPressureSystolic">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Blood Pressure (Diastolic)" name="bloodPressureDiastolic">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Temperature" name="temperature">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Respiratory Rate" name="respiratoryRate">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Oxygen Saturation" name="oxygenSaturation">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Pain Level" name="painLevel">
								<InputNumber style={{ width: "100%" }} min={0} max={10} /> {/* Added min/max for pain */}
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Height">
								<Input.Group compact>
									<Form.Item name="height" noStyle>
										<InputNumber style={{ width: "70%" }} />
									</Form.Item>
									<Form.Item name="heightUnit" noStyle initialValue="cm">
										<Select style={{ width: "30%" }}>
											<Select.Option value="cm">cm</Select.Option>
											<Select.Option value="in">in</Select.Option>
										</Select>
									</Form.Item>
								</Input.Group>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Weight">
								<Input.Group compact>
									<Form.Item name="weight" noStyle>
										<InputNumber style={{ width: "70%" }} />
									</Form.Item>
									<Form.Item name="weightUnit" noStyle initialValue="kg">
										<Select style={{ width: "30%" }}>
											<Select.Option value="kg">kg</Select.Option>
											<Select.Option value="lb">lb</Select.Option>
										</Select>
									</Form.Item>
								</Input.Group>
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Glucose">
								<Input.Group compact>
									<Form.Item name="glucose" noStyle>
										<InputNumber style={{ width: "70%" }} />
									</Form.Item>
									<Form.Item name="glucoseUnit" noStyle initialValue="mg/dL">
										<Select style={{ width: "30%" }}>
											<Select.Option value="mg/dL">mg/dL</Select.Option>
											<Select.Option value="mmol/L">mmol/L</Select.Option>
										</Select>
									</Form.Item>
								</Input.Group>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Posture" name="posture">
								<Input style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Capillary Refill Time (sec)" name="capillaryRefillTime">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label="Notes" name="notes">
						<Input.TextArea style={{ width: "100%" }} rows={3} />
					</Form.Item>
					<Form.Item label="Method" name="method">
						<Input style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default VitalSignList;
