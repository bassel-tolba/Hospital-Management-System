import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Space, Typography, Modal, Form, DatePicker, Spin, Row, Col, notification, AutoComplete, Select, Progress } from "antd";
import { useAuthStore } from "../../services/auth.service";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined, FileTextOutlined, AudioOutlined } from "@ant-design/icons";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import CKEditorComponent from "../../CKEditorComponent";
import assessmentTemplates from "./templates";
import html2pdf from "html2pdf.js";

const { Title } = Typography;

const AssessmentList = ({ darkMode }) => {
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
	const [isEditorReady, setIsEditorReady] = useState(false); // Track if CKEditor is ready
	const isEditorReadyRef = useRef(false); // Ref for isEditorReady
	const [pendingAudioBlob, setPendingAudioBlob] = useState(null);

	const { user, hasAuthority } = useAuthStore();
	const API_BASE_URL = `http://localhost:8080/api/assessments`;
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [transcriptionProgress, setTranscriptionProgress] = useState(0);

	const ckEditorRef = useRef(null);

	const canCreateAssessment = hasAuthority("CREATE_ASSESSMENT");
	const canReadAssessment = hasAuthority("READ_ASSESSMENT");
	const canUpdateAssessment = hasAuthority("UPDATE_ASSESSMENT");
	const canDeleteAssessment = hasAuthority("DELETE_ASSESSMENT");

	useEffect(() => {
		fetchAssessments();
	}, [page, size, searchParams]);

	useEffect(() => {
		if (!isModalVisible) {
			form.resetFields();
			setEditorNotes("");
			setSelectedPatientId(null);
			setSelectedTemplate(null);
			setEditorInitialized(false);
			setPatientSearchTerm("");
			setPatientOptions([]);
			setIsEditorReady(false);
			setPendingAudioBlob(null); // Reset on modal close
			isEditorReadyRef.current = false; // Reset the ref too
		}
	}, [isModalVisible, form]);

	useEffect(() => {
		if (selectedAssessment) {
			form.setFieldsValue({
				...selectedAssessment,
				assessmentDateTime: moment(selectedAssessment.assessmentDateTime),
				patientId: selectedAssessment.patientId,
			});
			setSelectedPatientId(selectedAssessment.patientId);
			setEditorNotes(selectedAssessment.notes);
		}
	}, [selectedAssessment, form]);

	const handleTemplateSelect = (value) => {
		setSelectedTemplate(value);
		if (editorNotes === "" || !editorInitialized) {
			setEditorNotes(assessmentTemplates[value]);
			setEditorInitialized(true);
			//This setData is for immediate visual feedback
			if (ckEditorRef.current && ckEditorRef.current.editor) {
				ckEditorRef.current.editor.setData(assessmentTemplates[value]);
			}
		}
	};

	const fetchAssessments = async () => {
		if (!canReadAssessment) {
			notification.error({ message: "Permission Denied", description: "You do not have permission." });
			return;
		}
		if (!searchParams?.patientId) {
			setAssessments([]);
			return;
		}
		setLoading(true);
		try {
			const response = await axios.get(`${API_BASE_URL}/patient/${searchParams.patientId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
				params: { page, size },
			});
			setAssessments(response.data.content);
			setTotal(response.data.totalElements);
		} catch (error) {
			setError(error.message);
			notification.error({ message: "Error", description: `Failed to fetch: ${error.message}` });
		} finally {
			setLoading(false);
		}
	};

	const showModal = (assessment = null) => {
		setSelectedAssessment(assessment);
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
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
			const formattedDateTime = values.assessmentDateTime.format("YYYY-MM-DDTHH:mm:ss");
			const assessmentData = { ...values, assessmentDateTime: formattedDateTime, patientId: selectedPatientId, notes: editorNotes };

			setLoading(true);
			if (selectedAssessment) {
				if (!canUpdateAssessment) {
					notification.error({ message: "Permission Denied", description: "No update permission." });
					return;
				}
				await axios.put(`${API_BASE_URL}/${selectedAssessment.id}`, assessmentData, {
					headers: { Authorization: `Bearer ${user?.token}` },
				});
				notification.success({ message: "Success", description: "Assessment updated." });
			} else {
				if (!canCreateAssessment) {
					notification.error({ message: "Permission Denied", description: "No create permission." });
					return;
				}
				await axios.post(API_BASE_URL, assessmentData, {
					headers: { Authorization: `Bearer ${user?.token}` },
				});
				notification.success({ message: "Success", description: "Assessment created." });
			}
			fetchAssessments();
			handleCancel();
		} catch (error) {
			notification.error({ message: "Error", description: `Save failed: ${error.message}` });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!canDeleteAssessment) {
			notification.error({ message: "Permission Denied", description: "No delete permission." });
			return;
		}
		setLoading(true);
		try {
			await axios.delete(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
			notification.success({ message: "Success", description: "Assessment deleted." });
			fetchAssessments();
		} catch (error) {
			notification.error({ message: "Error", description: `Delete failed: ${error.message}` });
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
		if (!canReadAssessment) {
			notification.error({ message: "Permission Denied", description: "No export permission." });
			return;
		}
		if (!notes) {
			notification.error({ message: "Error", description: "No notes to export." });
			return;
		}
		try {
			const formattedDateTime = moment(assessmentDateTime).format("YYYY-MM-DD_HH-mm-ss");
			const options = {
				margin: 10,
				filename: `assessment_${formattedDateTime}.pdf`,
				image: { type: "jpeg", quality: 1 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
			};
			await html2pdf().from(notes).set(options).save();
			notification.success({ message: "Success", description: "PDF exported." });
		} catch (error) {
			notification.error({ message: "Error", description: `PDF generation failed: ${error.message}` });
		}
	};

	const setCKEditorRef = (editorInstance) => {
		console.log("Setting editor ref:", editorInstance);
		ckEditorRef.current = {
			editor: editorInstance, // Store it in the correct structure
		};
	};

	const onEditorReady = (editor) => {
		console.log("Editor ready called, ref status:", !!ckEditorRef.current?.editor);
		// Use the passed editor instance
		if (ckEditorRef.current?.editor) {
			setIsEditorReady(true);
			isEditorReadyRef.current = true;
			if (pendingAudioBlob) {
				transcribeAndPopulate(pendingAudioBlob);
				setPendingAudioBlob(null);
			}
		} else {
			console.warn("Editor ready called but ref not set properly");
			// Try to recover using the passed editor instance
			ckEditorRef.current = { editor };
			setIsEditorReady(true);
			isEditorReadyRef.current = true;
		}
	};
	useEffect(() => {
		console.log("Editor ref status:", {
			hasRef: !!ckEditorRef.current,
			hasEditor: !!ckEditorRef.current?.editor,
			isReady: isEditorReady,
		});
	}, [isEditorReady]);

	const startRecording = async () => {
		console.log("Start recording - editor status:", {
			hasRef: !!ckEditorRef.current,
			hasEditor: !!ckEditorRef.current?.editor,
			isReady: isEditorReady,
		});

		if (!ckEditorRef.current?.editor) {
			console.error("Editor ref not properly initialized:", ckEditorRef.current);
			notification.error({
				message: "Editor Error",
				description: "Editor initialization issue. Please refresh the page and try again.",
			});
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder.current = new MediaRecorder(stream);
			mediaRecorder.current.ondataavailable = (event) => event.data.size > 0 && recordedChunks.current.push(event.data);
			mediaRecorder.current.onstop = async () => {
				if (!ckEditorRef.current?.editor) {
					notification.error({
						message: "Editor Error",
						description: "Editor lost during recording. Please try again.",
					});
					return;
				}
				const audioBlob = new Blob(recordedChunks.current, { type: "audio/webm" });
				recordedChunks.current = [];
				if (isEditorReadyRef.current) {
					await transcribeAndPopulate(audioBlob);
				} else {
					setPendingAudioBlob(audioBlob);
				}
			};
			mediaRecorder.current.start();
			setIsRecording(true);
		} catch (error) {
			notification.error({ message: "Microphone Error", description: "Could not access microphone." });
		}
	};

	const stopRecording = () => {
		if (mediaRecorder.current?.state === "recording") {
			mediaRecorder.current.stop();
		}
	};

	const transcribeAndPopulate = async (audioBlob) => {
		if (!selectedTemplate || !editorInitialized) {
			notification.warning({ message: "Template Not Selected", description: "Please select an assessment template." });
			setIsRecording(false);
			return;
		}
		if (!selectedPatientId) {
			notification.warning({ message: "Patient Not Selected", description: "Please select a patient." });
			setIsRecording(false);
			return;
		}

		// Add this check
		if (!ckEditorRef.current?.editor) {
			notification.error({ message: "Editor Error", description: "Editor not fully initialized. Please try again." });
			setIsRecording(false);
			return;
		}

		setIsTranscribing(true);
		setTranscriptionProgress(0);
		const progressInterval = setInterval(() => {
			setTranscriptionProgress((prev) => (prev >= 90 ? 90 : prev + 10));
		}, 200);

		try {
			const formData = new FormData();
			formData.append("audio", audioBlob);
			formData.append("templateName", selectedTemplate);
			// Add safety check here too
			formData.append("currentHtml", ckEditorRef.current?.editor?.getData() || "");
			formData.append("patientId", selectedPatientId.toString());

			const response = await axios.post("http://localhost:8080/api/assessments/ai/transcribe-and-populate", formData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});

			clearInterval(progressInterval);
			setTranscriptionProgress(100);

			if (response.status === 200) {
				ckEditorRef.current.editor.setData(response.data.updatedHtml);
				setEditorNotes(response.data.updatedHtml);
				notification.success({ message: "Success", description: "Transcription successful!" });
			} else {
				throw new Error(`Transcription failed: ${response.status}`);
			}
		} catch (error) {
			console.error("Error transcribing:", error);
			notification.error({
				message: "Transcription Error",
				description: `Failed to transcribe: ${error.response?.data?.message || error.message}`,
			});
		} finally {
			setIsTranscribing(false);
			setTranscriptionProgress(0);
			setIsRecording(false);
		}
	};

	const templateOptions = Object.keys(assessmentTemplates).map((key) => ({
		label: key,
		value: key,
	}));
	//NEW LOGS
	useEffect(() => {
		console.log("selectedTemplate:", !!selectedTemplate);
		console.log("isTranscribing:", isTranscribing);
		console.log("selectedPatientId:", !!selectedPatientId);
		console.log("isEditorReady:", isEditorReady);
		console.log("canCreateAssessment:", canCreateAssessment);
		console.log("canUpdateAssessment:", canUpdateAssessment);
	}, [selectedTemplate, isTranscribing, selectedPatientId, isEditorReady, canCreateAssessment, canUpdateAssessment]);

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Patient Assessments</Title>
			<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						disabled={!canReadAssessment}
						placeholder="Search for a patient"
						filterOption={false}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					{canCreateAssessment && (
						<Button type="default" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={!searchParams?.patientId}>
							Add New Assessment
						</Button>
					)}
				</Col>
			</Row>
			<div style={{ margin: "0 -16px" }}>
				<Table
					columns={[
						{
							title: "Date & Time",
							dataIndex: "assessmentDateTime",
							key: "assessmentDateTime",
							render: (text) => (canReadAssessment ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "***"),
						},
						{
							title: "Actions",
							key: "actions",
							render: (text, record) => (
								<Space size="middle">
									{canUpdateAssessment && (
										<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record)}>
											Edit
										</Button>
									)}
									{canDeleteAssessment && (
										<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
											Delete
										</Button>
									)}
									{canReadAssessment && (
										<Button
											type="default"
											icon={<FileTextOutlined />}
											onClick={() => exportPdf(record.notes, record.assessmentDateTime)}>
											Export PDF
										</Button>
									)}
								</Space>
							),
						},
					]}
					dataSource={assessments}
					loading={loading}
					rowKey="id"
					pagination={{
						current: page + 1,
						pageSize: size,
						total,
						onChange: (page, pageSize) => {
							setPage(page - 1);
							setSize(pageSize);
						},
					}}
					scroll={{ x: "max-content" }}
				/>
			</div>
			<Modal
				title={selectedAssessment ? "Edit Assessment" : "Add Assessment"}
				open={isModalVisible}
				onCancel={handleCancel}
				maskClosable={false}
				destroyOnClose={true}
				footer={[
					<Button key="cancel" onClick={handleCancel}>
						Cancel
					</Button>,
					(selectedAssessment ? canUpdateAssessment : canCreateAssessment) && (
						<Button key="submit" type="default" onClick={handleFormSubmit}>
							{selectedAssessment ? "Update" : "Save"}
						</Button>
					),
				]}
				width="90%"
				style={{ top: 20 }}
				bodyStyle={{ overflowX: "auto" }}>
				<Form
					form={form}
					layout="vertical"
					initialValues={
						selectedAssessment ? { ...selectedAssessment, assessmentDateTime: moment(selectedAssessment.assessmentDateTime) } : {}
					}>
					<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
						<AutoComplete
							options={patientOptions}
							onSearch={handlePatientSearch}
							placeholder="Search for a patient"
							disabled={!canCreateAssessment && !canUpdateAssessment}
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
						rules={[{ required: true, message: "Please select date and time" }]}>
						<DatePicker showTime style={{ width: "100%" }} />
					</Form.Item>
					<Form.Item label="Select Template">
						<Select
							disabled={!canCreateAssessment && !canUpdateAssessment}
							placeholder="Select a template"
							options={templateOptions}
							onChange={handleTemplateSelect}
							style={{ width: "100%" }}
						/>
					</Form.Item>
					<Form.Item>
						<Button
							type={isRecording ? "danger" : "default"}
							icon={<AudioOutlined />}
							onClick={isRecording ? stopRecording : startRecording}
							disabled={
								!selectedTemplate ||
								isTranscribing ||
								!selectedPatientId ||
								!isEditorReady ||
								(!canCreateAssessment && !canUpdateAssessment)
							}>
							{isRecording ? "Recording..." : "Populate with AI"}
						</Button>
						{isTranscribing && <Progress percent={transcriptionProgress} status="active" style={{ marginTop: 8 }} />}
					</Form.Item>

					<Form.Item label="Notes" style={{ marginBottom: 0 }}>
						<div style={{ minHeight: "60vh" }}>
							<CKEditorComponent
								onBeforeLoad={setCKEditorRef}
								onReady={onEditorReady}
								onChange={(data) => setEditorNotes(data)}
								data={editorNotes}
								darkMode={darkMode}
							/>
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default AssessmentList;
