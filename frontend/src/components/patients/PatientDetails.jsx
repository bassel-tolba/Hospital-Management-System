// PatientDetails.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
	Layout,
	Menu,
	Breadcrumb,
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
	Grid, // Import Grid
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
} from "@ant-design/icons";
import MiniCreateActivityForm from "./MiniCreateActivityForm";
import LabResultDetailsModal from "./LabResultDetailsModal";
import ImageSlider from "./ImageSlider";
import { useParams } from "react-router-dom";
import { usePatientDetailStore } from "../../services/patientDetail.service";
import { useLabStore } from "../../services/lab.service"; // Import useLabStore
import moment from "moment";
import PdfGenerator from "./PdfGenerator"; // Import the new component
import { useTranslation } from "react-i18next"; // Import
import { useAuthStore } from "../../services/auth.service";
import WaveSurfer from "wavesurfer.js";
const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid; // Use the useBreakpoint hook

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

	return `${processedUrl}`;
};
const generateDocumentUrl = (url) => {
	if (!url) return null;
	const processedUrl = url.startsWith("./") ? url.substring(1) : url;
	return `${processedUrl.startsWith("/") ? processedUrl : "/" + processedUrl}`;
};

// -----------------------------------------------------------------------------
// Reusable Table Component
// -----------------------------------------------------------------------------
const PaginatedTable = ({ columns, data, loading, currentPage, onPageChange, totalCount }) => {
	const { t } = useTranslation();
	return (
		<>
			<Table
				columns={columns}
				dataSource={data}
				loading={loading}
				pagination={false}
				rowKey="id"
				style={{
					border: "1px solid #e8e8e8",
					borderRadius: "4px",
					marginBottom: "16px",
					overflowX: "auto",
				}}
			/>
			<Pagination
				current={currentPage + 1}
				pageSize={10}
				total={totalCount}
				onChange={(page) => onPageChange(page - 1)}
				style={{ marginTop: 15, display: "flex", justifyContent: "center" }}
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
			bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}>
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
// Utility function for rendering notes
// -----------------------------------------------------------------------------
const renderAssessmentNotes = (notes) => (
	<div dangerouslySetInnerHTML={{ __html: notes }} style={{ backgroundColor: "#f0f0f0", padding: 15, borderRadius: 10 }} />
);
// -----------------------------------------------------------------------------
// Utility function for rendering medication list
// -----------------------------------------------------------------------------
const renderMedicationList = (medications, t) => {
	// Accept 't' as a parameter
	return (
		<ul style={{ paddingLeft: 20 }}>
			{medications.map((medication, index) => (
				<li key={index}>
					<Text>
						{t("medication-name")}: {medication.medicationName}, {t("dosage")}: {medication.dosage}, {t("route")}: {medication.route},{" "}
						{t("amount")}: {medication.amount}
					</Text>
					<Text type="danger">{medication.expired ? t("administered") : ""}</Text>
				</li>
			))}
		</ul>
	);
};

// -----------------------------------------------------------------------------
// Utility function for rendering image list
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
// Expanded Row Details Component
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
			style={{ maxWidth: screens.xs ? "95vw" : "400px", borderColor: "gold", border: "2px solid" }}
			bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}>
			{" "}
			{imageUrl && <Image src={generateImageUrl(imageUrl)} alt="Patient Profile" style={{ width: "100%", objectFit: "contain" }} />}{" "}
		</Modal>
	);
};

