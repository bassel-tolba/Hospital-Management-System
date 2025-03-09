import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import MiniCreateActivityForm from "./MiniCreateActivityForm";
import LabResultDetailsModal from "./LabResultDetailsModal";
import ImageSlider from "./ImageSlider";
import { useParams } from "react-router-dom";
import { usePatientDetailStore } from "../../services/patientDetail.service";
import { useLabStore } from "../../services/lab.service"; // Import useLabStore
import moment from "moment";
import PdfGenerator from "./PdfGenerator"; // Import the new component

const { Header, Content, Footer } = Layout;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

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
const PaginatedTable = ({ columns, data, loading, currentPage, onPageChange, totalCount }) => (
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

// -----------------------------------------------------------------------------
// Reusable Detail Modal Component
// -----------------------------------------------------------------------------
const DetailModal = ({ title, isOpen, onClose, children }) => (
	<Modal title={title} open={isOpen} onCancel={onClose} footer={null} width="90%" style={{ maxWidth: "800px" }} bodyStyle={{ padding: "24px" }}>
		<Row gutter={[16, 16]}>{children}</Row>
	</Modal>
);

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
const renderMedicationList = (medications) => (
	<ul style={{ paddingLeft: 20 }}>
		{medications &&
			medications.map((medication, index) => (
				<li key={index}>
					<Text>
						Medication Name: {medication.medicationName}, Dosage: {medication.dosage}, Route: {medication.route}, Amount:{" "}
						{medication.amount}
					</Text>
					{medication.expired && <Text type="danger">Administered</Text>}
				</li>
			))}
	</ul>
);
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
	if (!expandedRow) return null;

	const { type, ...data } = expandedRow;

	return (
		<DetailModal title={`Detailed ${type} Information`} isOpen={isModalOpen} onClose={handleCloseModal}>
			{type === "Admission" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Admission Date", data.admissionDate ? moment(data.admissionDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Discharge Date", data.dischargeDate ? moment(data.dischargeDate).format("YYYY-MM-DD HH:mm") : "Open")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Bed ID", data.bedId)}
					</Col>
				</>
			)}
			{type === "Appointment" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Appointment Date", data.appointmentDate ? moment(data.appointmentDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
				</>
			)}
			{type === "Assessment" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(
							"Assessment Date",
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
						{renderDetail("Billing Date", data.billDate ? moment(data.billDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>

					<Col xs={24} sm={24}>
						{renderAssessmentNotes(data.bill)}
					</Col>
				</>
			)}
			{type === "Care Plan" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Plan Date", data.planDate ? moment(data.planDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Goal", data.goal)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Interventions", data.interventions)}
					</Col>
				</>
			)}
			{type === "Prescription" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Prescription Date", data.prescriptionDate ? moment(data.prescriptionDate).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail("Note", data.note)}
					</Col>
					<Col xs={24} sm={24}>
						{renderMedicationList(data.prescribedMedications)}
					</Col>
				</>
			)}
			{type === "Vital Sign" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Record Date", data.timestamp ? moment(data.timestamp).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Heart Rate", data.heartRate)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Blood Pressure (Systolic)", data.bloodPressureSystolic)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Blood Pressure (Diastolic)", data.bloodPressureDiastolic)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Temperature", data.temperature)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Respiratory Rate", data.respiratoryRate)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Oxygen Saturation", data.oxygenSaturation)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Pain Level", data.painLevel)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Height", data.height ? `${data.height} ${data.heightUnit}` : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Weight", data.weight ? `${data.weight} ${data.weightUnit}` : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Glucose", data.glucose ? `${data.glucose} ${data.glucoseUnit}` : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Posture", data.posture)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Capillary Refill Time", data.capillaryRefillTime)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail("Notes", data.notes)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Method", data.method)}
					</Col>
				</>
			)}
			{type === "Product Usage" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Start Time", data.startTime ? moment(data.startTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("End Time", data.endTime ? moment(data.endTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Product ID", data.productId)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Product Name", data.productName)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Quantity", data.quantity)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Price", data.price)}
					</Col>
				</>
			)}
			{type === "Medication Administration" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail(
							"Administration Time",
							data.administrationTime ? moment(data.administrationTime).format("YYYY-MM-DD HH:mm") : "N/A"
						)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Amount", data.amount)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Calculated Price", data.calculatedPrice)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Prescribed Medication Id", data.prescribedMedicationId)}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Prescribed Medication Name", data.medicationName)}
					</Col>
				</>
			)}
			{type === "Image Report" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Report Date", data.reportDateTime ? moment(data.reportDateTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={12}>
						{renderDetail("Image Type", data.imageType)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail("Description", data.description)}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail("Report Text", data.reportText)}
					</Col>
				</>
			)}
			{type === "Lab Result" && (
				<>
					<Col xs={24} sm={12}>
						{renderDetail("Result Date Time", data.resultDateTime ? moment(data.resultDateTime).format("YYYY-MM-DD HH:mm") : "N/A")}
					</Col>
					<Col xs={24} sm={24}>
						{renderDetail("Notes", data.notes)}
					</Col>
				</>
			)}
		</DetailModal>
	);
};
// -----------------------------------------------------------------------------
// Patient Avatar Modal Component
// -----------------------------------------------------------------------------
const PatientAvatarModal = ({ imageUrl, isOpen, onClose }) => (
	<Modal
		title="Patient Profile Image"
		open={isOpen}
		onCancel={onClose}
		footer={null}
		width="90%"
		style={{ maxWidth: "400px", borderColor: "gold", border: "2px solid" }}
		bodyStyle={{ padding: "24px" }}>
		{imageUrl && <Image src={generateImageUrl(imageUrl)} alt="Patient Profile" style={{ width: "100%", objectFit: "contain" }} />}
	</Modal>
);

