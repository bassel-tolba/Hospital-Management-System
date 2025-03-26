// AssessmentForm.js (Major Changes)
import React, { useState, useEffect, useRef } from "react";
import { Form, DatePicker, AutoComplete, Select, Button, Progress, notification, Popover } from "antd"; // Import Popover
import { AudioOutlined, QuestionCircleOutlined } from "@ant-design/icons"; // Import QuestionCircleOutlined
import moment from "moment";
import CKEditorComponent from "../../CKEditorComponent";
import assessmentTemplates from "./templates";
import axios from "axios";
import { useAuthStore } from "../../services/auth.service";
import { usePatientStore } from "../../services/patient.service";

const AssessmentForm = ({ assessment, onSave, onCancel, darkMode, canCreateAssessment, canUpdateAssessment }) => {
	const [form] = Form.useForm();
	const [editorNotes, setEditorNotes] = useState("");
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [isEditorReady, setIsEditorReady] = useState(false); // Simpler ready flag
	const [pendingAudioBlob, setPendingAudioBlob] = useState(null);
	const [isRecording, setIsRecording] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [transcriptionProgress, setTranscriptionProgress] = useState(0);
	const [patientOptions, setPatientOptions] = useState([]);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const { patients, searchPatients } = usePatientStore();
	const { user } = useAuthStore();
	const API_BASE_URL = `http://localhost:8080/api/assessments`;
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);
	const ckEditorRef = useRef(null); // { editor: CKEditorInstance | null }

	// Initialize the ref properly.  This is crucial.
	useEffect(() => {
		ckEditorRef.current = { editor: null };
	}, []);

	useEffect(() => {
		if (assessment) {
			form.setFieldsValue({
				...assessment,
				assessmentDateTime: moment(assessment.assessmentDateTime),
				patientId: assessment.patientId,
			});
			setSelectedPatientId(assessment.patientId);
			setEditorNotes(assessment.notes);
			// Don't reset selectedTemplate or isEditorReady here.  We want to preserve the state.
		} else {
			form.resetFields();
			setEditorNotes("");
			setSelectedPatientId(null);
			setSelectedTemplate(null);
			//ckEditorRef.current = { editor: null }; // Reset the editor ref on new assessment
			setPatientSearchTerm("");
			setPatientOptions([]);
			setIsEditorReady(false);
			setPendingAudioBlob(null);
		}
	}, [assessment, form]);

	const handleTemplateSelect = (value) => {
		setSelectedTemplate(value);
		// Only set data if the editor is ready *or* it's the first time.
		if (isEditorReady || editorNotes === "") {
			const templateContent = assessmentTemplates[value];
			setEditorNotes(templateContent); // Update state
			if (ckEditorRef.current && ckEditorRef.current.editor) {
				ckEditorRef.current.editor.setData(templateContent); // Set editor data
			}
		}
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
			const assessmentData = {
				...values,
				assessmentDateTime: formattedDateTime,
				patientId: selectedPatientId,
				notes: editorNotes, // Use the state, not the editor directly
			};

			if (assessment) {
				// Update
				await axios.put(`${API_BASE_URL}/${assessment.id}`, assessmentData, {
					headers: { Authorization: `Bearer ${user?.token}` },
				});
				notification.success({ message: "Success", description: "Assessment updated." });
			} else {
				// Create
				await axios.post(API_BASE_URL, assessmentData, {
					headers: { Authorization: `Bearer ${user?.token}` },
				});
				notification.success({ message: "Success", description: "Assessment created." });
			}
			onSave();
		} catch (error) {
			notification.error({ message: "Error", description: `Save failed: ${error.message}` });
		}
	};

	const setCKEditorRef = (editorInstance) => {
		// Store it in the correct structure.  This is important!
		ckEditorRef.current = { editor: editorInstance };
		if (editorInstance) {
			setIsEditorReady(true);
		}
		console.log("Editor ref set:", ckEditorRef.current);
	};

	const onEditorReady = (editor) => {
		// This should now only be called *after* setCKEditorRef.
		setIsEditorReady(true);
		console.log("Editor is ready:", editor);

		if (pendingAudioBlob) {
			transcribeAndPopulate(pendingAudioBlob);
			setPendingAudioBlob(null); // Clear the pending blob
		}
	};

	const startRecording = async () => {
		if (!ckEditorRef.current || !ckEditorRef.current.editor) {
			notification.error({ message: "Editor Error", description: "Editor not initialized." });
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder.current = new MediaRecorder(stream);
			mediaRecorder.current.ondataavailable = (event) => event.data.size > 0 && recordedChunks.current.push(event.data);
			mediaRecorder.current.onstop = () => {
				const audioBlob = new Blob(recordedChunks.current, { type: "audio/webm" });
				recordedChunks.current = [];

				if (isEditorReady) {
					transcribeAndPopulate(audioBlob);
				} else {
					// If editor is NOT ready, store the blob for later.
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
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			mediaRecorder.current.stop();
		}
		setIsRecording(false); // Ensure recording state is updated
	};

	const transcribeAndPopulate = async (audioBlob) => {
		if (!selectedTemplate) {
			notification.warning({ message: "Template Not Selected", description: "Please select an assessment template." });
			return;
		}
		if (!selectedPatientId) {
			notification.warning({ message: "Patient Not Selected", description: "Please select a patient." });
			return;
		}
		if (!ckEditorRef.current || !ckEditorRef.current.editor) {
			notification.error({ message: "Editor Error", description: "Editor not initialized." });
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
			formData.append("currentHtml", ckEditorRef.current.editor.getData()); // Get current content
			formData.append("patientId", selectedPatientId.toString());

			const response = await axios.post("http://localhost:8080/api/assessments/ai/transcribe-and-populate", formData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});

			clearInterval(progressInterval);
			setTranscriptionProgress(100);

			if (response.status === 200) {
				// Update editor content and state
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
			// Don't reset isRecording here; let stopRecording handle it.
		}
	};

	const templateOptions = Object.keys(assessmentTemplates).map((key) => ({
		label: key,
		value: key,
	}));

	// AI Recording Best Practices Popover
	const aiRecordingTips = (
		<div>
			<p>
				<b>Speak Clearly:</b> Enunciate words and phrases distinctly.
			</p>
			<p>
				<b>Consistent Terminology:</b> Use placeholder names from the template (e.g., "Patient Name is...").
			</p>
			<p>
				<b>Logical Order:</b> Follow the template structure.
			</p>
			<p>
				<b>Explicit Instructions:</b> Use "request" or "خدمه" before a placeholder for AI generation (e.g., "Request for [Diagnosis] a
				differential diagnosis.").
			</p>
			<p>
				<b>Provide Context First:</b> Mention relevant information *before* giving the AI instruction.
			</p>
			<p>
				<b>Avoid Ambiguity:</b> Be specific (e.g., "The patient's [Temperature] is 39 degrees Celsius").
			</p>
			<p>
				<b>Pause Briefly:</b> Leave a short pause between different fields.
			</p>
		</div>
	);

	return (
		<Form
			form={form}
			layout="vertical"
			initialValues={assessment ? { ...assessment, assessmentDateTime: moment(assessment.assessmentDateTime) } : {}}>
			<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
				<AutoComplete
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					disabled={!canCreateAssessment && !canUpdateAssessment}
					filterOption={false}
					onSelect={(patientId) => {
						setSelectedPatientId(patientId);
						form.setFieldsValue({ patientId: patientId }); // Directly set the value
					}}
				/>
			</Form.Item>

			<Form.Item label="Assessment Date & Time" name="assessmentDateTime" rules={[{ required: true, message: "Please select date and time" }]}>
				<DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" />
			</Form.Item>
			<Form.Item label="Select Template">
				<Select
					placeholder="Select a template"
					options={templateOptions}
					onChange={handleTemplateSelect}
					style={{ width: "100%" }}
					value={selectedTemplate}
				/>
			</Form.Item>
			<Form.Item>
				<Popover content={aiRecordingTips} title="AI Assessment Recording Best Practices" trigger="hover">
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
						<QuestionCircleOutlined style={{ marginLeft: 8 }} />
					</Button>
				</Popover>
				{isTranscribing && <Progress percent={transcriptionProgress} status="active" style={{ marginTop: 8 }} />}
			</Form.Item>

			<Form.Item label="Notes" style={{ marginBottom: 0 }}>
				<div style={{ minHeight: "60vh" }}>
					<CKEditorComponent
						onBeforeLoad={setCKEditorRef} // Use onBeforeLoad
						onReady={onEditorReady} // onReady is still useful
						onChange={(data) => setEditorNotes(data)} // Update state
						data={editorNotes} // Controlled component
						darkMode={darkMode}
					/>
				</div>
			</Form.Item>

			<div style={{ textAlign: "right", marginTop: 16 }}>
				<Button key="cancel" onClick={onCancel} style={{ marginRight: 8 }}>
					Cancel
				</Button>
				<Button key="submit" type="primary" onClick={handleFormSubmit}>
					{assessment ? "Update" : "Save"}
				</Button>
			</div>
		</Form>
	);
};

export default AssessmentForm;
