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

	const user = useAuthStore((state) => state.user);
	const API_BASE_URL = `/api/vital-signs`;

	useEffect(() => {
		fetchVitalSignsData();
	}, [page, size, searchParams]);

	const fetchVitalSignsData = async () => {
		console.log("fetchVitalSignsData called.  Page:", page, "Size:", size, "SearchParams:", searchParams);
		if (!searchParams?.patientId) {
			console.log("No patientId in searchParams.  Clearing vital signs.");
			setVitalSigns([]);
			return;
		}
		try {
			const response = await axios.get(`${API_BASE_URL}/patient/${searchParams?.patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
				params: {
					page: page - 1,
					size,
				},
			});
			console.log("fetchVitalSignsData response:", response.data);
			setVitalSigns(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			console.error("Failed to fetch vital signs:", error);
			notification.error({
				message: "Error",
				description: `Failed to fetch vital signs: ${error.message}`,
			});
		}
	};

	const showModal = (vitalSign) => {
		console.log("showModal called with vitalSign:", vitalSign);
		setSelectedVitalSign(vitalSign);
		if (vitalSign) {
			form.setFieldsValue({
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

			fetchVitalSignsData();
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
		console.log("handleDelete called with vitalSignId:", vitalSignId);
		try {
			await deleteVitalSign(vitalSignId);
			fetchVitalSignsData();
		} catch (error) {
			console.error("Error deleting vital sign:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete vital sign: ${error.message}`,
			});
		}
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
		console.log("handleDataExtracted called with data:", data);
		// Determine if this is a create or update operation
		const isCreate = !selectedVitalSign;

		const formData = { ...data };

		// Convert timestamp to moment object if it exists and is not "did not get"
		if (formData.timestamp && formData.timestamp !== "did not get") {
			formData.timestamp = moment(formData.timestamp, "YYYY-MM-DDTHH:mm:ss");
		}

		// Convert height, weight and glucose units, only if NOT updating
		if (isCreate) {
			formData.heightUnit = data.heightUnit === "did not get" ? "cm" : data.heightUnit;
			formData.weightUnit = data.weightUnit === "did not get" ? "kg" : data.weightUnit;
			formData.glucoseUnit = data.glucoseUnit === "did not get" ? "mg/dL" : data.glucoseUnit;
		}

		// Set "did not get" values based on whether it's a create or update operation
		Object.keys(formData).forEach((key) => {
			if (isCreate) {
				// For CREATE, keep "did not get" as is (don't change to null)
			} else {
				// For UPDATE, set "did not get" to null
				if (formData[key] === "did not get") {
					formData[key] = null;
				}
			}
		});

		// Update form with the processed data
		console.log("Setting form fields with data:", formData);
		form.setFieldsValue(formData);
	};

	const columns = [
		// ... (your existing columns) ...
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
					<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div style={{ padding: "20px" }}>
			<Title level={2}>Vital Signs</Title>
			<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						placeholder="Search for a patient"
						filterOption={false}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					<Button type="default" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
						Add New Vital Sign
					</Button>
				</Col>
			</Row>
			<div style={{ margin: "0 -16px" }}>
				<Table columns={columns} dataSource={vitalSigns} loading={loading} rowKey="id" pagination={false} scroll={{ x: "max-content" }} />
			</div>
			<Pagination
				current={page}
				pageSize={size}
				total={total}
				onChange={handlePaginationChange}
				style={{ marginTop: 16, textAlign: "right" }}
			/>
			<Modal
				title={selectedVitalSign ? "Edit Vital Sign" : "Add Vital Sign"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="default" onClick={handleFormSubmit}>
						{selectedVitalSign ? "Update" : "Save"}
					</Button>,
				]}
				width={"90%"}
				bodyStyle={{ overflowX: "auto" }}>
				<Form form={form} layout="vertical">
					{/* Conditionally render VoiceToVitalSigns */}
					<Form.Item>
						<VoiceToVitalSigns
							onDataExtracted={handleDataExtracted}
							disabled={!selectedPatientId}
							isUpdate={!!selectedVitalSign} // Pass isUpdate prop
							originalData={selectedVitalSign || {}} // Pass originalData
						/>
					</Form.Item>
					<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder="Search for a patient"
							filterOption={false}
							onSelect={(patientId, option) => {
								setSelectedPatientId(patientId);
								form.setFieldsValue({ ...form.getFieldsValue(), patientId: patientId });
							}}
						/>
					</Form.Item>
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
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Height" style={{ width: "70%" }} name="height">
								<InputNumber />
							</Form.Item>
							<Form.Item style={{ display: "inline-block", width: "30%" }} name="heightUnit" initialValue="cm">
								<Select>
									<Select.Option value="cm">cm</Select.Option>
									<Select.Option value="in">in</Select.Option>
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Weight" style={{ width: "70%" }} name="weight">
								<InputNumber />
							</Form.Item>
							<Form.Item style={{ display: "inline-block", width: "30%" }} name="weightUnit" initialValue="kg">
								<Select>
									<Select.Option value="kg">kg</Select.Option>
									<Select.Option value="lb">lb</Select.Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Glucose" style={{ width: "70%" }} name="glucose">
								<InputNumber />
							</Form.Item>
							<Form.Item style={{ display: "inline-block", width: "30%" }} name="glucoseUnit" initialValue="mg/dL">
								<Select>
									<Select.Option value="mg/dL">mg/dL</Select.Option>
									<Select.Option value="mmol/L">mmol/L</Select.Option>
								</Select>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Posture" name="posture">
								<Input style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<Form.Item label="Capillary Refill Time" name="capillaryRefillTime">
								<InputNumber style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item label="Notes" name="notes">
						<Input.TextArea style={{ width: "100%" }} />
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
