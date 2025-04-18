import React, { useState, useEffect, useMemo, useRef } from "react";
import {
	Layout,
	Menu, // Keep for potential future use if structure changes, but not primary nav now
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
	Grid, // Keep Grid import
	FloatButton, // Import FloatButton
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
	SearchOutlined,
	PhoneOutlined,
	MailOutlined,
	EnvironmentOutlined,
	UserOutlined,
	EditOutlined, // For quick note-taking
	FilterOutlined, // For filtering records
	DeleteOutlined,
	PushpinOutlined, // Icon for quick notes button
	ClockCircleOutlined, // Icon for the created time
	AudioOutlined, // For the microphone icon
	AudioMutedOutlined,
	FileDoneOutlined,
	DashboardOutlined, // Icon for Overview tab
	ManOutlined, // Example Icon for Gender
	WomanOutlined, // Example Icon for Gender
	InfoCircleOutlined, // Icon for MRN
	WarningOutlined, // Icon for Allergies
} from "@ant-design/icons";
import MiniCreateActivityForm from "./MiniCreateActivityForm"; // Assuming this exists in the same directory
import LabResultDetailsModal from "./LabResultDetailsModal"; // Assuming this exists in the same directory
import ImageSlider from "./ImageSlider"; // Assuming this exists in the same directory
import { useParams } from "react-router-dom";
import { usePatientDetailStore } from "../../services/patientDetail.service"; // Adjust path as needed
import { useLabStore } from "../../services/lab.service"; // Adjust path as needed
import moment from "moment";
import PdfGenerator from "./PdfGenerator"; // Assuming this exists in the same directory
import { useTranslation } from "react-i18next"; // Adjust path as needed
import { useAuthStore } from "../../services/auth.service"; // Adjust path as needed
import WaveSurfer from "wavesurfer.js";

const { Header, Content, Footer } = Layout; // Keep standard Layout
const { TabPane } = Tabs;
const { Text, Title, Paragraph } = Typography;
const { useBreakpoint } = Grid; // Use the useBreakpoint hook

// Helper function to generate valid image URL (Keep as is)
const generateImageUrl = (url) => {
	if (!url) return null;
	const processedUrl = `${
		(url.startsWith("./") ? url.substring(1) : url).startsWith("/")
			? url.startsWith("./")
				? url.substring(1)
				: url
			: "/" + (url.startsWith("./") ? url.substring(1) : url)
	}`;
	return `${processedUrl}`;
};
// Helper function to generate valid document URL (Keep as is)
const generateDocumentUrl = (url) => {
	if (!url) return null;
	const processedUrl = url.startsWith("./") ? url.substring(1) : url;
	return `${processedUrl.startsWith("/") ? processedUrl : "/" + processedUrl}`;
};

// -----------------------------------------------------------------------------
// Reusable Table Component (Keep as is, ensure overflowX is still there)
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
					// border: "1px solid #e8e8e8", // Removed border for cleaner look within tab card
					// borderRadius: "4px", // Removed border radius
					marginBottom: "16px",
					overflowX: "auto", // Keep horizontal scroll for wide tables
				}}
				scroll={{ x: "max-content" }} // Ensures horizontal scroll works reliably
			/>
			<Pagination
				current={currentPage + 1}
				pageSize={10}
				total={totalCount}
				onChange={(page) => onPageChange(page - 1)}
				style={{ marginTop: 15, display: "flex", justifyContent: "center" }}
				showSizeChanger={false} // Simplify pagination
			/>
		</>
	);
};

// -----------------------------------------------------------------------------
// Reusable Detail Modal Component (Keep as is, ensure responsiveness)
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
			bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}>
			<Row gutter={[16, 16]}>{children}</Row>
		</Modal>
	);
};

