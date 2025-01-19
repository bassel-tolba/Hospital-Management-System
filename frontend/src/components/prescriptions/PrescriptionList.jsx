import React, { useState, useEffect } from "react";
import { Table, Button, Space, Typography, Modal, Form, Select, Input, AutoComplete, InputNumber, Alert, Tag } from "antd";
import { usePrescriptionStore } from "../../services/prescription.service";
import { useMedicationStore } from "../../services/medication.service";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import usePrescriptionPatient from "./usePrescriptionPatient";
import { GoogleGenerativeAI } from "@google/generative-ai";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const apiKey = "AIzaSyDrsmf3oyOeUhXFXkuoUXMxVkTkSlfeNy0";

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
	const { prescriptions, loading, total, deletePrescription, createPrescription, setLoading, fetchPrescriptionsByPatientId } =
		usePrescriptionStore();
	const { medications, searchMedications } = useMedicationStore();
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
	const [searchPatientId, setSearchPatientId] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			await fetchPrescriptions();
			setLoading(false);
		};
		fetchData();
	}, [page, size, searchPatientId]);

	const fetchPrescriptions = async () => {
		setLoading(true);
		if (searchPatientId) {
			await fetchPrescriptionsByPatientId(searchPatientId, page, size);
		} else {
			setLoading(false);
			set({ prescriptions: [], total: 0 });
		}
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
						value: medication.id,
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
						dosage: pm.dosage,
						route: pm.route,
						amount: pm.amount,
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

	const handleFormSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (selectedPatient) {
				values.patientId = selectedPatient.id;
			}

			const medicationArray = Object.values(medicationForms)
				.filter((form) => form.medicationId != null)
				.map((form) => {
					return {
						medicationId: form.medicationId,
						dosage: form.dosage,
						route: form.route,
						amount: form.amount,
					};
				});
			values.prescribedMedications = medicationArray;

			if (selectedPrescription) {
				// todo: update prescription
			} else {
				await createPrescription(values);
			}
			fetchPrescriptions();
			setIsModalVisible(false);
			setSelectedPrescription(null);
			form.resetFields();
			setPrescribedMedications([]);
			setMedicationForms({});
			setMedicationSearchTerm("");
			setMedicationOptions([]);
			setPatientSearchTerm("");
			clearPatientOptions();
			setConflictWarnings([]);
		} catch (error) {
			console.log("error in handle form submit", error);
		}
	};

	const handleDelete = async (prescriptionId) => {
		try {
			await deletePrescription(prescriptionId);
			fetchPrescriptions();
		} catch (error) {
			console.error("Error deleting prescription:", error);
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

	const checkMedicationConflicts = async () => {
		if (!model) {
			console.warn("Gemini API key not found. Skipping conflict check.");
			return;
		}
		setCheckingConflicts(true);

		const medicationNames = Object.values(medicationForms)
			.filter((form) => form.medicationId != null)
			.map((form) => {
				const med = medications?.find((med) => med.id === form.medicationId);
				return med?.name;
			})
			.filter(Boolean)
			.join(", ");

		if (!medicationNames) {
			setConflictWarnings([]);
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

	const parseResponse = (response) => {
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
				// Warnings are after this line
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

	const columns = [
		{
			title: "Patient",
			dataIndex: "patientName",
			key: "patientName",
		},
		{
			title: "Medications",
			dataIndex: "prescribedMedications",
			key: "prescribedMedications",
			render: (prescribedMedications) => (
				<Space direction="vertical">
					{prescribedMedications &&
						prescribedMedications.map((medication, index) => (
							<div key={index}>
								{medication.medicationName} - {medication.dosage}, {medication.route}, amount : {medication.amount}
							</div>
						))}
				</Space>
			),
		},
		{
			title: "Notes",
			dataIndex: "note",
			key: "notes",
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Space size="middle">
					<Button type="primary" icon={<EyeOutlined />} onClick={() => showModal(record, true)}>
						View
					</Button>
					<Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: 20 }}>
			<Title level={2}>Prescription List</Title>
			<Space style={{ marginBottom: 16 }}>
				<AutoComplete
					style={{ width: 300 }}
					options={patientOptions}
					onSearch={handlePatientSearch}
					placeholder="Search for a patient"
					filterOption={false}
					onSelect={handleSearchPatientFilter}
				/>
				<Button type="primary" onClick={() => showModal(null)}>
					Add New Prescription
				</Button>
			</Space>
			<Table
				columns={columns}
				dataSource={prescriptions}
				loading={loading}
				rowKey="id"
				pagination={{
					current: page + 1,
					pageSize: size,
					total: total,
					onChange: handleTableChange,
				}}
			/>
			<Modal
				title={selectedPrescription ? "View Prescription" : "Add Prescription"}
				visible={isModalVisible}
				onCancel={handleCancel}
				footer={
					!isViewOnly
						? [
								<Button key="cancel" onClick={handleCancel}>
									Cancel
								</Button>,
								<Button key="check" type="primary" onClick={checkMedicationConflicts} loading={checkingConflicts}>
									Check Conflicts
								</Button>,
								<Button key="submit" type="primary" onClick={handleFormSubmit}>
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
							disabled={isViewOnly}
							onSearch={handlePatientSearch}
							onSelect={handlePatientSelect}
							placeholder="Select a patient"
							filterOption={false}
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
							<Form.Item
								label={`Medication ${parseInt(index) + 1}`}
								rules={[{ required: true, message: "Please select a medication" }]}>
								<AutoComplete
									options={medicationOptions}
									disabled={isViewOnly}
									onSearch={handleMedicationSearch}
									placeholder="Search for a medication"
									filterOption={false}
									value={medication.medicationId}
									onChange={(value) => handleMedicationChange(index, "medicationId", value)}
								/>
							</Form.Item>
							<Form.Item label="Dosage" rules={[{ required: true, message: "Please enter the dosage" }]}>
								<Input
									disabled={isViewOnly}
									placeholder="Enter dosage"
									value={medication.dosage}
									onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
								/>
							</Form.Item>
							<Form.Item label="Route" rules={[{ required: true, message: "Please enter the route" }]}>
								<Input
									disabled={isViewOnly}
									placeholder="Enter route (e.g., IV, IM)"
									value={medication.route}
									onChange={(e) => handleMedicationChange(index, "route", e.target.value)}
								/>
							</Form.Item>
							<Form.Item label="Amount" rules={[{ required: true, message: "Please enter the amount" }]}>
								<InputNumber
									disabled={isViewOnly}
									placeholder="Enter amount"
									min={0}
									value={medication.amount}
									onChange={(value) => handleMedicationChange(index, "amount", value)}
								/>
							</Form.Item>
							{!isViewOnly && (
								<Button type="danger" onClick={() => handleRemoveMedication(index)}>
									Remove
								</Button>
							)}
						</div>
					))}

					{!isViewOnly && (
						<Button type="dashed" onClick={handleAddMedication} style={{ width: "100%" }}>
							Add Medication
						</Button>
					)}

					<Form.Item label="Notes" name="note">
						<TextArea disabled={isViewOnly} />
					</Form.Item>
					{conflictWarnings.length > 0 && conflictWarnings.map(renderWarning)}
				</Form>
			</Modal>
		</div>
	);
};

export default PrescriptionList;