// Quick Notes Modal - Now shows the list and handles CRUD

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
	const [isTranscribing, setIsTranscribing] = useState(false); // NEW: Track transcription
	const waveformRef = useRef(null);
	const wavesurfer = useRef({ current: null }); // Use object for mutable ref

	const chunks = useRef([]); // Store audio chunks

	const { t } = useTranslation();
	const screens = useBreakpoint();

	const handleSave = () => {
		onSave();
		onClose();
	};

	const startRecording = async () => {
		try {
			setRecordingError(null);
			setIsTranscribing(false); // Reset transcription state
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			setMediaRecorder(recorder);
			setIsRecording(true);
			chunks.current = []; // Clear previous chunks

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
				sendAudioToBackend(blob); // Send for transcription AFTER loading into WaveSurfer
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
			setIsRecording(false);
			// Tracks are stopped automatically by recorder.stop()
		}
	};

	const sendAudioToBackend = async (blob) => {
		setIsTranscribing(true); // Indicate transcription is in progress
		const formData = new FormData();
		formData.append("audio", blob, "recording.webm");

		try {
			const response = await fetch("http://localhost:8080/api/gemini/soundtotext", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Transcription failed");
			}

			const transcribedText = await response.text();
			setQuickNoteText((prevText) => (prevText ? prevText + transcribedText : transcribedText)); // Correct concatenation
			notification.success({ message: t("success"), description: t("transcription-successful") });
		} catch (error) {
			console.error("Error transcribing audio:", error);
			notification.error({
				message: t("error"),
				description: t("transcription-failed") + ": " + error.message,
			});
		} finally {
			setIsTranscribing(false); // Reset transcription state
		}
	};

	useEffect(() => {
		if (waveformRef.current && !wavesurfer.current.current) {
			wavesurfer.current.current = WaveSurfer.create({
				container: waveformRef.current,
				waveColor: "violet",
				progressColor: "purple",
				cursorColor: "navy",
				barWidth: 3,
				responsive: true,
				height: 100,
				normalize: true,
			});

			wavesurfer.current.current.on("ready", () => {
				console.log("WaveSurfer is ready!");
			});

			wavesurfer.current.current.on("error", (error) => {
				console.error("WaveSurfer error:", error);
			});
		}

		return () => {
			if (wavesurfer.current.current) {
				wavesurfer.current.current.destroy();
				wavesurfer.current.current = null;
			}
		};
	}, []); // Empty dependency array: only run on mount/unmount

	useEffect(() => {
		return () => {
			if (mediaRecorder && mediaRecorder.state !== "inactive") {
				mediaRecorder.stop(); // Stops the stream and the recorder
			}
			if (audioBlobUrl) {
				URL.revokeObjectURL(audioBlobUrl); // Clean up blob URL
			}
		};
	}, []); // Empty dependency array:  only run on unmount.

	const sortedQuickNotes = [...quickNotes].sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

	const playAudio = () => {
		if (wavesurfer.current.current) {
			wavesurfer.current.current.playPause();
		}
	};

	return (
		<Modal
			title={quickNotesModalMode === "create" ? t("add-quick-note") : t("edit-quick-note")}
			open={isOpen}
			onCancel={onClose}
			width={quickNotesModalMode === "list" ? (screens.xs ? "95%" : "60%") : screens.xs ? "95%" : "40%"}
			bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}
			footer={
				quickNotesModalMode === "list"
					? null
					: [
							<Button key="cancel" onClick={onClose}>
								{t("cancel")}
							</Button>,
							<Button
								key="submit"
								type="primary"
								onClick={handleSave}
								disabled={isTranscribing} // Disable save while transcribing
							>
								{quickNotesModalMode === "create" ? t("create-note") : t("update-note")}
							</Button>,
					  ]
			}>
			{quickNotesModalMode === "list" ? (
				<>
					<List
						itemLayout="horizontal"
						dataSource={sortedQuickNotes}
						loading={loading}
						renderItem={(item) => (
							<List.Item
								actions={[
									<Button type="link" icon={<EditOutlined />} onClick={() => onEdit(item)} />,
									<Button type="link" danger icon={<DeleteOutlined />} onClick={() => onDelete(item.id)} />,
								]}>
								<List.Item.Meta
									avatar={<Avatar icon={<PushpinOutlined />} />}
									title={
										<span>
											{item.addedByUser || t("system")} - <ClockCircleOutlined />{" "}
											{moment(item.createdAt).format("YYYY-MM-DD HH:mm")}
										</span>
									}
									description={item.noteText}
								/>
							</List.Item>
						)}
					/>
					<Button type="primary" style={{ marginTop: "16px" }} onClick={() => onEdit(null)}>
						{t("add-new-note")}
					</Button>
				</>
			) : (
				<>
					<Space style={{ marginBottom: "16px" }}>
						<Button
							icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
							type={isRecording ? "danger" : "primary"}
							onClick={isRecording ? stopRecording : startRecording}
							disabled={isTranscribing} // Disable recording while transcribing
						>
							{isRecording ? t("stop-recording") : t("start-recording")}
						</Button>
						<Button onClick={playAudio} disabled={!audioBlobUrl || isTranscribing}>
							Play/Pause
						</Button>
						{recordingError && <Text type="danger">{recordingError}</Text>}
					</Space>
					<div
						id="waveform"
						ref={waveformRef}
						style={{
							display: isRecording || audioBlobUrl ? "block" : "none", // Corrected display condition
							marginTop: "10px",
						}}></div>

					<Input.TextArea
						value={quickNoteText}
						onChange={(e) => setQuickNoteText(e.target.value)}
						placeholder={t("enter-quick-notes")}
						autoSize={{ minRows: 3, maxRows: 6 }}
						disabled={isTranscribing} // Disable input while transcribing
					/>
					{isTranscribing && <Text>Transcribing...</Text>}
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
	const {
		fetchPatientData,
		fetchProcedureLogs,
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
		totalCounts,
		quickNotes,
		procedureLogs,
		fetchQuickNotes,
		createQuickNote,
		updateQuickNote,
		deleteQuickNote,
		toggleFilter, // Get the toggleFilter function
		filters, // Get current filter states
	} = usePatientDetailStore();

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
	const [quickNotesPage, setQuickNotesPage] = useState(0); // Add quickNotesPage state
	const [procedureLogsPage, setProcedureLogsPage] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [isQuickNotesModalOpen, setIsQuickNotesModalOpen] = useState(false);
	const [quickNotesModalMode, setQuickNotesModalMode] = useState("create"); // 'create' or 'edit'
	const [editingQuickNoteId, setEditingQuickNoteId] = useState(null); // ID of the note being edited
	const [quickNoteText, setQuickNoteText] = useState(""); // State for the note text

	const [activeTab, setActiveTab] = useState("1");
	const [expandedRow, setExpandedRow] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
	const [isSliderOpen, setIsSliderOpen] = useState(false);
	const [selectedImageData, setSelectedImageData] = useState(null);
	const [isLabResultModalOpen, setIsLabResultModalOpen] = useState(false);
	const [selectedLabResult, setSelectedLabResult] = useState(null);
	const [activityCreated, setActivityCreated] = useState(false);
	const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
	const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(null);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
	const [generatingPdfFor, setGeneratingPdfFor] = useState(null);
	const { fetchLabTests, labTests } = useLabStore(); // Get labTests
	const { user: loggedInUser } = useAuthStore(); // Get current user from auth store

	// --- Helper function for responsive padding ---
	const getResponsivePadding = () => {
		if (screens.xs) {
			return "8px"; // Smaller padding on extra small screens
		} else if (screens.sm) {
			return "12px";
		} else {
			return "24px"; // Default padding for larger screens
		}
	};

	// --- Helper function for responsive margins ---
	const getResponsiveMargin = () => {
		if (screens.xs) {
			return "8px 0"; // Smaller margins on extra small
		} else if (screens.sm) {
			return "12px 0";
		} else {
			return "24px 16px";
		}
	};

	const handleOpenServiceModal = () => {
		setIsServiceModalOpen(true);
	};
	const handleCloseServiceModal = () => {
		setIsServiceModalOpen(false);
	};
	const handleActivityCreated = () => {
		setActivityCreated((prev) => !prev);
	};
	const handleOpenLabResultModal = (labResult) => {
		setSelectedLabResult(labResult);
		setIsLabResultModalOpen(true);
	};
	const handleCloseLabResultModal = () => {
		setIsLabResultModalOpen(false);
		setSelectedLabResult(null);
	};
	const handleOpenSlider = (imageReport) => {
		setSelectedImageData(imageReport);
		setIsSliderOpen(true);
	};
	const handleCloseSlider = () => {
		setIsSliderOpen(false);
		setSelectedImageData(null);
	};

	const handleOpenModal = (row, type) => {
		setExpandedRow({ ...row, type });
		setIsModalOpen(true);
	};
	const handleCloseModal = () => {
		setExpandedRow(null);
		setIsModalOpen(false);
	};

	const handleOpenAvatarModal = (avatarUrl) => {
		setSelectedAvatarUrl(avatarUrl);
		setIsAvatarModalOpen(true);
	};
	const handleCloseAvatarModal = () => {
		setSelectedAvatarUrl(null);
		setIsAvatarModalOpen(false);
	};
	// Modified to handle opening in different modes
	const handleOpenQuickNotesModal = () => {
		setQuickNotesModalMode("list"); // Open in list mode initially
		setIsQuickNotesModalOpen(true);
	};

	// Handles closing, resetting to create mode
	const handleCloseQuickNotesModal = () => {
		setIsQuickNotesModalOpen(false);
		setQuickNotesModalMode("create"); // Reset to create
		setEditingQuickNoteId(null);
		setQuickNoteText(""); // Clear text
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
			setQuickNotesModalMode("list"); // Switch back to list mode
		} catch (error) {
			// Error handling is already done in the service.
		}
	};

	const handleDeleteQuickNote = async (quickNoteId) => {
		try {
			await deleteQuickNote(quickNoteId);
			notification.success({ message: t("success"), description: t("quick-note-deleted") });
			setQuickNotesModalMode("list");
		} catch (error) {
			// Error handling is already in the service.
		}
	};

	// Function to handle editing
	const handleEditQuickNote = (quickNote) => {
		if (quickNote) {
			// Editing an existing note
			setQuickNotesModalMode("edit");
			setEditingQuickNoteId(quickNote.id);
			setQuickNoteText(quickNote.noteText);
		} else {
			// Creating a new note
			setQuickNotesModalMode("create");
			setEditingQuickNoteId(null);
			setQuickNoteText("");
		}
	};
	useEffect(() => {
		// Fetch lab tests when the component mounts
		fetchLabTests();
	}, [fetchLabTests]);
	useEffect(() => {
		console.log("prescriptions data:", prescriptions);
	}, [prescriptions]);
	useEffect(() => {
		const fetchData = async () => {
			try {
				await fetchPatientData(patientId);
			} catch (error) {
				console.error("Error fetching patient data:", error);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData]);

	// Generic fetch function (now takes dataType)
	const fetchPaginatedData = async (page, dataType) => {
		try {
			const pageNum = page + 1;
			await fetchPatientData(
				patientId,
				dataType === "admissions" ? pageNum : undefined,
				dataType === "appointments" ? pageNum : undefined,
				dataType === "assessments" ? pageNum : undefined,
				dataType === "billings" ? pageNum : undefined,
				dataType === "carePlans" ? pageNum : undefined,
				dataType === "prescriptions" ? pageNum : undefined,
				dataType === "vitalSigns" ? pageNum : undefined,
				dataType === "productUsages" ? pageNum : undefined,
				dataType === "medicationAdministrations" ? pageNum : undefined,
				dataType === "imageReports" ? pageNum : undefined,
				dataType === "labResults" ? pageNum : undefined,
				dataType === "documents" ? pageNum : undefined,
				dataType === "quickNotes" ? pageNum : undefined,
				dataType === "procedureLogs" ? pageNum : undefined,
				10
			);
		} catch (error) {
			console.error(`Error fetching ${dataType}:`, error.message);
		}
	};

	// useEffect hooks using fetchPaginatedData
	useEffect(() => {
		fetchPaginatedData(admissionsPage, "admissions");
	}, [admissionsPage, patientId, fetchPatientData, activityCreated, searchTerm]);
	useEffect(() => {
		fetchPaginatedData(appointmentsPage, "appointments");
	}, [appointmentsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.appointments]);
	useEffect(() => {
		fetchPaginatedData(assessmentsPage, "assessments");
	}, [assessmentsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.assessments]);
	useEffect(() => {
		fetchPaginatedData(billingsPage, "billings");
	}, [billingsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.billings]);
	useEffect(() => {
		fetchPaginatedData(carePlansPage, "carePlans");
	}, [carePlansPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.carePlans]);
	useEffect(() => {
		fetchPaginatedData(prescriptionsPage, "prescriptions");
	}, [prescriptionsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.prescriptions]);
	useEffect(() => {
		fetchPaginatedData(vitalSignsPage, "vitalSigns");
	}, [vitalSignsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.vitalSigns]);
	useEffect(() => {
		fetchPaginatedData(productUsagesPage, "productUsages");
	}, [productUsagesPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.productUsages]);
	useEffect(() => {
		fetchPaginatedData(medicationAdministrationsPage, "medicationAdministrations");
	}, [medicationAdministrationsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.medicationAdministrations]);
	useEffect(() => {
		fetchPaginatedData(imageReportsPage, "imageReports");
	}, [imageReportsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.imageReports]);
	useEffect(() => {
		fetchPaginatedData(labResultsPage, "labResults");
	}, [labResultsPage, patientId, fetchPatientData, activityCreated, searchTerm, labTests, filters.labResults]);
	useEffect(() => {
		fetchPaginatedData(documentsPage, "documents");
	}, [documentsPage, patientId, fetchPatientData, activityCreated, searchTerm, filters.documents]);
	useEffect(() => {
		fetchPaginatedData(quickNotesPage, "quickNotes");
	}, [quickNotesPage, patientId, fetchQuickNotes, searchTerm]);
	useEffect(() => {
		fetchPaginatedData(procedureLogsPage, "procedureLogs");
	}, [procedureLogsPage, patientId, fetchProcedureLogs, activityCreated, searchTerm, filters.procedureLogs]);

	const handleTabChange = (key) => {
		setActiveTab(key);
	};

	const admissionsColumns = [
		{
			title: t("admission-date"),
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Admission")}>
						{t("view-details")}
					</Button>{" "}
					<PdfGenerator type="admission" mode="single" data={record} fileNamePrefix="admission">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: t("discharge-date"),
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : t("open")),
		},
		{
			title: t("bed-id"),
			dataIndex: "bedId",
			key: "bedId",
		},
	];
	const appointmentsColumns = [
		{
			title: t("appointment-date"),
			dataIndex: "appointmentDate",
			key: "appointmentDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Appointment")}>
						{t("view-details")}
					</Button>
					<PdfGenerator type="appointment" mode="single" data={record} fileNamePrefix="appointment">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
	];
	const assessmentsColumns = [
		{
			title: t("assessment-date"),
			dataIndex: "assessmentDateTime",
			key: "assessmentDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Assessment")}>
						{t("view-details")}
					</Button>

					<PdfGenerator type="assessment" mode="single" data={record} fileNamePrefix="assessment">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
	];

	const billingColumns = [
		{
			title: t("billing-date"),
			dataIndex: "billDate",
			key: "billingDate",
			render: (text) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},
		{
			title: t("description"),
			dataIndex: "description",
			key: "description",
			render: (text, record) => (
				<Space>
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Billing")}>
						{t("view-details")}
					</Button>
					<PdfGenerator type="billing" mode="single" data={record} fileNamePrefix="billing">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
	];
	const carePlansColumns = [
		{
			title: t("plan-date"),
			dataIndex: "planDate",
			key: "planDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Care Plan")}>
						{t("view-details")}
					</Button>
					<PdfGenerator type="carePlan" mode="single" data={record} fileNamePrefix="care_plan">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: t("goal"),
			dataIndex: "goal",
			key: "goal",
		},
		{
			title: t("interventions"),
			dataIndex: "interventions",
			key: "interventions",
		},
	];
	const prescriptionsColumns = useMemo(
		() => [
			{
				title: t("prescription-date"),
				dataIndex: "prescriptionDate",
				key: "prescriptionDate",
				render: (text, record) => (
					<Space key={record.id}>
						{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
						<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Prescription")}></Button>
						<PdfGenerator type="prescription" mode="single" data={record} fileNamePrefix="prescription">
							<Button type="default">{t("pdf")}</Button>
						</PdfGenerator>
					</Space>
				),
			},
			{
				title: t("note"),
				dataIndex: "note",
				key: "note",
			},
			{
				title: t("prescribed-medications"),
				key: "prescribedMedications",
				render: (text, record) => {
					const medications = record?.prescribedMedications ?? [];
					return medications.length > 0
						? renderMedicationList(medications, t) // PASS 't' HERE
						: t("no-medications-prescribed");
				},
			},
		],
		[t, handleOpenModal] // Include 't' in the dependency array!
	);
	const vitalSignsColumns = [
		{
			title: t("record-date"),
			dataIndex: "timestamp",
			key: "recordDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Vital Sign")}>
						{t("view-details")}
					</Button>
					<PdfGenerator type="vitalSign" mode="single" data={record} fileNamePrefix="vital_sign">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: t("temperature"),
			dataIndex: "temperature",
			key: "temperature",
		},
		{
			title: t("heart-rate"),
			dataIndex: "heartRate",
			key: "heartRate",
		},
		{
			title: t("blood-pressure"),
			key: "bloodPressure",
			render: (text, record) => {
				return `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`;
			},
		},
	];
	const productUsagesColumns = [
		{
			title: t("start-time"),
			dataIndex: "startTime",
			key: "startTime",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Product Usage")}>
						{t("view-details")}
					</Button>
					<PdfGenerator type="productUsage" mode="single" data={record} fileNamePrefix="product_usage">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>{" "}
				</Space>
			),
		},
		{
			title: t("end-time"),
			dataIndex: "endTime",
			key: "endTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
		},
		{
			title: t("product-name"),
			dataIndex: "productName",
			key: "productName",
		},
		{
			title: t("quantity"),
			dataIndex: "quantity",
			key: "quantity",
		},
		{
			title: t("price"),
			dataIndex: "price",
			key: "price",
		},
	];
	const medicationAdministrationsColumns = [
		{
			title: t("administration-time"),
			dataIndex: "administrationTime",
			key: "administrationTime",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Medication Administration")}>
						{t("view-details")}
					</Button>
					<PdfGenerator type="medicationAdministration" mode="single" data={record} fileNamePrefix="medication_administration">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: t("amount"),
			dataIndex: "amount",
			key: "amount",
		},
		{
			title: t("calculated-price"),
			dataIndex: "calculatedPrice",
			key: "calculatedPrice",
		},
		{
			title: t("prescribed-medication-name"),
			dataIndex: "medicationName",
			key: "medicationName",
		},
	];
	const imageReportsColumns = [
		{
			title: t("report-date"),
			dataIndex: "reportDateTime",
			key: "reportDateTime",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Image Report")}>
						{t("view-details")}
					</Button>
					{/* Pass processed URLs here */}
					<PdfGenerator
						type="imageReport"
						mode="single"
						data={{ ...record, imageUrls: record.imageUrls.map(generateImageUrl) }}
						fileNamePrefix="image_report">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: t("image-type"),
			dataIndex: "imageType",
			key: "imageType",
		},
		{
			title: t("description"),
			dataIndex: "description",
			key: "description",
		},
		{
			title: t("report-text"),
			dataIndex: "reportText",
			key: "reportText",
		},
		{
			title: t("images"),
			key: "images",
			render: (text, record) => {
				if (!record.imageUrls || record.imageUrls.length === 0) {
					return t("no-images-available");
				}

				// *CRUCIAL FIX:  Generate full URLs *before* passing to handleOpenSlider*
				const imageUrls = record.imageUrls.map((url) => generateImageUrl(url));

				return (
					// Pass the processed imageUrls, NOT the original record
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenSlider({ imageUrls })}>
						{t("view-images")}
					</Button>
				);
			},
		},
	];
	const labResultsColumns = [
		{
			title: t("result-date-time"),
			dataIndex: "resultDateTime",
			key: "resultDateTime",
			render: (text) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},
		{
			title: t("notes"),
			dataIndex: "notes",
			key: "notes",
		},
		{
			title: t("actions"),
			key: "actions",
			render: (text, record) => {
				const labTestDetails = labTests.find((test) => test.id === record.labTestId);
				return (
					<Space>
						<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenLabResultModal(record)}>
							{t("view-details")}
						</Button>
						{/* Corrected data prop */}
						<PdfGenerator
							type="labResult"
							mode="single"
							data={{ ...record, labTestDetails: labTestDetails }}
							fileNamePrefix="lab_result"
							labTests={labTests}>
							<Button type="default">{t("export-pdf")}</Button>
						</PdfGenerator>
					</Space>
				);
			},
		},
	];
	const documentsColumns = [
		{
			title: t("document-name"),
			dataIndex: "documentName",
			key: "documentName",
		},
		{
			title: t("upload-date"),
			dataIndex: "uploadDate",
			key: "uploadDate",
			render: (text) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},
		{
			title: t("uploaded-by"),
			dataIndex: "uploadedByName",
			key: "uploadedByName",
		},

		{
			title: t("actions"),
			key: "actions",
			render: (text, record) => (
				<Button
					type="primary" // Makes the button stand out
					icon={<DownloadOutlined />} // Adds an icon for better visual appeal
					onClick={() => {
						fetch(generateDocumentUrl(record.documentPath))
							.then((response) => {
								if (!response.ok) {
									throw new Error("Failed to fetch the file");
								}
								return response.blob();
							})
							.then((blob) => {
								const url = window.URL.createObjectURL(blob);
								const link = document.createElement("a");
								link.href = url;
								link.download = record.documentName || "default-filename.ext";
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
								window.URL.revokeObjectURL(url);
							})
							.catch((error) => {
								console.error("Error downloading file:", error);
							});
					}}>
					{t("download")}
				</Button>
			),
		},
	];

	const procedureLogsColumns = [
		{
			title: t("start-time"),
			dataIndex: "startTime",
			key: "startTime",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Procedure Log")}>
						{t("view-details")}
					</Button>
					<PdfGenerator type="procedureLog" mode="single" data={record} fileNamePrefix="procedure_log">
						<Button type="default">{t("export-pdf")}</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: t("username"),
			dataIndex: "userName",
			key: "userName",
		},
		{
			title: t("procedure-name"),
			dataIndex: "procedureName",
			key: "procedureName",
		},
		{
			title: t("notes"),
			dataIndex: "notes",
			key: "notes",
		},
	];

	// Handle search
	const handleSearch = (value) => {
		setSearchTerm(value);
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
		setQuickNotesPage(0);
		setProcedureLogsPage(0);
	};

	// NEW:  Handle filter toggle
	const handleFilterToggle = (dataType) => {
		toggleFilter(dataType); // Call the Zustand action
		// Reset pagination when filter changes.  VERY IMPORTANT!
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

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Layout className="site-layout">
				<Content style={{ margin: getResponsiveMargin() }}>
					{/* --- Header Section --- */}
					<Row gutter={[16, 16]} style={{ marginBottom: screens.xs ? 10 : 20 }} align="middle">
						<Col>
							<Title level={2} style={{ margin: 0 }}>
								{t("patient-details")}
							</Title>
						</Col>
						<Col flex="auto">
							{/* --- Action Bar --- */}
							<Space style={{ float: "right" }}>
								<Tooltip title={t("add-service")}>
									<Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={handleOpenServiceModal} />
								</Tooltip>
								{!loading && (
									<Tooltip title={t("generate-patient-file-pdf")}>
										<PdfGenerator mode="patientFile" data={patient} labTests={labTests} fileNamePrefix="patient_file">
											<Button type="default" shape="circle" icon={<DownloadOutlined />} />
										</PdfGenerator>
									</Tooltip>
								)}
								{/* Quick Notes Button - Now opens the modal */}
								<Tooltip title={t("quick-notes")}>
									<Button
										type="default"
										shape="circle"
										icon={<PushpinOutlined />} // Use PushpinOutlined
										onClick={handleOpenQuickNotesModal}
									/>
								</Tooltip>
							</Space>
						</Col>
					</Row>

					{/* --- Quick Stats Dashboard --- */}
					{patient && (
						<Row gutter={[16, 16]} style={{ marginBottom: screens.xs ? 12 : 24 }}>
							{/* Use responsive Col spans */}
							<Col xs={24} sm={12} md={6}>
								<Card bodyStyle={{ padding: getResponsivePadding() }}>
									<Statistic
										title={t("blood-type")}
										value={patient.bloodType}
										prefix={<HeartOutlined style={{ color: "#cf1322" }} />}
									/>
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card bodyStyle={{ padding: getResponsivePadding() }}>
									<Statistic title={t("age")} value={moment().diff(patient.dateOfBirth, "years")} prefix={<UserOutlined />} />
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card bodyStyle={{ padding: getResponsivePadding() }}>
									{admissions && admissions.length > 0 ? (
										admissions[0].dischargeDate ? (
											<Statistic
												title={t("last-visit")}
												value={moment(admissions[0].dischargeDate).fromNow()}
												prefix={<span style={{ marginLeft: "8px" }}>🗓️</span>}
												valueStyle={{ color: "#52c41a" }}
											/>
										) : (
											<Statistic
												title={t("current-visit")}
												value={moment(admissions[0].admissionDate).format("LL")}
												prefix={<span style={{ marginLeft: "8px" }}>🎉</span>}
												valueStyle={{ color: "#3f8600" }}
											/>
										)
									) : (
										<Statistic
											title={t("last-visit")}
											value={"N/A"}
											prefix={<span style={{ marginLeft: "8px" }}>🤷</span>}
											valueStyle={{ color: "#777" }}
										/>
									)}
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card bodyStyle={{ padding: getResponsivePadding() }}>
									<Statistic
										title={t("next-appointment")}
										value={patient.nextAppointment ? moment(patient.nextAppointment).format("LLL") : "N/A"}
										prefix={<CalendarOutlined />}
									/>
								</Card>
							</Col>
						</Row>
					)}
					{/* --- Patient Details Card --- */}
					<Card style={{ marginBottom: screens.xs ? 12 : 24 }} bodyStyle={{ padding: getResponsivePadding() }}>
						{/* ... Patient details content ... */}
						{patient && (
							<Row gutter={[24, 24]} align="middle">
								{/* Patient Avatar */}
								<Col
									xs={24} // Full width on extra small
									sm={24}
									md={8}
									lg={6}
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
									}}>
									<Avatar
										size={150}
										src={generateImageUrl(patient.profilePictureURL)}
										alt="Patient Profile"
										style={{
											marginBottom: 10,
											marginRight: 10,
											objectFit: "cover",
											border: "2px solid snow",
											cursor: "pointer", // Indicate it's clickable
										}}
										onClick={() => handleOpenAvatarModal(patient.profilePictureURL)}
									/>
									<Button type="primary" icon={<EyeOutlined />} onClick={() => handleOpenAvatarModal(patient.profilePictureURL)}>
										{t("view-profile-image")}
									</Button>
								</Col>
								{/* Patient Information */}
								<Col xs={24} sm={24} md={16} lg={18}>
									<Row gutter={[16, 8]}>
										<Col xs={24} sm={12}>
											<Text strong>{t("name")}:</Text> {patient.firstName} {patient.lastName}
										</Col>
										<Col xs={24} sm={12}>
											<Text strong>{t("date-of-birth")}:</Text>{" "}
											{patient.dateOfBirth ? moment(patient.dateOfBirth).format("YYYY-MM-DD") : "N/A"}
										</Col>
										<Col xs={24} sm={12}>
											<Text strong>{t("gender")}:</Text> {patient.gender}
										</Col>
										<Col xs={24} sm={12}>
											<Text strong>{t("medical-record-number")}:</Text> {patient.medicalRecordNumber}
										</Col>
										<Col xs={24} sm={24}>
											<Text strong>{t("allergies")}:</Text>
											<Tag color="red">{patient.allergies || t("none")}</Tag>
										</Col>
										<Col xs={24} sm={24}>
											<Text strong>{t("medical-history")}:</Text> {patient.medicalHistory}
										</Col>
									</Row>

									{/* Contact Information - Highlighted Section */}
									<Divider orientation="left">{t("contact-information")}</Divider>
									<Row gutter={[16, 8]}>
										<Col xs={24} sm={12}>
											<EnvironmentOutlined /> <Text strong>{t("address")}:</Text> {patient.address}
										</Col>
										<Col xs={24} sm={12}>
											<PhoneOutlined /> <Text strong>{t("phone")}:</Text> {patient.phoneNumber}
										</Col>
										<Col xs={24} sm={12}>
											<MailOutlined /> <Text strong>{t("email")}:</Text> {patient.email}
										</Col>
									</Row>
								</Col>
							</Row>
						)}
					</Card>

					{/* --- Tabs --- */}
					<Card bodyStyle={{ padding: getResponsivePadding() }}>
						<Tabs defaultActiveKey="1" activeKey={activeTab} onChange={handleTabChange} type="card">
							<TabPane
								tab={
									<span>
										<ProfileOutlined />
										{t("admissions")}
									</span>
								}
								key="1">
								<PaginatedTable
									t={t}
									columns={admissionsColumns}
									data={admissions}
									loading={loading}
									currentPage={admissionsPage}
									onPageChange={setAdmissionsPage}
									totalCount={totalCounts?.admissions || 0}
								/>
								<PdfGenerator mode="table" type="admission" data={admissions} columns={admissionsColumns} fileNamePrefix="admissions">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<CalendarOutlined />
										{t("appointments")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("appointments")}
											style={{ marginLeft: 8 }}>
											{filters.appointments ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="2">
								<PaginatedTable
									t={t}
									columns={appointmentsColumns}
									data={appointments}
									loading={loading}
									currentPage={appointmentsPage}
									onPageChange={setAppointmentsPage}
									totalCount={totalCounts?.appointments || 0}
								/>
								<PdfGenerator
									mode="table"
									type="appointment"
									data={appointments}
									columns={appointmentsColumns}
									fileNamePrefix="appointments">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileTextOutlined />
										{t("assessments")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("assessments")}
											style={{ marginLeft: 8 }}>
											{filters.assessments ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="3">
								<PaginatedTable
									columns={assessmentsColumns}
									data={assessments}
									loading={loading}
									currentPage={assessmentsPage}
									onPageChange={setAssessmentsPage}
									totalCount={totalCounts?.assessments || 0}
								/>
								<PdfGenerator mode="table" type="assessment" data={assessments} fileNamePrefix="assessments">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<DollarOutlined />
										{t("billings")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("billings")}
											style={{ marginLeft: 8 }}>
											{filters.billings ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="4">
								<PaginatedTable
									columns={billingColumns}
									data={billings}
									loading={loading}
									currentPage={billingsPage}
									onPageChange={setBillingsPage}
									totalCount={totalCounts?.billings || 0}
								/>
								<PdfGenerator mode="table" type="billing" data={billings} fileNamePrefix="billings">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<UnorderedListOutlined />
										{t("care-plans")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("carePlans")}
											style={{ marginLeft: 8 }}>
											{filters.carePlans ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="5">
								<PaginatedTable
									columns={carePlansColumns}
									data={carePlans}
									loading={loading}
									currentPage={carePlansPage}
									onPageChange={setCarePlansPage}
									totalCount={totalCounts?.carePlans || 0}
								/>
								<PdfGenerator mode="table" type="carePlan" data={carePlans} columns={carePlansColumns} fileNamePrefix="care_plans">
									<Button type="primary">{t("export-table-pdf")}</Button>{" "}
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<MedicineBoxOutlined />
										{t("prescriptions")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("prescriptions")}
											style={{ marginLeft: 8 }}>
											{filters.prescriptions ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="6">
								<PaginatedTable
									t={t}
									columns={prescriptionsColumns}
									data={prescriptions}
									loading={loading}
									currentPage={prescriptionsPage}
									onPageChange={setPrescriptionsPage}
									totalCount={totalCounts?.prescriptions || 0}
								/>
								<PdfGenerator
									mode="table"
									type="prescription"
									data={prescriptions}
									columns={prescriptionsColumns}
									fileNamePrefix="prescriptions">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<HeartOutlined />
										{t("vital-signs")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("vitalSigns")}
											style={{ marginLeft: 8 }}>
											{filters.vitalSigns ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="7">
								<PaginatedTable
									t={t}
									columns={vitalSignsColumns}
									data={vitalSigns}
									loading={loading}
									currentPage={vitalSignsPage}
									onPageChange={setVitalSignsPage}
									totalCount={totalCounts?.vitalSigns || 0}
								/>
								<PdfGenerator
									mode="table"
									type="vitalSign"
									data={vitalSigns}
									columns={vitalSignsColumns}
									fileNamePrefix="vital_signs">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<ShoppingCartOutlined />
										{t("product-usages")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("productUsages")}
											style={{ marginLeft: 8 }}>
											{filters.productUsages ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="8">
								<PaginatedTable
									t={t}
									columns={productUsagesColumns}
									data={productUsages}
									loading={loading}
									currentPage={productUsagesPage}
									onPageChange={setProductUsagesPage}
									totalCount={totalCounts?.productUsages || 0}
								/>
								<PdfGenerator
									mode="table"
									type="productUsage"
									data={productUsages}
									columns={productUsagesColumns}
									fileNamePrefix="product_usages">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<MedicineBoxOutlined />
										{t("medication-administrations")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("medicationAdministrations")}
											style={{ marginLeft: 8 }}>
											{filters.medicationAdministrations ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="9">
								<PaginatedTable
									t={t}
									columns={medicationAdministrationsColumns}
									data={medicationAdministrations}
									loading={loading}
									currentPage={medicationAdministrationsPage}
									onPageChange={setMedicationAdministrationsPage}
									totalCount={totalCounts?.medicationAdministrations || 0}
								/>
								<PdfGenerator
									mode="table"
									type="medicationAdministration"
									data={medicationAdministrations}
									columns={medicationAdministrationsColumns}
									fileNamePrefix="medication_administrations">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<PictureOutlined />
										{t("image-reports")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("imageReports")}
											style={{ marginLeft: 8 }}>
											{filters.imageReports ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="10">
								<PaginatedTable
									t={t}
									columns={imageReportsColumns}
									data={imageReports}
									loading={loading}
									currentPage={imageReportsPage}
									onPageChange={setImageReportsPage}
									totalCount={totalCounts?.imageReports || 0}
								/>
								<PdfGenerator
									mode="table"
									type="imageReport"
									// Map over imageReports and process the URLs
									data={imageReports.map((report) => ({
										...report,
										imageUrls: report.imageUrls ? report.imageUrls.map(generateImageUrl) : [],
									}))}
									fileNamePrefix="image_reports">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<ExperimentOutlined />
										{t("lab-results")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("labResults")}
											style={{ marginLeft: 8 }}>
											{filters.labResults ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="11">
								<PaginatedTable
									t={t}
									columns={labResultsColumns}
									data={labResults}
									loading={loading}
									currentPage={labResultsPage}
									onPageChange={setLabResultsPage}
									totalCount={totalCounts?.labResults || 0}
								/>
								{/* Pass labTests to the PdfGenerator */}
								<PdfGenerator mode="table" type="labResult" data={labResults} fileNamePrefix="lab_results" labTests={labTests}>
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileTextOutlined />
										{t("documents")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("documents")}
											style={{ marginLeft: 8 }}>
											{filters.documents ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="12">
								<PaginatedTable
									t={t}
									columns={documentsColumns}
									data={documents}
									loading={loading}
									currentPage={documentsPage}
									onPageChange={setDocumentsPage}
									totalCount={totalCounts?.documents || 0}
								/>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileDoneOutlined />
										{t("procedure-logs")}
										{/* Filter Toggle Button */}
										<Button
											type="link"
											icon={<FilterOutlined />}
											onClick={() => handleFilterToggle("procedureLogs")}
											style={{ marginLeft: 8 }}>
											{filters.procedureLogs ? t("show-all") : t("filter-by-admission")}
										</Button>
									</span>
								}
								key="13">
								<PaginatedTable
									t={t}
									columns={procedureLogsColumns}
									data={procedureLogs}
									loading={loading}
									currentPage={procedureLogsPage}
									onPageChange={setProcedureLogsPage}
									totalCount={totalCounts?.procedureLogs || 0}
								/>
								<PdfGenerator
									mode="table"
									type="procedureLog"
									data={procedureLogs}
									columns={procedureLogsColumns}
									fileNamePrefix="procedure_logs">
									<Button type="primary">{t("export-table-pdf")}</Button>
								</PdfGenerator>
							</TabPane>
						</Tabs>
					</Card>
					{/* Footer here  */}
				</Content>
				<Footer style={{ textAlign: "center", padding: screens.xs ? "12px" : "24px" }}></Footer>
			</Layout>
			{/* --- Modals --- */}
			<Modal
				title={t("request-service")}
				open={isServiceModalOpen}
				onCancel={handleCloseServiceModal}
				footer={null}
				width={screens.xs ? "95%" : "90%"}
				bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}>
				<MiniCreateActivityForm onActivityCreated={handleActivityCreated} patientId={patientId} />
			</Modal>
			<ExpandedRowDetails t={t} expandedRow={expandedRow} isModalOpen={isModalOpen} handleCloseModal={handleCloseModal} />
			<LabResultDetailsModal
				t={t}
				isOpen={isLabResultModalOpen}
				onClose={handleCloseLabResultModal}
				labResult={selectedLabResult}
				labTests={labTests}
				width={screens.xs ? "95%" : "90%"}
				bodyStyle={{ padding: screens.xs ? "16px" : "24px" }}
			/>
			{isSliderOpen && selectedImageData && <ImageSlider t={t} open={isSliderOpen} data={selectedImageData} onClose={handleCloseSlider} />}
			<PatientAvatarModal t={t} imageUrl={selectedAvatarUrl} isOpen={isAvatarModalOpen} onClose={handleCloseAvatarModal} />
			{/* Quick Notes Modal - Now with list and CRUD */}
			<QuickNotesModal
				t={t}
				isOpen={isQuickNotesModalOpen}
				onClose={handleCloseQuickNotesModal}
				onSave={handleSaveQuickNotes}
				quickNotesModalMode={quickNotesModalMode}
				quickNoteText={quickNoteText}
				setQuickNoteText={setQuickNoteText}
				quickNotes={quickNotes} // Pass quick notes
				onDelete={handleDeleteQuickNote} // Pass delete handler
				onEdit={handleEditQuickNote} // Pass edit handler
				loading={loading}
			/>
		</Layout>
	);
};

export default PatientDetails;
