import React, { useState, useEffect, useMemo, useRef } from "react";
import {
	Layout,
	Card,
	Tabs,
	Typography,
	Row,
	Col,
	Button,
	Table,
	Modal,
	Pagination,
	Avatar,
	Image,
	Divider,
	Space,
	Spin,
	notification,
	Input,
	Tag,
	Statistic,
	Tooltip,
	List,
	Grid,
	FloatButton,
	theme as antdTheme,
	Dropdown,
	Menu,
} from "antd";
import {
	CalendarOutlined,
	FileTextOutlined,
	DollarOutlined,
	UnorderedListOutlined,
	MedicineBoxOutlined,
	HeartOutlined,
	ShoppingCartOutlined,
	ProfileOutlined,
	PictureOutlined,
	ExperimentOutlined,
	PlusOutlined,
	EyeOutlined,
	DownloadOutlined,
	PhoneOutlined,
	MailOutlined,
	EnvironmentOutlined,
	UserOutlined,
	EditOutlined,
	FilterOutlined,
	DeleteOutlined,
	PushpinOutlined,
	ClockCircleOutlined,
	AudioOutlined,
	AudioMutedOutlined,
	FileDoneOutlined,
	ManOutlined,
	WomanOutlined,
	InfoCircleOutlined,
	WarningOutlined,
} from "@ant-design/icons";
import MiniCreateActivityForm from "./MiniCreateActivityForm";
import LabResultDetailsModal from "./LabResultDetailsModal";
import ImageSlider from "./ImageSlider";
import { useParams } from "react-router-dom";
import { usePatientDetailStore } from "../../services/patientDetail.service";
import { useLabStore } from "../../services/lab.service";
import moment from "moment";
import HtmlReportGenerator from "./HtmlReportGenerator";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../services/auth.service";
import WaveSurfer from "wavesurfer.js";

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// Helper function to generate valid image URL
const generateImageUrl = (url) => {
	if (!url) return null;
	const processedUrl = `${
		(url.startsWith("./") ? url.substring(1) : url).startsWith("/")
			? url.startsWith("./")
				? url.substring(1)
				: url
			: "/" + (url.startsWith("./") ? url.substring(1) : url)
	}`;
	return `http://localhost:8080${processedUrl}`;
};
// Helper function to generate valid document URL
const generateDocumentUrl = (url) => {
	if (!url) return null;
	const processedUrl = url.startsWith("./") ? url.substring(1) : url;
	return `http://localhost:8080${processedUrl.startsWith("/") ? processedUrl : "/" + processedUrl}`;
};

// ... (No changes to sub-components like PaginatedTable, DetailModal, etc.)
// -----------------------------------------------------------------------------
// Reusable Table Component
// -----------------------------------------------------------------------------
const PaginatedTable = ({ columns, data, loading, currentPage, onPageChange, totalCount }) => {
	return (
		<>
			<Table
				columns={columns}
				dataSource={data}
				loading={loading}
				pagination={false}
				rowKey="id"
				style={{
					marginBottom: "16px",
					overflowX: "auto",
				}}
				scroll={{ x: "max-content" }}
			/>
			<Pagination
				current={currentPage + 1}
				pageSize={10}
				total={totalCount}
				onChange={(page) => onPageChange(page - 1)}
				style={{ marginTop: 15, display: "flex", justifyContent: "center" }}
				showSizeChanger={false}
			/>
		</>
	);
};

// -----------------------------------------------------------------------------
// Reusable Detail Modal Component
// -----------------------------------------------------------------------------
const DetailModal = ({ title, isOpen, onClose, children }) => {
	const screens = useBreakpoint();
	return (
		<Modal
			title={title}
			open={isOpen}
			onCancel={onClose}
			footer={null}
			width={screens.xs ? "95%" : "90%"}
			style={{ maxWidth: screens.xs ? "95vw" : "800px" }}
			styles={{ body: { padding: screens.xs ? "16px" : "24px" } }}>
			<Row gutter={[16, 16]}>{children}</Row>
		</Modal>
	);
};

// -----------------------------------------------------------------------------
// Utility function for rendering Detail
// -----------------------------------------------------------------------------
const renderDetail = (label, value) => (
	<div style={{ marginBottom: 8 }}>
		<Text strong>{label}: </Text>
		<Text>{value ? value : "N/A"}</Text>
	</div>
);

// -----------------------------------------------------------------------------
// FIX: Converted renderAssessmentNotes from a helper function to a component
// to correctly use the `useToken` hook.
// -----------------------------------------------------------------------------
const AssessmentNotesDisplay = ({ notes }) => {
	const { token } = antdTheme.useToken();
	if (!notes) return null;
	return <div dangerouslySetInnerHTML={{ __html: notes }} style={{ backgroundColor: token.colorFillContent, padding: 15, borderRadius: 10 }} />;
};

// -----------------------------------------------------------------------------
// Utility function for rendering medication list
// -----------------------------------------------------------------------------
const renderMedicationList = (medications, t) => {
	return (
		<ul style={{ paddingLeft: 20, margin: 0 }}>
			{medications.map((medication, index) => (
				<li key={index}>
					<Text>
						{t("medication-name")}: {medication.medicationName}, {t("dosage")}: {medication.dosage}, {t("route")}: {medication.route},{" "}
						{t("amount")}: {medication.amount}
					</Text>
					<Text type="danger" style={{ marginLeft: 5 }}>
						{medication.expired ? t("administered") : ""}
					</Text>
				</li>
			))}
		</ul>
	);
};