// Quick Notes Modal
const QuickNotesModal = ({ isOpen, onClose, patientId, notes, onSave }) => {
	const [currentNotes, setCurrentNotes] = useState(notes || ""); // Initialize with existing notes

	useEffect(() => {
		setCurrentNotes(notes || ""); // Update local state when notes prop changes
	}, [notes]);

	const handleSave = () => {
		onSave(patientId, currentNotes); // Pass the patientId and currentNotes to the save function
		onClose();
	};

	return (
		<Modal
			title="Quick Notes"
			open={isOpen}
			onCancel={onClose}
			onOk={handleSave} // Use onOk for the save action
			okText="Save"
			bodyStyle={{ padding: "24px" }}>
			<Input.TextArea
				value={currentNotes}
				onChange={(e) => setCurrentNotes(e.target.value)}
				placeholder="Enter quick notes here..."
				autoSize={{ minRows: 3, maxRows: 6 }}
			/>
		</Modal>
	);
};

// -----------------------------------------------------------------------------
// Patient Details Component
// -----------------------------------------------------------------------------
const PatientDetails = () => {
	const { patientId } = useParams();
	const {
		fetchPatientData,
		loading: patientLoading, //Use a single loading state
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
	} = usePatientDetailStore();

	// Pagination State
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
	const [searchTerm, setSearchTerm] = useState("");
	const [isQuickNotesModalOpen, setIsQuickNotesModalOpen] = useState(false); // Quick notes modal state

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
	const handleOpenQuickNotesModal = () => {
		setIsQuickNotesModalOpen(true);
	};
	const handleCloseQuickNotesModal = () => {
		setIsQuickNotesModalOpen(false);
	};

	const handleSaveQuickNotes = async (patientId, notes) => {
		try {
			// Call your API endpoint to save the notes
			const response = await fetch(`/api/patients/${patientId}/notes`, {
				method: "PUT", // Or POST, depending on your API design
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ notes }),
			});

			if (!response.ok) {
				throw new Error(`Failed to save notes: ${response.status}`);
			}

			// Optionally, refetch patient data to update the UI with the saved notes
			fetchPatientData(patientId);
			notification.success({
				message: "Notes Saved",
				description: "Patient notes have been saved successfully.",
			});
		} catch (error) {
			console.error("Error saving notes:", error);
			notification.error({
				message: "Error Saving Notes",
				description: "There was a problem saving the patient notes.",
			});
		}
	};
	useEffect(() => {
		// Fetch lab tests when the component mounts
		fetchLabTests();
	}, [fetchLabTests]);

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
				10,
				searchTerm
			);
		} catch (error) {
			console.error(`Error fetching ${dataType}:`, error.message);
		}
	};

	useEffect(() => {
		fetchPaginatedData(admissionsPage, "admissions");
	}, [admissionsPage, patientId, fetchPatientData, activityCreated, searchTerm]);

	useEffect(() => {
		fetchPaginatedData(appointmentsPage, "appointments");
	}, [appointmentsPage, patientId, fetchPatientData, activityCreated, searchTerm]);

	useEffect(() => {
		fetchPaginatedData(assessmentsPage, "assessments");
	}, [assessmentsPage, patientId, fetchPatientData, activityCreated, searchTerm]);

	useEffect(() => {
		fetchPaginatedData(billingsPage, "billings");
	}, [billingsPage, patientId, fetchPatientData, activityCreated, searchTerm]);

	useEffect(() => {
		fetchPaginatedData(carePlansPage, "carePlans");
	}, [carePlansPage, patientId, fetchPatientData, activityCreated, searchTerm]);

	useEffect(() => {
		fetchPaginatedData(prescriptionsPage, "prescriptions");
	}, [prescriptionsPage, patientId, fetchPatientData, activityCreated, searchTerm]);

	useEffect(() => {
		fetchPaginatedData(vitalSignsPage, "vitalSigns");
	}, [vitalSignsPage, patientId, fetchPatientData, activityCreated, searchTerm]);
	useEffect(() => {
		fetchPaginatedData(productUsagesPage, "productUsages");
	}, [productUsagesPage, patientId, fetchPatientData, activityCreated, searchTerm]);

	useEffect(() => {
		fetchPaginatedData(medicationAdministrationsPage, "medicationAdministrations");
	}, [medicationAdministrationsPage, patientId, fetchPatientData, activityCreated, searchTerm]);
	useEffect(() => {
		fetchPaginatedData(imageReportsPage, "imageReports");
	}, [imageReportsPage, patientId, fetchPatientData, activityCreated, searchTerm]);
	useEffect(() => {
		fetchPaginatedData(labResultsPage, "labResults");
	}, [labResultsPage, patientId, fetchPatientData, activityCreated, searchTerm, labTests]);

	useEffect(() => {
		fetchPaginatedData(documentsPage, "documents");
	}, [documentsPage, patientId, fetchPatientData, activityCreated, searchTerm]);
	const handleTabChange = (key) => {
		setActiveTab(key);
	};

	const admissionsColumns = [
		{
			title: "Admission Date",
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Admission")}>
						View Details
					</Button>{" "}
					<PdfGenerator type="admission" mode="single" data={record} fileNamePrefix="admission">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: "Discharge Date",
			dataIndex: "dischargeDate",
			key: "dischargeDate",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "Open"),
		},
		{
			title: "Bed ID",
			dataIndex: "bedId",
			key: "bedId",
		},
	];
	const appointmentsColumns = [
		{
			title: "Appointment Date",
			dataIndex: "appointmentDate",
			key: "appointmentDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Appointment")}>
						View Details
					</Button>
					<PdfGenerator type="appointment" mode="single" data={record} fileNamePrefix="appointment">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
	];
	const assessmentsColumns = [
		{
			title: "Assessment Date",
			dataIndex: "assessmentDateTime",
			key: "assessmentDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Assessment")}>
						View Details
					</Button>

					<PdfGenerator type="assessment" mode="single" data={record} fileNamePrefix="assessment">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
	];

	const billingColumns = [
		{
			title: "Billing Date",
			dataIndex: "billDate",
			key: "billingDate",
			render: (text) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (text, record) => (
				<Space>
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Billing")}>
						View Details
					</Button>
					<PdfGenerator type="billing" mode="single" data={record} fileNamePrefix="billing">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
	];
	const carePlansColumns = [
		{
			title: "Plan Date",
			dataIndex: "planDate",
			key: "planDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Care Plan")}>
						View Details
					</Button>
					<PdfGenerator type="carePlan" mode="single" data={record} fileNamePrefix="care_plan">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: "Goal",
			dataIndex: "goal",
			key: "goal",
		},
		{
			title: "Interventions",
			dataIndex: "interventions",
			key: "interventions",
		},
	];
	const prescriptionsColumns = [
		{
			title: "Prescription Date",
			dataIndex: "prescriptionDate",
			key: "prescriptionDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Prescription")}>
						View Details
					</Button>
					<PdfGenerator type="prescription" mode="single" data={record} fileNamePrefix="prescription">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: "Note",
			dataIndex: "note",
			key: "note",
		},
		{
			title: "Prescribed Medications",
			key: "prescribedMedications",
			render: (text, record) =>
				record.prescribedMedications && record.prescribedMedications.length > 0
					? renderMedicationList(record.prescribedMedications)
					: "No medications prescribed",
		},
	];
	const vitalSignsColumns = [
		{
			title: "Record Date",
			dataIndex: "timestamp",
			key: "recordDate",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Vital Sign")}>
						View Details
					</Button>
					<PdfGenerator type="vitalSign" mode="single" data={record} fileNamePrefix="vital_sign">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: "Temperature",
			dataIndex: "temperature",
			key: "temperature",
		},
		{
			title: "Heart Rate",
			dataIndex: "heartRate",
			key: "heartRate",
		},
		{
			title: "Blood Pressure",
			key: "bloodPressure",
			render: (text, record) => {
				return `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`;
			},
		},
	];
	const productUsagesColumns = [
		{
			title: "Start Time",
			dataIndex: "startTime",
			key: "startTime",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Product Usage")}>
						View Details
					</Button>
					<PdfGenerator type="productUsage" mode="single" data={record} fileNamePrefix="product_usage">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: "End Time",
			dataIndex: "endTime",
			key: "endTime",
			render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"),
		},
		{
			title: "Product Name",
			dataIndex: "productName",
			key: "productName",
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
		},
	];
	const medicationAdministrationsColumns = [
		{
			title: "Administration Time",
			dataIndex: "administrationTime",
			key: "administrationTime",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Medication Administration")}>
						View Details
					</Button>
					<PdfGenerator type="medicationAdministration" mode="single" data={record} fileNamePrefix="medication_administration">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
		},
		{
			title: "Calculated Price",
			dataIndex: "calculatedPrice",
			key: "calculatedPrice",
		},
		{
			title: "Prescribed Medication Name",
			dataIndex: "medicationName",
			key: "medicationName",
		},
	];
	const imageReportsColumns = [
		{
			title: "Report Date",
			dataIndex: "reportDateTime",
			key: "reportDateTime",
			render: (text, record) => (
				<Space>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, "Image Report")}>
						View Details
					</Button>
					{/* Pass processed URLs here */}
					<PdfGenerator
						type="imageReport"
						mode="single"
						data={{ ...record, imageUrls: record.imageUrls.map(generateImageUrl) }}
						fileNamePrefix="image_report">
						<Button type="default">Export PDF</Button>
					</PdfGenerator>
				</Space>
			),
		},
		{
			title: "Image Type",
			dataIndex: "imageType",
			key: "imageType",
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
		},
		{
			title: "Report Text",
			dataIndex: "reportText",
			key: "reportText",
		},
		{
			title: "Images",
			key: "images",
			render: (text, record) => {
				if (!record.imageUrls || record.imageUrls.length === 0) {
					return "No images available";
				}

				// *CRUCIAL FIX:  Generate full URLs *before* passing to handleOpenSlider*
				const imageUrls = record.imageUrls.map((url) => generateImageUrl(url));

				return (
					// Pass the processed imageUrls, NOT the original record
					<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenSlider({ imageUrls })}>
						View Images
					</Button>
				);
			},
		},
	];
	const labResultsColumns = [
		{
			title: "Result Date Time",
			dataIndex: "resultDateTime",
			key: "resultDateTime",
			render: (text) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => {
				const labTestDetails = labTests.find((test) => test.id === record.labTestId);
				return (
					<Space>
						<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenLabResultModal(record)}>
							View Details
						</Button>
						{/* Corrected data prop */}
						<PdfGenerator
							type="labResult"
							mode="single"
							data={{ ...record, labTestDetails: labTestDetails }}
							fileNamePrefix="lab_result"
							labTests={labTests}>
							<Button type="default">Export PDF</Button>
						</PdfGenerator>
					</Space>
				);
			},
		},
	];
	const documentsColumns = [
		{
			title: "Document Name",
			dataIndex: "documentName",
			key: "documentName",
		},
		{
			title: "Upload Date",
			dataIndex: "uploadDate",
			key: "uploadDate",
			render: (text) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},
		{
			title: "Uploaded By",
			dataIndex: "uploadedByName",
			key: "uploadedByName",
		},

		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Button
					type="default" // Makes the button stand out
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
					Download
				</Button>
			),
		},
	];
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
	};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Layout className="site-layout">
				<Content style={{ margin: "24px 16px" }}>
					{/* --- Header Section --- */}
					<Row gutter={[16, 16]} style={{ marginBottom: 20 }} align="middle">
						<Col>
							<Title level={2} style={{ margin: 0 }}>
								Patient Details
							</Title>
						</Col>
						<Col flex="auto">
							{/* --- Action Bar --- */}
							<Space style={{ float: "right" }}>
								<Tooltip title="Add Service">
									<Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={handleOpenServiceModal} />
								</Tooltip>
								{!patientLoading && (
									<Tooltip title="Generate Patient File PDF">
										<PdfGenerator mode="patientFile" data={patient} labTests={labTests} fileNamePrefix="patient_file">
											<Button type="default" shape="circle" icon={<DownloadOutlined />} />
										</PdfGenerator>
									</Tooltip>
								)}
								<Tooltip title="Quick Notes">
									<Button type="default" shape="circle" icon={<EditOutlined />} onClick={handleOpenQuickNotesModal} />
								</Tooltip>
							</Space>
						</Col>
					</Row>

					{/* --- Quick Stats Dashboard --- */}
					{patient && (
						<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
							<Col xs={24} sm={12} md={6}>
								<Card>
									<Statistic title="Blood Type" value={patient.bloodType} prefix={<HeartOutlined style={{ color: "#cf1322" }} />} />
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card>
									<Statistic title="Age" value={moment().diff(patient.dateOfBirth, "years")} prefix={<UserOutlined />} />
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card>
									<Statistic
										title="Last Visit"
										value={patient.lastVisitDate ? moment(patient.lastVisitDate).fromNow() : "N/A"}
										prefix={<CalendarOutlined />}
									/>
								</Card>
							</Col>
							<Col xs={24} sm={12} md={6}>
								<Card>
									<Statistic
										title="Next Appointment"
										value={patient.nextAppointment ? moment(patient.nextAppointment).format("LLL") : "N/A"}
										prefix={<CalendarOutlined />}
									/>
								</Card>
							</Col>
						</Row>
					)}
					{/* --- Patient Details Card --- */}
					<Card style={{ marginBottom: "24px" }}>
						{patient && (
							<Row gutter={[24, 24]} align="middle">
								{/* Patient Avatar */}
								<Col
									xs={24}
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
									<Button type="default" icon={<EyeOutlined />} onClick={() => handleOpenAvatarModal(patient.profilePictureURL)}>
										View Profile Image
									</Button>
								</Col>

								{/* Patient Information */}
								<Col xs={24} sm={24} md={16} lg={18}>
									<Row gutter={[16, 8]}>
										<Col xs={24} sm={12}>
											<Text strong>Name:</Text> {patient.firstName} {patient.lastName}
										</Col>
										<Col xs={24} sm={12}>
											<Text strong>Date of Birth:</Text>{" "}
											{patient.dateOfBirth ? moment(patient.dateOfBirth).format("YYYY-MM-DD") : "N/A"}
										</Col>
										<Col xs={24} sm={12}>
											<Text strong>Gender:</Text> {patient.gender}
										</Col>
										<Col xs={24} sm={12}>
											<Text strong>Medical Record Number:</Text> {patient.medicalRecordNumber}
										</Col>
										<Col xs={24} sm={24}>
											<Text strong>Allergies:</Text>
											<Tag color="red">{patient.allergies || "None"}</Tag>
										</Col>
										<Col xs={24} sm={24}>
											<Text strong>Medical History:</Text> {patient.medicalHistory}
										</Col>
									</Row>

									{/* Contact Information - Highlighted Section */}
									<Divider orientation="left">Contact Information</Divider>
									<Row gutter={[16, 8]}>
										<Col xs={24} sm={12}>
											<EnvironmentOutlined /> <Text strong>Address:</Text> {patient.address}
										</Col>
										<Col xs={24} sm={12}>
											<PhoneOutlined /> <Text strong>Phone:</Text> {patient.phoneNumber}
										</Col>
										<Col xs={24} sm={12}>
											<MailOutlined /> <Text strong>Email:</Text> {patient.email}
										</Col>
									</Row>
								</Col>
							</Row>
						)}
					</Card>

					{/* --- Tabs --- */}
					<Card>
						<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
							<Col flex="auto">
								<Input.Search
									placeholder="Search in all tabs..."
									onSearch={handleSearch}
									style={{ width: "100%", maxWidth: 400 }}
									enterButton
								/>
							</Col>
							<Col>
								<Tooltip title="Filter Records">
									<Button shape="circle" icon={<FilterOutlined />} />
								</Tooltip>
							</Col>
						</Row>
						<Tabs defaultActiveKey="1" activeKey={activeTab} onChange={handleTabChange} type="card">
							<TabPane
								tab={
									<span>
										<ProfileOutlined />
										Admissions
									</span>
								}
								key="1">
								<PaginatedTable
									columns={admissionsColumns}
									data={admissions}
									loading={patientLoading}
									currentPage={admissionsPage}
									onPageChange={setAdmissionsPage}
									totalCount={totalCounts?.admissions || 0}
								/>
								<PdfGenerator mode="table" type="admission" data={admissions} columns={admissionsColumns} fileNamePrefix="admissions">
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<CalendarOutlined />
										Appointments
									</span>
								}
								key="2">
								<PaginatedTable
									columns={appointmentsColumns}
									data={appointments}
									loading={patientLoading}
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
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileTextOutlined />
										Assessments
									</span>
								}
								key="3">
								<PaginatedTable
									columns={assessmentsColumns}
									data={assessments}
									loading={patientLoading}
									currentPage={assessmentsPage}
									onPageChange={setAssessmentsPage}
									totalCount={totalCounts?.assessments || 0}
								/>
								<PdfGenerator mode="table" type="assessment" data={assessments} fileNamePrefix="assessments">
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<DollarOutlined />
										Billings
									</span>
								}
								key="4">
								<PaginatedTable
									columns={billingColumns}
									data={billings}
									loading={patientLoading}
									currentPage={billingsPage}
									onPageChange={setBillingsPage}
									totalCount={totalCounts?.billings || 0}
								/>
								<PdfGenerator mode="table" type="billing" data={billings} fileNamePrefix="billings">
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<UnorderedListOutlined />
										Care Plans
									</span>
								}
								key="5">
								<PaginatedTable
									columns={carePlansColumns}
									data={carePlans}
									loading={patientLoading}
									currentPage={carePlansPage}
									onPageChange={setCarePlansPage}
									totalCount={totalCounts?.carePlans || 0}
								/>
								<PdfGenerator mode="table" type="carePlan" data={carePlans} columns={carePlansColumns} fileNamePrefix="care_plans">
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<MedicineBoxOutlined />
										Prescriptions
									</span>
								}
								key="6">
								<PaginatedTable
									columns={prescriptionsColumns}
									data={prescriptions}
									loading={patientLoading}
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
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<HeartOutlined />
										Vital Signs
									</span>
								}
								key="7">
								<PaginatedTable
									columns={vitalSignsColumns}
									data={vitalSigns}
									loading={patientLoading}
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
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<ShoppingCartOutlined />
										Product Usages
									</span>
								}
								key="8">
								<PaginatedTable
									columns={productUsagesColumns}
									data={productUsages}
									loading={patientLoading}
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
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<MedicineBoxOutlined />
										Medication Administrations
									</span>
								}
								key="9">
								<PaginatedTable
									columns={medicationAdministrationsColumns}
									data={medicationAdministrations}
									loading={patientLoading}
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
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<PictureOutlined />
										Image Reports
									</span>
								}
								key="10">
								<PaginatedTable
									columns={imageReportsColumns}
									data={imageReports}
									loading={patientLoading}
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
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<ExperimentOutlined />
										Lab Results
									</span>
								}
								key="11">
								<PaginatedTable
									columns={labResultsColumns}
									data={labResults}
									loading={patientLoading}
									currentPage={labResultsPage}
									onPageChange={setLabResultsPage}
									totalCount={totalCounts?.labResults || 0}
								/>
								{/* Pass labTests to the PdfGenerator */}
								<PdfGenerator mode="table" type="labResult" data={labResults} fileNamePrefix="lab_results" labTests={labTests}>
									<Button type="default">Export Table PDF</Button>
								</PdfGenerator>
							</TabPane>
							<TabPane
								tab={
									<span>
										<FileTextOutlined />
										Documents
									</span>
								}
								key="12">
								<PaginatedTable
									columns={documentsColumns}
									data={documents}
									loading={patientLoading}
									currentPage={documentsPage}
									onPageChange={setDocumentsPage}
									totalCount={totalCounts?.documents || 0}
								/>
							</TabPane>
						</Tabs>
					</Card>
					{/* Footer here  */}
				</Content>
				<Footer style={{ textAlign: "center" }}></Footer>
			</Layout>
			{/* --- Modals --- */}
			<Modal title="Request Service" open={isServiceModalOpen} onCancel={handleCloseServiceModal} footer={null}>
				<MiniCreateActivityForm onActivityCreated={handleActivityCreated} patientId={patientId} />
			</Modal>
			<ExpandedRowDetails expandedRow={expandedRow} isModalOpen={isModalOpen} handleCloseModal={handleCloseModal} />
			<LabResultDetailsModal
				isOpen={isLabResultModalOpen}
				onClose={handleCloseLabResultModal}
				labResult={selectedLabResult}
				labTests={labTests}
			/>
			{isSliderOpen && selectedImageData && <ImageSlider open={isSliderOpen} data={selectedImageData} onClose={handleCloseSlider} />}
			<PatientAvatarModal imageUrl={selectedAvatarUrl} isOpen={isAvatarModalOpen} onClose={handleCloseAvatarModal} />
			<QuickNotesModal
				isOpen={isQuickNotesModalOpen}
				onClose={handleCloseQuickNotesModal}
				patientId={patientId}
				notes={patient?.notes}
				onSave={handleSaveQuickNotes} // Pass the save handler
			/>
		</Layout>
	);
};

export default PatientDetails;
