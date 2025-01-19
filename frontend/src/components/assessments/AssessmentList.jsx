import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Typography, Modal, Form, DatePicker, notification, AutoComplete, Select } from "antd";
import { useAuthStore } from "../../services/auth.service";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import CKEditorComponent from "../../CKEditorComponent";
import assessmentTemplates from "./templates";
import html2pdf from "html2pdf.js";
const { Title } = Typography;

const AssessmentList = ({ darkMode }) => {
	// Add darkMode prop here
	const [assessments, setAssessments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedAssessment, setSelectedAssessment] = useState(null);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchParams, setSearchParams] = useState({});
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const { patients, searchPatients } = usePatientStore();
	const [editorNotes, setEditorNotes] = useState("");
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [editorInitialized, setEditorInitialized] = useState(false);

	const { user } = useAuthStore();
	const API_BASE_URL = `http://localhost:8080/api/assessments`;

	useEffect(() => {
		fetchAssessments();
	}, [page, size, searchParams]);

	useEffect(() => {
		if (selectedAssessment) {
			form.setFieldsValue({
				...selectedAssessment,
				assessmentDateTime: moment(selectedAssessment.assessmentDateTime),
				patientId: selectedAssessment.patientId,
			});
			setSelectedPatientId(selectedAssessment.patientId);
			setEditorNotes(selectedAssessment.notes);
		} else {
			form.setFieldsValue({});
			setEditorNotes("");
			setSelectedPatientId(null);
		}
		setSelectedTemplate(null);
		setEditorInitialized(false);
	}, [selectedAssessment, form]);

	const handleTemplateSelect = (value) => {
		setSelectedTemplate(value);
		if (!editorInitialized && editorNotes === "") {
			setEditorNotes(assessmentTemplates[value]);
			setEditorInitialized(true);
		}
	};

	const fetchAssessments = async () => {
		if (!searchParams?.patientId) {
			setAssessments([]);
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

			setAssessments(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			setError(error.message);
			notification.error({
				message: "Error",
				description: `Failed to fetch assessments: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const showModal = (assessment) => {
		setSelectedAssessment(assessment);
		if (assessment) {
			form.setFieldsValue({
				...assessment,
				assessmentDateTime: moment(assessment.assessmentDateTime),
				patientId: assessment.patientId,
			});
			setSelectedPatientId(assessment.patientId);
			setEditorNotes(assessment.notes);
		} else {
			form.resetFields();
			setEditorNotes("");
			setSelectedPatientId(null);
		}
		setSelectedTemplate(null);
		setIsModalVisible(true);
		setPatientSearchTerm("");
		setPatientOptions([]);
		setEditorInitialized(false);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedAssessment(null);
		form.resetFields();
		setEditorNotes("");
		setPatientSearchTerm("");
		setPatientOptions([]);
		setSelectedPatientId(null);
		setSelectedTemplate(null);
		setEditorInitialized(false);
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
	};

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			const formattedAssessmentDateTime = values.assessmentDateTime ? values.assessmentDateTime.format("YYYY-MM-DDTHH:mm:ss") : null;

			const assessmentData = {
				...values,
				assessmentDateTime: formattedAssessmentDateTime,
				patientId: selectedPatientId,
				notes: editorNotes,
			};

			setLoading(true);

			if (selectedAssessment) {
				await axios.put(`${API_BASE_URL}/${selectedAssessment.id}`, assessmentData, {
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				});
				notification.success({
					message: "Success",
					description: "Assessment updated successfully",
				});
			} else {
				await axios.post(API_BASE_URL, assessmentData, {
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				});
				notification.success({
					message: "Success",
					description: "Assessment created successfully",
				});
			}

			fetchAssessments();
			setIsModalVisible(false);
			form.resetFields();
			setSelectedAssessment(null);
			setEditorNotes("");
			setPatientSearchTerm("");
			setPatientOptions([]);
			setSelectedPatientId(null);
			setSelectedTemplate(null);
			setEditorInitialized(false);
		} catch (error) {
			notification.error({
				message: "Error",
				description: `Failed to save assessment: ${error.message}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (assessmentId) => {
		setLoading(true);
		try {
			await axios.delete(`${API_BASE_URL}/${assessmentId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			notification.success({
				message: "Success",
				description: "Assessment deleted successfully",
			});
			fetchAssessments();
		} catch (error) {
			console.error("Error deleting assessment:", error);
			notification.error({
				message: "Error",
				description: `Failed to delete assessment: ${error.message}`,
			});
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

	const exportPdf = async (notes, assessmentDateTime) => {
		console.log("exportPdf called with notes:", notes, "and assessmentDateTime:", assessmentDateTime);

		if (!notes) {
			notification.error({
				message: "Error",
				description: "No notes available to export.",
			});
			return;
		}

		try {
			const formattedDateTime = moment(assessmentDateTime).format("YYYY-MM-DD_HH-mm-ss");

			const options = {
				margin: 10,
				filename: `assessment_${formattedDateTime}.pdf`,
				image: { type: "jpeg", quality: 0.98 },
				html2canvas: { scale: 2 }, // Adjust scale as needed
				jsPDF: { unit: "mm", format: "a4", orientation: "p" },
			};

			await html2pdf().from(notes).set(options).save();

			notification.success({
				message: "Success",
				description: "PDF exported successfully!",
			});
		} catch (error) {
			console.error("Error generating PDF:", error);
			notification.error({
				message: "Error",
				description: `Failed to generate PDF: ${error.message}`,
			});
		}
	};

	const columns = [
		{
			title: "Date & Time",
			dataIndex: "assessmentDateTime",
			key: "assessmentDateTime",
			render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{["ADMIN", "DOCTOR", "NURSE"].includes(user?.role) && (
						<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>
							Edit
						</Button>
					)}
					{user?.role === "ADMIN" && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
					<Button type="default" icon={<FileTextOutlined />} onClick={() => exportPdf(record.notes, record.assessmentDateTime)}>
						Export PDF
					</Button>
				</Space>
			),
		},
	];

	const templateOptions = Object.keys(assessmentTemplates).map((key) => ({
		label: key,
		value: key,
	}));

	return (
		<div style={{ padding: 20 }} className="main-container">
			<Title level={2}>Patient Assessments</Title>
			<Space style={{ marginBottom: 16 }}>
				<AutoComplete
					style={{ width: 300 }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
				{["ADMIN", "DOCTOR", "NURSE"].includes(user?.role) && (
					<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
						Add New Assessment
					</Button>
				)}
			</Space>
			<Table
				columns={columns}
				dataSource={assessments}
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
				title={selectedAssessment ? "Edit Assessment" : "Add Assessment"}
				style={{ top: 20 }}
				width="90%"
				height="90%"
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					["ADMIN", "DOCTOR", "NURSE"].includes(user?.role) && (
						<Button key="submit" type="primary" onClick={handleFormSubmit}>
							{selectedAssessment ? "Update" : "Save"}
						</Button>
					),
				]}>
				<Form form={form} layout="vertical">
					<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder="Search for a patient"
							filterOption={false}
							onSelect={(patientId) => {
								setSelectedPatientId(patientId);
								form.setFieldsValue({ ...form.getFieldsValue(), patientId: patientId });
							}}
						/>
					</Form.Item>
					<Form.Item
						label="Assessment Date & Time"
						name="assessmentDateTime"
						rules={[{ required: true, message: "Please select the assessment date and time" }]}>
						<DatePicker style={{ width: "100%" }} showTime />
					</Form.Item>
					<Form.Item label="Select Template">
						<Select
							placeholder="Select a template to populate"
							options={templateOptions}
							onChange={handleTemplateSelect}
							style={{ width: "100%" }}
						/>
					</Form.Item>
					<Form.Item label="Notes">
						<div style={{ minHeight: "60vh" }}>
							<CKEditorComponent onChange={(data) => setEditorNotes(data)} data={editorNotes} darkMode={darkMode} />
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default AssessmentList;