// -----------------------------------------------------------------------------
// Expanded Row Details Component
// -----------------------------------------------------------------------------
const ExpandedRowDetails = ({ expandedRow, isModalOpen, handleCloseModal }) => {
	const { t } = useTranslation();
	if (!expandedRow) return null;
	const { type, ...data } = expandedRow;
	return (
		<DetailModal title={t("detailed-info", { type: t(type.toLowerCase().replace(/ /g, "-")) })} isOpen={isModalOpen} onClose={handleCloseModal}>
			{type === "Admission" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("admission-date"), data.admissionDate ? moment(data.admissionDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("discharge-date"), data.dischargeDate ? moment(data.dischargeDate).format("YYYY-MM-DD HH:mm") : t("open"))}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("bed-id"), data.bedId)}
					</Col>
				</>
			)}
			{type === "Appointment" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(
							t("appointment-date-time"),
							data.appointmentDateTime ? moment(data.appointmentDateTime).format("YYYY-MM-DD HH:mm") : "N/A",
						)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("service"), data.productName)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("provider"), `${data.userFirstName || ""} ${data.userLastName || ""}`.trim() || "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("status"), data.status)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("start-time"), data.startTime ? moment(data.startTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("end-time"), data.endTime ? moment(data.endTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
				</>
			)}
			{type === "Assessment" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(
							t("assessment-date"),
							data.assessmentDateTime ? moment(data.assessmentDateTime).format("YYYY-MM-DD HH:mm") : "N/A",
						)}
					</Col>
					<Col xs={24} sm={24}>
						{/* FIX: Replaced helper function with component */}
						<AssessmentNotesDisplay notes={data.notes} />
					</Col>
				</>
			)}
			{type === "Billing" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("billing-date"), data.billDate ? moment(data.billDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={24}>
						{/* FIX: Replaced helper function with component */}
						<AssessmentNotesDisplay notes={data.bill} />
					</Col>
				</>
			)}
			{type === "Care Plan" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("plan-date"), data.planDate ? moment(data.planDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("goal"), data.goal)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("interventions"), data.interventions)}
					</Col>
				</>
			)}
			{type === "Prescription" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(
							t("prescription-date"),
							data.prescriptionDate ? moment(data.prescriptionDate).format("YYYY-MM-DD HH:mm") : "N/A",
						)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail(t("note"), data.note)}
					</Col>
					<Col xs={24} sm={24}>
						{renderMedicationList(data.prescribedMedications, t)}
					</Col>
				</>
			)}
			{type === "Vital Sign" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("record-date"), data.timestamp ? moment(data.timestamp).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("heart-rate"), data.heartRate)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("blood-pressure-systolic"), data.bloodPressureSystolic)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("blood-pressure-diastolic"), data.bloodPressureDiastolic)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("temperature"), data.temperature)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("respiratory-rate"), data.respiratoryRate)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("oxygen-saturation"), data.oxygenSaturation)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("pain-level"), data.painLevel)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("height"), data.height ? `${data.height} ${data.heightUnit}` : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("weight"), data.weight ? `${data.weight} ${data.weightUnit}` : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("glucose"), data.glucose ? `${data.glucose} ${data.glucoseUnit}` : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("posture"), data.posture)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("capillary-refill-time"), data.capillaryRefillTime)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail(t("notes"), data.notes)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("method"), data.method)}
					</Col>
				</>
			)}
			{type === "Product Usage" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("start-time"), data.startTime ? moment(data.startTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("end-time"), data.endTime ? moment(data.endTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("product-id"), data.productId)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("product-name"), data.productName)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("quantity"), data.quantity)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("price"), data.price)}
					</Col>
				</>
			)}
			{type === "Medication Administration" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(
							t("administration-time"),
							data.administrationTime ? moment(data.administrationTime).format("YYYY-MM-DD HH:mm") : "N/A",
						)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("amount"), data.amount)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("calculated-price"), data.calculatedPrice)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("prescribed-medication-id"), data.prescribedMedicationId)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("prescribed-medication-name"), data.medicationName)}
					</Col>
				</>
			)}
			{type === "Image Report" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("report-date"), data.reportDateTime ? moment(data.reportDateTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("image-type"), data.imageType)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail(t("description"), data.description)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail(t("report-text"), data.reportText)}
					</Col>
				</>
			)}
			{type === "Lab Result" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("result-date-time"), data.resultDateTime ? moment(data.resultDateTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail(t("notes"), data.notes)}
					</Col>
				</>
			)}
			{type === "Procedure Log" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("start-time"), data.startTime ? moment(data.startTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("done-by"), data.userName)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("procedure-name"), data.procedureName)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail(t("billing-id"), data.billingId)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail(t("notes"), data.notes)}
					</Col>
				</>
			)}
		</DetailModal>
	);
};
// -----------------------------------------------------------------------------
// Patient Avatar Modal Component
// -----------------------------------------------------------------------------
const PatientAvatarModal = ({ imageUrl, isOpen, onClose }) => {
	const { t } = useTranslation();
	const screens = useBreakpoint();
	return (
		<Modal
			title={t("patient-profile-image")}
			open={isOpen}
			onCancel={onClose}
			footer={null}
			width={screens.xs ? "95%" : "90%"}
			style={{
				maxWidth: screens.xs ? "95vw" : "400px",
			}}
			styles={{ body: { padding: screens.xs ? "16px" : "24px", textAlign: "center" } }}>
			{imageUrl ? (
				<Image src={generateImageUrl(imageUrl)} alt="Patient Profile" style={{ width: "100%", maxWidth: "350px", objectFit: "contain" }} />
			) : (
				<Text>{t("no-image-available")}</Text>
			)}
		</Modal>
	);
};

