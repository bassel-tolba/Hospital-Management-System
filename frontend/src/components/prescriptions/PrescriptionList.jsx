import React, { useState, useEffect } from "react";
import {
	Table,
	Button,
	Space,
	Typography,
	Modal,
	Form,
	Select,
	Input,
	AutoComplete,
	InputNumber,
	Alert,
	Tag,
	Row,
	Col,
	Spin,
	notification,
} from "antd";
import { usePrescriptionStore } from "../../services/prescription.service";
import { useMedicationStore } from "../../services/medication.service";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import usePrescriptionPatient from "./usePrescriptionPatient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dayjs from "dayjs";
import { useAuthStore } from "../../services/auth.service"; // Import useAuthStore

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const apiKey = "AIzaSyDrsmf3oyOeUhXFXkuoUXMxVkTkSlfeNy0"; // Hardcoded API key

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const model = genAI
	? genAI.getGenerativeModel({
			model: "gemini-2.0-flash-exp",
	  })
	: null;

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
};

const severityColors = {
	NONE: "green",
	MINOR: "blue",
	MODERATE: "orange",
	SEVERE: "red",
};

const PrescriptionList = () => {
	const {
		prescriptions,
		loading,
		total,
		deletePrescription,
		createPrescription,
		getPrescriptionById,
		setLoading,
		fetchPrescriptionsByPatientId,
		updatePrescription,
		setPrescriptions,
	} = usePrescriptionStore();
	const { medications, searchMedications, fetchAllMedications } = useMedicationStore(); // Updated here
	const { fetchPatientById, searchPatientOptions, patientOptions, clearPatientOptions } = usePrescriptionPatient();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedPrescription, setSelectedPrescription] = useState(null);
	const [medicationOptions, setMedicationOptions] = useState([]);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [medicationSearchTerm, setMedicationSearchTerm] = useState("");
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [prescribedMedications, setPrescribedMedications] = useState([]);
	const [medicationForms, setMedicationForms] = useState({});
	const [isViewOnly, setIsViewOnly] = useState(false);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	const [conflictWarnings, setConflictWarnings] = useState([]);
	const [checkingConflicts, setCheckingConflicts] = useState(false);
	const [checkingPatientHistory, setCheckingPatientHistory] = useState(false);
	const [patientHistoryWarnings, setPatientHistoryWarnings] = useState([]);
	const [searchPatientId, setSearchPatientId] = useState(null);
	const [medicationsLoaded, setMedicationsLoaded] = useState(false);
	const { hasAuthority } = useAuthStore(); // Use hasAuthority hook

	// Define permission checks (adjust these names to match your backend)
	const canReadPrescription = hasAuthority("READ_PRESCRIPTION");
	const canCreatePrescription = hasAuthority("CREATE_PRESCRIPTION");
	const canUpdatePrescription = hasAuthority("UPDATE_PRESCRIPTION");
	const canDeletePrescription = hasAuthority("DELETE_PRESCRIPTION");
	const canExpirePrescription = hasAuthority("UPDATE_PRESCRIPTION"); // Assuming you have an authority for expiring

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await fetchPrescriptions();
			await fetchAllMedications().then(() => setMedicationsLoaded(true));
			setLoading(false);
		};
		fetchData();
	}, [page, size, searchPatientId, setLoading, fetchAllMedications]);

	const fetchPrescriptions = async () => {
		setLoading(true);
		if (!canReadPrescription) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to view prescriptions.",
			});
			setLoading(false);
			return; // Stop execution if no permission
		}
		if (searchPatientId) {
			await fetchPrescriptionsByPatientId(searchPatientId, page, size);
		} else {
			setLoading(false);
			setPrescriptions([]);
		}
		setLoading(false);
	};

	const handleSearchPatientFilter = (patientId) => {
		setSearchPatientId(patientId);
		setPage(0);
	};

	const handleMedicationSearch = async (value) => {
		setMedicationSearchTerm(value);
		if (value) {
			try {
				const searchResults = await searchMedications({
					searchTerm: value,
					page: 0,
					size: 10,
				});
				setMedicationOptions(
					searchResults?.map((medication) => ({
						label: medication.name,
						value: medication.id.toString(),
						medication,
					})) || []
				);
			} catch (error) {
				console.error("Failed to search medications:", error);
				setMedicationOptions([]);
			}
		} else {
			setMedicationOptions([]);
		}
	};

	const handlePatientSearch = async (value) => {
		setPatientSearchTerm(value);
		await searchPatientOptions(value);
	};

	const handlePatientSelect = async (value, option) => {
		try {
			const patient = await fetchPatientById(value);
			setSelectedPatient(patient);
			form.setFieldsValue({ patientId: value });
		} catch (error) {
			console.error("Failed to fetch selected patient:", error);
		}
	};

	const showModal = async (prescription, viewOnly = false) => {
		if (!canCreatePrescription && !prescription) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create prescriptions.",
			});
			return;
		}
		if (prescription && !canUpdatePrescription && !viewOnly) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to edit prescriptions.",
			});
			return;
		}
		setSelectedPrescription(prescription);
		setSelectedPatient(null);
		setIsViewOnly(viewOnly);
		setPrescribedMedications(prescription?.prescribedMedications || []);
		if (prescription) {
			form.setFieldsValue(prescription);
			try {
				const patient = await fetchPatientById(prescription.patientId);
				setSelectedPatient(patient);
				form.setFieldsValue({ patientId: patient.id });
			} catch (error) {
				console.error("Failed to fetch patient for existing prescription:", error);
			}

			setMedicationForms(
				(prescription.prescribedMedications || []).reduce((acc, pm, index) => {
					acc[index] = {
						medicationId: pm.medicationId,
						id: pm.id,
						dosage: pm.dosage,
						route: pm.route,
						amount: pm.amount,
						expired: pm.expired,
					};
					return acc;
				}, {})
			);
		} else {
			form.resetFields();
			setMedicationForms({});
		}
		setIsModalVisible(true);
		setMedicationSearchTerm("");
		setMedicationOptions([]);
		setPatientSearchTerm("");
		clearPatientOptions();
		setConflictWarnings([]);
		setPatientHistoryWarnings([]);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedPrescription(null);
		form.resetFields();
		setPrescribedMedications([]);
		setMedicationForms({});
		setMedicationSearchTerm("");
		setMedicationOptions([]);
		setPatientSearchTerm("");
		clearPatientOptions();
		setIsViewOnly(false);
		setConflictWarnings([]);
		setPatientHistoryWarnings([]);
	};

	const handleAddMedication = () => {
		const newIndex = Object.keys(medicationForms).length;
		setMedicationForms({
			...medicationForms,
			[newIndex]: { medicationId: null, dosage: "", route: "", amount: 0 },
		});
	};

	const handleRemoveMedication = (index) => {
		const newMedicationForms = { ...medicationForms };
		delete newMedicationForms[index];
		setMedicationForms(newMedicationForms);
	};

	const handleMedicationChange = (index, field, value) => {
		setMedicationForms({
			...medicationForms,
			[index]: { ...medicationForms[index], [field]: value },
		});
	};

	const handleExpirePrescription = async (prescription) => {
		if (!canExpirePrescription) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to expire prescriptions.",
			});
			return;
		}
		try {
			const updatedPrescription = await getPrescriptionById(prescription.id);
			if (!updatedPrescription) {
				console.error("Failed to get prescription data");
				return;
			}
			const expiredPrescription = {
				...updatedPrescription,
				validityDays: 0,
				expirationDate: dayjs().format("YYYY-MM-DD"),
			};
			await updatePrescription(expiredPrescription.id, expiredPrescription);
			fetchPrescriptions();
		} catch (error) {
			console.error("Error marking prescription as expired:", error);
			notification.error({
				// Add error notification
				message: "Error",
				description: "Failed to expire the prescription.",
			});
		}
	};

	const handleFormSubmit = async () => {
		if (selectedPrescription && !canUpdatePrescription) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to update prescriptions.",
			});
			return;
		}
		if (!selectedPrescription && !canCreatePrescription) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to create prescriptions.",
			});
			return;
		}
		try {
			const values = await form.validateFields();
			if (selectedPatient) {
				values.patientId = selectedPatient.id;
			}

			const medicationArray = Object.values(medicationForms)
				.filter((form) => form.medicationId != null)
				.map((form) => {
					const med = medications?.find((med) => med.id === form.medicationId);
					return {
						id: form.id || null,
						medicationId: form.medicationId,
						dosage: form.dosage,
						route: form.route,
						amount: form.amount,
						expired: form.expired,
						medicationName: med?.name,
					};
				});
			values.prescribedMedications = medicationArray;

			if (selectedPrescription) {
				await updatePrescription(selectedPrescription.id, values);
			} else {
				await createPrescription(values);
			}
			fetchPrescriptions();
			handleCancel();
		} catch (error) {
			console.log("Error in handle form submit", error);
			notification.error({
				// Add error notification
				message: "Error",
				description: "Failed to save the prescription.",
			});
		}
	};

	const handleDelete = async (prescriptionId) => {
		if (!canDeletePrescription) {
			notification.error({
				message: "Permission Denied",
				description: "You do not have permission to delete prescriptions.",
			});
			return;
		}
		try {
			await deletePrescription(prescriptionId);
			fetchPrescriptions();
		} catch (error) {
			console.error("Error deleting prescription:", error);
			notification.error({
				// Add error notification
				message: "Error",
				description: "Failed to delete the prescription.",
			});
		}
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	const getPatientName = (patientId) => {
		if (!patientId) return "N/A";
		if (selectedPrescription && selectedPrescription.patientId === patientId && selectedPatient) {
			return `${selectedPatient.firstName} ${selectedPatient.lastName}`;
		}
		return "Loading...";
	};

	const getMedicationName = (medicationId) => {
		if (!medicationId) return "N/A";
		const medication = medications?.find((med) => med.id === medicationId);
		return medication ? medication.name : "N/A";
	};

	// Redesigned checkMedicationConflicts function
	const checkMedicationConflicts = async () => {
		if (!model || !medicationsLoaded) {
			console.warn("Gemini API key not found, or medications not loaded. Skipping conflict check.");
			return;
		}
		setCheckingConflicts(true);
		setConflictWarnings([]);

		const medicationNames = Object.values(medicationForms)
			.filter((form) => form.medicationId != null)
			.map((form) => {
				const medOption = medicationOptions?.find((medOption) => medOption.value === form.medicationId?.toString());

				return medOption?.medication?.name;
			})
			.filter(Boolean)
			.join(", ");

		if (!medicationNames) {
			setCheckingConflicts(false);
			return;
		}

		const prompt = `Analyze the potential interactions between the following medications: ${medicationNames}. 

        Provide the response in the following format:
        
        Severity: [NONE | MINOR | MODERATE | SEVERE]
        Explanation: [A brief, clear explanation of the interaction, if any, in a single paragraph.]
        Warnings: [A concise bulleted list of any warnings, based on the severity. If severity is NONE, warnings can be omitted.]
        
        Severity levels are defined as follows:
        - NONE: No significant interaction is expected.
        - MINOR: Minimal or no clinical effect. No action needed in most cases.
        - MODERATE: May result in noticeable effects, often controllable.
        - SEVERE: Significant risk of serious adverse events and medical emergencies are highly likely.
        
        Choose only from the following warnings that are appropriate for the severity level given above:
        - Increased risk of gastrointestinal issues.
        - Increased risk of liver damage.
        - Potential for increased blood-thinning effects.
        - Increased risk of heart problems.
        - Increased risk of kidney problems.
        - Increased risk of sedation or drowsiness.
        - Potential to reduce medication effectiveness.
        - Risk of allergic reaction.
        - Possible changes in medication absorption.
        - Drug interaction is unknown and further caution is needed.
        - Severe reaction is likely to occur.
        - No known significant interactions.
        - Increased risk of side effects
        
        Provide the answer in a plain text format.`;

		try {
			const chatSession = model.startChat({
				generationConfig,
				history: [],
			});
			const result = await chatSession.sendMessage(prompt);
			const response = result.response.text();

			try {
				const parsedResponse = parseResponse(response);
				setConflictWarnings([parsedResponse]);
			} catch (error) {
				console.error("Error parsing conflict response", error);
				setConflictWarnings([
					{
						Severity: "NONE",
						Explanation: "Failed to parse medication warning response",
						Warnings: [],
					},
				]);
			}
		} catch (error) {
			console.error("Error checking medication conflicts:", error);
			setConflictWarnings([
				{
					Severity: "NONE",
					Explanation: "Error checking medication conflicts. Please try again.",
					Warnings: [],
				},
			]);
		} finally {
			setCheckingConflicts(false);
		}
	};

	// Redesigned checkPatientHistory function
	const checkPatientHistory = async () => {
		if (!model || !selectedPatient || !medicationsLoaded) {
			console.warn("Gemini API key or Patient not found, or medications not loaded. Skipping patient history check.");
			return;
		}
		setCheckingPatientHistory(true);
		setPatientHistoryWarnings([]);

		const medicationNames = Object.values(medicationForms)
			.filter((form) => form.medicationId != null)
			.map((form) => {
				const medOption = medicationOptions?.find((medOption) => medOption.value === form.medicationId?.toString());
				return medOption?.medication?.name;
			})
			.filter(Boolean)
			.join(", ");

		if (!medicationNames) {
			setCheckingPatientHistory(false);
			return;
		}

		const prompt = `Analyze the potential risks of prescribing the following medications: ${medicationNames} to a patient with the following allergies: ${selectedPatient?.allergies} and medical history: ${selectedPatient?.medicalHistory}.

        Provide the response in the following format:
        
        Severity: [NONE | MINOR | MODERATE | SEVERE]
        Explanation: [A brief, clear explanation of the potential risks, if any, in a single paragraph.]
        Warnings: [A concise bulleted list of any warnings based on the severity, include if a specific medication can cause any of the risk given above. If severity is NONE, warnings can be omitted.]

        Severity levels are defined as follows:
        - NONE: No significant risk is expected.
        - MINOR: Minimal risk of adverse effects. No action needed in most cases.
        - MODERATE: May result in noticeable effects.
        - SEVERE: Significant risk of serious adverse events and medical emergencies.
        
        Choose only from the following warnings that are appropriate for the severity level given above:
        - This medication may cause an allergic reaction due to a known allergy.
        - This medication may worsen the patient's existing medical conditions.
        - There is a potential for interactions with the patient's medical history.
        - The prescribed medication may not be safe to be taken by this patient due to his medical history.
        - The patient's allergy history does not indicate any risks with the proposed medication,
        - Drug interaction is unknown and further caution is needed.
        - Severe reaction is likely to occur.
        - No known significant interactions.
        - Increased risk of side effects
        
        Provide the answer in a plain text format.`;

		try {
			const chatSession = model.startChat({
				generationConfig,
				history: [],
			});
			const result = await chatSession.sendMessage(prompt);
			const response = result.response.text();

			try {
				const parsedResponse = parseResponse(response);
				setPatientHistoryWarnings([parsedResponse]);
			} catch (error) {
				console.error("Error parsing patient history response", error);
				setPatientHistoryWarnings([
					{
						Severity: "NONE",
						Explanation: "Failed to parse patient history response",
						Warnings: [],
					},
				]);
			}
		} catch (error) {
			console.error("Error checking patient history:", error);
			setPatientHistoryWarnings([
				{
					Severity: "NONE",
					Explanation: "Error checking patient history. Please try again.",
					Warnings: [],
				},
			]);
		} finally {
			setCheckingPatientHistory(false);
		}
	};

	const parseResponse = (response) => {
		if (!response) return null;
		const lines = response.split("\n").filter((line) => line.trim() !== "");

		let severity = "";
		let explanation = "";
		const warnings = [];

		for (const line of lines) {
			if (line.startsWith("Severity:")) {
				severity = line.split(":")[1].trim();
			} else if (line.startsWith("Explanation:")) {
				explanation = line.split(":")[1].trim();
			} else if (line.startsWith("Warnings:")) {
				const warningStart = lines.indexOf(line) + 1;
				for (let i = warningStart; i < lines.length; i++) {
					const trimmedLine = lines[i].trim();
					if (trimmedLine.startsWith("-")) {
						warnings.push(trimmedLine.substring(2).trim());
					}
				}
				break;
			}
		}
		return { Severity: severity, Explanation: explanation, Warnings: warnings };
	};

	const renderWarning = (warning) => {
		if (!warning || Object.keys(warning).length === 0) return null;
		const { Severity, Explanation, Warnings } = warning;

		return (
			<div style={{ marginTop: 16 }}>
				{Severity && <Tag color={severityColors[Severity]}>{Severity}</Tag>}
				{Explanation && <p>{Explanation}</p>}
				{Warnings.length > 0 && (
					<ul style={{ listStyleType: "none", paddingLeft: 0 }}>
						{Warnings.map((warning, index) => (
							<li key={index} style={{ marginBottom: 5 }}>
								<Alert message={warning} type="warning" />
							</li>
						))}
					</ul>
				)}
			</div>
		);
	};

	const isPrescriptionValid = (prescription) => {
		if (!prescription || !prescription.expirationDate) {
			return false;
		}

		let expirationDate;

		if (dayjs.isDayjs(prescription.expirationDate)) {
			expirationDate = prescription.expirationDate;
		} else if (typeof prescription.expirationDate === "string") {
			const parsedDate = dayjs(prescription.expirationDate);
			if (parsedDate.isValid()) {
				expirationDate = parsedDate;
			} else {
				return false;
			}
		} else {
			return false;
		}

		const todayStartOfDay = dayjs().endOf("day");
		return expirationDate.valueOf() >= todayStartOfDay.valueOf();
	};

	const columns = [
		{
			title: "Patient",
			dataIndex: "patientName",
			key: "patientName",
			render: (text) => (canReadPrescription ? text : "***"),
		},
		{
			title: "Validity",
			dataIndex: "expirationDate",
			key: "validity",
			render: (expirationDate, record) =>
				canReadPrescription ? isPrescriptionValid(record) ? <Tag color="green">Valid</Tag> : <Tag color="red">Expired</Tag> : "***",
		},
		{
			title: "Medications",
			dataIndex: "prescribedMedications",
			key: "prescribedMedications",
			render: (prescribedMedications) =>
				canReadPrescription ? (
					<Space direction="vertical">
						{prescribedMedications &&
							prescribedMedications.map((medication, index) => (
								<div key={index}>
									{medication.medicationName} - {medication.dosage}, {medication.route}, amount : {medication.amount}
								</div>
							))}
					</Space>
				) : (
					"***"
				),
		},
		{
			title: "Expiration Date",
			dataIndex: "expirationDate",
			key: "expirationDate",
			render: (expirationDate) => (canReadPrescription ? (expirationDate ? dayjs(expirationDate).format("YYYY-MM-DD") : "N/A") : "***"),
		},
		{
			title: "Notes",
			dataIndex: "note",
			key: "notes",
			render: (text) => (canReadPrescription ? text : "***"),
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					{canExpirePrescription &&
						(!isPrescriptionValid(record) ? null : (
							<Button type="default" onClick={() => handleExpirePrescription(record)}>
								Expire
							</Button>
						))}
					{canReadPrescription && (
						<Button type="default" icon={<EyeOutlined />} onClick={() => showModal(record, true)}>
							View
						</Button>
					)}
					{canUpdatePrescription && (
						<Button type="default" icon={<EditOutlined />} onClick={() => showModal(record, false)}>
							Edit
						</Button>
					)}
					{canDeletePrescription && (
						<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
							Delete
						</Button>
					)}
				</Space>
			),
		},
	];

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div style={{ padding: "20px" }}>
			<Title level={2}>Prescription List</Title>
			<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						placeholder="Search for a patient"
						filterOption={false}
						disabled={!canReadPrescription}
						onSelect={handleSearchPatientFilter}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					{canCreatePrescription && (
						<Button type="default" onClick={() => showModal(null)}>
							Add New Prescription
						</Button>
					)}
				</Col>
			</Row>
			<div style={{ margin: "0 -16px" }}>
				{canReadPrescription && (
					<Table
						columns={columns}
						dataSource={prescriptions}
						rowKey="id"
						pagination={{
							current: page + 1,
							pageSize: size,
							total: total,
							onChange: handleTableChange,
						}}
						scroll={{ x: "max-content" }}
					/>
				)}
			</div>

			<Modal
				title={selectedPrescription ? "View Prescription" : "Add Prescription"}
				open={isModalVisible}
				onCancel={handleCancel}
				width={"90%"}
				style={{ maxWidth: "90vw" }}
				styles={{ body: { overflowX: "auto" } }}
				footer={
					!isViewOnly
						? [
								<Button key="cancel" onClick={handleCancel}>
									Cancel
								</Button>,
								<Button
									key="history"
									type="default"
									onClick={checkPatientHistory}
									loading={checkingPatientHistory}
									disabled={
										!selectedPatient ||
										(!canCreatePrescription && !selectedPrescription) ||
										(!canUpdatePrescription && selectedPrescription)
									}>
									Check Patient History
								</Button>,
								<Button
									key="check"
									type="default"
									onClick={checkMedicationConflicts}
									loading={checkingConflicts}
									disabled={
										Object.values(medicationForms).filter((form) => form.medicationId != null).length === 0 ||
										(!canCreatePrescription && !selectedPrescription) ||
										(!canUpdatePrescription && selectedPrescription)
									}>
									Check Conflicts
								</Button>,
								<Button
									key="submit"
									type="default"
									onClick={handleFormSubmit}
									disabled={(!canCreatePrescription && !selectedPrescription) || (!canUpdatePrescription && selectedPrescription)}>
									{selectedPrescription ? "Update" : "Save"}
								</Button>,
						  ]
						: [
								<Button key="cancel" onClick={handleCancel}>
									Close
								</Button>,
						  ]
				}>
				<Form form={form} layout="vertical">
					<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
						<AutoComplete
							options={patientOptions}
							disabled={
								isViewOnly || (!canCreatePrescription && !selectedPrescription) || (!canUpdatePrescription && selectedPrescription)
							}
							onSearch={handlePatientSearch}
							onSelect={handlePatientSelect}
							placeholder="Select a patient"
							filterOption={false}
						/>
					</Form.Item>
					<Form.Item
						label="Validity in Days"
						name="validityDays"
						rules={[{ required: true, message: "Please enter the validity in days" }]}>
						<InputNumber
							disabled={
								isViewOnly || (!canCreatePrescription && !selectedPrescription) || (!canUpdatePrescription && selectedPrescription)
							}
							min={0}
							style={{ width: "100%" }}
							placeholder="Enter the validity in days"
						/>
					</Form.Item>

					{Object.entries(medicationForms).map(([index, medication]) => (
						<div
							key={index}
							style={{
								border: "1px solid #e8e8e8",
								padding: "10px",
								marginBottom: "10px",
							}}>
							<Row gutter={16}>
								<Col xs={24} md={12}>
									<Form.Item
										label={`Medication ${parseInt(index) + 1}`}
										rules={[{ required: true, message: "Please select a medication" }]}>
										<AutoComplete
											options={medicationOptions}
											disabled={
												isViewOnly ||
												(!canCreatePrescription && !selectedPrescription) ||
												(!canUpdatePrescription && selectedPrescription)
											}
											onSearch={handleMedicationSearch}
											placeholder="Search for a medication"
											filterOption={false}
											value={medication.medicationId}
											onChange={(value) => handleMedicationChange(index, "medicationId", value)}
										/>
									</Form.Item>
								</Col>
								<Col xs={24} md={12}>
									<Form.Item label="Dosage" rules={[{ required: true, message: "Please enter the dosage" }]}>
										<Input
											disabled={
												isViewOnly ||
												(!canCreatePrescription && !selectedPrescription) ||
												(!canUpdatePrescription && selectedPrescription)
											}
											placeholder="Enter dosage"
											value={medication.dosage}
											onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
										/>
									</Form.Item>
								</Col>
								<Col xs={24} md={12}>
									<Form.Item label="Route" rules={[{ required: true, message: "Please enter the route" }]}>
										<Input
											disabled={
												isViewOnly ||
												(!canCreatePrescription && !selectedPrescription) ||
												(!canUpdatePrescription && selectedPrescription)
											}
											placeholder="Enter route (e.g., IV, IM)"
											value={medication.route}
											onChange={(e) => handleMedicationChange(index, "route", e.target.value)}
										/>
									</Form.Item>
								</Col>
								<Col xs={24} md={12}>
									<Form.Item label="Amount" rules={[{ required: true, message: "Please enter the amount" }]}>
										<InputNumber
											disabled={
												isViewOnly ||
												(!canCreatePrescription && !selectedPrescription) ||
												(!canUpdatePrescription && selectedPrescription)
											}
											placeholder="Enter amount"
											min={0}
											value={medication.amount}
											onChange={(value) => handleMedicationChange(index, "amount", value)}
										/>
									</Form.Item>
								</Col>
							</Row>
							{!isViewOnly && canCreatePrescription && (
								<Button type="danger" onClick={() => handleRemoveMedication(index)}>
									Remove
								</Button>
							)}
						</div>
					))}

					{!isViewOnly && canCreatePrescription && (
						<Button type="default" onClick={handleAddMedication} style={{ width: "100%" }}>
							Add Medication
						</Button>
					)}

					<Form.Item label="Notes" name="note">
						<TextArea
							disabled={
								isViewOnly || (!canCreatePrescription && !selectedPrescription) || (!canUpdatePrescription && selectedPrescription)
							}
						/>
					</Form.Item>
					{patientHistoryWarnings.length > 0 && patientHistoryWarnings.map(renderWarning)}
					{conflictWarnings.length > 0 && conflictWarnings.map(renderWarning)}
				</Form>
			</Modal>
		</div>
	);
};

export default PrescriptionList;
