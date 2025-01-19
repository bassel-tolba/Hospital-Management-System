import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePatientDetailStore } from "../../services/patientDetail.service";
import {
    Container,
    Card,
    CardContent,
    Typography,
    Grid,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    Box,
    Pagination,
    CircularProgress,
    Paper,
    useTheme,
    Button,
    useMediaQuery,
    Chip,
    Modal,
} from "@mui/material";
import {
    ArrowBack,
    Event,
    Note,
    Receipt,
    PlaylistAddCheck,
    Medication,
    Timeline,
    ShoppingCart,
    LocalHospital,
    InsertPhoto,
    Science,
} from "@mui/icons-material";
import moment from "moment";
import styled from "@emotion/styled";
import heartSVG from "./heart.svg";
import chartSVG from "./chart.svg";
import pillSVG from "./pill.svg";
import ImageSlider from "./ImageSlider";
import LabResultDetailsModal from "./LabResultDetailsModal"; // Import the new component
import ReactPageFlip from "react-pageflip";
import MiniCreateActivityForm from "./MiniCreateActivityForm";
// Custom CSS using styled

const StyledPaginationContainer = styled(Box)`
    display: flex;
    justify-content: center;
    margin-top: 20px;
    & .MuiPagination-ul {
        li {
            & button {
                background-color: ${(props) => props.theme.palette.action.disabledBackground};
                color: ${(props) => props.theme.palette.text.primary};
                border-radius: 4px;
                margin: 0 4px; // Add space between buttons
                &:hover,
                &.Mui-selected {
                    background-color: ${(props) => props.theme.palette.action.disabled};
                }
            }
        }
    }
`;

const ErrorMessage = styled(Typography)`
    color: red;
    text-align: center;
    margin-top: 10px;
`;

const LoaderContainer = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
`;

const CustomGridItem = styled(Grid)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 5px;
    @media (max-width: 600px) {
        flex-basis: 100%;
    }
`;

const CustomLabel = styled(Typography)`
    color: ${(props) => props.theme.palette.text.secondary};
    font-size: 0.9em;
    margin-bottom: 4px;
    font-weight: bold;
`;

const CustomValue = styled(Typography)`
    color: ${(props) => props.theme.palette.text.primary};
    font-size: 1em;
`;

// Styled container to wrap the table for horizontal scrolling on small screens
const ResponsiveTableContainer = styled(Box)`
    overflow-x: auto; /* Enable horizontal scroll if needed */
    width: 100%; /* Make sure container takes the whole width */
`;
// Style for the Modal
const StyledModal = styled(Modal)`
    display: flex;
    align-items: center;
    justify-content: center;
`;
const StyledModalPaper = styled(Paper)`
    padding: 20px;
    max-width: 80%;
    overflow: auto;
    max-height: 80vh;
`;

const DetailItem = styled(Box)`
    margin-bottom: 15px;
`;

const DetailLabel = styled(Typography)`
    font-weight: bold;
    color: ${(props) => props.theme.palette.text.secondary};
    margin-bottom: 5px;
`;

const DetailValue = styled(Typography)`
    color: ${(props) => props.theme.palette.text.primary};
`;
const DetailList = styled(Box)`
    padding-left: 20px;
    width: 100%;
`;
const StyledListItem = styled(Box)`
    padding: 2px 0;
`;