// Quick Notes Modal
// -----------------------------------------------------------------------------
const QuickNotesModal = ({
	isOpen,
	onClose,
	onSave,
	quickNotesModalMode,
	quickNoteText,
	setQuickNoteText,
	quickNotes,
	onDelete,
	onEdit,
	loading,
	// Pagination props
	currentPage,
	onPageChange,
	totalCount,
	pageSize,
	// START: ==================== MODIFICATION ====================
	// ADDED: Permission props to control modal actions.
	canCreate,
	canUpdate,
	canDelete,
	// END: ==================== MODIFICATION ====================
}) => {
	const [isRecording, setIsRecording] = useState(false);
	const [mediaRecorder, setMediaRecorder] = useState(null);
	const [audioBlobUrl, setAudioBlobUrl] = useState(null);
	const [recordingError, setRecordingError] = useState(null);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const waveformRef = useRef(null);
	const wavesurfer = useRef({ current: null });
	const chunks = useRef([]);

	const { t } = useTranslation();
	const screens = useBreakpoint();
	const { token } = antdTheme.useToken();

	const handleSave = () => {
		onSave();
	};

	const startRecording = async () => {
		try {
			setRecordingError(null);
			setIsTranscribing(false);
			setAudioBlobUrl(null);
			if (wavesurfer.current.current) {
				wavesurfer.current.current.empty();
			}
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			setMediaRecorder(recorder);
			setIsRecording(true);
			chunks.current = [];
			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunks.current.push(event.data);
				}
			};
			recorder.onstop = () => {
				const blob = new Blob(chunks.current, { type: "audio/webm" });
				const url = URL.createObjectURL(blob);
				setAudioBlobUrl(url);
				if (wavesurfer.current.current) {
					wavesurfer.current.current.load(url);
				}
				sendAudioToBackend(blob);
				stream.getTracks().forEach((track) => track.stop());
			};
			recorder.onerror = (error) => {
				console.error("Recording error:", error);
				setRecordingError(t("recording-error"));
				notification.error({ message: t("error"), description: t("recording-error") });
				setIsRecording(false);
				stream.getTracks().forEach((track) => track.stop());
				setMediaRecorder(null);
			};
			recorder.start();
		} catch (error) {
			console.error("Error starting recording:", error);
			setRecordingError(t("microphone-access-denied"));
			notification.error({ message: t("error"), description: t("microphone-access-denied") });
			setIsRecording(false);
		}
	};

	const stopRecording = () => {
		if (mediaRecorder && mediaRecorder.state !== "inactive") {
			mediaRecorder.stop();
			setIsRecording(false);
		}
	};

	const sendAudioToBackend = async (blob) => {
		setIsTranscribing(true);
		const formData = new FormData();
		formData.append("audio", blob, "recording.webm");
		try {
			const response = await fetch("http://localhost:8080/api/gemini/soundtotext", {
				method: "POST",
				body: formData,
				headers: { Authorization: `Bearer ${useAuthStore.getState().user?.token}` },
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: "Transcription failed with status " + response.status }));
				throw new Error(errorData.message || "Transcription failed");
			}
			const transcribedText = await response.text();
			setQuickNoteText((prevText) => (prevText ? prevText + " " + transcribedText : transcribedText));
			notification.success({ message: t("success"), description: t("transcription-successful") });
		} catch (error) {
			console.error("Error transcribing audio:", error);
			notification.error({ message: t("error"), description: t("transcription-failed") + ": " + error.message });
		} finally {
			setIsTranscribing(false);
		}
	};

	useEffect(() => {
		if (waveformRef.current && !wavesurfer.current.current) {
			wavesurfer.current.current = WaveSurfer.create({
				container: waveformRef.current,
				waveColor: token.colorFillContent,
				progressColor: token.colorPrimary,
				cursorColor: token.colorText,
				barWidth: 2,
				barGap: 1,
				responsive: true,
				height: 60,
				normalize: true,
			});
		}
		return () => {
			if (wavesurfer.current.current) {
				wavesurfer.current.current.destroy();
				wavesurfer.current.current = null;
			}
			if (mediaRecorder && mediaRecorder.state !== "inactive") {
				mediaRecorder.stop();
				mediaRecorder.stream.getTracks().forEach((track) => track.stop());
			}
			if (audioBlobUrl) {
				URL.revokeObjectURL(audioBlobUrl);
			}
		};
	}, [token]);

	useEffect(() => {
		if (isOpen && (quickNotesModalMode === "create" || quickNotesModalMode === "edit")) {
			setAudioBlobUrl(null);
			setRecordingError(null);
			setIsRecording(false);
			setIsTranscribing(false);
			if (wavesurfer.current.current) {
				wavesurfer.current.current.empty();
			}
		}
	}, [isOpen, quickNotesModalMode]);

	const sortedQuickNotes = [...quickNotes].sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());
	const playAudio = () => {
		if (wavesurfer.current.current && audioBlobUrl) {
			wavesurfer.current.current.playPause();
		}
	};

	let modalTitle = t("quick-notes");
	if (quickNotesModalMode === "create") modalTitle = t("add-quick-note");
	if (quickNotesModalMode === "edit") modalTitle = t("edit-quick-note");
	const canPerformAudioActions = (quickNotesModalMode === "create" && canCreate) || (quickNotesModalMode === "edit" && canUpdate);

	return (
		<Modal
			title={modalTitle}
			open={isOpen}
			onCancel={onClose}
			width={quickNotesModalMode === "list" ? (screens.xs ? "95%" : "60%") : screens.xs ? "95%" : "500px"}
			style={{ maxWidth: screens.xs ? "95vw" : quickNotesModalMode === "list" ? "800px" : "500px" }}
			styles={{ body: { padding: screens.xs ? "16px" : "24px" } }}
			footer={
				quickNotesModalMode === "list"
					? [
							canCreate && (
								<Button key="add" type="primary" onClick={() => onEdit(null)}>
									{t("add-new-note")}
								</Button>
							),
							<Button key="close" onClick={onClose}>
								{t("close")}
							</Button>,
						].filter(Boolean)
					: [
							<Button key="cancel" onClick={onClose}>
								{t("cancel")}
							</Button>,
							((quickNotesModalMode === "create" && canCreate) || (quickNotesModalMode === "edit" && canUpdate)) && (
								<Button
									key="submit"
									type="primary"
									onClick={handleSave}
									loading={loading || isTranscribing}
									disabled={isRecording || isTranscribing}>
									{quickNotesModalMode === "create" ? t("create-note") : t("update-note")}
								</Button>
							),
						].filter(Boolean)
			}>
			{quickNotesModalMode === "list" ? (
				<List
					itemLayout="horizontal"
					dataSource={sortedQuickNotes}
					loading={loading}
					pagination={{
						current: currentPage,
						pageSize: pageSize,
						total: totalCount,
						onChange: onPageChange,
						style: { marginTop: 16, textAlign: "center" },
						showSizeChanger: false,
					}}
					renderItem={(item) => (
						<List.Item
							actions={[
								canUpdate && (
									<Tooltip title={t("edit")}>
										<Button type="text" icon={<EditOutlined />} onClick={() => onEdit(item)} />
									</Tooltip>
								),
								canDelete && (
									<Tooltip title={t("delete")}>
										<Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(item.id)} />
									</Tooltip>
								),
							].filter(Boolean)}>
							<List.Item.Meta
								avatar={<Avatar icon={<PushpinOutlined />} />}
								title={
									<span>
										{item.addedByUser || t("system")} - <ClockCircleOutlined style={{ marginRight: 4 }} />
										{moment(item.createdAt).format("YYYY-MM-DD HH:mm")}
									</span>
								}
								description={<Paragraph style={{ margin: 0 }}>{item.noteText}</Paragraph>}
							/>
						</List.Item>
					)}
				/>
			) : (
				<>
					<Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
						<Space>
							<Tooltip title={isRecording ? t("stop-recording") : t("start-recording")}>
								<Button
									icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
									type={isRecording ? "danger" : "primary"}
									onClick={isRecording ? stopRecording : startRecording}
									disabled={isTranscribing || !canPerformAudioActions}
									ghost={isRecording}
								/>
							</Tooltip>
							<Tooltip title={t("play-pause-audio")}>
								<Button onClick={playAudio} disabled={!audioBlobUrl || isTranscribing || isRecording || !canPerformAudioActions}>
									{t("play-pause")}
								</Button>
							</Tooltip>
							{recordingError && (
								<Text type="danger" style={{ marginLeft: 8 }}>
									{recordingError}
								</Text>
							)}
						</Space>
						<div
							id="waveform"
							ref={waveformRef}
							style={{
								width: "100%",
								height: "60px",
								display: isRecording || audioBlobUrl ? "block" : "none",
								background: token.colorBgLayout,
								borderRadius: token.borderRadiusLG,
							}}></div>
						{isTranscribing && <Spin size="small" style={{ marginLeft: 8 }} />}
					</Space>
					<Input.TextArea
						value={quickNoteText}
						onChange={(e) => setQuickNoteText(e.target.value)}
						placeholder={t("enter-quick-notes")}
						autoSize={{ minRows: 4, maxRows: 8 }}
						disabled={isTranscribing || !canPerformAudioActions}
					/>
				</>
			)}
		</Modal>
	);
};

