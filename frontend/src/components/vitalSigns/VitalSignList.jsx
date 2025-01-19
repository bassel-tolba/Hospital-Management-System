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
	Pagination, // Import standalone Pagination
} from "antd";
import { useAuthStore } from "../../services/auth.service";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import { useVitalSignStore } from "../../services/vitalSign.service";

const { Title } = Typography;

const VitalSignList = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedVitalSign, setSelectedVitalSign] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1); // Start from page 1
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const [total, setTotal] = useState(0);
	//Patient Search States
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const { patients, searchPatients } = usePatientStore();
	const { createVitalSign, updateVitalSign, deleteVitalSign, loading, setVitalSigns, vitalSigns } = useVitalSignStore();

	const user = useAuthStore((state) => state.user);
	const API_BASE_URL = `http://localhost:8080/api/vital-signs`;

	useEffect(() => {
		fetchVitalSignsData();
	}, [page, size, searchParams]);

	const fetchVitalSignsData = async () => {
		if (!searchParams?.patientId) {
			setVitalSigns([]);
			return;
		}
		try {
			const response = await axios.get(`${API_BASE_URL}/patient/${searchParams?.patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
				params: {
					page: page - 1, // backend starts page from 0
					size,
				},
			});
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
		setSelectedVitalSign(vitalSign);
		if (vitalSign) {
			form.setFieldsValue({
				...vitalSign,
				timestamp: moment(vitalSign.timestamp),
				patientId: vitalSign.patientId,
			});
			setSelectedPatientId(vitalSign.patientId);
		} else {
			form.resetFields();
			setSelectedPatientId(null);
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedVitalSign(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientId(null);
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchPatients({
					searchTerm: value,
					page: 0,
					size: 10,
				});
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
		setSelectedPatientId(patientId);
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedTimestamp = values.timestamp ? values.timestamp.format("YYYY-MM-DDTHH:mm:ss") : null;
			const vitalSignData = {
				...values,
				timestamp: formattedTimestamp,
				patientId: selectedPatientId,
			};

			if (selectedVitalSign) {
				await updateVitalSign(selectedVitalSign.id, vitalSignData);
			} else {
				await createVitalSign(vitalSignData);
			}

			fetchVitalSignsData();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedVitalSign(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedPatientId(null);
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to save vital sign: ${error.message}`,
			});
		}
	};

	const handleDelete = async (vitalSignId) => {
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
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(1); // Reset to page 1 on new patient search
	};

	const handlePaginationChange = (pageNumber, pageSize) => {
		setPage(pageNumber);
		setSize(pageSize);
	};

	const columns = [
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
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Vital Signs</Title>
			<Space style={{ marginBottom: 16 }}>
				<AutoComplete
					style={{ width: 300 }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
					Add New Vital Sign
				</Button>
			</Space>
			<Table columns={columns} dataSource={vitalSigns} loading={loading} rowKey="id" />
			<Pagination
				current={page}
				pageSize={size}
				total={total}
				onChange={handlePaginationChange}
				style={{ marginTop: 16, textAlign: "right" }} // Added some styling
			/>
			<Modal
				title={selectedVitalSign ? "Edit Vital Sign" : "Add Vital Sign"}
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedVitalSign ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
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
					<Form.Item label="Heart Rate" name="heartRate" rules={[{ required: true, message: "Please enter the heart rate" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						label="Blood Pressure (Systolic)"
						name="bloodPressureSystolic"
						rules={[{ required: true, message: "Please enter the systolic blood pressure" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						label="Blood Pressure (Diastolic)"
						name="bloodPressureDiastolic"
						rules={[{ required: true, message: "Please enter the diastolic blood pressure" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Temperature" name="temperature" rules={[{ required: true, message: "Please enter the temperature" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item
						label="Respiratory Rate"
						name="respiratoryRate"
						rules={[{ required: true, message: "Please enter the respiratory rate" }]}>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default VitalSignList;
