import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, DatePicker, notification, AutoComplete } from "antd";
import { useAuthStore } from "../../services/auth.service";
import axios from "axios";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
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

	//Labtest search states
	const [labTestOptions, setLabTestOptions] = useState([]);
	const [labTestSearchTerm, setLabTestSearchTerm] = useState("");
	const [selectedLabTestId, setSelectedLabTestId] = useState(null);

	//Patient Search States
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const { patients, searchPatients } = usePatientStore();
	const { labTests, fetchLabTests } = useLabStore();

	const user = useAuthStore((state) => state.user);
	const API_BASE_URL = `http://localhost:8080/api/lab-results`;

	useEffect(() => {
		fetchLabResults();
	}, [page, size, searchParams]);

	const fetchLabResults = async () => {
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
			setLabResults(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			handleError(error, "Failed to fetch lab results");
		} finally {
			setLoading(false);
		}
	};

	const showModal = (labResult) => {
		setSelectedLabResult(labResult);
		if (labResult) {
			form.setFieldsValue({
				...labResult,
				resultDateTime: moment(labResult.resultDateTime),
				patientId: labResult.patientId,
				labTestId: labResult.labTestId,
				notes: labResult.notes,
			});
			setSelectedPatientId(labResult.patientId);
			setSelectedLabTestId(labResult.labTestId);
		} else {
			form.resetFields();
			setSelectedPatientId(null);
			setSelectedLabTestId(null);
		}
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
		setLabTestSearchTerm("");
		setLabTestOptions([]);
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
				console.log(response);
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
		form.setFieldsValue({ ...form.getFieldsValue(), labTestId: labTestId }); //update the form when the autocomplete is selected
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
		} else {
			setPatientOptions([]);
		}
	};

	const handlePatientSelect = (patientId) => {
		setSelectedPatientId(patientId);
		form.setFieldsValue({ ...form.getFieldsValue(), patientId: patientId }); //update the form when the autocomplete is selected
	};

	const handleFormSubmit = async (labResultDataFromForm) => {
		try {
			setLoading(true);
			const formValues = await form.validateFields();
			const labResultData = {
				...formValues,
				resultDateTime: formValues.resultDateTime.format("YYYY-MM-DDTHH:mm:ss"),
				patientId: selectedPatientId,
				labTestId: selectedLabTestId,
				performedById: user?.id, // Include the user ID here
				...labResultDataFromForm,
			};

			console.log("Lab result data being sent:", labResultData); // Added console log to check that the IDs are being correctly sent.

			if (selectedLabResult) {
				await axios.put(`${API_BASE_URL}/${selectedLabResult.id}`, labResultData, {
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				});
				notification.success({
					message: "Success",
					description: "Lab Result updated successfully",
				});
			} else {
				await axios.post(API_BASE_URL, labResultData, {
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				});
				notification.success({
					message: "Success",
					description: "Lab result created successfully",
				});
			}

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
			render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
						Edit
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Lab Results</Title>
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
					Add New Lab Result
				</Button>
			</Space>
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
			/>
			<Modal
				title={selectedLabResult ? "Edit Lab Result" : "Add Lab Result"}
				open={isModalVisible}
				onCancel={handleCancel}
				width={800}
				footer={null}>
				<Form form={form} layout="vertical">
					<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder="Search for a patient"
							filterOption={false}
							onSelect={(patientId, option) => {
								handlePatientSelect(patientId);
							}}
						/>
					</Form.Item>
					<Form.Item label="Lab Test" name="labTestId" rules={[{ required: true, message: "Please select a lab test" }]}>
						<AutoComplete
							options={labTestOptions}
							onSearch={handleLabTestSearch}
							placeholder="Search for a lab test"
							filterOption={false}
							onSelect={(labTestId, option) => {
								handleLabTestSelect(labTestId);
							}}
						/>
					</Form.Item>
					<Form.Item
						label="Result Date & Time"
						name="resultDateTime"
						rules={[{ required: true, message: "Please select the result date and time" }]}>
						<DatePicker style={{ width: "100%" }} showTime />
					</Form.Item>
					<Form.Item label="Notes" name="notes" rules={[{ required: true, message: "Please enter result notes" }]}>
						<Input.TextArea rows={4} />
					</Form.Item>
					<LabResultForm
						form={form}
						labTestId={selectedLabTestId}
						selectedLabResult={selectedLabResult}
						onSubmit={handleFormSubmit}
						onCancel={handleCancel}
						setLoading={setLoading}
					/>
				</Form>
			</Modal>
		</div>
	);
};

export default LabResultPage;