// -----------------------------------------------------------------------------
// Patient Details Component
// -----------------------------------------------------------------------------
const PatientDetails = () => {
	const { id: patientId } = useParams();
	const { t } = useTranslation();
	const screens = useBreakpoint();
	const isMobile = !screens.sm; // Use !screens.sm for a better mobile breakpoint

	const { token } = antdTheme.useToken();

	const {
		fetchPatientData,
		fetchQuickNotes,
		createQuickNote,
		updateQuickNote,
		deleteQuickNote,
		loading,
		patient,
		admissions,
		appointments,
		assessments,
		billings,
		carePlans,
		prescriptions,
		vitalSigns,
		productUsages,
		medicationAdministrations,
		imageReports,
		labResults,
		documents,
		quickNotes,
		procedureLogs,
		totalCounts,
		toggleFilter,
		filters,
	} = usePatientDetailStore();

	// START: ==================== MODIFICATION ====================
	// ADDED: Retrieving `hasAuthority` to manage permissions.
	const { user: loggedInUser, hasAuthority } = useAuthStore();

	// Defining permission booleans for easier use in the component.
	const canReadPatient = hasAuthority("READ_PATIENT");
	const canCreateActivity = hasAuthority("CREATE_ACTIVITY");
	const canReadActivity = hasAuthority("READ_ACTIVITY");
	const canUpdateActivity = hasAuthority("UPDATE_ACTIVITY");
	const canDeleteActivity = hasAuthority("DELETE_ACTIVITY");
	// END: ==================== MODIFICATION ====================

	const [admissionsPage, setAdmissionsPage] = useState(0);
	const [appointmentsPage, setAppointmentsPage] = useState(0);
	const [assessmentsPage, setAssessmentsPage] = useState(0);
	const [billingsPage, setBillingsPage] = useState(0);
	const [carePlansPage, setCarePlansPage] = useState(0);
	const [prescriptionsPage, setPrescriptionsPage] = useState(0);
	const [vitalSignsPage, setVitalSignsPage] = useState(0);
	const [productUsagesPage, setProductUsagesPage] = useState(0);
	const [medicationAdministrationsPage, setMedicationAdministrationsPage] = useState(0);
	const [imageReportsPage, setImageReportsPage] = useState(0);
	const [labResultsPage, setLabResultsPage] = useState(0);
	const [documentsPage, setDocumentsPage] = useState(0);
	const [procedureLogsPage, setProcedureLogsPage] = useState(0);
	const [quickNotesPage, setQuickNotesPage] = useState(1);

	const [activeTab, setActiveTab] = useState("profile");

	const [expandedRow, setExpandedRow] = useState(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
	const [isSliderOpen, setIsSliderOpen] = useState(false);
	const [selectedImageData, setSelectedImageData] = useState(null);
	const [isLabResultModalOpen, setIsLabResultModalOpen] = useState(false);
	const [selectedLabResult, setSelectedLabResult] = useState(null);
	const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
	const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(null);
	const [isQuickNotesModalOpen, setIsQuickNotesModalOpen] = useState(false);
	const [quickNotesModalMode, setQuickNotesModalMode] = useState("list");
	const [editingQuickNoteId, setEditingQuickNoteId] = useState(null);
	const [quickNoteText, setQuickNoteText] = useState("");

	const [activityCreated, setActivityCreated] = useState(false);
	const { fetchLabTests, labTests } = useLabStore();

	const handleOpenServiceModal = () => setIsServiceModalOpen(true);
	const handleCloseServiceModal = () => setIsServiceModalOpen(false);
	const handleActivityCreated = () => setActivityCreated((prev) => !prev);
	const handleOpenLabResultModal = (labResult) => {
		setSelectedLabResult(labResult);
		setIsLabResultModalOpen(true);
	};
	const handleCloseLabResultModal = () => {
		setIsLabResultModalOpen(false);
		setSelectedLabResult(null);
	};
	const handleOpenSlider = (imageReport) => {
		const processedUrls = imageReport.imageUrls?.map(generateImageUrl) || [];
		setSelectedImageData({ ...imageReport, imageUrls: processedUrls });
		setIsSliderOpen(true);
	};
	const handleCloseSlider = () => {
		setIsSliderOpen(false);
		setSelectedImageData(null);
	};
	const handleOpenDetailModal = (row, type) => {
		setExpandedRow({ ...row, type });
		setIsDetailModalOpen(true);
	};
	const handleCloseDetailModal = () => {
		setExpandedRow(null);
		setIsDetailModalOpen(false);
	};
	const handleOpenAvatarModal = (avatarUrl) => {
		setSelectedAvatarUrl(avatarUrl);
		setIsAvatarModalOpen(true);
	};
	const handleCloseAvatarModal = () => {
		setSelectedAvatarUrl(null);
		setIsAvatarModalOpen(false);
	};

	const handleOpenQuickNotesModal = (mode = "list", note = null) => {
		setQuickNotesModalMode(mode);
		if (mode === "edit" && note) {
			setEditingQuickNoteId(note.id);
			setQuickNoteText(note.noteText);
		} else if (mode === "create") {
			setEditingQuickNoteId(null);
			setQuickNoteText("");
		}
		if (mode === "list") {
			setQuickNotesPage(1);
			fetchQuickNotes(patientId, 1, 10);
		}
		setIsQuickNotesModalOpen(true);
	};

	const handleQuickNotesPageChange = (page) => {
		setQuickNotesPage(page);
		fetchQuickNotes(patientId, page, 10);
	};

	const handleCloseQuickNotesModal = () => {
		setIsQuickNotesModalOpen(false);
		setQuickNotesModalMode("list");
		setEditingQuickNoteId(null);
		setQuickNoteText("");
	};
	const handleSaveQuickNotes = async () => {
		if (!loggedInUser || !loggedInUser.id) {
			notification.error({ message: t("error"), description: t("user-not-logged-in") });
			return;
		}
		try {
			if (quickNotesModalMode === "create") {
				await createQuickNote(patientId, quickNoteText, loggedInUser.id);
				notification.success({ message: t("success"), description: t("quick-note-created") });
			} else if (quickNotesModalMode === "edit" && editingQuickNoteId) {
				await updateQuickNote(editingQuickNoteId, quickNoteText, loggedInUser.id);
				notification.success({ message: t("success"), description: t("quick-note-updated") });
			}
			setQuickNotesModalMode("list");
			setQuickNoteText("");
			setEditingQuickNoteId(null);
		} catch (error) {
			// Error already handled in the service store
		}
	};
	const handleDeleteQuickNote = async (quickNoteId) => {
		Modal.confirm({
			title: t("confirm-delete-note-title"),
			content: t("confirm-delete-note-content"),
			okText: t("delete"),
			okType: "danger",
			cancelText: t("cancel"),
			onOk: async () => {
				try {
					await deleteQuickNote(quickNoteId);
					notification.success({ message: t("success"), description: t("quick-note-deleted") });
				} catch (error) {
					// Error already handled in the service store
				}
			},
		});
	};
	const handleEditQuickNote = (quickNote) => {
		if (quickNote) {
			handleOpenQuickNotesModal("edit", quickNote);
		} else {
			handleOpenQuickNotesModal("create");
		}
	};

	useEffect(() => {
		fetchLabTests();
	}, [fetchLabTests]);

	useEffect(() => {
		if (patientId) {
			fetchPatientData(patientId, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10);
			if (canReadActivity) {
				fetchQuickNotes(patientId, 1, 10);
			}
		}
	}, [patientId, fetchPatientData, fetchQuickNotes, activityCreated, canReadActivity]);

	const fetchPaginatedDataForTab = async (dataType, pageState) => {
		if (!patientId) return;
		const pageNum = pageState + 1;
		try {
			await fetchPatientData(
				patientId,
				dataType === "admissions" ? pageNum : 0,
				dataType === "appointments" ? pageNum : 0,
				dataType === "assessments" ? pageNum : 0,
				dataType === "billings" ? pageNum : 0,
				dataType === "carePlans" ? pageNum : 0,
				dataType === "prescriptions" ? pageNum : 0,
				dataType === "vitalSigns" ? pageNum : 0,
				dataType === "productUsages" ? pageNum : 0,
				dataType === "medicationAdministrations" ? pageNum : 0,
				dataType === "imageReports" ? pageNum : 0,
				dataType === "labResults" ? pageNum : 0,
				dataType === "documents" ? pageNum : 0,
				0,
				dataType === "procedureLogs" ? pageNum : 0,
				10,
			);
		} catch (error) {
			console.error(`Error fetching ${dataType}:`, error.message);
		}
	};

	useEffect(() => {
		if (activeTab === "3" && patientId) fetchPaginatedDataForTab("admissions", admissionsPage);
	}, [activeTab, patientId, admissionsPage, activityCreated, filters.admissions]);
	useEffect(() => {
		if (activeTab === "4" && patientId) fetchPaginatedDataForTab("appointments", appointmentsPage);
	}, [activeTab, patientId, appointmentsPage, filters.appointments, activityCreated]);
	useEffect(() => {
		if (activeTab === "5" && patientId) fetchPaginatedDataForTab("assessments", assessmentsPage);
	}, [activeTab, patientId, assessmentsPage, filters.assessments, activityCreated]);
	useEffect(() => {
		if (activeTab === "6" && patientId) fetchPaginatedDataForTab("billings", billingsPage);
	}, [activeTab, patientId, billingsPage, filters.billings, activityCreated]);
	useEffect(() => {
		if (activeTab === "7" && patientId) fetchPaginatedDataForTab("carePlans", carePlansPage);
	}, [activeTab, patientId, carePlansPage, filters.carePlans, activityCreated]);
	useEffect(() => {
		if (activeTab === "8" && patientId) fetchPaginatedDataForTab("prescriptions", prescriptionsPage);
	}, [activeTab, patientId, prescriptionsPage, filters.prescriptions, activityCreated]);
	useEffect(() => {
		if (activeTab === "9" && patientId) fetchPaginatedDataForTab("vitalSigns", vitalSignsPage);
	}, [activeTab, patientId, vitalSignsPage, filters.vitalSigns, activityCreated]);
	useEffect(() => {
		if (activeTab === "10" && patientId) fetchPaginatedDataForTab("productUsages", productUsagesPage);
	}, [activeTab, patientId, productUsagesPage, filters.productUsages, activityCreated]);
	useEffect(() => {
		if (activeTab === "11" && patientId) fetchPaginatedDataForTab("medicationAdministrations", medicationAdministrationsPage);
	}, [activeTab, patientId, medicationAdministrationsPage, filters.medicationAdministrations, activityCreated]);
	useEffect(() => {
		if (activeTab === "12" && patientId) fetchPaginatedDataForTab("imageReports", imageReportsPage);
	}, [activeTab, patientId, imageReportsPage, filters.imageReports, activityCreated]);
	useEffect(() => {
		if (activeTab === "13" && patientId) fetchPaginatedDataForTab("labResults", labResultsPage);
	}, [activeTab, patientId, labResultsPage, filters.labResults, activityCreated]);
	useEffect(() => {
		if (activeTab === "14" && patientId) fetchPaginatedDataForTab("documents", documentsPage);
	}, [activeTab, patientId, documentsPage, filters.documents, activityCreated]);
	useEffect(() => {
		if (activeTab === "15" && patientId) fetchPaginatedDataForTab("procedureLogs", procedureLogsPage);
	}, [activeTab, patientId, procedureLogsPage, filters.procedureLogs, activityCreated]);

	const handleTabChange = (key) => {
		setActiveTab(key);
		setAdmissionsPage(0);
		setAppointmentsPage(0);
		setAssessmentsPage(0);
		setBillingsPage(0);
		setCarePlansPage(0);
		setPrescriptionsPage(0);
		setVitalSignsPage(0);
		setProductUsagesPage(0);
		setMedicationAdministrationsPage(0);
		setImageReportsPage(0);
		setLabResultsPage(0);
		setDocumentsPage(0);
		setProcedureLogsPage(0);
	};

	const commonActionColumn = (type, htmlReportType, htmlReportPrefix, recordProcessor = (r) => r) => ({
		title: t("actions"),
		key: "actions",
		fixed: isMobile ? false : "right",
		width: isMobile ? 110 : 130,
		render: (text, record) => (
			<Space size={isMobile ? "small" : "middle"} wrap={isMobile}>
				<Tooltip title={t("view-details")}>
					<Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => handleOpenDetailModal(record, type)} />
				</Tooltip>
				<Tooltip title={t("export-html-report")}>
					<HtmlReportGenerator
						type={htmlReportType}
						mode="single"
						data={recordProcessor(record)}
						fileNamePrefix={htmlReportPrefix}
						labTests={labTests}>
						<Button size="small" type="default" icon={<DownloadOutlined />} />
					</HtmlReportGenerator>
				</Tooltip>
			</Space>
		),
	});

	const admissionsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("admission-date"),
				dataIndex: "admissionDate",
				key: "admissionDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{
				title: t("discharge-date"),
				dataIndex: "dischargeDate",
				key: "dischargeDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : <Tag color="green">{t("open")}</Tag>),
			},
			{ title: t("bed-id"), dataIndex: "bedId", key: "bedId", width: 100 },
		];
		return isMobile
			? [baseColumns[0], commonActionColumn("Admission", "admission", "admission")]
			: [...baseColumns, commonActionColumn("Admission", "admission", "admission")];
	}, [isMobile, t, labTests]);

	const appointmentsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("appointment-date-time"),
				dataIndex: "appointmentDateTime",
				key: "appointmentDateTime",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{
				title: t("service"),
				dataIndex: "productName",
				key: "productName",
				ellipsis: true,
			},
			{
				title: t("provider"),
				key: "provider",
				render: (text, record) => `${record.userFirstName || ""} ${record.userLastName || ""}`.trim() || "N/A",
				ellipsis: true,
			},
			{
				title: t("status"),
				dataIndex: "status",
				key: "status",
				width: 120,
				render: (status) =>
					status ? <Tag color={status === "COMPLETED" ? "green" : status === "SCHEDULED" ? "blue" : "default"}>{status}</Tag> : "N/A",
			},
		];
		return isMobile
			? [baseColumns[0], baseColumns[3], commonActionColumn("Appointment", "appointment", "appointment")]
			: [...baseColumns, commonActionColumn("Appointment", "appointment", "appointment")];
	}, [isMobile, t, labTests]);

	const assessmentsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("assessment-date"),
				dataIndex: "assessmentDateTime",
				key: "assessmentDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{
				title: t("notes"),
				dataIndex: "notes",
				key: "notes",
				ellipsis: true,
				render: (text) => <div dangerouslySetInnerHTML={{ __html: text?.substring(0, 100) + (text?.length > 100 ? "..." : "") }} />,
			},
		];
		return isMobile
			? [baseColumns[0], commonActionColumn("Assessment", "assessment", "assessment")]
			: [baseColumns[0], baseColumns[1], commonActionColumn("Assessment", "assessment", "assessment")];
	}, [isMobile, t, labTests]);

	const billingColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("billing-date"),
				dataIndex: "billDate",
				key: "billingDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("description"), dataIndex: "description", key: "description", ellipsis: true },
			{ title: t("amount"), dataIndex: "amount", key: "amount", width: 100, render: (text) => (text ? `$${Number(text).toFixed(2)}` : "N/A") },
		];
		return isMobile
			? [baseColumns[0], baseColumns[2], commonActionColumn("Billing", "billing", "billing")]
			: [...baseColumns, commonActionColumn("Billing", "billing", "billing")];
	}, [isMobile, t, labTests]);

	const carePlansColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("plan-date"),
				dataIndex: "planDate",
				key: "planDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("goal"), dataIndex: "goal", key: "goal", ellipsis: true },
			{ title: t("interventions"), dataIndex: "interventions", key: "interventions", ellipsis: true },
		];
		return isMobile
			? [baseColumns[0], commonActionColumn("Care Plan", "carePlan", "care_plan")]
			: [...baseColumns, commonActionColumn("Care Plan", "carePlan", "care_plan")];
	}, [isMobile, t, labTests]);

	const prescriptionsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("prescription-date"),
				dataIndex: "prescriptionDate",
				key: "prescriptionDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("note"), dataIndex: "note", key: "note", ellipsis: true },
			{
				title: t("prescribed-medications"),
				key: "prescribedMedications",
				ellipsis: true,
				render: (text, record) =>
					(record?.prescribedMedications ?? []).map((m) => m.medicationName).join(", ") || t("no-medications-prescribed"),
			},
		];
		return isMobile
			? [baseColumns[0], commonActionColumn("Prescription", "prescription", "prescription")]
			: [...baseColumns, commonActionColumn("Prescription", "prescription", "prescription")];
	}, [isMobile, t, labTests]);

	const vitalSignsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("record-date"),
				dataIndex: "timestamp",
				key: "recordDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("temp"), dataIndex: "temperature", key: "temperature", width: 60 },
			{ title: t("hr"), dataIndex: "heartRate", key: "heartRate", width: 60 },
			{
				title: t("bp"),
				key: "bloodPressure",
				width: 90,
				render: (text, record) =>
					record.bloodPressureSystolic && record.bloodPressureDiastolic
						? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`
						: "N/A",
			},
			{ title: t("rr"), dataIndex: "respiratoryRate", key: "respiratoryRate", width: 60 },
			{ title: t("spo2"), dataIndex: "oxygenSaturation", key: "oxygenSaturation", width: 60 },
		];
		return isMobile
			? [baseColumns[0], baseColumns[3], commonActionColumn("Vital Sign", "vitalSign", "vital_sign")]
			: [...baseColumns, commonActionColumn("Vital Sign", "vitalSign", "vital_sign")];
	}, [isMobile, t, labTests]);

	const productUsagesColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("start-time"),
				dataIndex: "startTime",
				key: "startTime",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("product-name"), dataIndex: "productName", key: "productName", ellipsis: true },
			{ title: t("qty"), dataIndex: "quantity", key: "quantity", width: 60 },
			{ title: t("price"), dataIndex: "price", key: "price", width: 80, render: (text) => (text ? `$${Number(text).toFixed(2)}` : "N/A") },
		];
		return isMobile
			? [baseColumns[0], baseColumns[1], commonActionColumn("Product Usage", "productUsage", "product_usage")]
			: [...baseColumns, commonActionColumn("Product Usage", "productUsage", "product_usage")];
	}, [isMobile, t, labTests]);

	const medicationAdministrationsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("admin-time"),
				dataIndex: "administrationTime",
				key: "administrationTime",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("medication"), dataIndex: "medicationName", key: "medicationName", ellipsis: true },
			{ title: t("amount"), dataIndex: "amount", key: "amount", width: 80 },
		];
		return isMobile
			? [baseColumns[0], baseColumns[1], commonActionColumn("Medication Administration", "medicationAdministration", "med_admin")]
			: [...baseColumns, commonActionColumn("Medication Administration", "medicationAdministration", "med_admin")];
	}, [isMobile, t, labTests]);

	const imageReportsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("report-date"),
				dataIndex: "reportDateTime",
				key: "reportDateTime",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("image-type"), dataIndex: "imageType", key: "imageType", width: 120 },
			{ title: t("description"), dataIndex: "description", key: "description", ellipsis: true },
			{
				title: t("images"),
				key: "images",
				width: 100,
				render: (text, record) =>
					!record.imageUrls || record.imageUrls.length === 0 ? (
						<Text type="secondary">{t("no-images")}</Text>
					) : (
						<Tooltip title={t("view-images")}>
							<Button size="small" type="dashed" icon={<PictureOutlined />} onClick={() => handleOpenSlider(record)} />
						</Tooltip>
					),
			},
		];
		return isMobile
			? [
					baseColumns[0],
					baseColumns[1],
					commonActionColumn("Image Report", "imageReport", "image_report", (record) => ({
						...record,
						imageUrls: record.imageUrls?.map(generateImageUrl) || [],
					})),
				]
			: [
					...baseColumns,
					commonActionColumn("Image Report", "imageReport", "image_report", (record) => ({
						...record,
						imageUrls: record.imageUrls?.map(generateImageUrl) || [],
					})),
				];
	}, [isMobile, t, labTests]);

	const labResultsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("result-date"),
				dataIndex: "resultDateTime",
				key: "resultDateTime",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{
				title: t("test-name"),
				key: "testName",
				ellipsis: true,
				render: (text, record) => labTests.find((test) => test.id === record.labTestId)?.testName || t("unknown-test"),
			},
			{ title: t("notes"), dataIndex: "notes", key: "notes", ellipsis: true },
		];
		const actionsCol = {
			title: t("actions"),
			key: "actions",
			fixed: isMobile ? false : "right",
			width: isMobile ? 110 : 130,
			render: (text, record) => (
				<Space size={isMobile ? "small" : "middle"} wrap={isMobile}>
					<Tooltip title={t("view-details")}>
						<Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => handleOpenLabResultModal(record)} />
					</Tooltip>
					<Tooltip title={t("export-html-report")}>
						<HtmlReportGenerator
							type="labResult"
							mode="single"
							data={{ ...record, labTestDetails: labTests.find((lt) => lt.id === record.labTestId) }}
							fileNamePrefix="lab_result"
							labTests={labTests}>
							<Button size="small" type="default" icon={<DownloadOutlined />} />
						</HtmlReportGenerator>
					</Tooltip>
				</Space>
			),
		};
		return isMobile ? [baseColumns[0], baseColumns[1], actionsCol] : [...baseColumns, actionsCol];
	}, [isMobile, t, labTests]);

	const documentsColumns = useMemo(() => {
		const baseColumns = [
			{ title: t("document-name"), dataIndex: "documentName", key: "documentName", ellipsis: true },
			{
				title: t("upload-date"),
				dataIndex: "uploadDate",
				key: "uploadDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("uploaded-by"), dataIndex: "uploadedByName", key: "uploadedByName", width: 150, ellipsis: true },
		];
		const actionsCol = {
			title: t("actions"),
			key: "actions",
			fixed: isMobile ? false : "right",
			width: isMobile ? 80 : 100,
			render: (text, record) => (
				<Tooltip title={t("download")}>
					<Button
						size="small"
						type="primary"
						icon={<DownloadOutlined />}
						onClick={() => {
							const downloadUrl = generateDocumentUrl(record.documentPath);
							if (!downloadUrl) {
								notification.error({ message: t("error"), description: t("invalid-document-path") });
								return;
							}
							fetch(downloadUrl)
								.then((response) => {
									if (!response.ok) throw new Error(`HTTP error ${response.status}`);
									return response.blob();
								})
								.then((blob) => {
									const url = window.URL.createObjectURL(blob);
									const link = document.createElement("a");
									link.href = url;
									link.download = record.documentPath?.split("/").pop() || record.documentName || "downloaded_file";
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
									window.URL.revokeObjectURL(url);
								})
								.catch((error) => {
									console.error("Error downloading file:", error);
									notification.error({ message: t("error"), description: `${t("download-failed")}: ${error.message}` });
								});
						}}>
						{!isMobile && t("download")}
					</Button>
				</Tooltip>
			),
		};
		return isMobile ? [baseColumns[0], actionsCol] : [...baseColumns, actionsCol];
	}, [isMobile, t]);

	const procedureLogsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("start-time"),
				dataIndex: "startTime",
				key: "startTime",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("procedure-name"), dataIndex: "procedureName", key: "procedureName", ellipsis: true },
			{ title: t("done-by"), dataIndex: "userName", key: "userName", width: 150, ellipsis: true },
			{ title: t("notes"), dataIndex: "notes", key: "notes", ellipsis: true },
		];
		return isMobile
			? [baseColumns[0], baseColumns[1], commonActionColumn("Procedure Log", "procedureLog", "procedure_log")]
			: [...baseColumns, commonActionColumn("Procedure Log", "procedureLog", "procedure_log")];
	}, [isMobile, t, labTests]);

	const handleFilterToggle = (dataType) => {
		toggleFilter(dataType);
		const pageSetters = {
			admissions: setAdmissionsPage,
			appointments: setAppointmentsPage,
			assessments: setAssessmentsPage,
			billings: setBillingsPage,
			carePlans: setCarePlansPage,
			prescriptions: setPrescriptionsPage,
			vitalSigns: setVitalSignsPage,
			productUsages: setProductUsagesPage,
			medicationAdministrations: setMedicationAdministrationsPage,
			imageReports: setImageReportsPage,
			labResults: setLabResultsPage,
			documents: setDocumentsPage,
			procedureLogs: setProcedureLogsPage,
		};
		if (pageSetters[dataType]) pageSetters[dataType](0);
	};

	const patientFileMenu = (
		<Menu
			items={[
				{
					key: "active",
					label: (
						<HtmlReportGenerator mode="patientFile" data={patient} labTests={labTests} reportScope="active">
							{t("download-active-info")}
						</HtmlReportGenerator>
					),
				},
				{
					key: "all",
					label: (
						<HtmlReportGenerator mode="patientFile" data={patient} labTests={labTests} reportScope="all">
							{t("download-all-info")}
						</HtmlReportGenerator>
					),
				},
			]}
		/>
	);

	// START: ==================== MODIFICATION ====================
	// ADDED: Configuration array for all data tabs with associated permissions.
	const tabsConfig = [
		{
			key: "3",
			permission: "READ_ADMISSION",
			title: t("admissions"),
			icon: <ProfileOutlined />,
			columns: admissionsColumns,
			data: admissions,
			page: admissionsPage,
			setPage: setAdmissionsPage,
			count: totalCounts?.admissions,
			filterType: "admissions",
		},
		{
			key: "4",
			permission: "READ_APPOINTMENT",
			title: t("appointments"),
			icon: <CalendarOutlined />,
			columns: appointmentsColumns,
			data: appointments,
			page: appointmentsPage,
			setPage: setAppointmentsPage,
			count: totalCounts?.appointments,
			filterType: "appointments",
		},
		{
			key: "5",
			permission: "READ_ASSESSMENT",
			title: t("assessments"),
			icon: <FileTextOutlined />,
			columns: assessmentsColumns,
			data: assessments,
			page: assessmentsPage,
			setPage: setAssessmentsPage,
			count: totalCounts?.assessments,
			filterType: "assessments",
		},
		{
			key: "6",
			permission: "READ_BILLING",
			title: t("billings"),
			icon: <DollarOutlined />,
			columns: billingColumns,
			data: billings,
			page: billingsPage,
			setPage: setBillingsPage,
			count: totalCounts?.billings,
			filterType: "billings",
		},
		{
			key: "7",
			permission: "READ_NURSING_CARE_PLAN",
			title: t("care-plans"),
			icon: <UnorderedListOutlined />,
			columns: carePlansColumns,
			data: carePlans,
			page: carePlansPage,
			setPage: setCarePlansPage,
			count: totalCounts?.carePlans,
			filterType: "carePlans",
		},
		{
			key: "8",
			permission: "READ_PRESCRIPTION",
			title: t("prescriptions"),
			icon: <MedicineBoxOutlined />,
			columns: prescriptionsColumns,
			data: prescriptions,
			page: prescriptionsPage,
			setPage: setPrescriptionsPage,
			count: totalCounts?.prescriptions,
			filterType: "prescriptions",
		},
		{
			key: "9",
			permission: "READ_VITAL_SIGN",
			title: t("vital-signs"),
			icon: <HeartOutlined />,
			columns: vitalSignsColumns,
			data: vitalSigns,
			page: vitalSignsPage,
			setPage: setVitalSignsPage,
			count: totalCounts?.vitalSigns,
			filterType: "vitalSigns",
		},
		{
			key: "10",
			permission: "READ_PATIENT_PRODUCT_USAGE",
			title: t("product-usages"),
			icon: <ShoppingCartOutlined />,
			columns: productUsagesColumns,
			data: productUsages,
			page: productUsagesPage,
			setPage: setProductUsagesPage,
			count: totalCounts?.productUsages,
			filterType: "productUsages",
		},
		{
			key: "11",
			permission: "READ_MEDICATION_ADMINISTRATION",
			title: t("med-admin"),
			icon: <MedicineBoxOutlined />,
			columns: medicationAdministrationsColumns,
			data: medicationAdministrations,
			page: medicationAdministrationsPage,
			setPage: setMedicationAdministrationsPage,
			count: totalCounts?.medicationAdministrations,
			filterType: "medicationAdministrations",
		},
		{
			key: "12",
			permission: "READ_IMAGE_REPORT",
			title: t("image-reports"),
			icon: <PictureOutlined />,
			columns: imageReportsColumns,
			data: imageReports,
			page: imageReportsPage,
			setPage: setImageReportsPage,
			count: totalCounts?.imageReports,
			filterType: "imageReports",
		},
		{
			key: "13",
			permission: "READ_LAB_RESULT",
			title: t("lab-results"),
			icon: <ExperimentOutlined />,
			columns: labResultsColumns,
			data: labResults,
			page: labResultsPage,
			setPage: setLabResultsPage,
			count: totalCounts?.labResults,
			filterType: "labResults",
		},
		{
			key: "14",
			permission: "READ_DOCUMENT",
			title: t("documents"),
			icon: <FileTextOutlined />,
			columns: documentsColumns,
			data: documents,
			page: documentsPage,
			setPage: setDocumentsPage,
			count: totalCounts?.documents,
			filterType: "documents",
		},
		{
			key: "15",
			permission: "READ_PROCEDURE_LOG",
			title: t("procedure-logs"),
			icon: <FileDoneOutlined />,
			columns: procedureLogsColumns,
			data: procedureLogs,
			page: procedureLogsPage,
			setPage: setProcedureLogsPage,
			count: totalCounts?.procedureLogs,
			filterType: "procedureLogs",
		},
	];

	// Filter tabs based on user permissions
	const visibleTabs = tabsConfig.filter((tab) => hasAuthority(tab.permission));
	// END: ==================== MODIFICATION ====================

	return (
		<Layout style={{ minHeight: "100vh", background: token.colorBgLayout }}>
			<Header
				style={{
					padding: isMobile ? "0 16px" : "0 24px",
					background: token.colorBgContainer,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					borderBottom: `1px solid ${token.colorBorderSecondary}`,
					height: 56,
				}}>
				<Title level={4} style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
					{t("patient-details")}
				</Title>
				{canReadPatient && (
					<Space>
						<Tooltip title={t("add-service")}>
							<Button
								type="primary"
								shape="circle"
								icon={<PlusOutlined />}
								onClick={handleOpenServiceModal}
								disabled={!canCreateActivity}
							/>
						</Tooltip>
						{!loading && patient && (
							<Dropdown overlay={patientFileMenu} placement="bottomRight">
								<Tooltip title={t("generate-patient-file-html")}>
									<Button type="default" shape="circle" icon={<DownloadOutlined />} />
								</Tooltip>
							</Dropdown>
						)}
					</Space>
				)}
			</Header>

			<Content style={{ padding: isMobile ? "8px" : "16px" }}>
				{loading && !patient && <Spin tip={t("loading-patient-details")} style={{ display: "block", marginTop: 50 }} />}

				{patient && canReadPatient && (
					<Card
						style={{
							marginBottom: isMobile ? "8px" : "16px",
							position: "sticky",
							top: isMobile ? "8px" : "16px",
							zIndex: 10,
							boxShadow: token.boxShadowSecondary,
						}}
						styles={{ body: { padding: isMobile ? "12px" : "20px" } }}>
						<Row gutter={[16, 16]} align="middle">
							<Col xs={24} sm={6} md={4} style={{ textAlign: isMobile ? "center" : "left" }}>
								<Avatar
									size={isMobile ? 80 : 96}
									src={generateImageUrl(patient.profilePictureURL)}
									alt={`${patient.firstName} ${patient.lastName}`}
									icon={<UserOutlined />}
									style={{
										cursor: "pointer",
										border: `3px solid ${token.colorBorder}`,
										backgroundColor: token.colorBgLayout,
									}}
									onClick={() => handleOpenAvatarModal(patient.profilePictureURL)}
								/>
							</Col>
							<Col xs={24} sm={18} md={20}>
								<Row gutter={[isMobile ? 8 : 16, isMobile ? 12 : 16]}>
									<Col span={24}>
										<Title level={isMobile ? 4 : 3} style={{ marginBottom: 0, textAlign: isMobile ? "center" : "left" }}>
											{patient.firstName} {patient.lastName}
										</Title>
									</Col>
									<Col xs={12} sm={12} md={8}>
										<Statistic
											title={t("mrn")}
											value={patient.medicalRecordNumber}
											valueStyle={{ fontSize: isMobile ? 16 : 20 }}
											prefix={<InfoCircleOutlined />}
										/>
									</Col>
									<Col xs={12} sm={12} md={5}>
										<Statistic title={t("age")} value={moment().diff(patient.dateOfBirth, "years")} prefix={<UserOutlined />} />
									</Col>
									<Col xs={12} sm={12} md={5}>
										<Statistic
											title={t("gender")}
											value={patient.gender}
											prefix={patient.gender === "Male" ? <ManOutlined /> : <WomanOutlined />}
										/>
									</Col>
									<Col xs={12} sm={12} md={6}>
										{admissions && admissions.length > 0 && !admissions[0].dischargeDate ? (
											<Statistic
												title={t("current-visit")}
												value={moment(admissions[0].admissionDate).format("ll")}
												valueStyle={{ color: token.colorSuccess }}
												prefix={<CalendarOutlined />}
											/>
										) : (
											<Statistic title={t("last-visit")} value={t("n-a")} prefix={<CalendarOutlined />} />
										)}
									</Col>
								</Row>
							</Col>
						</Row>
					</Card>
				)}

				{patient && canReadPatient && (
					<Card className="patient-details-tabs" styles={{ body: { padding: "0" } }}>
						<Tabs
							activeKey={activeTab}
							onChange={handleTabChange}
							type="card"
							size={isMobile ? "small" : "default"}
							tabBarStyle={{ margin: 0, paddingLeft: "8px" }}>
							<TabPane
								tab={
									<span>
										<UserOutlined /> {t("profile")}
									</span>
								}
								key="profile">
								<div style={{ padding: isMobile ? "16px 12px" : "24px" }}>
									<Row gutter={[24, 24]}>
										<Col xs={24} md={12} lg={8}>
											<Title level={5} style={{ marginBottom: 16 }}>
												{t("contact-information")}
											</Title>
											<Space direction="vertical" size="middle" style={{ width: "100%" }}>
												<Text>
													<EnvironmentOutlined style={{ marginRight: 8, color: token.colorPrimary }} />{" "}
													{patient.address || t("not-available")}
												</Text>
												<Text>
													<PhoneOutlined style={{ marginRight: 8, color: token.colorPrimary }} />{" "}
													{patient.phoneNumber || t("not-available")}
												</Text>
												<Text>
													<MailOutlined style={{ marginRight: 8, color: token.colorPrimary }} />{" "}
													{patient.email || t("not-available")}
												</Text>
											</Space>
										</Col>
										<Col xs={24} md={12} lg={8}>
											<Title level={5} style={{ marginBottom: 16 }}>
												{t("medical-information")}
											</Title>
											<Space direction="vertical" size="middle" style={{ width: "100%" }}>
												<Text>
													<HeartOutlined style={{ marginRight: 8, color: token.colorError }} /> {t("blood-type")}:{" "}
													<Text strong>{patient.bloodType || "N/A"}</Text>
												</Text>
												<div>
													<Text strong>
														<WarningOutlined style={{ marginRight: 8, color: token.colorError }} />
														{t("allergies")}:
													</Text>
													<Paragraph ellipsis={{ rows: 3, expandable: true, symbol: t("more") }}>
														{patient.allergies || t("no-known-allergies")}
													</Paragraph>
												</div>
												<div>
													<Text strong>{t("medical-history")}:</Text>
													<Paragraph ellipsis={{ rows: 3, expandable: true, symbol: t("more") }}>
														{patient.medicalHistory || t("not-available")}
													</Paragraph>
												</div>
											</Space>
										</Col>
										{canReadActivity && (
											<Col xs={24} md={24} lg={8}>
												<Title level={5} style={{ marginBottom: 16 }}>
													{t("quick-notes")}
												</Title>
												<List
													itemLayout="horizontal"
													dataSource={quickNotes.slice(0, 3)}
													loading={loading && quickNotes.length === 0}
													renderItem={(item) => (
														<List.Item
															actions={
																canUpdateActivity
																	? [
																			<Button
																				type="link"
																				size="small"
																				onClick={() => handleEditQuickNote(item)}>
																				{t("edit")}
																			</Button>,
																		]
																	: []
															}>
															<List.Item.Meta
																avatar={
																	<Avatar
																		size="small"
																		icon={<PushpinOutlined />}
																		style={{ backgroundColor: token.colorPrimaryBg }}
																	/>
																}
																title={`${item.addedByUser || t("system")} - ${moment(item.createdAt).fromNow()}`}
																description={
																	<Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
																		{item.noteText}
																	</Paragraph>
																}
															/>
														</List.Item>
													)}
												/>
												{totalCounts?.quickNotes > 3 && (
													<Button type="link" onClick={() => handleOpenQuickNotesModal("list")} style={{ marginTop: 8 }}>
														{t("view-all-quick-notes")}
													</Button>
												)}
												{quickNotes.length === 0 && !loading && <Text type="secondary">{t("no-quick-notes-available")}</Text>}
											</Col>
										)}
									</Row>
								</div>
							</TabPane>

							{/* MODIFIED: Mapping over the permission-filtered array of tabs */}
							{visibleTabs.map((tab) => (
								<TabPane
									key={tab.key}
									tab={
										<span>
											{tab.icon} {!isMobile && tab.title}
											{tab.filterType && (
												<Tooltip title={filters[tab.filterType] ? t("show-all") : t("filter-by-admission")}>
													<Button
														type="text"
														size="small"
														danger={filters[tab.filterType]}
														icon={<FilterOutlined />}
														onClick={(e) => {
															e.stopPropagation();
															handleFilterToggle(tab.filterType);
														}}
														style={{ marginLeft: isMobile ? 0 : 4, padding: "0 4px" }}
													/>
												</Tooltip>
											)}
										</span>
									}>
									<div style={{ padding: isMobile ? "12px" : "16px" }}>
										<PaginatedTable
											columns={tab.columns}
											data={tab.data}
											loading={loading && activeTab === tab.key}
											currentPage={tab.page}
											onPageChange={tab.setPage}
											totalCount={tab.count || 0}
										/>
									</div>
								</TabPane>
							))}
						</Tabs>
					</Card>
				)}
				{!patient && !loading && !canReadPatient && (
					<Card style={{ textAlign: "center", padding: 50 }}>
						<Text type="secondary">{t("patient-not-found-or-permission-denied")}</Text>
					</Card>
				)}
			</Content>

			{canReadActivity && (
				<FloatButton.Group shape="circle" style={{ right: isMobile ? 16 : 24, bottom: isMobile ? 60 : 24 }}>
					<Tooltip title={t("quick-notes")}>
						<FloatButton icon={<PushpinOutlined />} onClick={() => handleOpenQuickNotesModal("list")} />
					</Tooltip>
					<FloatButton.BackTop visibilityHeight={100} />
				</FloatButton.Group>
			)}

			<Modal
				title={t("request-service")}
				open={isServiceModalOpen}
				onCancel={handleCloseServiceModal}
				footer={null}
				width={screens.xs ? "95%" : "90%"}
				style={{ maxWidth: screens.xs ? "95vw" : "600px" }}
				styles={{ body: { padding: screens.xs ? "16px" : "24px" } }}>
				<MiniCreateActivityForm onActivityCreated={handleActivityCreated} patientId={patientId} />
			</Modal>
			<ExpandedRowDetails expandedRow={expandedRow} isModalOpen={isDetailModalOpen} handleCloseModal={handleCloseDetailModal} />
			<LabResultDetailsModal
				isOpen={isLabResultModalOpen}
				onClose={handleCloseLabResultModal}
				labResult={selectedLabResult}
				labTests={labTests}
			/>
			{isSliderOpen && selectedImageData && <ImageSlider open={isSliderOpen} data={selectedImageData} onClose={handleCloseSlider} />}
			<PatientAvatarModal imageUrl={selectedAvatarUrl} isOpen={isAvatarModalOpen} onClose={handleCloseAvatarModal} />
			{canReadActivity && (
				<QuickNotesModal
					isOpen={isQuickNotesModalOpen}
					onClose={handleCloseQuickNotesModal}
					onSave={handleSaveQuickNotes}
					quickNotesModalMode={quickNotesModalMode}
					quickNoteText={quickNoteText}
					setQuickNoteText={setQuickNoteText}
					quickNotes={quickNotes}
					onDelete={handleDeleteQuickNote}
					onEdit={handleEditQuickNote}
					loading={loading && (quickNotesModalMode === "list" || quickNotesModalMode === "create" || quickNotesModalMode === "edit")}
					currentPage={quickNotesPage}
					onPageChange={handleQuickNotesPageChange}
					totalCount={totalCounts?.quickNotes || 0}
					pageSize={10}
					canCreate={canCreateActivity}
					canUpdate={canUpdateActivity}
					canDelete={canDeleteActivity}
				/>
			)}
		</Layout>
	);
};

export default PatientDetails;
