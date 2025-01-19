import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, DatePicker, Pagination, Select } from "antd";
import { usePatientStore } from "../../services/patient.service";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { Link } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const PatientList = () => {
	const { patients, loading, total, searchPatients, deletePatient, createPatient, updatePatient, setLoading } = usePatientStore();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const [searchParams, setSearchParams] = useState({});
	const genderOptions = ["Male", "Female"]; // Options for the Gender dropdown
	const [genderFilter, setGenderFilter] = useState(null);

	useEffect(() => {
		fetchPatients();
	}, [page, size, searchParams, genderFilter]); // Refetch when filter changes

	const fetchPatients = async () => {
		setLoading(true);
		await searchPatients({ ...searchParams, page: page - 1, size, gender: genderFilter });
		setLoading(false);
	};

	const showModal = (patient) => {
		setSelectedPatient(patient);
		if (patient) {
			form.setFieldsValue({
				...patient,
				dateOfBirth: patient.dateOfBirth ? moment(patient.dateOfBirth) : null,
			});
		} else {
			form.resetFields();
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedPatient(null);
		form.resetFields();
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedDateOfBirth = values.dateOfBirth.format("YYYY-MM-DD");
			const patientData = { ...values, dateOfBirth: formattedDateOfBirth };

			if (selectedPatient) {
				await updatePatient(selectedPatient.id, patientData);
			} else {
				await createPatient(patientData);
			}
			fetchPatients();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedPatient(null);
		} catch (error) {
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (patientId) => {
		try {
			await deletePatient(patientId);
			fetchPatients();
		} catch (error) {
			console.error("Error deleting patient:", error);
		}
	};

	const handleSearch = (value) => {
		setSearchParams({ searchTerm: value });
		setPage(1);
	};

	const handleGenderFilterChange = (value) => {
		setGenderFilter(value);
		setPage(1); // Reset to first page when filtering
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (current, newSize) => {
		setPage(1);
		setSize(newSize);
	};

	const columns = [
		{
			title: "First Name",
			dataIndex: "firstName",
			key: "firstName",
			render: (text, record) => <Link to={`/patients/${record.id}`}>{text}</Link>,
		},
		{
			title: "Last Name",
			dataIndex: "lastName",
			key: "lastName",
		},
		{
			title: "Date of Birth",
			dataIndex: "dateOfBirth",
			key: "dateOfBirth",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD") : null),
		},
		{
			title: "Gender",
			dataIndex: "gender",
			key: "gender",
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
			<Title level={2}>Patient List</Title>
			<Space style={{ marginBottom: 16 }}>
				<Input.Search placeholder="Search by first name, last name, blood type..." onSearch={handleSearch} style={{ width: 300 }} />
				<Select placeholder="Filter by gender" allowClear onChange={handleGenderFilterChange} style={{ width: 150 }}>
					{genderOptions.map((gender) => (
						<Option key={gender} value={gender}>
							{gender}
						</Option>
					))}
				</Select>
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Patient
				</Button>
			</Space>

			<Table columns={columns} dataSource={patients} loading={loading} rowKey="id" pagination={false} />

			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination
					current={page}
					pageSize={size}
					total={total}
					showSizeChanger
					onChange={handlePageChange}
					onShowSizeChange={handlePageSizeChange}
				/>
			</div>
			<Modal
				title={selectedPatient ? "Edit Patient" : "Add Patient"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button key="submit" type="primary" onClick={handleFormSubmit}>
						{selectedPatient ? "Update" : "Save"}
					</Button>,
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please input first name" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please input last name" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Date of Birth" name="dateOfBirth" rules={[{ required: true, message: "Please input date of birth" }]}>
						<DatePicker style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Gender" name="gender" rules={[{ required: true, message: "Please select a gender" }]}>
						<Select placeholder="Select gender">
							{genderOptions.map((gender) => (
								<Option key={gender} value={gender}>
									{gender}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label="Address" name="address">
						<Input />
					</Form.Item>
					<Form.Item label="Phone Number" name="phoneNumber">
						<Input />
					</Form.Item>
					<Form.Item label="Email" name="email">
						<Input />
					</Form.Item>
					<Form.Item label="Profile Picture URL" name="profilePictureURL">
						<Input />
					</Form.Item>
					<Form.Item label="Medical Record Number" name="medicalRecordNumber">
						<Input />
					</Form.Item>
					<Form.Item label="Blood Type" name="bloodType">
						<Input />
					</Form.Item>
					<Form.Item label="Allergies" name="allergies">
						<Input.TextArea rows={4} />
					</Form.Item>
					<Form.Item label="Medical History" name="medicalHistory">
						<Input.TextArea rows={4} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default PatientList;