// -----------------------------------------------------------------------------
// Utility function for rendering Detail (Keep as is)
// -----------------------------------------------------------------------------
const renderDetail = (label, value) => (
	<div style={{ marginBottom: 8 }}>
		<Text strong>{label}: </Text>
		<Text>{value ? value : "N/A"}</Text>
	</div>
);
// -----------------------------------------------------------------------------
// Utility function for rendering notes (Keep as is)
// -----------------------------------------------------------------------------
const renderAssessmentNotes = (notes) => (
	<div dangerouslySetInnerHTML={{ __html: notes }} style={{ backgroundColor: "#f0f0f0", padding: 15, borderRadius: 10 }} />
);
// -----------------------------------------------------------------------------
// Utility function for rendering medication list (Keep as is)
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
// Utility function for rendering image list (Keep as is)
// -----------------------------------------------------------------------------
const renderImagesList = (images) => (
	<ul style={{ paddingLeft: 20 }}>
		{images &&
			images.map((imageUrl, index) => (
				<li key={index}>
					<Text>
						<a href={imageUrl} target="_blank" rel="noopener noreferrer">
							{imageUrl}
						</a>
					</Text>
				</li>
			))}
	</ul>
);
// -----------------------------------------------------------------------------
// Expanded Row Details Component (Keep as is)
// -----------------------------------------------------------------------------
const ExpandedRowDetails = ({ expandedRow, isModalOpen, handleCloseModal }) => {
	const { t } = useTranslation(); // Initialize useTranslation here
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
						{renderDetail(t("appointment-date"), data.appointmentDate ? moment(data.appointmentDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
				</>
			)}
			{type === "Assessment" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(
							t("assessment-date"),
							data.assessmentDateTime ? moment(data.assessmentDateTime).format("YYYY-MM-DD HH:mm") : "N/A"
						)}
					</Col>
					<Col xs={24} sm={24}>
						{renderAssessmentNotes(data.notes)}
					</Col>
				</>
			)}
			{type === "Billing" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(t("billing-date"), data.billDate ? moment(data.billDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>

					<Col xs={24} sm={24}>
						{renderAssessmentNotes(data.bill)}
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
							data.prescriptionDate ? moment(data.prescriptionDate).format("YYYY-MM-DD HH:mm") : "N/A"
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
							data.administrationTime ? moment(data.administrationTime).format("YYYY-MM-DD HH:mm") : "N/A"
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
// Patient Avatar Modal Component (Keep as is, ensure responsiveness)
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
			style={{ maxWidth: screens.xs ? "95vw" : "400px", borderColor: "gold", border: "2px solid" }}
			bodyStyle={{ padding: screens.xs ? "16px" : "24px", textAlign: "center" }}>
			{imageUrl ? (
				<Image src={generateImageUrl(imageUrl)} alt="Patient Profile" style={{ width: "100%", maxWidth: "350px", objectFit: "contain" }} />
			) : (
				<Text>{t("no-image-available")}</Text>
			)}
		</Modal>
	);
};

// Quick Notes Modal - (Keep as is, includes WaveSurfer etc.)
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

	const handleSave = () => {
		onSave();
		// Keep modal open if list mode, close otherwise
		if (quickNotesModalMode !== "list") {
			onClose();
		}
	};

	const startRecording = async () => {
		try {
			setRecordingError(null);
			setIsTranscribing(false);
			setAudioBlobUrl(null); // Clear previous audio
			if (wavesurfer.current.current) {
				wavesurfer.current.current.empty(); // Clear waveform
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
				stream.getTracks().forEach((track) => track.stop()); // Stop stream tracks here
			};

			recorder.onerror = (error) => {
				console.error("Recording error:", error);
				setRecordingError(t("recording-error"));
				notification.error({
					message: t("error"),
					description: t("recording-error"),
				});
				setIsRecording(false);
				stream.getTracks().forEach((track) => track.stop());
				setMediaRecorder(null);
			};

			recorder.start();
		} catch (error) {
			console.error("Error starting recording:", error);
			setRecordingError(t("microphone-access-denied"));
			notification.error({
				message: t("error"),
				description: t("microphone-access-denied"),
			});
			setIsRecording(false);
		}
	};

	const stopRecording = () => {
		if (mediaRecorder && mediaRecorder.state !== "inactive") {
			mediaRecorder.stop();
			// Tracks are stopped in recorder.onstop
			setIsRecording(false);
		}
	};

	const sendAudioToBackend = async (blob) => {
		setIsTranscribing(true);
		const formData = new FormData();
		formData.append("audio", blob, "recording.webm");

		try {
			const response = await fetch("/api/gemini/soundtotext", {
				method: "POST",
				body: formData,
				// Add Authorization header if needed by your backend
				// headers: { Authorization: `Bearer ${useAuthStore.getState().user?.token}` }
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
			notification.error({
				message: t("error"),
				description: t("transcription-failed") + ": " + error.message,
			});
		} finally {
			setIsTranscribing(false);
		}
	};

	useEffect(() => {
		// Initialize WaveSurfer
		if (waveformRef.current && !wavesurfer.current.current) {
			wavesurfer.current.current = WaveSurfer.create({
				container: waveformRef.current,
				waveColor: "violet",
				progressColor: "purple",
				cursorColor: "navy",
				barWidth: 2,
				barGap: 1,
				responsive: true,
				height: 60,
				normalize: true,
			});
		}

		// Cleanup function
		return () => {
			if (wavesurfer.current.current) {
				wavesurfer.current.current.destroy();
				wavesurfer.current.current = null;
			}
			// Stop recording and revoke URL on component unmount
			if (mediaRecorder && mediaRecorder.state !== "inactive") {
				mediaRecorder.stop();
				mediaRecorder.stream.getTracks().forEach((track) => track.stop());
			}
			if (audioBlobUrl) {
				URL.revokeObjectURL(audioBlobUrl);
			}
		};
	}, []); // Empty dependency array ensures this runs only on mount and unmount

	// Reset state when modal opens for create/edit mode
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

	// Determine modal title based on mode
	let modalTitle = t("quick-notes"); // Default for list mode
	if (quickNotesModalMode === "create") modalTitle = t("add-quick-note");
	if (quickNotesModalMode === "edit") modalTitle = t("edit-quick-note");

	return (
		<Modal
			title={modalTitle}
			open={isOpen}
			onCancel={onClose}
			width={quickNotesModalMode === "list" ? (screens.xs ? "95%" : "60%") : screens.xs ? "95%" : "500px"} // Adjusted width for create/edit
			style={{ maxWidth: screens.xs ? "95vw" : quickNotesModalMode === "list" ? "800px" : "500px" }}
			bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}
			footer={
				quickNotesModalMode === "list"
					? [
							// Add footer for list mode to have "Add New Note" button
							<Button key="add" type="primary" onClick={() => onEdit(null)}>
								{t("add-new-note")}
							</Button>,
							<Button key="close" onClick={onClose}>
								{t("close")}
							</Button>,
					  ]
					: [
							<Button key="cancel" onClick={onClose}>
								{t("cancel")}
							</Button>,
							<Button
								key="submit"
								type="primary"
								onClick={handleSave}
								loading={loading || isTranscribing} // Show loading state
								disabled={isRecording || isTranscribing} // Disable while recording/transcribing
							>
								{quickNotesModalMode === "create" ? t("create-note") : t("update-note")}
							</Button>,
					  ]
			}>
			{quickNotesModalMode === "list" ? (
				<List
					itemLayout="horizontal"
					dataSource={sortedQuickNotes}
					loading={loading}
					renderItem={(item) => (
						<List.Item
							actions={[
								<Tooltip title={t("edit")}>
									<Button type="text" icon={<EditOutlined />} onClick={() => onEdit(item)} />
								</Tooltip>,
								<Tooltip title={t("delete")}>
									<Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(item.id)} />
								</Tooltip>,
							]}>
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
				// Create or Edit Mode
				<>
					<Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
						<Space>
							<Tooltip title={isRecording ? t("stop-recording") : t("start-recording")}>
								<Button
									icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
									type={isRecording ? "danger" : "primary"}
									onClick={isRecording ? stopRecording : startRecording}
									disabled={isTranscribing}
									ghost={isRecording} // Make stop button ghost
								/>
							</Tooltip>
							<Tooltip title={t("play-pause-audio")}>
								<Button onClick={playAudio} disabled={!audioBlobUrl || isTranscribing || isRecording}>
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
								height: "60px", // Fixed height for waveform
								display: isRecording || audioBlobUrl ? "block" : "none",
								background: "#f0f0f0", // Background for empty state
								borderRadius: "4px",
							}}></div>
						{isTranscribing && <Spin size="small" style={{ marginLeft: 8 }} />}
					</Space>

					<Input.TextArea
						value={quickNoteText}
						onChange={(e) => setQuickNoteText(e.target.value)}
						placeholder={t("enter-quick-notes")}
						autoSize={{ minRows: 4, maxRows: 8 }}
						disabled={isTranscribing}
					/>
				</>
			)}
		</Modal>
	);
};

