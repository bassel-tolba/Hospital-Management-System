// src/components/assessments/AssessmentForm.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Form, DatePicker, AutoComplete, Select, Button, Progress, notification, Popover, Spin, Input, Space, Row, Col } from "antd";
import { AudioOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import CKEditorComponent from "../../CKEditorComponent"; // Adjust path if needed
import axios from "axios";
import { useAuthStore } from "../../services/auth.service"; // Adjust path if needed
import { usePatientStore } from "../../services/patient.service"; // Adjust path if needed
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";

const AssessmentForm = ({ assessment, initialPatient, onSave, onCancel, darkMode }) => {
	console.log("[AssessmentForm] Component Instantiating/Rendering...");
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const [editorNotes, setEditorNotes] = useState("");
	const [selectedTemplateName, setSelectedTemplateName] = useState(null);
	const [isEditorReady, setIsEditorReady] = useState(false);
	const [editorInstance, setEditorInstance] = useState(null);
	const [pendingAudioBlob, setPendingAudioBlob] = useState(null);
	const [isRecording, setIsRecording] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [transcriptionProgress, setTranscriptionProgress] = useState(0);
	const [patientOptions, setPatientOptions] = useState([]);
	const [isSearchingPatients, setIsSearchingPatients] = useState(false);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState(null);
	const [assessmentTypes, setAssessmentTypes] = useState([]);
	const [loadingTypes, setLoadingTypes] = useState(true);
	const [loadingTemplateContent, setLoadingTemplateContent] = useState(false);
	const isCancelling = useRef(false);

	const { searchPatients } = usePatientStore();
	const { user, hasAuthority } = useAuthStore();
	const API_BASE_URL = `http://localhost:8080/api/assessments`;
	const TYPE_API_URL = `http://localhost:8080/api/assessment-types`;
	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);

	const isEditing = !!assessment;
	const canCreateAssessment = hasAuthority("CREATE_ASSESSMENT");
	const canUpdateAssessment = hasAuthority("UPDATE_ASSESSMENT");
	const isReadOnly = isEditing ? !canUpdateAssessment : !canCreateAssessment;
	console.log(
		`[AssessmentForm] Permissions Check: isEditing=${isEditing}, canCreate=${canCreateAssessment}, canUpdate=${canUpdateAssessment}, calculated isReadOnly=${isReadOnly}`
	);

	// --- Debounced Patient Search ---
	const debouncedPatientSearch = useCallback(
		debounce(async (value) => {
			console.log(`[AssessmentForm] Debounced search triggered for term: "${value}"`);
			if (!value || value.length < 2) {
				setPatientOptions([]);
				setIsSearchingPatients(false);
				return;
			}
			setIsSearchingPatients(true);
			try {
				const searchResults = await searchPatients({ searchTerm: value, page: 0, size: 15 });
				const options =
					searchResults?.content?.map((patient) => ({
						label: `${patient.firstName} ${patient.lastName} (${t("common.id")}: ${patient.id})`,
						value: patient.id,
						key: patient.id,
						name: `${patient.firstName} ${patient.lastName}`,
					})) || [];
				setPatientOptions(options);
			} catch (error) {
				console.error("[AssessmentForm] Failed to search patients:", error);
				notification.error({ message: t("common.error"), description: t("assessmentForm.notifications.patientSearchError") });
				setPatientOptions([]);
			} finally {
				setIsSearchingPatients(false);
			}
		}, 500),
		[searchPatients, t]
	);

	// --- Fetch Assessment Types ---
	useEffect(() => {
		let isMounted = true;
		const fetchTypes = async () => {
			console.log("[AssessmentForm] useEffect[user?.token, t]: Fetching assessment types...");
			setLoadingTypes(true);
			try {
				const response = await axios.get(TYPE_API_URL, { headers: { Authorization: `Bearer ${user?.token}` } });
				if (isMounted) {
					setAssessmentTypes(response.data || []);
					console.log("[AssessmentForm] Assessment types fetched successfully:", response.data?.length);
					setLoadingTypes(false);
				} else {
					console.log("[AssessmentForm] fetchTypes: Unmounted before setting types.");
				}
			} catch (error) {
				console.error("[AssessmentForm] Failed to fetch assessment types:", error);
				if (isMounted) {
					notification.error({ message: t("common.error"), description: t("assessmentForm.notifications.templateLoadError") });
					setAssessmentTypes([]);
					setLoadingTypes(false);
				}
			}
		};
		fetchTypes();
		return () => {
			console.log("[AssessmentForm] useEffect[user?.token, t]: Cleanup. Unmounting or token changed.");
			isMounted = false;
		};
	}, [user?.token, t]);

	// --- Effect to Set Form Values ---
	useEffect(() => {
		console.log(
			"[AssessmentForm] useEffect[assessment, form, initialPatient, t]: Setting form values. Assessment ID:",
			assessment?.id,
			"InitialPatient ID:",
			initialPatient?.id
		);
		isCancelling.current = false; // Reset cancel flag

		const formatPatientLabel = (name, id) => `${name} (${t("common.id")}: ${id})`;
		let initialNotesValue = "";

		if (assessment) {
			console.log("[AssessmentForm] useEffect[assessment...]: Setting form for EXISTING assessment:", assessment.id);
			let patientLabel = t("assessmentForm.patientIdLabel", { id: assessment.patientId });
			if (initialPatient?.id === assessment.patientId && initialPatient?.name)
				patientLabel = formatPatientLabel(initialPatient.name, assessment.patientId);
			else if (assessment.patientName) patientLabel = formatPatientLabel(assessment.patientName, assessment.patientId);

			form.setFieldsValue({
				assessmentDateTime: assessment.assessmentDateTime ? moment(assessment.assessmentDateTime) : null,
				patientId: assessment.patientId,
			});
			setSelectedPatientId(assessment.patientId);
			setPatientSearchTerm(patientLabel);
			initialNotesValue = assessment.notes || "";
			setSelectedTemplateName(null);
		} else {
			console.log("[AssessmentForm] useEffect[assessment...]: Resetting form for NEW assessment.");
			form.resetFields();
			const defaultDateTime = moment();
			form.setFieldsValue({ assessmentDateTime: defaultDateTime });
			initialNotesValue = "";
			setSelectedTemplateName(null);
			if (initialPatient?.id) {
				console.log("[AssessmentForm] useEffect[assessment...]: Using initialPatient for NEW assessment:", initialPatient);
				const patientLabel = formatPatientLabel(initialPatient.name, initialPatient.id);
				setSelectedPatientId(initialPatient.id);
				setPatientSearchTerm(patientLabel);
				form.setFieldsValue({ patientId: initialPatient.id });
			} else {
				setSelectedPatientId(null);
				setPatientSearchTerm("");
				form.setFieldsValue({ patientId: undefined });
			}
			setPatientOptions([]);
			setPendingAudioBlob(null);
		}
		console.log("[AssessmentForm] useEffect[assessment...]: Setting editorNotes state.");
		setEditorNotes(initialNotesValue);

		if (editorInstance && isEditorReady) {
			console.log("[AssessmentForm] useEffect[assessment...]: Editor instance exists and ready. Attempting to set data.");
			try {
				const currentEditorData = editorInstance.getData();
				if (currentEditorData !== initialNotesValue) {
					console.log("[AssessmentForm] useEffect[assessment...]: Updating editor content.");
					editorInstance.setData(initialNotesValue);
				} else {
					console.log("[AssessmentForm] useEffect[assessment...]: Editor content already matches. No update.");
				}
			} catch (e) {
				console.warn("[AssessmentForm] useEffect[assessment...]: Error setting data on editor instance:", e);
			}
		} else {
			console.log(
				`[AssessmentForm] useEffect[assessment...]: Editor not available/ready (instance: ${!!editorInstance}, ready: ${isEditorReady}). Notes set in state.`
			);
		}
	}, [assessment, form, initialPatient, t]);

	// --- CKEditor Ready Handler ---
	const handleEditorReady = useCallback(
		(editor) => {
			console.log("[AssessmentForm] handleEditorReady: Callback received editor instance:", !!editor);
			if (editor) {
				console.log("[AssessmentForm] handleEditorReady: Setting editor instance and marking editor as READY.");
				setEditorInstance(editor);
				setIsEditorReady(true);

				const currentEditorData = editor.getData();
				if (currentEditorData !== editorNotes) {
					console.log("[AssessmentForm] handleEditorReady: Editor content differs from state. Syncing editor.");
					editor.setData(editorNotes || "");
				} else {
					console.log("[AssessmentForm] handleEditorReady: Editor content matches state. No sync.");
				}

				if (pendingAudioBlob) {
					console.warn("[AssessmentForm] handleEditorReady: Found pending audio blob. Starting transcription.");
					transcribeAndPopulate(pendingAudioBlob);
					setPendingAudioBlob(null);
				}
			} else {
				console.error("[AssessmentForm] handleEditorReady: Called with null/undefined editor instance! Resetting state.");
				setEditorInstance(null);
				setIsEditorReady(false);
			}
		},
		[editorNotes, pendingAudioBlob] // Removed transcribeAndPopulate from deps
	);

	// --- CKEditor Change Handler ---
	const handleEditorChange = useCallback(
		(event, editor) => {
			if (editor) {
				const data = editor.getData();
				setEditorNotes((prevNotes) => (data !== prevNotes ? data : prevNotes));
			} else {
				console.warn("[AssessmentForm] handleEditorChange: Called but editor instance was invalid.");
			}
		},
		[setEditorNotes]
	);

	// --- Template Selection Handler ---
	const handleTemplateSelect = async (value) => {
		console.log(`[AssessmentForm] handleTemplateSelect: Template selected: ${value}`);
		setSelectedTemplateName(value);
		if (!value) {
			console.log("[AssessmentForm] handleTemplateSelect: Template deselected. Clearing notes.");
			setEditorNotes("");
			if (editorInstance && isEditorReady) editorInstance?.setData("");
			return;
		}
		console.log(`[AssessmentForm] handleTemplateSelect: Fetching content for template name: ${value}`);
		setLoadingTemplateContent(true);
		try {
			const response = await axios.get(`${TYPE_API_URL}/by-name/${value}`, { headers: { Authorization: `Bearer ${user?.token}` } });
			const templateContent = response.data?.templateContent || "";
			console.log("[AssessmentForm] handleTemplateSelect: Template content fetched. Length:", templateContent.length);
			setEditorNotes(templateContent);
			if (editorInstance && isEditorReady) {
				console.log("[AssessmentForm] handleTemplateSelect: Editor ready, setting editor data.");
				editorInstance?.setData(templateContent);
			} else {
				console.log("[AssessmentForm] handleTemplateSelect: Editor not ready, content set in state.");
			}
		} catch (error) {
			console.error("[AssessmentForm] handleTemplateSelect: Failed to fetch template content:", error.response || error);
			notification.error({
				message: t("common.error"),
				description: t("assessmentForm.notifications.templateContentLoadError", {
					templateName: value,
					error: error.response?.data?.message || error.message || "",
				}),
			});
		} finally {
			console.log("[AssessmentForm] handleTemplateSelect: Finished loading template content.");
			setLoadingTemplateContent(false);
		}
	};

	// --- Patient Search/Select Handlers ---
	const handlePatientSearch = (value) => {
		console.log(`[AssessmentForm] handlePatientSearch: Input changed: "${value}"`);
		setPatientSearchTerm(value);
		if (!value) {
			setSelectedPatientId(null);
			setPatientOptions([]);
			form.setFieldsValue({ patientId: undefined });
		} else {
			debouncedPatientSearch(value);
		}
	};
	const handlePatientSelect = (patientId, option) => {
		console.log("[AssessmentForm] handlePatientSelect: Patient selected:", { patientId, label: option.label });
		setSelectedPatientId(patientId);
		setPatientSearchTerm(option.label);
		form.setFieldsValue({ patientId: patientId });
		setPatientOptions([]);
	};

	// --- Form Submission Handler ---
	const handleFormSubmit = async () => {
		console.log("[AssessmentForm] handleFormSubmit: Initiating submission...");
		try {
			const currentEditorData = editorInstance && isEditorReady ? editorInstance?.getData() : editorNotes;
			const isNotesEmpty = !currentEditorData || currentEditorData.replace(/<[^>]*>/g, "").trim() === "";
			form.setFieldsValue({ notesContent: isNotesEmpty ? null : currentEditorData });

			console.log("[AssessmentForm] handleFormSubmit: Triggering validation...");
			const values = await form.validateFields(["assessmentDateTime", "notesContent", "patientId"]);
			console.log("[AssessmentForm] handleFormSubmit: Validation successful.");

			if (!selectedPatientId) {
				// Safeguard
				console.error("[AssessmentForm] handleFormSubmit: CRITICAL - No selectedPatientId despite validation pass!");
				notification.error({ message: t("common.validationError"), description: t("assessmentForm.validation.selectPatient") });
				return;
			}

			const formattedDateTime = values.assessmentDateTime.format("YYYY-MM-DDTHH:mm:ss");
			const assessmentData = {
				assessmentDateTime: formattedDateTime,
				patientId: selectedPatientId,
				notes: currentEditorData,
			};

			let url = API_BASE_URL;
			let method = "post";
			if (assessment?.id) {
				url = `${API_BASE_URL}/${assessment.id}`;
				method = "put";
				console.log(`[AssessmentForm] handleFormSubmit: Preparing UPDATE: ${url}`);
			} else {
				console.log(`[AssessmentForm] handleFormSubmit: Preparing CREATE: ${url}`);
			}

			const response = await axios[method](url, assessmentData, { headers: { Authorization: `Bearer ${user?.token}` } });
			console.log(`[AssessmentForm] handleFormSubmit: Save successful. Status: ${response.status}`);
			const successMessage = assessment ? t("assessmentForm.notifications.updateSuccess") : t("assessmentForm.notifications.createSuccess");
			notification.success({ message: t("common.success"), description: successMessage });
			onSave();
		} catch (error) {
			if (error.name === "ValidateError") {
				console.error("[AssessmentForm] handleFormSubmit: Form validation failed (Antd):", error.errorFields);
				notification.warning({ message: t("common.validationError"), description: t("assessmentForm.validation.checkFields") });
			} else {
				console.error("[AssessmentForm] handleFormSubmit: Save API failed:", error.response || error);
				let errorDescription = t("assessmentForm.notifications.saveErrorGeneric");
				if (error.response)
					errorDescription = t("assessmentForm.notifications.saveErrorSpecific", {
						error: error.response.data?.message || error.response.statusText || `Status ${error.response.status}`,
					});
				else if (error.request) errorDescription = t("assessmentForm.notifications.saveErrorNetwork");
				else errorDescription = t("assessmentForm.notifications.saveErrorOther", { error: error.message });
				notification.error({ message: t("common.error"), description: errorDescription });
			}
		}
	};

	// --- Recording and Transcription Logic ---
	const startRecording = async () => {
		console.log("[AssessmentForm] startRecording: Attempting...");
		console.log(
			"[AssessmentForm] startRecording: Prerequisites check - isEditorReady:",
			isEditorReady,
			"Template:",
			selectedTemplateName,
			"Patient:",
			selectedPatientId,
			"ReadOnly:",
			isReadOnly
		);
		if (!isEditorReady || !editorInstance) {
			notification.error({
				message: t("assessmentForm.notifications.editorNotReadyTitle"),
				description: t("assessmentForm.notifications.editorNotReadyDesc"),
			});
			return;
		}
		if (!selectedTemplateName) {
			notification.warning({
				message: t("assessmentForm.notifications.templateRequiredTitle"),
				description: t("assessmentForm.notifications.templateRequiredDesc"),
			});
			return;
		}
		if (!selectedPatientId) {
			notification.warning({
				message: t("assessmentForm.notifications.patientRequiredTitle"),
				description: t("assessmentForm.notifications.patientRequiredDesc"),
			});
			form.validateFields(["patientId"]).catch(() => {});
			return;
		}
		if (isReadOnly) {
			notification.warning({
				message: t("assessmentForm.notifications.readOnlyTitle"),
				description: t("assessmentForm.notifications.readOnlyRecordDesc"),
			});
			return;
		}

		console.log("[AssessmentForm] startRecording: Prerequisites met. Starting...");
		recordedChunks.current = [];
		try {
			console.log("[AssessmentForm] startRecording: Requesting mic...");
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			console.log("[AssessmentForm] startRecording: Mic granted. Creating MediaRecorder.");
			mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });

			mediaRecorder.current.ondataavailable = (event) => {
				if (event.data.size > 0) recordedChunks.current.push(event.data);
			};

			mediaRecorder.current.onstop = () => {
				console.log("[AssessmentForm] onstop: MediaRecorder stopped.");
				setIsRecording(false); // Set state FIRST
				console.log("[AssessmentForm] onstop: isRecording state set to false.");

				if (isCancelling.current) {
					console.warn("[AssessmentForm] onstop: Cancelled during recording, skipping transcription.");
					stream.getTracks().forEach((track) => track.stop());
					recordedChunks.current = [];
					return;
				}

				const audioBlob = new Blob(recordedChunks.current, { type: "audio/webm" });
				console.log("[AssessmentForm] onstop: Audio Blob created, size:", audioBlob.size);
				recordedChunks.current = [];
				stream.getTracks().forEach((track) => {
					console.log(`[AssessmentForm] onstop: Stopping media track: ${track.kind}`);
					track.stop();
				});

				if (audioBlob.size === 0) {
					console.warn("[AssessmentForm] onstop: Empty blob. Not transcribing.");
					notification.warning({
						message: t("assessmentForm.notifications.recordingIssueTitle"),
						description: t("assessmentForm.notifications.recordingIssueDesc"),
					});
					return;
				}

				if (isEditorReady && editorInstance) {
					console.log("[AssessmentForm] onstop: Editor ready. Proceeding with transcription.");
					transcribeAndPopulate(audioBlob); // Pass blob directly
				} else {
					console.warn("[AssessmentForm] onstop: Editor NOT READY after stop. Storing blob.");
					setPendingAudioBlob(audioBlob);
					notification.info({
						message: t("assessmentForm.notifications.editorIssueTitle"),
						description: t("assessmentForm.notifications.editorIssueDesc"),
					});
				}
			};

			mediaRecorder.current.onerror = (event) => {
				console.error("[AssessmentForm] onerror: MediaRecorder error:", event.error);
				notification.error({
					message: t("assessmentForm.notifications.recordingErrorTitle"),
					description: t("assessmentForm.notifications.recordingErrorDesc", { error: event.error?.name || t("common.unknownError") }),
				});
				setIsRecording(false);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.current.start();
			setIsRecording(true); // Set state AFTER successful start
			console.log("[AssessmentForm] startRecording: MediaRecorder started successfully.");
		} catch (error) {
			console.error("[AssessmentForm] startRecording: Mic/recorder error:", error);
			let errorMsg = t("assessmentForm.notifications.micErrorGeneric", { error: error.message });
			if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError")
				errorMsg = t("assessmentForm.notifications.micErrorNotAllowed");
			else if (error.name === "NotFoundError") errorMsg = t("assessmentForm.notifications.micErrorNotFound");
			else if (error.name === "SecurityError") errorMsg = t("assessmentForm.notifications.micErrorSecurity");
			notification.error({ message: t("assessmentForm.notifications.micErrorTitle"), description: errorMsg });
			setIsRecording(false);
		}
	};

	const stopRecording = () => {
		console.log("[AssessmentForm] stopRecording: Button clicked.");
		if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
			console.log("[AssessmentForm] stopRecording: Calling mediaRecorder.stop().");
			mediaRecorder.current.stop();
		} else {
			console.log("[AssessmentForm] stopRecording: Recorder not active/already stopped. State:", mediaRecorder.current?.state);
			if (isRecording) {
				console.warn("[AssessmentForm] stopRecording: Forcing isRecording state false.");
				setIsRecording(false);
			}
		}
	};

	// --- Updated: transcribeAndPopulate now includes currentHtml in FormData ---
	const transcribeAndPopulate = async (audioBlob) => {
		console.log("[AssessmentForm] transcribeAndPopulate: Starting...");
		console.log(
			"[AssessmentForm] transcribeAndPopulate: Prerequisites check - Template:",
			selectedTemplateName,
			"Patient:",
			selectedPatientId,
			"EditorReady:",
			isEditorReady,
			"ReadOnly:",
			isReadOnly
		);

		if (!selectedTemplateName || !selectedPatientId || !editorInstance || !isEditorReady) {
			console.error("[AssessmentForm] transcribeAndPopulate: CRITICAL - Prerequisites failed just before API!");
			notification.error({ message: t("common.error"), description: t("assessmentForm.notifications.transcriptionPrereqError") });
			setIsTranscribing(false);
			setTranscriptionProgress(0);
			return;
		}
		if (isReadOnly) {
			console.error("[AssessmentForm] transcribeAndPopulate: Cancelled - read-only.");
			notification.error({
				message: t("assessmentForm.notifications.readOnlyTitle"),
				description: t("assessmentForm.notifications.readOnlyTranscribeDesc"),
			});
			setIsTranscribing(false);
			setTranscriptionProgress(0);
			return;
		}

		console.log("[AssessmentForm] transcribeAndPopulate: Prerequisites met. Setting isTranscribing=true.");
		setIsTranscribing(true);
		setTranscriptionProgress(1);

		let currentProgress = 1;
		const progressInterval = setInterval(() => {
			currentProgress += Math.random() * 5 + 1;
			setTranscriptionProgress(Math.min(Math.floor(currentProgress), 95));
		}, 400);

		try {
			const formData = new FormData();
			const fileName = `assessment_audio_${selectedPatientId}_${Date.now()}.webm`;

			// --- Get the current HTML content ---
			const currentEditorData = editorInstance && isEditorReady ? editorInstance.getData() : editorNotes;
			if (currentEditorData === null || currentEditorData === undefined) {
				console.error("[AssessmentForm] transcribeAndPopulate: Cannot send request, current editor data is null/undefined.");
				notification.error({ message: "Error", description: "Cannot get editor content for transcription." });
				setIsTranscribing(false);
				setTranscriptionProgress(0);
				clearInterval(progressInterval);
				return; // Exit the function
			}

			formData.append("audio", audioBlob, fileName);
			formData.append("templateName", selectedTemplateName);
			formData.append("patientId", selectedPatientId.toString());
			// --- >>> ADDED currentHtml <<< ---
			formData.append("currentHtml", currentEditorData);
			// --- >>> END ADDED currentHtml <<< ---

			if (assessment?.id) {
				formData.append("assessmentId", assessment.id.toString());
			}

			console.log(
				`[AssessmentForm] transcribeAndPopulate: Sending POST to ${API_BASE_URL}/ai/transcribe-and-populate. Filename: ${fileName}, Size: ${audioBlob.size}`
			);
			console.log("[AssessmentForm] transcribeAndPopulate: FormData keys:", Array.from(formData.keys())); // Log keys

			// --- API Call ---
			const response = await axios.post(`${API_BASE_URL}/ai/transcribe-and-populate`, formData, {
				headers: { Authorization: `Bearer ${user?.token}` },
				timeout: 180000,
			});
			// --- End API Call ---

			console.log("[AssessmentForm] transcribeAndPopulate: Response received - Status:", response.status);
			clearInterval(progressInterval);
			setTranscriptionProgress(100);

			if (response.status === 200 && response.data?.updatedHtml !== undefined) {
				const updatedHtml = response.data.updatedHtml;
				console.log("[AssessmentForm] transcribeAndPopulate: Success. Updating editor.");
				if (editorInstance && isEditorReady) {
					editorInstance?.setData(updatedHtml);
					setEditorNotes(updatedHtml);
					form.setFieldsValue({ notesContent: updatedHtml || null });
					console.log("[AssessmentForm] transcribeAndPopulate: Editor, state, form value updated.");
				} else {
					console.error("[AssessmentForm] transcribeAndPopulate: SUCCESS but editor instance invalid/not ready!");
					setEditorNotes(updatedHtml);
					form.setFieldsValue({ notesContent: updatedHtml || null });
				}
				notification.success({ message: t("common.success"), description: t("assessmentForm.notifications.transcriptionSuccess") });
			} else {
				console.error("[AssessmentForm] transcribeAndPopulate: Unexpected response format:", response.data);
				throw new Error(t("assessmentForm.notifications.transcriptionUnexpectedResponse", { status: response.status }));
			}
		} catch (error) {
			clearInterval(progressInterval);
			console.error("[AssessmentForm] transcribeAndPopulate: API call error:", error.response || error);
			setTranscriptionProgress(0);
			if (error.response?.status === 403) {
				notification.error({
					message: t("assessmentForm.notifications.transcriptionErrorTitle"),
					description: t("assessmentForm.notifications.transcriptionErrorForbidden", "Permission denied for transcription service."),
				});
			} else {
				let errorDescription = t("assessmentForm.notifications.transcriptionErrorGeneric");
				if (error.code === "ECONNABORTED" || error.message?.includes("timeout"))
					errorDescription = t("assessmentForm.notifications.transcriptionErrorTimeout");
				else if (error.response)
					errorDescription = t("assessmentForm.notifications.transcriptionErrorSpecific", {
						error: error.response.data?.message || error.response.statusText || `Status ${error.response.status}`,
					});
				else errorDescription = t("assessmentForm.notifications.transcriptionErrorOther", { error: error.message });
				notification.error({ message: t("assessmentForm.notifications.transcriptionErrorTitle"), description: errorDescription });
			}
		} finally {
			console.log("[AssessmentForm] transcribeAndPopulate: Finished. Resetting isTranscribing.");
			setIsTranscribing(false);
			setTimeout(() => {
				if (!isTranscribing) setTranscriptionProgress(0);
			}, 2000);
		}
	};

	// --- Template Options ---
	const templateOptions = useMemo(() => {
		return assessmentTypes.map((type) => ({
			label: type.displayName || type.name,
			value: type.name,
			key: type.name,
		}));
	}, [assessmentTypes]);

	// --- AI Tips ---
	const aiRecordingTips = useMemo(() => {
		return (
			<div style={{ maxWidth: "300px" }}>
				<p>
					<b>{t("assessmentForm.aiTips.speakClearly.title")}</b> {t("assessmentForm.aiTips.speakClearly.desc")}
				</p>
				<p>
					<b>{t("assessmentForm.aiTips.usePlaceholders.title")}</b> {t("assessmentForm.aiTips.usePlaceholders.desc")}
				</p>
				<p>
					<b>{t("assessmentForm.aiTips.followOrder.title")}</b> {t("assessmentForm.aiTips.followOrder.desc")}
				</p>
				<p>
					<b>{t("assessmentForm.aiTips.beSpecific.title")}</b> {t("assessmentForm.aiTips.beSpecific.desc")}
				</p>
				<p>
					<b>{t("assessmentForm.aiTips.pauseBriefly.title")}</b> {t("assessmentForm.aiTips.pauseBriefly.desc")}
				</p>
				<p>
					<b>{t("assessmentForm.aiTips.checkPermissions.title")}</b> {t("assessmentForm.aiTips.checkPermissions.desc")}
				</p>
				<p>
					<i>{t("assessmentForm.aiTips.note")}</i>
				</p>
			</div>
		);
	}, [t]);

	// --- Hidden Notes Field Sync ---
	useEffect(() => {
		const currentNotes = editorNotes;
		const isEmpty = !currentNotes || currentNotes.replace(/<[^>]*>/g, "").trim() === "";
		const formValue = isEmpty ? null : currentNotes;
		if (form.getFieldValue("notesContent") !== formValue) {
			form.setFieldsValue({ notesContent: formValue });
		}
	}, [editorNotes, form]);

	// --- Progress Formatter ---
	const formatProgress = useCallback(
		(percent) => {
			if (!percent) return "";
			if (percent < 95) return `${percent}% ${t("assessmentForm.progress.transcribing")}`;
			if (percent < 100) return `${percent}% ${t("assessmentForm.progress.processing")}`;
			return t("assessmentForm.progress.populating");
		},
		[t]
	);

	// --- AI Button Disabled Logic ---
	const cannotStartRecording =
		isReadOnly || !selectedTemplateName || !selectedPatientId || !isEditorReady || loadingTemplateContent || isTranscribing || isRecording;
	const aiButtonDisabled = isTranscribing || (!isRecording && cannotStartRecording);

	// --- Render Logic ---
	console.log("[AssessmentForm] RENDERING. Current states:", {
		isEditorReady,
		editorInstance: !!editorInstance,
		loadingTemplateContent,
		isReadOnly,
		selectedTemplateName,
		selectedPatientId,
		isTranscribing,
		isRecording,
		cannotStartRecording,
		aiButtonDisabled,
		editorNotesLength: editorNotes?.length,
	});

	// --- Unmount Cleanup ---
	useEffect(() => {
		return () => {
			console.log("[AssessmentForm] Component Unmounting. Cleaning up...");
			isCancelling.current = true;
			if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
				console.warn("[AssessmentForm] Unmounting while recording. Stopping recorder.");
				mediaRecorder.current.stop();
			}
		};
	}, []);

	// --- Wrapper for onCancel prop ---
	const handleCancelClick = () => {
		console.log("[AssessmentForm] Cancel button clicked.");
		isCancelling.current = true;
		if (isRecording) {
			console.log("[AssessmentForm] Cancel clicked while recording. Stopping recorder first.");
			stopRecording();
		}
		onCancel();
	};

	return (
		<>
			<Form form={form} layout="vertical" onFinish={handleFormSubmit} name="assessment_form">
				{/* Patient Row */}
				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Form.Item
							label={t("assessmentForm.patient.label")}
							name="patientId"
							rules={[{ required: true, message: t("assessmentForm.validation.selectPatient") }]}
							help={
								!selectedPatientId && form.isFieldTouched("patientId")
									? t("assessmentForm.validation.selectPatient")
									: selectedPatientId
									? t("assessmentForm.patient.helpSelected", { patientInfo: patientSearchTerm || `ID: ${selectedPatientId}` })
									: t("assessmentForm.patient.helpSearch")
							}
							validateStatus={!selectedPatientId && form.isFieldTouched("patientId") ? "error" : ""}>
							<AutoComplete
								value={patientSearchTerm}
								options={patientOptions}
								onSearch={handlePatientSearch}
								onSelect={handlePatientSelect}
								onChange={handlePatientSearch}
								placeholder={t("assessmentForm.patient.placeholder")}
								disabled={isReadOnly || isEditing}
								filterOption={false}
								notFoundContent={
									isSearchingPatients ? (
										<Spin size="small" />
									) : patientSearchTerm && patientOptions.length === 0 ? (
										t("assessmentForm.patient.notFound")
									) : null
								}
								allowClear={!isEditing && !isReadOnly}
								style={{ width: "100%" }}
								onClear={() => {
									handlePatientSearch("");
								}}
							/>
						</Form.Item>
					</Col>
					<Col xs={24} md={12}>
						<Form.Item
							label={t("assessmentForm.dateTime.label")}
							name="assessmentDateTime"
							rules={[{ required: true, message: t("assessmentForm.dateTime.validation") }]}>
							<DatePicker
								showTime
								style={{ width: "100%" }}
								format="YYYY-MM-DD HH:mm:ss"
								disabled={isReadOnly}
								onChange={(date) => form.setFieldsValue({ assessmentDateTime: date })}
							/>
						</Form.Item>
					</Col>
				</Row>

				{/* Template & AI Row */}
				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Form.Item label={t("assessmentForm.template.label")} name="templateName">
							{loadingTypes ? (
								<Spin tip={t("assessmentForm.template.loadingTip")} />
							) : (
								<Select
									placeholder={t("assessmentForm.template.placeholder")}
									options={templateOptions}
									onChange={handleTemplateSelect}
									style={{ width: "100%" }}
									value={selectedTemplateName}
									allowClear
									disabled={isReadOnly || loadingTemplateContent || isTranscribing || isRecording}
									loading={loadingTemplateContent}
									onClear={() => {
										handleTemplateSelect(null);
									}}
									notFoundContent={!loadingTypes && !assessmentTypes.length ? t("assessmentForm.template.notFound") : null}
								/>
							)}
						</Form.Item>
					</Col>
					<Col xs={24} md={12}>
						<Form.Item label={t("assessmentForm.aiVoice.label")}>
							<Space align="center" wrap style={{ width: "100%" }}>
								<Popover content={aiRecordingTips} title={t("assessmentForm.aiVoice.popoverTitle")} trigger="hover" placement="right">
									<Button
										type={isRecording ? "danger" : "primary"}
										icon={<AudioOutlined />}
										onClick={isRecording ? stopRecording : startRecording}
										loading={isTranscribing}
										disabled={aiButtonDisabled} // Use updated logic
										ghost={!isRecording}>
										{isRecording ? t("assessmentForm.aiVoice.stopButton") : t("assessmentForm.aiVoice.startButton")}
										<QuestionCircleOutlined style={{ marginLeft: 8, verticalAlign: "middle", fontSize: "14px", opacity: 0.7 }} />
									</Button>
								</Popover>
								{isTranscribing && (
									<div style={{ flexGrow: 1, width: "100%", minWidth: "150px", marginLeft: "15px" }}>
										<Progress
											percent={transcriptionProgress}
											status={transcriptionProgress === 100 ? "success" : "active"}
											strokeColor={transcriptionProgress === 100 ? undefined : { from: "#108ee9", to: "#87d068" }}
											style={{ margin: 0, padding: 0 }}
											size="small"
											format={formatProgress}
										/>
									</div>
								)}
								{!isTranscribing && <div style={{ height: "24px", flexGrow: 1, minWidth: "150px" }}></div>}
							</Space>
						</Form.Item>
					</Col>
				</Row>

				{/* CKEditor Notes Area */}
				<Form.Item
					label={t("assessmentForm.notes.label")}
					name="notesContent"
					required
					rules={[{ required: true, message: t("assessmentForm.notes.validation") }]}
					validateStatus={
						form.isFieldTouched("notesContent") && (!editorNotes || editorNotes.replace(/<[^>]*>/g, "").trim() === "") ? "error" : ""
					}>
					<Spin spinning={loadingTemplateContent} tip={t("assessmentForm.notes.loadingTip")}>
						<div
							className={`ckeditor-container ${isReadOnly ? "readonly" : ""} ${darkMode ? "dark" : ""}`}
							style={{
								border: "1px solid #d9d9d9",
								borderRadius: "2px",
								minHeight: "300px",
								position: "relative",
								backgroundColor: isReadOnly ? "#f5f5f5" : "transparent",
							}}>
							{!loadingTemplateContent ? (
								<CKEditorComponent
									data={editorNotes}
									onReady={handleEditorReady}
									onChange={handleEditorChange}
									darkMode={darkMode}
									readOnly={isReadOnly}
								/>
							) : (
								<div
									style={{
										padding: "20px",
										textAlign: "center",
										color: "#aaa",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										height: "300px",
									}}>
									{t("assessmentForm.notes.loadingContent")}
								</div>
							)}
						</div>
					</Spin>
					{!isEditorReady && !loadingTemplateContent && (
						<div style={{ color: "#aaa", marginTop: "5px", fontSize: "12px" }}>{t("assessmentForm.notes.initializingEditor")}</div>
					)}
				</Form.Item>

				{/* Hidden input for validation */}
				<Form.Item name="notesContent" hidden>
					<Input />
				</Form.Item>

				{/* Action Buttons */}
				<div style={{ textAlign: "right", marginTop: 16, borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
					<Space wrap>
						<Button key="cancel" onClick={handleCancelClick} disabled={isTranscribing}>
							{t("common.cancel")}
						</Button>
						<Button
							key="submit"
							type="primary"
							htmlType="submit"
							disabled={isReadOnly || isRecording || isTranscribing || loadingTemplateContent || loadingTypes}
							loading={false}>
							{assessment ? t("assessmentForm.updateButton") : t("assessmentForm.saveButton")}
						</Button>
					</Space>
				</div>
			</Form>
		</>
	);
};

export default AssessmentForm;