const PatientDetails = () => {
	const theme = useTheme();
	const { patientId } = useParams();
	const {
		fetchPatientData,
		loading: patientLoading,
		error: patientError,
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
		labResults, // New state for lab results
		totalCounts,
	} = usePatientDetailStore();

	const navigate = useNavigate();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Check if screen is small

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
	const [labResultsPage, setLabResultsPage] = useState(0); // New state for lab results pagination

	const pageSize = 10; // Page Size

	// Loading States
	const [admissionsLoading, setAdmissionsLoading] = useState(false);
	const [appointmentsLoading, setAppointmentsLoading] = useState(false);
	const [assessmentsLoading, setAssessmentsLoading] = useState(false);
	const [billingsLoading, setBillingsLoading] = useState(false);
	const [carePlansLoading, setCarePlansLoading] = useState(false);
	const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
	const [vitalSignsLoading, setVitalSignsLoading] = useState(false);
	const [productUsagesLoading, setProductUsagesLoading] = useState(false);
	const [medicationAdministrationsLoading, setMedicationAdministrationsLoading] = useState(false);
	const [imageReportsLoading, setImageReportsLoading] = useState(false);
	const [labResultsLoading, setLabResultsLoading] = useState(false); // New loading state for lab results

	// Error States
	const [admissionsError, setAdmissionsError] = useState(null);
	const [appointmentsError, setAppointmentsError] = useState(null);
	const [assessmentsError, setAssessmentsError] = useState(null);
	const [billingsError, setBillingsError] = useState(null);
	const [carePlansError, setCarePlansError] = useState(null);
	const [prescriptionsError, setPrescriptionsError] = useState(null);
	const [vitalSignsError, setVitalSignsError] = useState(null);
	const [productUsagesError, setProductUsagesError] = useState(null);
	const [medicationAdministrationsError, setMedicationAdministrationsError] = useState(null);
	const [imageReportsError, setImageReportsError] = useState(null);
	const [labResultsError, setLabResultsError] = useState(null); // New error state for lab results

	// State for Image Slider
	const [isSliderOpen, setIsSliderOpen] = useState(false);
	const [selectedImageUrls, setSelectedImageUrls] = useState([]);

	// State for detailed Lab Result Modal
	const [isLabResultModalOpen, setIsLabResultModalOpen] = useState(false);
	const [selectedLabResult, setSelectedLabResult] = useState(null);

	// State to force a re-render
	const [activityCreated, setActivityCreated] = useState(false);
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

	const handleOpenSlider = (imageUrls) => {
		setSelectedImageUrls(imageUrls);
		setIsSliderOpen(true);
	};

	const handleCloseSlider = () => {
		setIsSliderOpen(false);
	};

	// State for current tab
	const [activeTab, setActiveTab] = useState("admissions");
	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};
	// State for Expanded Row
	const [expandedRow, setExpandedRow] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Function to open a Modal
	const handleOpenModal = (row, type) => {
		setExpandedRow({ ...row, type: type });
		setIsModalOpen(true);
	};
	// Function to close a Modal
	const handleCloseModal = () => {
		setExpandedRow(null);
		setIsModalOpen(false);
	};
	// Initial Patient Data Fetch
	useEffect(() => {
		fetchPatientData(patientId);
	}, [patientId, fetchPatientData]);

	//Individual Fetch for each data type
	useEffect(() => {
		const fetchData = async () => {
			setAdmissionsLoading(true);
			setAdmissionsError(null);
			try {
				await fetchPatientData(
					patientId,
					admissionsPage + 1,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setAdmissionsError(error.message);
			} finally {
				setAdmissionsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, admissionsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setAppointmentsLoading(true);
			setAppointmentsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					appointmentsPage + 1,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setAppointmentsError(error.message);
			} finally {
				setAppointmentsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, appointmentsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setAssessmentsLoading(true);
			setAssessmentsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					assessmentsPage + 1,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setAssessmentsError(error.message);
			} finally {
				setAssessmentsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, assessmentsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setBillingsLoading(true);
			setBillingsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					billingsPage + 1,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setBillingsError(error.message);
			} finally {
				setBillingsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, billingsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setCarePlansLoading(true);
			setCarePlansError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					undefined,
					carePlansPage + 1,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setCarePlansError(error.message);
			} finally {
				setCarePlansLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, carePlansPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setPrescriptionsLoading(true);
			setPrescriptionsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					prescriptionsPage + 1,
					undefined,
					undefined,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setPrescriptionsError(error.message);
			} finally {
				setPrescriptionsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, prescriptionsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setVitalSignsLoading(true);
			setVitalSignsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					vitalSignsPage + 1,
					undefined,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setVitalSignsError(error.message);
			} finally {
				setVitalSignsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, vitalSignsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setProductUsagesLoading(true);
			setProductUsagesError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					productUsagesPage + 1,
					undefined,
					undefined,
					pageSize
				);
			} catch (error) {
				setProductUsagesError(error.message);
			} finally {
				setProductUsagesLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, productUsagesPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setMedicationAdministrationsLoading(true);
			setMedicationAdministrationsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					medicationAdministrationsPage + 1,
					undefined,
					pageSize
				);
			} catch (error) {
				setMedicationAdministrationsError(error.message);
			} finally {
				setMedicationAdministrationsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, medicationAdministrationsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setImageReportsLoading(true);
			setImageReportsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					imageReportsPage + 1,
					undefined,
					pageSize
				);
			} catch (error) {
				setImageReportsError(error.message);
			} finally {
				setImageReportsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, imageReportsPage, pageSize, activityCreated]);

	useEffect(() => {
		const fetchData = async () => {
			setLabResultsLoading(true);
			setLabResultsError(null);
			try {
				await fetchPatientData(
					patientId,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					undefined,
					labResultsPage + 1,
					pageSize
				);
			} catch (error) {
				setLabResultsError(error.message);
			} finally {
				setLabResultsLoading(false);
			}
		};
		fetchData();
	}, [patientId, fetchPatientData, labResultsPage, pageSize, activityCreated]);

	const handleBack = () => {
		navigate("/patients");
	};

	const renderDetail = (label, value) => {
		return (
			<DetailItem>
				<DetailLabel>{label}</DetailLabel>
				<DetailValue>{value ? value : "N/A"}</DetailValue>
			</DetailItem>
		);
	};

	const renderMedicationList = (medications) => {
		return (
			<DetailItem>
				<DetailLabel>Prescribed Medications</DetailLabel>
				{medications && medications.length > 0 ? (
					<DetailList>
						{medications.map((medication, index) => (
							<StyledListItem key={index}>
								<Typography>
									Medication Name: {medication.medicationName}, Dosage: {medication.dosage}, Route: {medication.route}, Amount:{" "}
									{medication.amount}
									{medication.expired && <Chip label="Administered" color="error" size="small" sx={{ marginLeft: 1 }} />}
								</Typography>
							</StyledListItem>
						))}
					</DetailList>
				) : (
					<DetailValue>No medications prescribed</DetailValue>
				)}
			</DetailItem>
		);
	};
	const renderImagesList = (images) => {
		return (
			<DetailItem>
				<DetailLabel>ImageUrls</DetailLabel>
				{images && images.length > 0 ? (
					<DetailList>
						{images.map((imageUrl, index) => (
							<StyledListItem key={index}>
								<Typography>
									<a href={imageUrl} target="_blank" rel="noopener noreferrer">
										{imageUrl}
									</a>
								</Typography>
							</StyledListItem>
						))}
					</DetailList>
				) : (
					<DetailValue>No Images available</DetailValue>
				)}
			</DetailItem>
		);
	};

	const renderAssessmentNotes = (notes) => {
		return (
			<ReactPageFlip width={400} height={500} drawShadow={true}>
				<div dangerouslySetInnerHTML={{ __html: notes }} />
			</ReactPageFlip>
		);
	};

	const renderExpandedRowDetails = ({ expandedRow, isModalOpen, handleCloseModal }) => {
		if (!expandedRow) return null;
		const { type, ...data } = expandedRow;
		return (
			<StyledModal open={isModalOpen} onClose={handleCloseModal}>
				<StyledModalPaper>
					<Typography variant="h5" align="center" gutterBottom>
						Detailed {type} Information
					</Typography>
					<Grid container spacing={2}>
						{type === "Admission" && (
							<>
								<Grid item xs={12}>
									{renderDetail(
										"Admission Date",
										data.admissionDate ? moment(data.admissionDate).format("YYYY-MM-DD HH:mm") : "N/A"
									)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail(
										"Discharge Date",
										data.dischargeDate ? moment(data.dischargeDate).format("YYYY-MM-DD HH:mm") : "Open"
									)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Bed ID", data.bedId)}
								</Grid>
							</>
						)}
						{type === "Appointment" && (
							<>
								<Grid item xs={12}>
									{renderDetail(
										"Appointment Date",
										data.appointmentDate ? moment(data.appointmentDate).format("YYYY-MM-DD HH:mm") : "N/A"
									)}
								</Grid>
							</>
						)}
						{type === "Assessment" && (
							<>
								<Grid item xs={12}>
									{renderDetail(
										"Assessment Date",
										data.assessmentDateTime ? moment(data.assessmentDateTime).format("YYYY-MM-DD HH:mm") : "N/A"
									)}
								</Grid>
								<Grid item xs={12}>
									{renderAssessmentNotes(data.notes)}
								</Grid>
							</>
						)}
						{type === "Billing" && (
							<>
								<Grid item xs={12}>
									{renderDetail("Billing Date", data.billDate ? moment(data.billDate).format("YYYY-MM-DD HH:mm") : "N/A")}
								</Grid>

								<Grid item xs={12}>
									{renderAssessmentNotes(data.bill)}
								</Grid>
							</>
						)}
						{type === "Care Plan" && (
							<>
								<Grid item xs={12}>
									{renderDetail("Plan Date", data.planDate ? moment(data.planDate).format("YYYY-MM-DD HH:mm") : "N/A")}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Goal", data.goal)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Interventions", data.interventions)}
								</Grid>
							</>
						)}
						{type === "Prescription" && (
							<>
								<Grid item xs={12}>
									{renderDetail(
										"Prescription Date",
										data.prescriptionDate ? moment(data.prescriptionDate).format("YYYY-MM-DD HH:mm") : "N/A"
									)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Note", data.note)}
								</Grid>
								<Grid item xs={12}>
									{renderMedicationList(data.prescribedMedications)}
								</Grid>
							</>
						)}
						{type === "Vital Sign" && (
							<>
								<Grid item xs={12}>
									{renderDetail("Record Date", data.timestamp ? moment(data.timestamp).format("YYYY-MM-DD HH:mm") : "N/A")}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Temperature", data.temperature)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Heart Rate", data.heartRate)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Blood Pressure", `${data.bloodPressureSystolic}/${data.bloodPressureDiastolic}`)}
								</Grid>
							</>
						)}
						{type === "Product Usage" && (
							<>
								<Grid item xs={12}>
									{renderDetail("Start Time", data.startTime ? moment(data.startTime).format("YYYY-MM-DD HH:mm") : "N/A")}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("End Time", data.endTime ? moment(data.endTime).format("YYYY-MM-DD HH:mm") : "N/A")}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Product ID", data.productId)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Product Name", data.productName)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Quantity", data.quantity)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Price", data.price)}
								</Grid>
							</>
						)}
						{type === "Medication Administration" && (
							<>
								<Grid item xs={12}>
									{renderDetail(
										"Administration Time",
										data.administrationTime ? moment(data.administrationTime).format("YYYY-MM-DD HH:mm") : "N/A"
									)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Amount", data.amount)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Calculated Price", data.calculatedPrice)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Prescribed Medication Id", data.prescribedMedicationId)}
								</Grid>
							</>
						)}
						{type === "Image Report" && (
							<>
								<Grid item xs={12}>
									{renderDetail(
										"Report Date",
										data.reportDateTime ? moment(data.reportDateTime).format("YYYY-MM-DD HH:mm") : "N/A"
									)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Image Type", data.imageType)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Description", data.description)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Report Text", data.reportText)}
								</Grid>
							</>
						)}
						{type === "Lab Result" && (
							<>
								<Grid item xs={12}>
									{renderDetail(
										"Result Date Time",
										data.resultDateTime ? moment(data.resultDateTime).format("YYYY-MM-DD HH:mm") : "N/A"
									)}
								</Grid>
								<Grid item xs={12}>
									{renderDetail("Notes", data.notes)}
								</Grid>
							</>
						)}
					</Grid>
				</StyledModalPaper>
			</StyledModal>
		);
	};

	if (patientLoading) {
		return (
			<Container>
				<LoaderContainer>
					<CircularProgress color="primary" />
				</LoaderContainer>
			</Container>
		);
	}

	if (patientError) {
		return (
			<Container>
				<ErrorMessage>Error: {patientError}</ErrorMessage>
			</Container>
		);
	}
	if (!patient) {
		return (
			<Container>
				<ErrorMessage>Patient not found.</ErrorMessage>
			</Container>
		);
	}
	const admissionsColumns = [
		{
			title: "Admission Date",
			dataIndex: "admissionDate",
			key: "admissionDate",
			render: (text, record) => (
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Admission")}>
						View Details
					</Button>
				</>
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
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Appointment")}>
						View Details
					</Button>
				</>
			),
		},
	];
	const assessmentsColumns = [
		{
			title: "Assessment Date",
			dataIndex: "assessmentDateTime",
			key: "assessmentDate",
			render: (text, record) => (
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Assessment")}>
						View Details
					</Button>
				</>
			),
		},
	];
	const billingColumns = [
		{
			title: "Billing Date",
			dataIndex: "billDate",
			key: "billingDate",
			render: (text, record) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},

		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (text, record) => (
				<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Billing")}>
					View Details
				</Button>
			),
		},
	];
	const carePlansColumns = [
		{
			title: "Plan Date",
			dataIndex: "planDate",
			key: "planDate",
			render: (text, record) => (
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Care Plan")}>
						View Details
					</Button>
				</>
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
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Prescription")}>
						View Details
					</Button>
				</>
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
				record.prescribedMedications && record.prescribedMedications.length > 0 ? (
					<ul style={{ margin: 0 }}>
						{record.prescribedMedications.map((medication, index) => (
							<li key={index}>
								Medication Name: {medication.medicationName}, Dosage: {medication.dosage}, Route: {medication.route}, Amount:{" "}
								{medication.amount}
								{medication.expired && <Chip label="Administered" color="error" size="small" sx={{ marginLeft: 1 }} />}
							</li>
						))}
					</ul>
				) : (
					"No medications prescribed"
				),
		},
	];
	const vitalSignsColumns = [
		{
			title: "Record Date",
			dataIndex: "timestamp",
			key: "recordDate",
			render: (text, record) => (
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Vital Sign")}>
						View Details
					</Button>
				</>
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
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Product Usage")}>
						View Details
					</Button>
				</>
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
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Medication Administration")}>
						View Details
					</Button>
				</>
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
			title: "Prescribed Medication Id",
			dataIndex: "prescribedMedicationId",
			key: "prescribedMedicationId",
		},
	];

	const imageReportsColumns = [
		{
			title: "Report Date",
			dataIndex: "reportDateTime",
			key: "reportDateTime",
			render: (text, record) => (
				<>
					{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}
					<Button variant="outlined" color="primary" onClick={() => handleOpenModal(record, "Image Report")}>
						View Details
					</Button>
				</>
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
			render: (text, record) =>
				record.imageUrls && record.imageUrls.length > 0 ? (
					<Button variant="outlined" color="primary" onClick={() => handleOpenSlider(record.imageUrls)}>
						View Images
					</Button>
				) : (
					"No images available"
				),
		},
	];
	const labResultsColumns = [
		{
			title: "Result Date Time",
			dataIndex: "resultDateTime",
			key: "resultDateTime",
			render: (text, record) => <>{text ? moment(text).format("YYYY-MM-DD HH:mm") : "N/A"}</>,
		},
		{
			title: "Notes",
			dataIndex: "notes",
			key: "notes",
		},
		{
			title: "Lab Results",
			key: "labResults",
			render: (text, record) => {
				return Object.entries(record.resultMap).map(([key, value], index) => (
					<div key={index}>
						<Typography variant="subtitle2" sx={{ fontWeight: "bold", display: "inline" }}>
							{key}:
						</Typography>
						<Typography variant="body2" sx={{ display: "inline", marginLeft: "5px" }}>
							{value.الاسم} , {value["فصيله الدم"]}, {value["عدد كريات الدم"]}
						</Typography>
					</div>
				));
			},
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Button variant="outlined" color="primary" onClick={() => handleOpenLabResultModal(record)}>
					View Details
				</Button>
			),
		},
	];
	const renderTable = (data, columns, loadingState, errorState, currentPage, onPageChange, totalCount) => {
		if (loadingState) {
			return (
				<LoaderContainer>
					<CircularProgress color="primary" size={30} />
				</LoaderContainer>
			);
		}

		if (errorState) {
			return <ErrorMessage>{errorState}</ErrorMessage>;
		}
		return (
			<>
				{data && (
					<ResponsiveTableContainer>
						<Paper elevation={2}>
							<Table sx={{ minWidth: 650 }}>
								<TableHead>
									<TableRow>
										{columns.map((col) => (
											<TableCell
												key={col.key}
												sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.disabledBackground }}>
												{col.title}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{data.map((row) => (
										<TableRow
											key={row.id}
											sx={{
												"&:nth-of-type(odd)": {
													backgroundColor: theme.palette.action.disabledBackground,
												},
											}}>
											{columns.map((col) => (
												<TableCell key={col.key}>
													{col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
												</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Paper>
					</ResponsiveTableContainer>
				)}
				<StyledPaginationContainer>
					<Pagination
						count={Math.ceil(totalCount / pageSize)}
						page={currentPage + 1}
						onChange={(event, page) => onPageChange(page - 1)}
						color="primary"
					/>
				</StyledPaginationContainer>
			</>
		);
	};

	return (
		<Container maxWidth="lg" sx={{ paddingTop: "20px", backgroundColor: "background.default" }}>
			<ImageSlider open={isSliderOpen} images={selectedImageUrls} onClose={handleCloseSlider} theme={theme} />
			<LabResultDetailsModal open={isLabResultModalOpen} onClose={handleCloseLabResultModal} labResult={selectedLabResult} theme={theme} />
			<IconButton sx={{ position: "absolute", top: "20px", left: "20px" }} onClick={handleBack}>
				<ArrowBack />
			</IconButton>

			<Card sx={{ marginBottom: "20px", padding: isSmallScreen ? "10px" : "20px" }}>
				{" "}
				{/* Apply padding based on screen size */}
				<CardContent>
					<Typography variant="h5" align="center" gutterBottom>
						Patient Details
					</Typography>
					<Grid container spacing={2}>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>First Name</CustomLabel>
							<CustomValue>{patient.firstName}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Last Name</CustomLabel>
							<CustomValue>{patient.lastName}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Date of Birth</CustomLabel>
							<CustomValue>{patient.dateOfBirth ? moment(patient.dateOfBirth).format("YYYY-MM-DD") : "N/A"}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Gender</CustomLabel>
							<CustomValue>{patient.gender}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Address</CustomLabel>
							<CustomValue>{patient.address}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Phone Number</CustomLabel>
							<CustomValue>{patient.phoneNumber}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Email</CustomLabel>
							<CustomValue>{patient.email}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Medical Record Number</CustomLabel>
							<CustomValue>{patient.medicalRecordNumber}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Blood Type</CustomLabel>
							<CustomValue>{patient.bloodType}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12} sm={6}>
							<CustomLabel>Allergies</CustomLabel>
							<CustomValue>{patient.allergies}</CustomValue>
						</CustomGridItem>
						<CustomGridItem item xs={12}>
							<CustomLabel>Medical History</CustomLabel>
							<CustomValue>{patient.medicalHistory}</CustomValue>
						</CustomGridItem>
					</Grid>
				</CardContent>
			</Card>
			<Card sx={{ marginBottom: "20px", padding: isSmallScreen ? "10px" : "20px" }}>
				<CardContent>
					<Typography variant="h6" align="center" gutterBottom>
						Request Service
					</Typography>
					<MiniCreateActivityForm onActivityCreated={handleActivityCreated} patientId={patientId} />
				</CardContent>
			</Card>
			<Card sx={{ padding: isSmallScreen ? "10px" : "20px" }}>
				{" "}
				{/* Apply padding based on screen size */}
				<CardContent>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={activeTab}
							onChange={handleTabChange}
							aria-label="patient-details-tabs"
							variant="scrollable"
							scrollButtons="auto">
							<Tab icon={<LocalHospital />} label="Admissions" value="admissions" />
							<Tab icon={<Event />} label="Appointments" value="appointments" />
							<Tab icon={<Note />} label="Assessments" value="assessments" />
							<Tab icon={<Receipt />} label="Billings" value="billings" />
							<Tab icon={<PlaylistAddCheck />} label="Care Plans" value="carePlans" />
							<Tab icon={<Medication />} label="Prescriptions" value="prescriptions" />
							<Tab icon={<Timeline />} label="Vital Signs" value="vitalSigns" />
							<Tab icon={<ShoppingCart />} label="Product Usages" value="productUsages" />
							<Tab
								icon={<img src={pillSVG} alt="Pill SVG" style={{ width: 24, height: 24 }} />}
								label="Medication Administrations"
								value="medicationAdministrations"
							/>
							<Tab icon={<InsertPhoto />} label="Image Reports" value="imageReports" />
							<Tab icon={<Science />} label="Lab Results" value="labResults" />
						</Tabs>
					</Box>
					{renderExpandedRowDetails({ expandedRow, isModalOpen, handleCloseModal })}
					{activeTab === "admissions" &&
						renderTable(
							admissions,
							admissionsColumns,
							admissionsLoading,
							admissionsError,
							admissionsPage,
							setAdmissionsPage,
							totalCounts?.admissions || 0
						)}
					{activeTab === "appointments" &&
						renderTable(
							appointments,
							appointmentsColumns,
							appointmentsLoading,
							appointmentsError,
							appointmentsPage,
							setAppointmentsPage,
							totalCounts?.appointments || 0
						)}
					{activeTab === "assessments" &&
						renderTable(
							assessments,
							assessmentsColumns,
							assessmentsLoading,
							assessmentsError,
							assessmentsPage,
							setAssessmentsPage,
							totalCounts?.assessments || 0
						)}
					{activeTab === "billings" &&
						renderTable(
							billings,
							billingColumns,
							billingsLoading,
							billingsError,
							billingsPage,
							setBillingsPage,
							totalCounts?.billings || 0
						)}
					{activeTab === "carePlans" &&
						renderTable(
							carePlans,
							carePlansColumns,
							carePlansLoading,
							carePlansError,
							carePlansPage,
							setCarePlansPage,
							totalCounts?.carePlans || 0
						)}
					{activeTab === "prescriptions" &&
						renderTable(
							prescriptions,
							prescriptionsColumns,
							prescriptionsLoading,
							prescriptionsError,
							prescriptionsPage,
							setPrescriptionsPage,
							totalCounts?.prescriptions || 0
						)}
					{activeTab === "vitalSigns" &&
						renderTable(
							vitalSigns,
							vitalSignsColumns,
							vitalSignsLoading,
							vitalSignsError,
							vitalSignsPage,
							setVitalSignsPage,
							totalCounts?.vitalSigns || 0
						)}
					{activeTab === "productUsages" &&
						renderTable(
							productUsages,
							productUsagesColumns,
							productUsagesLoading,
							productUsagesError,
							productUsagesPage,
							setProductUsagesPage,
							totalCounts?.productUsages || 0
						)}
					{activeTab === "medicationAdministrations" &&
						renderTable(
							medicationAdministrations,
							medicationAdministrationsColumns,
							medicationAdministrationsLoading,
							medicationAdministrationsError,
							medicationAdministrationsPage,
							setMedicationAdministrationsPage,
							totalCounts?.medicationAdministrations || 0
						)}
					{activeTab === "imageReports" &&
						renderTable(
							imageReports,
							imageReportsColumns,
							imageReportsLoading,
							imageReportsError,
							imageReportsPage,
							setImageReportsPage,
							totalCounts?.imageReports || 0
						)}
					{activeTab === "labResults" &&
						renderTable(
							labResults,
							labResultsColumns,
							labResultsLoading,
							labResultsError,
							labResultsPage,
							setLabResultsPage,
							totalCounts?.labResults || 0
						)}
				</CardContent>
			</Card>
		</Container>
	);
};

export default PatientDetails;