// -----------------------------------------------------------------------------
// Patient Details Component - REVISED LAYOUT
// -----------------------------------------------------------------------------
const PatientDetails = () => {
	const { id: patientId } = useParams();
	const { t } = useTranslation();
	const screens = useBreakpoint();
	const isMobile = screens.xs; // Simplified check for mobile layout adjustments

	const {
		fetchPatientData,
		// fetchProcedureLogs, // Now handled by fetchPatientData
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
		// latestVitalSign, // Available if needed for overview tab
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

	// --- State ---
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
	const [quickNotesPage, setQuickNotesPage] = useState(0); // Still needed if overview uses its own pagination
	const [procedureLogsPage, setProcedureLogsPage] = useState(0);

	const [searchTerm, setSearchTerm] = useState(""); // Keep search if backend supports it across fields
	const [activeTab, setActiveTab] = useState("profile"); // Default to profile tab

	// Modal States
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
	const [quickNotesModalMode, setQuickNotesModalMode] = useState("list"); // Default to list view
	const [editingQuickNoteId, setEditingQuickNoteId] = useState(null);
	const [quickNoteText, setQuickNoteText] = useState("");

	// Other States
	const [activityCreated, setActivityCreated] = useState(false); // To trigger refetch after creation
	const { fetchLabTests, labTests } = useLabStore();
	const { user: loggedInUser } = useAuthStore();

	// --- Responsive Helpers ---
	const getResponsivePadding = (defaultValue = "24px") => {
		if (screens.xs) return "12px";
		if (screens.sm) return "16px";
		return defaultValue;
	};

	const getResponsiveMargin = () => {
		if (screens.xs) return "8px";
		if (screens.sm) return "12px";
		return "16px"; // Reduced default margin
	};

	// --- Modal Handlers ---
	const handleOpenServiceModal = () => setIsServiceModalOpen(true);
	const handleCloseServiceModal = () => setIsServiceModalOpen(false);
	const handleActivityCreated = () => setActivityCreated((prev) => !prev); // Trigger refetch
	const handleOpenLabResultModal = (labResult) => {
		setSelectedLabResult(labResult);
		setIsLabResultModalOpen(true);
	};
	const handleCloseLabResultModal = () => {
		setIsLabResultModalOpen(false);
		setSelectedLabResult(null);
	};
	const handleOpenSlider = (imageReport) => {
		// Ensure imageUrls are processed before opening
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

	// Quick Notes Modal Handlers
	const handleOpenQuickNotesModal = (mode = "list", note = null) => {
		setQuickNotesModalMode(mode);
		if (mode === "edit" && note) {
			setEditingQuickNoteId(note.id);
			setQuickNoteText(note.noteText);
		} else if (mode === "create") {
			setEditingQuickNoteId(null);
			setQuickNoteText("");
		}
		// Fetch notes if opening list view and they might be stale
		if (mode === "list" && !quickNotes.length) {
			// Example condition
			fetchQuickNotes(patientId, 1, 10);
		}
		setIsQuickNotesModalOpen(true);
	};
	const handleCloseQuickNotesModal = () => {
		setIsQuickNotesModalOpen(false);
		// Reset state, important for WaveSurfer cleanup potentially
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
			// After save, switch back to list mode within the modal if desired, or close
			// Let's switch back to list mode to see the update/creation
			setQuickNotesModalMode("list");
			// No need to close here, handleCloseQuickNotesModal handles closing
		} catch (error) {
			// Error handled in store
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
					// Stay in list mode
					setQuickNotesModalMode("list");
				} catch (error) {
					// Error handled in store
				}
			},
		});
	};
	const handleEditQuickNote = (quickNote) => {
		// This function is called by the Edit button in the list view
		if (quickNote) {
			// Editing existing
			handleOpenQuickNotesModal("edit", quickNote);
		} else {
			// Adding new (called from "Add New Note" button in list footer)
			handleOpenQuickNotesModal("create");
		}
	};

	// --- Data Fetching ---
	useEffect(() => {
		// Fetch lab tests once on mount
		fetchLabTests();
	}, [fetchLabTests]);

	useEffect(() => {
		// Fetch initial patient data when ID changes
		if (patientId) {
			// Fetch patient details + data for the *initially active tab* (Profile/Overview don't need initial fetch like this)
			// Let's fetch patient + admissions initially as an example, or adjust as needed
			// The store's fetchPatientData fetches the patient regardless
			fetchPatientData(patientId, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10);
			// Fetch quick notes initially for the overview tab/modal
			fetchQuickNotes(patientId, 1, 10);
		}
	}, [patientId, fetchPatientData, fetchQuickNotes]); // Removed activityCreated from initial fetch

	// Generic fetch function adapted for tab-based loading
	const fetchPaginatedDataForTab = async (dataType, pageState) => {
		if (!patientId) return;
		const pageNum = pageState + 1; // API uses 1-based usually, state is 0-based

		// Map dataType to the correct page argument position in fetchPatientData
		const pageArgs = {
			admissions: admissionsPage,
			appointments: appointmentsPage,
			assessments: assessmentsPage,
			billings: billingsPage,
			carePlans: carePlansPage,
			prescriptions: prescriptionsPage,
			vitalSigns: vitalSignsPage,
			productUsages: productUsagesPage,
			medicationAdministrations: medicationAdministrationsPage,
			imageReports: imageReportsPage,
			labResults: labResultsPage,
			documents: documentsPage,
			quickNotes: quickNotesPage, // Keep if needed for separate pagination
			procedureLogs: procedureLogsPage,
		};

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
				dataType === "quickNotes" ? pageNum : 0, // Keep if paginating notes separately
				dataType === "procedureLogs" ? pageNum : 0,
				10 // pageSize
			);
		} catch (error) {
			console.error(`Error fetching ${dataType}:`, error.message);
			// Notification handled in store
		}
	};

	// useEffect hooks for specific tabs (triggered by tab change, page change, filter change, activity creation)
	useEffect(() => {
		if (activeTab === "3" && patientId) fetchPaginatedDataForTab("admissions", admissionsPage);
	}, [activeTab, patientId, admissionsPage, activityCreated, searchTerm]); // Filter not applicable to admissions

	useEffect(() => {
		if (activeTab === "4" && patientId) fetchPaginatedDataForTab("appointments", appointmentsPage);
	}, [activeTab, patientId, appointmentsPage, filters.appointments, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "5" && patientId) fetchPaginatedDataForTab("assessments", assessmentsPage);
	}, [activeTab, patientId, assessmentsPage, filters.assessments, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "6" && patientId) fetchPaginatedDataForTab("billings", billingsPage);
	}, [activeTab, patientId, billingsPage, filters.billings, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "7" && patientId) fetchPaginatedDataForTab("carePlans", carePlansPage);
	}, [activeTab, patientId, carePlansPage, filters.carePlans, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "8" && patientId) fetchPaginatedDataForTab("prescriptions", prescriptionsPage);
	}, [activeTab, patientId, prescriptionsPage, filters.prescriptions, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "9" && patientId) fetchPaginatedDataForTab("vitalSigns", vitalSignsPage);
	}, [activeTab, patientId, vitalSignsPage, filters.vitalSigns, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "10" && patientId) fetchPaginatedDataForTab("productUsages", productUsagesPage);
	}, [activeTab, patientId, productUsagesPage, filters.productUsages, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "11" && patientId) fetchPaginatedDataForTab("medicationAdministrations", medicationAdministrationsPage);
	}, [activeTab, patientId, medicationAdministrationsPage, filters.medicationAdministrations, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "12" && patientId) fetchPaginatedDataForTab("imageReports", imageReportsPage);
	}, [activeTab, patientId, imageReportsPage, filters.imageReports, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "13" && patientId) fetchPaginatedDataForTab("labResults", labResultsPage);
	}, [activeTab, patientId, labResultsPage, filters.labResults, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "14" && patientId) fetchPaginatedDataForTab("documents", documentsPage);
	}, [activeTab, patientId, documentsPage, filters.documents, activityCreated, searchTerm]);

	useEffect(() => {
		if (activeTab === "15" && patientId) fetchPaginatedDataForTab("procedureLogs", procedureLogsPage);
	}, [activeTab, patientId, procedureLogsPage, filters.procedureLogs, activityCreated, searchTerm]);

	// Note: Quick Notes fetching might be handled primarily by the modal logic now.
	// If you need the main list populated for the Overview tab, trigger fetchQuickNotes here based on activeTab === 'overview'
	// useEffect(() => {
	// 	if (activeTab === 'overview' && patientId) fetchQuickNotes(patientId, 1, 10); // Fetch first page for overview
	// }, [activeTab, patientId, fetchQuickNotes]);

	const handleTabChange = (key) => {
		setActiveTab(key);
		// Reset page numbers when switching tabs? Optional, could be annoying.
		// Let's not reset pages on tab switch for now.
	};

	// --- Column Definitions (Memoized and Responsive) ---

	const commonActionColumn = (type, pdfType, pdfPrefix, recordProcessor = (r) => r) => ({
		title: t("actions"),
		key: "actions",
		fixed: isMobile ? false : "right", // Fix actions column on desktop
		width: isMobile ? 110 : 130, // Adjust width as needed
		render: (text, record) => (
			<Space size={isMobile ? "small" : "middle"} wrap={isMobile}>
				<Tooltip title={t("view-details")}>
					<Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => handleOpenDetailModal(record, type)} />
				</Tooltip>
				<Tooltip title={t("export-pdf")}>
					<PdfGenerator type={pdfType} mode="single" data={recordProcessor(record)} fileNamePrefix={pdfPrefix} labTests={labTests}>
						<Button size="small" type="default" icon={<DownloadOutlined />} />
					</PdfGenerator>
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
		const actionsCol = commonActionColumn("Admission", "admission", "admission");

		return isMobile
			? [baseColumns[0], actionsCol] // Show Date + Actions on mobile
			: [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]); // Added t and handler dependencies

	const appointmentsColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("appointment-date"),
				dataIndex: "appointmentDate",
				key: "appointmentDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			// Add other relevant columns if available, e.g., Doctor, Status
		];
		const actionsCol = commonActionColumn("Appointment", "appointment", "appointment");

		return isMobile ? [baseColumns[0], actionsCol] : [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

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
				ellipsis: true, // Add ellipsis for long notes
				render: (text) => <div dangerouslySetInnerHTML={{ __html: text?.substring(0, 100) + (text?.length > 100 ? "..." : "") }} />, // Show preview
			},
		];
		const actionsCol = commonActionColumn("Assessment", "assessment", "assessment");

		return isMobile ? [baseColumns[0], actionsCol] : [baseColumns[0], baseColumns[1], actionsCol]; // Show Date, Notes Preview, Actions on desktop
	}, [isMobile, t, handleOpenDetailModal]);

	const billingColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("billing-date"),
				dataIndex: "billDate",
				key: "billingDate",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			{ title: t("description"), dataIndex: "description", key: "description", ellipsis: true }, // Assuming description exists
			{ title: t("amount"), dataIndex: "amount", key: "amount", width: 100, render: (text) => (text ? `$${text.toFixed(2)}` : "N/A") }, // Assuming amount exists
		];
		const actionsCol = commonActionColumn("Billing", "billing", "billing");

		return isMobile
			? [baseColumns[0], baseColumns[2] ?? null, actionsCol].filter(Boolean) // Date, Amount (if exists), Actions
			: [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

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
		const actionsCol = commonActionColumn("Care Plan", "carePlan", "care_plan");

		return isMobile ? [baseColumns[0], actionsCol] : [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

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
				render: (text, record) => {
					const medications = record?.prescribedMedications ?? [];
					return medications.length > 0
						? medications.map((m) => m.medicationName).join(", ") // Simple preview
						: t("no-medications-prescribed");
				},
			},
		];
		const actionsCol = commonActionColumn("Prescription", "prescription", "prescription");

		return isMobile ? [baseColumns[0], actionsCol] : [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

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
		const actionsCol = commonActionColumn("Vital Sign", "vitalSign", "vital_sign");

		return isMobile
			? [baseColumns[0], baseColumns[3], actionsCol] // Date, BP, Actions
			: [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

	const productUsagesColumns = useMemo(() => {
		const baseColumns = [
			{
				title: t("start-time"),
				dataIndex: "startTime",
				key: "startTime",
				width: 160,
				render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
			},
			// { title: t("end-time"), dataIndex: "endTime", key: "endTime", width: 160, render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A") }, // Often same as start or less critical
			{ title: t("product-name"), dataIndex: "productName", key: "productName", ellipsis: true },
			{ title: t("qty"), dataIndex: "quantity", key: "quantity", width: 60 },
			{ title: t("price"), dataIndex: "price", key: "price", width: 80, render: (text) => (text ? `$${text.toFixed(2)}` : "N/A") },
		];
		const actionsCol = commonActionColumn("Product Usage", "productUsage", "product_usage");

		return isMobile
			? [baseColumns[0], baseColumns[1], actionsCol] // Date, Product, Actions
			: [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

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
			// { title: t("calc-price"), dataIndex: "calculatedPrice", key: "calculatedPrice", width: 100, render: (text) => text ? `$${text.toFixed(2)}` : 'N/A' },
		];
		const actionsCol = commonActionColumn("Medication Administration", "medicationAdministration", "med_admin");

		return isMobile
			? [baseColumns[0], baseColumns[1], actionsCol] // Time, Med Name, Actions
			: [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

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
			// { title: t("report-text"), dataIndex: "reportText", key: "reportText", ellipsis: true },
			{
				title: t("images"),
				key: "images",
				width: 100,
				render: (text, record) => {
					if (!record.imageUrls || record.imageUrls.length === 0) {
						return <Text type="secondary">{t("no-images")}</Text>;
					}
					return (
						<Tooltip title={t("view-images")}>
							<Button size="small" type="dashed" icon={<PictureOutlined />} onClick={() => handleOpenSlider(record)} />
						</Tooltip>
					);
				},
			},
		];
		// Modify action column processor to handle image URLs
		const actionsCol = commonActionColumn("Image Report", "imageReport", "image_report", (record) => ({
			...record,
			imageUrls: record.imageUrls?.map(generateImageUrl) || [],
		}));

		return isMobile
			? [baseColumns[0], baseColumns[1], actionsCol] // Date, Type, Actions
			: [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal, handleOpenSlider]); // Added handleOpenSlider dependency

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
		// Custom Actions Column for Lab Results (Uses different modal)
		const actionsCol = {
			title: t("actions"),
			key: "actions",
			fixed: isMobile ? false : "right",
			width: isMobile ? 110 : 130,
			render: (text, record) => {
				const labTestDetails = labTests.find((test) => test.id === record.labTestId);
				return (
					<Space size={isMobile ? "small" : "middle"} wrap={isMobile}>
						<Tooltip title={t("view-details")}>
							<Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => handleOpenLabResultModal(record)} />
						</Tooltip>
						<Tooltip title={t("export-pdf")}>
							<PdfGenerator
								type="labResult"
								mode="single"
								data={{ ...record, labTestDetails: labTestDetails }}
								fileNamePrefix="lab_result"
								labTests={labTests}>
								<Button size="small" type="default" icon={<DownloadOutlined />} />
							</PdfGenerator>
						</Tooltip>
					</Space>
				);
			},
		};

		return isMobile
			? [baseColumns[0], baseColumns[1], actionsCol] // Date, Test Name, Actions
			: [...baseColumns, actionsCol];
	}, [isMobile, t, labTests, handleOpenLabResultModal]); // Added labTests and handler dependencies

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
		// Custom Actions for Documents (Download only)
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
							fetch(downloadUrl) // Assuming relative path works from frontend host or CORS is set up
								.then((response) => {
									if (!response.ok) {
										throw new Error(`Failed to fetch file: ${response.statusText}`);
									}
									return response.blob();
								})
								.then((blob) => {
									const url = window.URL.createObjectURL(blob);
									const link = document.createElement("a");
									link.href = url;
									// Extract filename from path or use documentName
									const filename = record.documentPath?.split("/").pop() || record.documentName || "downloaded_file";
									link.download = filename;
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
						{!isMobile && t("download")} {/* Show text only on desktop */}
					</Button>
				</Tooltip>
			),
		};

		return isMobile
			? [baseColumns[0], actionsCol] // Name, Actions
			: [...baseColumns, actionsCol];
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
		const actionsCol = commonActionColumn("Procedure Log", "procedureLog", "procedure_log");

		return isMobile
			? [baseColumns[0], baseColumns[1], actionsCol] // Time, Name, Actions
			: [...baseColumns, actionsCol];
	}, [isMobile, t, handleOpenDetailModal]);

	// Handle search (Placeholder - Adapt based on backend capability)
	const handleSearch = (value) => {
		console.log("Search triggered (implement backend search):", value);
		setSearchTerm(value);
		// Resetting pages on search might be desired
		setActiveTab("profile"); // Go back to profile after search? Or stay? TBD.
		// setAdmissionsPage(0); ... reset all pages
	};

	// Handle filter toggle
	const handleFilterToggle = (dataType) => {
		toggleFilter(dataType);
		// Reset pagination for the specific tab when its filter changes
		switch (dataType) {
			case "appointments":
				setAppointmentsPage(0);
				break;
			case "assessments":
				setAssessmentsPage(0);
				break;
			case "billings":
				setBillingsPage(0);
				break;
			case "carePlans":
				setCarePlansPage(0);
				break;
			case "prescriptions":
				setPrescriptionsPage(0);
				break;
			case "vitalSigns":
				setVitalSignsPage(0);
				break;
			case "productUsages":
				setProductUsagesPage(0);
				break;
			case "medicationAdministrations":
				setMedicationAdministrationsPage(0);
				break;
			case "imageReports":
				setImageReportsPage(0);
				break;
			case "labResults":
				setLabResultsPage(0);
				break;
			case "documents":
				setDocumentsPage(0);
				break;
			case "procedureLogs":
				setProcedureLogsPage(0);
				break;
			default:
				break;
		}
	};

	// --- Render ---
	return (
		<Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
			{" "}
			{/* Light background */}
			{/* Main Page Header - For global actions */}
			<Header
				style={{
					padding: `0 ${getResponsivePadding()}`,
					background: "#fff",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					borderBottom: "1px solid #f0f0f0",
					height: 56, // Slightly smaller header
				}}>
				<Title level={4} style={{ margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
					{t("patient-details")}
				</Title>
				<Space>
					{/* Search Input - Optional */}
					{/* <Input.Search
						placeholder={t("search-records")}
						onSearch={handleSearch}
						style={{ width: 200 }}
						allowClear
					/> */}
					<Tooltip title={t("add-service")}>
						<Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={handleOpenServiceModal} />
					</Tooltip>
					{!loading && patient && (
						<Tooltip title={t("generate-patient-file-pdf")}>
							<PdfGenerator
								mode="patientFile"
								data={patient}
								labTests={labTests}
								fileNamePrefix={`patient_${patient?.lastName || "file"}`}>
								<Button type="default" shape="circle" icon={<DownloadOutlined />} />
							</PdfGenerator>
						</Tooltip>
					)}
				</Space>
			</Header>
			<Content style={{ margin: `${getResponsiveMargin()} ${getResponsivePadding()}` }}>
				{loading && !patient && <Spin tip={t("loading-patient-details")} style={{ display: "block", marginTop: 50 }} />}

				{/* Compact Patient Header - Sticky */}
				{patient && (
					<div
						style={{
							padding: getResponsivePadding(),
							background: "#fff",
							border: "1px solid #e8e8e8", // Use border instead of shadow for subtlety
							borderRadius: "8px",
							marginBottom: getResponsiveMargin(),
							position: "sticky", // Make header sticky
							top: 0, // Stick to top (adjust if main header has different height)
							zIndex: 10, // Ensure it's above scrolling content
						}}>
						<Row gutter={[16, 16]} align="middle">
							{/* Avatar Column */}
							<Col xs={24} sm={4} md={3} style={{ textAlign: isMobile ? "center" : "left" }}>
								<Avatar
									size={isMobile ? 64 : 80}
									src={generateImageUrl(patient.profilePictureURL)}
									alt={`${patient.firstName} ${patient.lastName}`}
									icon={<UserOutlined />} // Fallback icon
									style={{
										cursor: "pointer",
										border: "2px solid #eee",
									}}
									onClick={() => handleOpenAvatarModal(patient.profilePictureURL)}
								/>
							</Col>

							{/* Info Column */}
							<Col xs={24} sm={20} md={21}>
								<Row gutter={[16, isMobile ? 8 : 12]}>
									{/* Name */}
									<Col xs={24} md={12} lg={8}>
										<Title level={5} style={{ marginBottom: 0 }}>
											{patient.firstName} {patient.lastName}
										</Title>
									</Col>
									{/* MRN */}
									<Col xs={12} md={6} lg={4}>
										<Text type="secondary">
											<InfoCircleOutlined style={{ marginRight: 4 }} />
											{t("mrn")}:
										</Text>{" "}
										<Text strong>{patient.medicalRecordNumber}</Text>
									</Col>
									{/* Age & DOB */}
									<Col xs={12} md={6} lg={4}>
										<Text type="secondary">
											<UserOutlined style={{ marginRight: 4 }} />
											{t("age")}:
										</Text>{" "}
										<Text strong>{moment().diff(patient.dateOfBirth, "years")}</Text>
										{!isMobile && <Text style={{ marginLeft: 8 }}>({moment(patient.dateOfBirth).format("YYYY-MM-DD")})</Text>}
									</Col>
									{/* Gender */}
									<Col xs={12} md={6} lg={4}>
										<Text type="secondary">
											{patient.gender === "Male" ? (
												<ManOutlined style={{ marginRight: 4 }} />
											) : (
												<WomanOutlined style={{ marginRight: 4 }} />
											)}{" "}
											{t("gender")}:
										</Text>{" "}
										<Text strong>{patient.gender}</Text>
									</Col>
									{/* Allergies */}
									<Col xs={12} md={6} lg={4}>
										<Text type="secondary">
											<WarningOutlined style={{ marginRight: 4 }} />
											{t("allergies")}:
										</Text>{" "}
										<Tag color="red" style={{ margin: 0 }}>
											{patient.allergies || t("none")}
										</Tag>
									</Col>

									{/* Quick Stats Integrated - Example: Last Visit & Next Appt */}
									{admissions && admissions.length > 0 && !admissions[0].dischargeDate && (
										<Col xs={12} md={6} lg={4}>
											<Statistic
												title={<Text type="secondary">{t("current-visit")}</Text>}
												value={moment(admissions[0].admissionDate).format("ll")} // Short format
												valueStyle={{ fontSize: isMobile ? 14 : 16, color: "#3f8600" }}
												prefix={<CalendarOutlined />}
												style={{ lineHeight: 1.2 }} // Reduce line height
											/>
										</Col>
									)}
									{/* Consider adding Next Appointment here if important */}
									{/* <Col xs={12} md={6} lg={4}>
										 <Statistic title={t("next-appointment")} ... />
									 </Col> */}
								</Row>
							</Col>
						</Row>
					</div>
				)}

				{/* Tabs Section */}
				{patient && (
					<Card
						className="patient-details-tabs" // Class for CSS targeting
						bordered={false} // Remove card border, rely on page background
						bodyStyle={{ padding: `0 ${getResponsivePadding()}` }} // No padding around tabs themselves
					>
						<Tabs
							activeKey={activeTab}
							onChange={handleTabChange}
							type="card" // Card style tabs
							size={isMobile ? "small" : "default"}
							tabBarStyle={{ marginBottom: getResponsivePadding("16px") }} // Space below tab bar
						>
							{/* --- Profile Tab --- */}
							<TabPane
								tab={
									<span>
										<UserOutlined /> {t("profile")}
									</span>
								}
								key="profile">
								<Row gutter={[24, 16]} style={{ padding: `${getResponsivePadding()} 0` }}>
									{" "}
									{/* Padding inside tab content */}
									{/* Contact Information */}
									<Col xs={24} md={12} lg={8}>
										<Title level={5} style={{ marginBottom: 12 }}>
											{t("contact-information")}
										</Title>
										<Space direction="vertical" size="small">
											<Text>
												<EnvironmentOutlined style={{ marginRight: 8, color: "#1890ff" }} /> {patient.address || "N/A"}
											</Text>
											<Text>
												<PhoneOutlined style={{ marginRight: 8, color: "#1890ff" }} /> {patient.phoneNumber || "N/A"}
											</Text>
											<Text>
												<MailOutlined style={{ marginRight: 8, color: "#1890ff" }} /> {patient.email || "N/A"}
											</Text>
										</Space>
									</Col>
									{/* Medical Information */}
									<Col xs={24} md={12} lg={8}>
										<Title level={5} style={{ marginBottom: 12 }}>
											{t("medical-information")}
										</Title>
										<Space direction="vertical" size="small">
											<Text>
												<HeartOutlined style={{ marginRight: 8, color: "#cf1322" }} /> {t("blood-type")}:{" "}
												<Text strong>{patient.bloodType || "N/A"}</Text>
											</Text>
											<div>
												<Text strong>{t("medical-history")}:</Text>
												<Paragraph ellipsis={{ rows: 3, expandable: true, symbol: t("more") }}>
													{patient.medicalHistory || "N/A"}
												</Paragraph>
											</div>
										</Space>
									</Col>
									{/* Quick Stats (If Option B chosen) */}
									<Col xs={24} md={24} lg={8}>
										<Title level={5} style={{ marginBottom: 12 }}>
											{t("vital-stats")}
										</Title>
										<Row gutter={[16, 16]}>
											{/* Example: Placing stats here */}
											<Col xs={12} sm={12}>
												<Statistic
													title={t("age")}
													value={moment().diff(patient.dateOfBirth, "years")}
													prefix={<UserOutlined />}
												/>
											</Col>
											<Col xs={12} sm={12}>
												{admissions && admissions.length > 0 && admissions[0].dischargeDate ? (
													<Statistic
														title={t("last-visit")}
														value={moment(admissions[0].dischargeDate).fromNow()}
														valueStyle={{ color: "#52c41a" }}
														prefix={<CalendarOutlined />}
													/>
												) : !loading ? ( // Show N/A only if not loading
													<Statistic title={t("last-visit")} value={"N/A"} prefix={<CalendarOutlined />} />
												) : null}
											</Col>
										</Row>
									</Col>
								</Row>
							</TabPane>

							{/* --- Overview Tab --- */}
							<TabPane
								tab={
									<span>
										<DashboardOutlined /> {t("overview")}
									</span>
								}
								key="overview">
								<div style={{ padding: `${getResponsivePadding()} 0` }}>
									<Title level={5} style={{ marginBottom: 12 }}>
										{t("recent-quick-notes")}
									</Title>
									<List
										itemLayout="horizontal"
										dataSource={quickNotes.slice(0, 5)} // Show latest 5 notes
										loading={loading && quickNotes.length === 0} // Show loading only if notes aren't loaded yet
										renderItem={(item) => (
											<List.Item
												actions={[
													<Button type="link" size="small" onClick={() => handleEditQuickNote(item)}>
														{t("edit")}
													</Button>,
												]}>
												<List.Item.Meta
													avatar={<Avatar size="small" icon={<PushpinOutlined />} />}
													title={
														<span>
															{item.addedByUser || t("system")} - {moment(item.createdAt).format("YYYY-MM-DD HH:mm")}
														</span>
													}
													description={
														<Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
															{item.noteText}
														</Paragraph>
													}
												/>
											</List.Item>
										)}
									/>
									{quickNotes.length > 5 && (
										<Button type="link" onClick={() => handleOpenQuickNotesModal("list")} style={{ marginTop: 8 }}>
											{t("view-all-quick-notes")}
										</Button>
									)}
									{quickNotes.length === 0 && !loading && <Text type="secondary">{t("no-quick-notes-available")}</Text>}
									{/* Add other overview elements here - e.g., latest vitals graph, upcoming appts */}
								</div>
							</TabPane>

							{/* --- Data Tabs --- */}
							<TabPane
								tab={
									<span>
										<ProfileOutlined />
										{t("admissions")}
									</span>
								}
								key="3">
								<PaginatedTable
									columns={admissionsColumns}
									data={admissions}
									loading={loading && activeTab === "3"}
									currentPage={admissionsPage}
									onPageChange={setAdmissionsPage}
									totalCount={totalCounts?.admissions || 0}
								/>
								{/* Add Table PDF Export if needed */}
								{/* <PdfGenerator mode="table" type="admission" data={admissions} columns={admissionsColumns} fileNamePrefix="admissions">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator> */}
							</TabPane>
							<TabPane
								tab={
									<span>
										<CalendarOutlined /> {t("appointments")}
										<Tooltip title={filters.appointments ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.appointments}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("appointments")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="4">
								<PaginatedTable
									columns={appointmentsColumns}
									data={appointments}
									loading={loading && activeTab === "4"}
									currentPage={appointmentsPage}
									onPageChange={setAppointmentsPage}
									totalCount={totalCounts?.appointments || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileTextOutlined /> {t("assessments")}
										<Tooltip title={filters.assessments ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.assessments}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("assessments")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="5">
								<PaginatedTable
									columns={assessmentsColumns}
									data={assessments}
									loading={loading && activeTab === "5"}
									currentPage={assessmentsPage}
									onPageChange={setAssessmentsPage}
									totalCount={totalCounts?.assessments || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<DollarOutlined /> {t("billings")}
										<Tooltip title={filters.billings ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.billings}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("billings")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="6">
								<PaginatedTable
									columns={billingColumns}
									data={billings}
									loading={loading && activeTab === "6"}
									currentPage={billingsPage}
									onPageChange={setBillingsPage}
									totalCount={totalCounts?.billings || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<UnorderedListOutlined /> {t("care-plans")}
										<Tooltip title={filters.carePlans ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.carePlans}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("carePlans")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="7">
								<PaginatedTable
									columns={carePlansColumns}
									data={carePlans}
									loading={loading && activeTab === "7"}
									currentPage={carePlansPage}
									onPageChange={setCarePlansPage}
									totalCount={totalCounts?.carePlans || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<MedicineBoxOutlined /> {t("prescriptions")}
										<Tooltip title={filters.prescriptions ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.prescriptions}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("prescriptions")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="8">
								<PaginatedTable
									columns={prescriptionsColumns}
									data={prescriptions}
									loading={loading && activeTab === "8"}
									currentPage={prescriptionsPage}
									onPageChange={setPrescriptionsPage}
									totalCount={totalCounts?.prescriptions || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<HeartOutlined /> {t("vital-signs")}
										<Tooltip title={filters.vitalSigns ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.vitalSigns}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("vitalSigns")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="9">
								<PaginatedTable
									columns={vitalSignsColumns}
									data={vitalSigns}
									loading={loading && activeTab === "9"}
									currentPage={vitalSignsPage}
									onPageChange={setVitalSignsPage}
									totalCount={totalCounts?.vitalSigns || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<ShoppingCartOutlined /> {t("product-usages")}
										<Tooltip title={filters.productUsages ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.productUsages}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("productUsages")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="10">
								<PaginatedTable
									columns={productUsagesColumns}
									data={productUsages}
									loading={loading && activeTab === "10"}
									currentPage={productUsagesPage}
									onPageChange={setProductUsagesPage}
									totalCount={totalCounts?.productUsages || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<MedicineBoxOutlined /> {t("med-admin")} {/* Shortened Name */}
										<Tooltip title={filters.medicationAdministrations ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.medicationAdministrations}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("medicationAdministrations")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="11">
								<PaginatedTable
									columns={medicationAdministrationsColumns}
									data={medicationAdministrations}
									loading={loading && activeTab === "11"}
									currentPage={medicationAdministrationsPage}
									onPageChange={setMedicationAdministrationsPage}
									totalCount={totalCounts?.medicationAdministrations || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<PictureOutlined /> {t("image-reports")}
										<Tooltip title={filters.imageReports ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.imageReports}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("imageReports")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="12">
								<PaginatedTable
									columns={imageReportsColumns}
									data={imageReports}
									loading={loading && activeTab === "12"}
									currentPage={imageReportsPage}
									onPageChange={setImageReportsPage}
									totalCount={totalCounts?.imageReports || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<ExperimentOutlined /> {t("lab-results")}
										<Tooltip title={filters.labResults ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.labResults}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("labResults")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="13">
								<PaginatedTable
									columns={labResultsColumns}
									data={labResults}
									loading={loading && activeTab === "13"}
									currentPage={labResultsPage}
									onPageChange={setLabResultsPage}
									totalCount={totalCounts?.labResults || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileTextOutlined /> {t("documents")}
										<Tooltip title={filters.documents ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.documents}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("documents")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="14">
								<PaginatedTable
									columns={documentsColumns}
									data={documents}
									loading={loading && activeTab === "14"}
									currentPage={documentsPage}
									onPageChange={setDocumentsPage}
									totalCount={totalCounts?.documents || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileDoneOutlined /> {t("procedure-logs")}
										<Tooltip title={filters.procedureLogs ? t("show-all") : t("filter-by-admission")}>
											<Button
												type="text"
												size="small"
												danger={filters.procedureLogs}
												icon={<FilterOutlined />}
												onClick={() => handleFilterToggle("procedureLogs")}
												style={{ marginLeft: 4, padding: "0 4px" }}
											/>
										</Tooltip>
									</span>
								}
								key="15">
								<PaginatedTable
									columns={procedureLogsColumns}
									data={procedureLogs}
									loading={loading && activeTab === "15"}
									currentPage={procedureLogsPage}
									onPageChange={setProcedureLogsPage}
									totalCount={totalCounts?.procedureLogs || 0}
								/>
							</TabPane>
						</Tabs>
					</Card>
				)}

				{!patient && !loading && (
					<Card style={{ textAlign: "center", padding: 50 }}>
						<Text type="secondary">{t("patient-not-found")}</Text>
					</Card>
				)}
			</Content>
			{/* Footer (Optional) */}
			{/* <Footer style={{ textAlign: "center", padding: getResponsivePadding("12px") }}>
				Patient Record System ©{new Date().getFullYear()}
			</Footer> */}
			{/* --- Floating Action Buttons --- */}
			<FloatButton.Group shape="circle" style={{ right: isMobile ? 16 : 24, bottom: isMobile ? 60 : 24 }}>
				<Tooltip title={t("quick-notes")}>
					<FloatButton icon={<PushpinOutlined />} onClick={() => handleOpenQuickNotesModal("list")} />
				</Tooltip>
				<FloatButton.BackTop visibilityHeight={100} />
			</FloatButton.Group>
			{/* --- Modals --- */}
			<Modal
				title={t("request-service")}
				open={isServiceModalOpen}
				onCancel={handleCloseServiceModal}
				footer={null}
				width={screens.xs ? "95%" : "90%"}
				style={{ maxWidth: screens.xs ? "95vw" : "600px" }}
				bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}>
				{/* Ensure MiniCreateActivityForm is adaptable */}
				<MiniCreateActivityForm onActivityCreated={handleActivityCreated} patientId={patientId} />
			</Modal>
			{/* Detail Modal */}
			<ExpandedRowDetails
				// t={t} // Already has its own t
				expandedRow={expandedRow}
				isModalOpen={isDetailModalOpen}
				handleCloseModal={handleCloseDetailModal}
			/>
			{/* Lab Result Details Modal */}
			<LabResultDetailsModal
				// t={t} // Already has its own t
				isOpen={isLabResultModalOpen}
				onClose={handleCloseLabResultModal}
				labResult={selectedLabResult}
				labTests={labTests}
				// width={screens.xs ? "95%" : "90%"} // Handled inside component potentially
				// bodyStyle={{ padding: screens.xs ? "16px" : "24px" }} // Handled inside component potentially
			/>
			{/* Image Slider Modal */}
			{isSliderOpen && selectedImageData && (
				<ImageSlider
					// t={t} // Already has its own t
					open={isSliderOpen}
					data={selectedImageData}
					onClose={handleCloseSlider}
				/>
			)}
			{/* Patient Avatar Modal */}
			<PatientAvatarModal
				// t={t} // Already has its own t
				imageUrl={selectedAvatarUrl}
				isOpen={isAvatarModalOpen}
				onClose={handleCloseAvatarModal}
			/>
			{/* Quick Notes Modal */}
			<QuickNotesModal
				// t={t} // Already has its own t
				isOpen={isQuickNotesModalOpen}
				onClose={handleCloseQuickNotesModal}
				onSave={handleSaveQuickNotes}
				quickNotesModalMode={quickNotesModalMode}
				quickNoteText={quickNoteText}
				setQuickNoteText={setQuickNoteText}
				quickNotes={quickNotes}
				onDelete={handleDeleteQuickNote}
				onEdit={handleEditQuickNote} // Pass the function to handle switching to edit/create mode
				loading={loading && quickNotesModalMode === "list"} // Show loading only in list mode potentially
			/>
		</Layout>
	);
};

export default PatientDetails;
