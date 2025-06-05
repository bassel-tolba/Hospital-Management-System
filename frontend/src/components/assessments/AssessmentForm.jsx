// src/components/assessments/AssessmentForm.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Form, DatePicker, AutoComplete, Select, Button, Progress, notification, Popover, Spin, Input, Space, Row, Col } from "antd";
import { AudioOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import axios from "axios";
import { useAuthStore } from "../../services/auth.service"; // Adjust path if needed
import { usePatientStore } from "../../services/patient.service"; // Adjust path if needed
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";

const AssessmentForm = ({ assessment, initialPatient, onSave, onCancel, darkMode }) => {
	console.log("[AssessmentForm] Component Instantiating/Rendering (Structured AI Approach)...");
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const notesDisplayAreaRef = useRef(null);

	const [editorNotes, setEditorNotes] = useState("");
	const [selectedTemplateName, setSelectedTemplateName] = useState(null);
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
	const API_BASE_URL = `/api/assessments`;
	const TYPE_API_URL = `/api/assessment-types`;
	const AI_STRUCTURED_ENDPOINT = `${API_BASE_URL}/ai/extract-structured-data`;

	const mediaRecorder = useRef(null);
	const recordedChunks = useRef([]);

	const isEditing = !!assessment;
	const canCreateAssessment = hasAuthority("CREATE_ASSESSMENT");
	const canUpdateAssessment = hasAuthority("UPDATE_ASSESSMENT");
	const isReadOnly = isEditing ? !canUpdateAssessment : !canCreateAssessment;

	const debouncedPatientSearch = useCallback(
		debounce(async (value) => {
			if (!value || value.length < 2) {
				setPatientOptions([]);
				setIsSearchingPatients(false);
				return;
			}
			setIsSearchingPatients(true);
			try {
				const results = await searchPatients({ searchTerm: value, page: 0, size: 15 });
				const opts =
					results?.content?.map((p) => ({
						label: `${p.firstName} ${p.lastName} (${t("common.id")}: ${p.id})`,
						value: p.id,
						key: p.id,
						name: `${p.firstName} ${p.lastName}`,
					})) || [];
				setPatientOptions(opts);
			} catch (err) {
				notification.error({ message: t("common.error"), description: t("assessmentForm.notifications.patientSearchError") });
				setPatientOptions([]);
			} finally {
				setIsSearchingPatients(false);
			}
		}, 500),
		[searchPatients, t]
	);

	useEffect(() => {
		let mounted = true;
		const fetch = async () => {
			setLoadingTypes(true);
			try {
				const res = await axios.get(TYPE_API_URL, { headers: { Authorization: `Bearer ${user?.token}` } });
				if (mounted) setAssessmentTypes(res.data || []);
			} catch (err) {
				if (mounted) {
					notification.error({ message: t("common.error"), description: t("assessmentForm.notifications.templateLoadError") });
					setAssessmentTypes([]);
				}
			} finally {
				if (mounted) setLoadingTypes(false);
			}
		};
		if (user?.token) fetch();
		else setLoadingTypes(false);
		return () => {
			mounted = false;
		};
	}, [user?.token, t]);

	useEffect(() => {
		isCancelling.current = false;
		const fmtLabel = (name, id) => `${name} (${t("common.id")}: ${id})`;
		let initialNotesHTML = "";

		if (assessment) {
			let pL = t("assessmentForm.patientIdLabel", { id: assessment.patientId });
			if (initialPatient?.id === assessment.patientId && initialPatient?.name) pL = fmtLabel(initialPatient.name, assessment.patientId);
			else if (assessment.patientName) pL = fmtLabel(assessment.patientName, assessment.patientId);
			form.setFieldsValue({
				assessmentDateTime: assessment.assessmentDateTime ? moment(assessment.assessmentDateTime) : null,
				patientId: assessment.patientId,
			});
			setSelectedPatientId(assessment.patientId);
			setPatientSearchTerm(pL);
			initialNotesHTML = assessment.notes || "";
			if (assessmentTypes.length > 0) {
				const found = assessmentTypes.find((type) => type.name === assessment.templateName);
				setSelectedTemplateName(found ? assessment.templateName : null);
			}
		} else {
			form.resetFields();
			form.setFieldsValue({ assessmentDateTime: moment() });
			initialNotesHTML = "";
			setSelectedTemplateName(null);
			if (initialPatient?.id) {
				const pL = fmtLabel(initialPatient.name, initialPatient.id);
				setSelectedPatientId(initialPatient.id);
				setPatientSearchTerm(pL);
				form.setFieldsValue({ patientId: initialPatient.id });
			} else {
				setSelectedPatientId(null);
				setPatientSearchTerm("");
				form.setFieldsValue({ patientId: undefined });
			}
			setPatientOptions([]);
			setPendingAudioBlob(null);
		}
		setEditorNotes(initialNotesHTML);
		form.setFieldsValue({ notesContent: initialNotesHTML || null });

		if (pendingAudioBlob && selectedTemplateName && selectedPatientId && !isTranscribing) {
			transcribeAndPopulate(pendingAudioBlob);
			setPendingAudioBlob(null);
		}
	}, [assessment, form, initialPatient, t, assessmentTypes]);

	const handleTemplateSelect = async (value) => {
		setSelectedTemplateName(value);
		if (!value) {
			setEditorNotes("");
			return;
		}
		setLoadingTemplateContent(true);
		try {
			const res = await axios.get(`${TYPE_API_URL}/by-name/${value}`, { headers: { Authorization: `Bearer ${user?.token}` } });
			setEditorNotes(res.data?.templateContent || "");
			if (pendingAudioBlob && selectedPatientId && value && !isTranscribing) {
				transcribeAndPopulate(pendingAudioBlob);
				setPendingAudioBlob(null);
			}
		} catch (err) {
			notification.error({
				message: t("common.error"),
				description: t("assessmentForm.notifications.templateContentLoadError", {
					templateName: value,
					error: err.response?.data?.message || err.message,
				}),
			});
		} finally {
			setLoadingTemplateContent(false);
		}
	};

	const handlePatientSearch = (val) => {
		setPatientSearchTerm(val);
		if (!val) {
			setSelectedPatientId(null);
			setPatientOptions([]);
			form.setFieldsValue({ patientId: undefined });
		} else debouncedPatientSearch(val);
	};
	const handlePatientSelect = (id, opt) => {
		setSelectedPatientId(id);
		setPatientSearchTerm(opt.label);
		form.setFieldsValue({ patientId: id });
		setPatientOptions([]);
		if (pendingAudioBlob && selectedTemplateName && id && !isTranscribing) {
			transcribeAndPopulate(pendingAudioBlob);
			setPendingAudioBlob(null);
		}
	};

	const handleFormSubmit = async () => {
		console.log("[AssessmentForm] handleFormSubmit: Initiating submission...");
		try {
			let processedNotesHtml = editorNotes;
			if (notesDisplayAreaRef.current) {
				console.log("[AssessmentForm] Processing notes from notesDisplayAreaRef for submission.");
				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = editorNotes;
				const templateInputs = tempContainer.querySelectorAll("input, textarea, select");
				const liveRenderedInputs = notesDisplayAreaRef.current.querySelectorAll("input, textarea, select");

				templateInputs.forEach((templateInput, index) => {
					const liveInput = liveRenderedInputs[index];
					if (!liveInput) {
						console.warn(`[Submit] No live input for template input idx ${index}.`);
						return;
					}
					const inputType = templateInput.type || templateInput.tagName.toLowerCase();
					switch (inputType) {
						case "checkbox":
						case "radio":
							if (liveInput.checked) templateInput.setAttribute("checked", "checked");
							else templateInput.removeAttribute("checked");
							templateInput.checked = liveInput.checked;
							break;
						case "select-one":
						case "select-multiple":
						case "select":
							templateInput.value = liveInput.value;
							Array.from(templateInput.options).forEach((opt, i) => {
								if (liveInput.options[i]) {
									if (liveInput.options[i].selected) opt.setAttribute("selected", "selected");
									else opt.removeAttribute("selected");
									opt.selected = liveInput.options[i].selected;
								}
							});
							break;
						case "textarea":
							templateInput.textContent = liveInput.value;
							templateInput.value = liveInput.value;
							break;
						default:
							templateInput.setAttribute("value", liveInput.value);
							templateInput.value = liveInput.value;
							break;
					}
				});
				processedNotesHtml = tempContainer.innerHTML;
			}
			const isNotesEmpty = !processedNotesHtml || processedNotesHtml.replace(/<[^>]*>/g, "").trim() === "";
			form.setFieldsValue({ notesContent: isNotesEmpty ? null : processedNotesHtml });
			const values = await form.validateFields(["assessmentDateTime", "notesContent", "patientId"]);
			if (!selectedPatientId) {
				notification.error({ message: t("common.validationError"), description: t("assessmentForm.validation.selectPatient") });
				return;
			}
			const assessmentData = {
				assessmentDateTime: values.assessmentDateTime.format("YYYY-MM-DDTHH:mm:ss"),
				patientId: selectedPatientId,
				notes: processedNotesHtml,
				templateName: selectedTemplateName || null,
			};
			let url = API_BASE_URL,
				method = "post";
			if (assessment?.id) {
				url = `${API_BASE_URL}/${assessment.id}`;
				method = "put";
			}
			await axios[method](url, assessmentData, { headers: { Authorization: `Bearer ${user?.token}` } });
			notification.success({
				message: t("common.success"),
				description: assessment ? t("assessmentForm.notifications.updateSuccess") : t("assessmentForm.notifications.createSuccess"),
			});
			onSave();
		} catch (err) {
			if (err.name === "ValidateError")
				notification.warning({ message: t("common.validationError"), description: t("assessmentForm.validation.checkFields") });
			else {
				let desc = t("assessmentForm.notifications.saveErrorGeneric");
				if (err.response)
					desc = t("assessmentForm.notifications.saveErrorSpecific", {
						error: err.response.data?.message || err.response.statusText || `Status ${err.response.status}`,
					});
				else if (err.request) desc = t("assessmentForm.notifications.saveErrorNetwork");
				else desc = t("assessmentForm.notifications.saveErrorOther", { error: err.message });
				notification.error({ message: t("common.error"), description: desc });
			}
		}
	};

	const startRecording = async () => {
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
		recordedChunks.current = [];
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
			mediaRecorder.current.ondataavailable = (e) => {
				if (e.data.size > 0) recordedChunks.current.push(e.data);
			};
			mediaRecorder.current.onstop = () => {
				setIsRecording(false);
				if (isCancelling.current) {
					stream.getTracks().forEach((t) => t.stop());
					recordedChunks.current = [];
					return;
				}
				const audioBlob = new Blob(recordedChunks.current, { type: "audio/webm" });
				recordedChunks.current = [];
				stream.getTracks().forEach((t) => t.stop());
				if (audioBlob.size === 0) {
					notification.warning({
						message: t("assessmentForm.notifications.recordingIssueTitle"),
						description: t("assessmentForm.notifications.recordingIssueDesc"),
					});
					return;
				}
				if (selectedTemplateName && selectedPatientId && !isTranscribing) transcribeAndPopulate(audioBlob);
				else {
					setPendingAudioBlob(audioBlob);
					notification.info({
						message: t("assessmentForm.notifications.transcriptionPendingTitle"),
						description: t("assessmentForm.notifications.transcriptionPendingDesc"),
					});
				}
			};
			mediaRecorder.current.onerror = (e) => {
				notification.error({
					message: t("assessmentForm.notifications.recordingErrorTitle"),
					description: t("assessmentForm.notifications.recordingErrorDesc", { error: e.error?.name || t("common.unknownError") }),
				});
				setIsRecording(false);
				stream.getTracks().forEach((t) => t.stop());
			};
			mediaRecorder.current.start();
			setIsRecording(true);
		} catch (err) {
			let msg = t("assessmentForm.notifications.micErrorGeneric", { error: err.message });
			if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") msg = t("assessmentForm.notifications.micErrorNotAllowed");
			else if (err.name === "NotFoundError") msg = t("assessmentForm.notifications.micErrorNotFound");
			else if (err.name === "SecurityError") msg = t("assessmentForm.notifications.micErrorSecurity");
			notification.error({ message: t("assessmentForm.notifications.micErrorTitle"), description: msg });
			setIsRecording(false);
		}
	};
	const stopRecording = () => {
		if (mediaRecorder.current?.state === "recording") mediaRecorder.current.stop();
		else if (isRecording) setIsRecording(false);
	};

	const transcribeAndPopulate = async (audioBlobToTranscribe) => {
		console.log("[AssessmentForm] AI: Starting transcription for structured data population.");
		if (!selectedTemplateName || !selectedPatientId || isReadOnly || isTranscribing) {
			if (!selectedTemplateName) notification.error({ message: "Error", description: "Template must be selected for AI transcription." });
			if (!selectedPatientId) notification.error({ message: "Error", description: "Patient must be selected for AI transcription." });
			if (isReadOnly) notification.error({ message: "Error", description: "Cannot transcribe in read-only mode." });
			if (isTranscribing) console.warn("AI: Transcription already in progress.");
			if (!isRecording && audioBlobToTranscribe) setPendingAudioBlob(audioBlobToTranscribe);
			return;
		}
		setIsTranscribing(true);
		setTranscriptionProgress(1);
		let currentProg = 1;
		const progInterval = setInterval(() => {
			currentProg += Math.random() * 5 + 1;
			setTranscriptionProgress(Math.min(Math.floor(currentProg), 95));
		}, 400);
		try {
			const formData = new FormData();
			formData.append("audio", audioBlobToTranscribe, `audio_${selectedPatientId}_${Date.now()}.webm`);
			formData.append("templateName", selectedTemplateName);
			formData.append("patientId", selectedPatientId.toString());
			formData.append("currentHtml", editorNotes);
			if (assessment?.id) formData.append("assessmentId", assessment.id.toString());
			console.log(`[AssessmentForm] AI: Sending audio to ${AI_STRUCTURED_ENDPOINT}`);
			const response = await axios.post(AI_STRUCTURED_ENDPOINT, formData, {
				headers: { Authorization: `Bearer ${user?.token}` },
				timeout: 180000,
			});
			clearInterval(progInterval);
			setTranscriptionProgress(100);

			if (response.status === 200 && response.data && response.data.fields) {
				console.log("[AssessmentForm] AI: Received structured data:", response.data.fields);
				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = editorNotes;
				const aiFields = response.data.fields;
				let changesMadeToNotes = false;
				for (const fieldKey in aiFields) {
					if (Object.hasOwnProperty.call(aiFields, fieldKey)) {
						const fieldValue = aiFields[fieldKey];
						let targetEl = tempContainer.querySelector(`#${fieldKey}`) || tempContainer.querySelector(`[name="${fieldKey}"]`);
						if (!targetEl && tempContainer.querySelector(`input[name="${fieldKey}"][type="radio"]`)) {
							const radios = tempContainer.querySelectorAll(`input[name="${fieldKey}"][type="radio"]`);
							radios.forEach((radio) => {
								if (radio.value === String(fieldValue)) {
									radio.setAttribute("checked", "checked");
									radio.checked = true;
									changesMadeToNotes = true;
								} else {
									radio.removeAttribute("checked");
									radio.checked = false;
								}
							});
							if (changesMadeToNotes) console.log(`[AI Merge] Set radio group '${fieldKey}' to '${fieldValue}'`);
							continue;
						}
						if (targetEl) {
							changesMadeToNotes = true;
							const elType = targetEl.type || targetEl.tagName.toLowerCase();
							console.log(`[AI Merge] Updating field '${fieldKey}' (type: ${elType}) with value:`, fieldValue);
							switch (elType) {
								case "checkbox":
									const isChk = typeof fieldValue === "boolean" ? fieldValue : String(fieldValue).toLowerCase() === "true";
									if (isChk) targetEl.setAttribute("checked", "checked");
									else targetEl.removeAttribute("checked");
									targetEl.checked = isChk;
									break;
								case "select":
								case "select-one":
								case "select-multiple":
									targetEl.value = String(fieldValue);
									Array.from(targetEl.options).forEach((opt) => {
										if (opt.value === String(fieldValue)) {
											opt.setAttribute("selected", "selected");
											opt.selected = true;
										} else {
											opt.removeAttribute("selected");
											opt.selected = false;
										}
									});
									break;
								case "textarea":
									targetEl.textContent = String(fieldValue);
									targetEl.value = String(fieldValue);
									break;
								default:
									targetEl.setAttribute("value", String(fieldValue));
									targetEl.value = String(fieldValue);
									break;
							}
						} else {
							console.warn(`[AI Merge] No target element found for AI field key: '${fieldKey}'`);
						}
					}
				}
				if (changesMadeToNotes) {
					const newNotesHtml = tempContainer.innerHTML;
					setEditorNotes(newNotesHtml);
					form.setFieldsValue({ notesContent: newNotesHtml || null });
					console.log("[AssessmentForm] AI: EditorNotes updated.");
				} else {
					console.log("[AssessmentForm] AI: No changes to notes from AI data.");
				}
				if (response.data.rawTranscription) {
					notification.info({
						message: t("assessmentForm.notifications.aiRawTranscriptionTitle", "AI Raw Transcription"),
						description: response.data.rawTranscription,
						duration: 10,
					});
				}
				notification.success({ message: t("common.success"), description: t("assessmentForm.notifications.transcriptionSuccess") });
			} else {
				console.error("[AssessmentForm] AI: Backend returned unexpected response:", response.data);
				throw new Error(t("assessmentForm.notifications.transcriptionUnexpectedResponse", { status: response.status }));
			}
		} catch (err) {
			clearInterval(progInterval);
			setTranscriptionProgress(0);
			if (audioBlobToTranscribe) setPendingAudioBlob(audioBlobToTranscribe);
			let desc = t("assessmentForm.notifications.transcriptionErrorGeneric");
			if (err.response?.status === 403) desc = t("assessmentForm.notifications.transcriptionErrorForbidden");
			else if (err.code === "ECONNABORTED" || err.message?.includes("timeout"))
				desc = t("assessmentForm.notifications.transcriptionErrorTimeout");
			else if (err.response)
				desc = t("assessmentForm.notifications.transcriptionErrorSpecific", {
					error: err.response.data?.message || err.response.statusText || `Status ${err.response.status}`,
				});
			else desc = t("assessmentForm.notifications.transcriptionErrorOther", { error: err.message });
			notification.error({ message: t("assessmentForm.notifications.transcriptionErrorTitle"), description: desc });
		} finally {
			setIsTranscribing(false);
			setTimeout(() => {
				if (!isTranscribing) setTranscriptionProgress(0);
			}, 2000);
		}
	};

	const templateOptions = useMemo(
		() => assessmentTypes.map((type) => ({ label: type.displayName || type.name, value: type.name, key: type.name })),
		[assessmentTypes]
	);
	const aiRecordingTips = useMemo(
		() => (
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
		),
		[t]
	);

	useEffect(() => {
		const notes = editorNotes;
		const isEmpty = !notes || notes.replace(/<[^>]*>/g, "").trim() === "";
		const val = isEmpty ? null : notes;
		if (form.getFieldValue("notesContent") !== val) form.setFieldsValue({ notesContent: val });
	}, [editorNotes, form]);

	const formatProgress = useCallback(
		(p) =>
			!p || p < 1
				? ""
				: p < 95
				? `${p}% ${t("assessmentForm.progress.transcribing")}`
				: p < 100
				? `${p}% ${t("assessmentForm.progress.processing")}`
				: t("assessmentForm.progress.populating"),
		[t]
	);
	const cannotStartRecording = isReadOnly || !selectedTemplateName || !selectedPatientId || loadingTemplateContent || isTranscribing || isRecording;
	const aiButtonDisabled = isTranscribing || (!isRecording && cannotStartRecording);

	useEffect(
		() => () => {
			isCancelling.current = true;
			if (mediaRecorder.current?.state === "recording") mediaRecorder.current.stop();
		},
		[]
	);
	const handleCancelClick = () => {
		isCancelling.current = true;
		if (isRecording) stopRecording();
		onCancel();
	};

	const notesContainerClass = `notes-display-area ${isReadOnly ? "readonly" : ""} ${darkMode ? "dark" : ""}`;
	const notesContainerStyle = {
		border: "1px solid #d9d9d9",
		borderRadius: "2px",
		minHeight: "300px",
		padding: "10px",
		overflowY: "auto",
		backgroundColor: darkMode ? (isReadOnly ? "#1f1f1f" : "#262626") : isReadOnly ? "#f5f5f5" : "white",
		color: darkMode ? (isReadOnly ? "rgba(255,255,255,0.45)" : "#f0f0f0") : "inherit",
		lineHeight: "1.5",
		whiteSpace: "pre-wrap",
		wordWrap: "break-word",
	};

	return (
		<>
			<Form form={form} layout="vertical" onFinish={handleFormSubmit} name="assessment_form">
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
							<DatePicker showTime style={{ width: "100%" }} format="YYYY-MM-DD HH:mm:ss" disabled={isReadOnly} />
						</Form.Item>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Form.Item
							label={t("assessmentForm.template.label")}
							name="templateNameSelectedInUI" // Name for AntD form, value primarily from state
						>
							{loadingTypes ? (
								<Spin tip={t("assessmentForm.template.loadingTip")} />
							) : (
								<Select
									value={selectedTemplateName}
									options={templateOptions}
									onChange={handleTemplateSelect}
									placeholder={t("assessmentForm.template.placeholder")}
									style={{ width: "100%" }}
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
										loading={isTranscribing && transcriptionProgress < 1}
										disabled={aiButtonDisabled}
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
								{!isTranscribing && <div style={{ height: "24px", flexGrow: 1, minWidth: "150px" }}></div>} {/* Placeholder */}
							</Space>
						</Form.Item>
					</Col>
				</Row>

				<Form.Item
					label={t("assessmentForm.notes.label")}
					name="notesContent" // For validation
					required
					rules={[{ required: true, message: t("assessmentForm.notes.validation") }]}
					validateStatus={
						form.isFieldTouched("notesContent") && (!editorNotes || editorNotes.replace(/<[^>]*>/g, "").trim() === "") ? "error" : ""
					}>
					<Spin spinning={loadingTemplateContent} tip={t("assessmentForm.notes.loadingTip")}>
						<div
							ref={notesDisplayAreaRef}
							className={notesContainerClass}
							style={notesContainerStyle}
							dangerouslySetInnerHTML={{ __html: editorNotes }}
						/>
					</Spin>
				</Form.Item>
				<Form.Item name="notesContent" hidden>
					<Input />
				</Form.Item>

				<div style={{ textAlign: "right", marginTop: 16, borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
					<Space wrap>
						<Button onClick={handleCancelClick} disabled={isTranscribing}>
							{t("common.cancel")}
						</Button>
						<Button
							type="primary"
							htmlType="submit"
							disabled={isReadOnly || isRecording || isTranscribing || loadingTemplateContent || loadingTypes}>
							{assessment ? t("assessmentForm.updateButton") : t("assessmentForm.saveButton")}
						</Button>
					</Space>
				</div>
			</Form>
		</>
	);
};

export default AssessmentForm;
