import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, DatePicker, notification, AutoComplete, Row, Col } from "antd";
import { useAuthStore } from "../../services/auth.service";
import axios from "axios";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import { useLabStore } from "../../services/lab.service";
import LabResultForm from "./LabResultForm";

const { Title } = Typography;

const LabResultPage = () => {
	const [labResults, setLabResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedLabResult, setSelectedLabResult] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchParams, setSearchParams] = useState({});

	// Labtest search states
	const [labTestOptions, setLabTestOptions] = useState([]);
	const [labTestSearchTerm, setLabTestSearchTerm] = useState("");
	const [selectedLabTestId, setSelectedLabTestId] = useState(null);

	// Patient Search States
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const { patients, searchPatients } = usePatientStore();
	const { labTests, fetchLabTests } = useLabStore();

	const { user, hasAuthority } = useAuthStore(); // Get user and hasAuthority
	const API_BASE_URL = `/api/lab-results`;

	// Permission Checks
	const canCreateLabResult = hasAuthority("CREATE_LAB_RESULT");
	const canReadLabResult = hasAuthority("READ_LAB_RESULT");
	const canDeleteLabResult = hasAuthority("DELETE_LAB_RESULT");

	useEffect(() => {
		fetchLabResults();
	}, [page, size, searchParams]);

	const fetchLabResults = async () => {
		if (!canReadLabResult) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view lab results.",
			});
			setLabResults([]); // Clear any previous results
			setTotal(0);
			return;
		}
		if (!searchParams?.patientId) {
			setLabResults([]);
			return;
		}
		setLoading(true);
		try {
			const response = await axios.get(`${API_BASE_URL}/patient/${searchParams?.patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
				params: {
					page,
					size,
				},
			});
			// No need to check permission *again* here. The API call is already protected.
			setLabResults(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			handleError(error, "Failed to fetch lab results");
		} finally {
			setLoading(false);
		}
	};

	const showModal = async (labResult) => {
		if (!canCreateLabResult) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create lab results.",
			});
			return;
		}
		setSelectedLabResult(labResult);
		setPatientSearchTerm("");
		setPatientOptions([]);
		setLabTestSearchTerm("");
		setLabTestOptions([]);
		if (labResult) {
			try {
				// Fetch the patient and lab test information
				const patientId = labResult.patientId;
				const labTestId = labResult.labTestId;

				const searchResults = await searchPatients({ searchTerm: null, page: 0, size: 10 });
				setPatientOptions(
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName}`,
						value: patient.id,
					})) || []
				);

				const labTest = await fetchLabTests();

				setLabTestOptions(
					labTest?.map((labTest) => ({
						label: `${labTest.testName} - ${labTest.testCode}`,
						value: labTest.id,
					})) || []
				);

				form.setFieldsValue({
					...labResult,
					resultDateTime: moment(labResult.resultDateTime),
					patientId: patientId,
					labTestId: labTestId,
					notes: labResult.notes,
				});
				setSelectedPatientId(patientId);
				setSelectedLabTestId(labTestId);
			} catch (error) {
				handleError(error, "Failed to fetch additional data");
			}
		} else {
			form.resetFields();
			setSelectedPatientId(null);
			setSelectedLabTestId(null);
		}
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedLabResult(null);
		form.resetFields();
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientId(null);
		setLabTestSearchTerm("");
		setLabTestOptions([]);
		setSelectedLabTestId(null);
	};

	const handleLabTestSearch = async (value) => {
		setLabTestSearchTerm(value);
		if (value) {
			try {
				const response = await fetchLabTests(value);
				setLabTestOptions(
					response?.map((labTest) => ({
						label: `${labTest.testName} - ${labTest.testCode}`,
						value: labTest.id,
					})) || []
				);
			} catch (error) {
				handleError(error, "Failed to search lab tests");
				setLabTestOptions([]);
			}
		} else if (selectedLabResult?.labTestId) {
			try {
				const response = await fetchLabTests();
				setLabTestOptions(
					response?.map((labTest) => ({
						label: `${labTest.testName} - ${labTest.testCode}`,
						value: labTest.id,
					})) || []
				);
			} catch (error) {
				handleError(error, "Failed to search lab tests");
				setLabTestOptions([]);
			}
		} else {
			setLabTestOptions([]);
		}
	};

	const handleLabTestSelect = (labTestId) => {
		setSelectedLabTestId(labTestId);
		form.setFieldsValue({ ...form.getFieldsValue(), labTestId: labTestId });
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
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
		} else if (selectedLabResult?.patientId) {
			try {
				const searchResults = await searchPatients({ searchTerm: null, page: 0, size: 10 });
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
		form.setFieldsValue({ ...form.getFieldsValue(), patientId: patientId });
	};

	const handleFormSubmit = async (labResultDataFromForm) => {
		if (!canCreateLabResult) {
			// Check before submitting
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create lab results.",
			});
			return;
		}
		try {
			setLoading(true);
			const formValues = await form.validateFields();
			const labResultData = {
				...formValues,
				resultDateTime: formValues.resultDateTime.format("YYYY-MM-DDTHH:mm:ss"),
				patientId: selectedPatientId,
				labTestId: selectedLabTestId,
				performedById: user?.id,
				...labResultDataFromForm,
			};
			await axios.post(API_BASE_URL, labResultData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			notification.success({
				message: "Success",
				description: "Lab result created successfully",
			});
			fetchLabResults();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedLabResult(null);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedPatientId(null);
			setLabTestSearchTerm("");
			setLabTestOptions([]);
			setSelectedLabTestId(null);
		} catch (error) {
			handleError(error, "Failed to save lab result");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!canDeleteLabResult) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete lab results.",
			});
			return;
		}
		try {
			setLoading(true);
			await axios.delete(`${API_BASE_URL}/${id}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			notification.success({
				message: "Success",
				description: "Lab result deleted successfully",
			});
			fetchLabResults();
		} catch (error) {
			handleError(error, "Failed to delete lab result");
		} finally {
			setLoading(false);
		}
	};

	const handleSearchPatientFilter = (patientId) => {
		setSearchParams({ ...searchParams, patientId: patientId });
		setPage(0);
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const handleError = (error, message) => {
		setError(error.message);
		notification.error({
			message: "Error",
			description: `${message}: ${error.message}`,
		});
		setLoading(false);
	};

	const columns = [
		{
			title: "Date & Time",
			dataIndex: "resultDateTime",
			key: "resultDateTime",
			render: (text) => (canReadLabResult ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "***"), // Data masking
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
			render: (text) => (canReadLabResult ? text : "***"), // Data masking
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canDeleteLabResult && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Lab Results</Title>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						disabled={!canReadLabResult}
						placeholder="Search for a patient"
						filterOption={false}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12}>
					{canCreateLabResult && (
						<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId} block>
							Add New Lab Result
						</Button>
					)}
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={labResults}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page + 1,
					pageSize: size,
					total: total,
					onChange: handleTableChange,
				}}
				scroll={{ x: true }} // Enable horizontal scrolling for small screens
			/>
			<Modal
				title={"Add Lab Result"}
				open={isModalVisible}
				onCancel={handleCancel}
				width="90%" // Make modal width responsive
				style={{ maxWidth: 800 }}
				footer={null}>
				<Form form={form} layout="vertical">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
								<AutoComplete
									options={patientOptions}
									onSearch={handlePatientSearch}
									disabled={!canCreateLabResult}
									placeholder="Search for a patient"
									filterOption={false}
									onSelect={(patientId) => {
										handlePatientSelect(patientId);
									}}
								/>
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Lab Test" name="labTestId" rules={[{ required: true, message: "Please select a lab test" }]}>
								<AutoComplete
									options={labTestOptions}
									onSearch={handleLabTestSearch}
									disabled={!canCreateLabResult}
									placeholder="Search for a lab test"
									filterOption={false}
									onSelect={(labTestId) => {
										handleLabTestSelect(labTestId);
									}}
								/>
							</Form.Item>
						</Col>
					</Row>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12}>
							<Form.Item
								label="Result Date & Time"
								name="resultDateTime"
								rules={[{ required: true, message: "Please select the result date and time" }]}>
								<DatePicker style={{ width: "100%" }} showTime disabled={!canCreateLabResult} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12}>
							<Form.Item label="Notes" name="notes" rules={[{ required: true, message: "Please enter result notes" }]}>
								<Input.TextArea rows={4} disabled={!canCreateLabResult} />
							</Form.Item>
						</Col>
					</Row>
					{canCreateLabResult && (
						<LabResultForm
							form={form}
							labTestId={selectedLabTestId}
							selectedLabResult={selectedLabResult}
							onSubmit={handleFormSubmit}
							onCancel={handleCancel}
							setLoading={setLoading}
						/>
					)}
				</Form>
			</Modal>
		</div>
	);
};

export default LabResultPage;
