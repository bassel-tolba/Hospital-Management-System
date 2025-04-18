import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
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
import axios from "axios"; // Import axios for API key fetching
import { usePrescriptionStore } from "../../services/prescription.service";
import { useMedicationStore } from "../../services/medication.service";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import usePrescriptionPatient from "./usePrescriptionPatient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dayjs from "dayjs";
// Import useAuthStore for authentication token
import { useAuthStore } from "../../services/auth.service";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// --- Define Backend URL for Gemini API ---
const GEMINI_API_BASE_URL = "/api/gemini"; // Adjust if needed

// --- Remove Hardcoded API Key ---
// const apiKey = "AIzaSyDrsmf3oyOeUhXFXkuoUXMxVkTkSlfeNy0"; // REMOVED

// --- AI Configuration (Keep as needed for AI checks) ---
const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
};

// Keep severity colors for rendering AI warnings
const severityColors = {
	NONE: "green",
	MINOR: "blue",
	MODERATE: "orange",
	SEVERE: "red",
	UNKNOWN: "default", // Handle unknown case
};

const PrescriptionList = () => {
	// --- Existing State and Store Hooks (Using original names where possible) ---
	const {
		prescriptions,
		loading, // Keep original name if preferred
		total,
		deletePrescription,
		createPrescription,
		getPrescriptionById,
		setLoading, // Keep original name
		fetchPrescriptionsByPatientId,
		updatePrescription,
		setPrescriptions,
	} = usePrescriptionStore();
	const { medications, searchMedications, fetchAllMedications } = useMedicationStore();
	const { fetchPatientById, searchPatientOptions, patientOptions, clearPatientOptions } = usePrescriptionPatient();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedPrescription, setSelectedPrescription] = useState(null);
	const [medicationOptions, setMedicationOptions] = useState([]);
	const [form] = Form.useForm();
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);
	const [medicationSearchTerm, setMedicationSearchTerm] = useState("");
	const [selectedPatient, setSelectedPatient] = useState(null);
	// prescribedMedications state might not be needed if medicationForms is the source of truth
	// const [prescribedMedications, setPrescribedMedications] = useState([]);
	const [medicationForms, setMedicationForms] = useState({});
	const [isViewOnly, setIsViewOnly] = useState(false);
	const [patientSearchTerm, setPatientSearchTerm] = useState("");
	// State related to AI checks (Keep these)
	const [conflictWarnings, setConflictWarnings] = useState([]);
	const [checkingConflicts, setCheckingConflicts] = useState(false);
	const [checkingPatientHistory, setCheckingPatientHistory] = useState(false);
	const [patientHistoryWarnings, setPatientHistoryWarnings] = useState([]);
	// --- End AI check state ---
	const [searchPatientId, setSearchPatientId] = useState(null);
	const [medicationsLoaded, setMedicationsLoaded] = useState(false);
	// Get user object and hasAuthority from auth store
	const { hasAuthority, user } = useAuthStore();

	// --- NEW State for API Key ---
	const [geminiApiKey, setGeminiApiKey] = useState(null);
	const [apiKeyLoading, setApiKeyLoading] = useState(true);
	const [apiKeyError, setApiKeyError] = useState(null);

	// --- Fetch API Key on Mount (AUTHENTICATED) ---
	useEffect(() => {
		const fetchApiKey = async () => {
			setApiKeyLoading(true);
			setApiKeyError(null);
			setGeminiApiKey(null);
			console.log("Attempting to fetch Gemini API Key (authenticated)...");

			if (!user?.token) {
				console.warn("User not authenticated. AI features disabled.");
				setApiKeyError("User not authenticated.");
				setApiKeyLoading(false);
				return;
			}

			try {
				const response = await axios.get(`${GEMINI_API_BASE_URL}/get-key`, {
					headers: { Authorization: `Bearer ${user.token}` },
				});

				if (response.data && response.data.apiKey) {
					setGeminiApiKey(response.data.apiKey);
					console.log("Gemini API Key fetched successfully.");
					// Minimal notification for success
					// notification.success({ message: "AI Ready", duration: 1.5 });
				} else {
					throw new Error("API key not found in response.");
				}
			} catch (error) {
				console.error("Failed to fetch Gemini API Key:", error);
				const errMsg = error.response?.data?.message || error.message || "Failed to fetch key";
				setApiKeyError(`Failed to load AI key: ${errMsg}`);
				// Keep error notification minimal
				notification.error({
					message: "AI Key Error",
					description: `Could not load AI API Key. Conflict/History checks disabled. (${errMsg})`,
					duration: 4,
				});
			} finally {
				setApiKeyLoading(false);
			}
		};

		fetchApiKey();
	}, [user?.token]); // Re-fetch if user logs in/out

	// --- Initialize Gemini AI using useMemo AFTER key is fetched ---
	const genAI = useMemo(() => {
		if (geminiApiKey && !apiKeyLoading && !apiKeyError) {
			try {
				return new GoogleGenerativeAI(geminiApiKey);
			} catch (err) {
				console.error("Error initializing GoogleGenerativeAI:", err);
				setApiKeyError(`AI client init error: ${err.message}`);
				return null;
			}
		}
		return null;
	}, [geminiApiKey, apiKeyLoading, apiKeyError]);

	const model = useMemo(() => {
		if (genAI) {
			try {
				// Ensure model name matches backend
				return genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
			} catch (err) {
				console.error("Error getting generative model:", err);
				setApiKeyError(`AI model init error: ${err.message}`);
				return null;
			}
		}
		return null;
	}, [genAI]);
	// --- END API Key Fetch and AI Init ---

	// --- Permission Checks (Keep as they were) ---
	const canReadPrescription = hasAuthority("READ_PRESCRIPTION");
	const canCreatePrescription = hasAuthority("CREATE_PRESCRIPTION");
	const canUpdatePrescription = hasAuthority("UPDATE_PRESCRIPTION");
	const canDeletePrescription = hasAuthority("DELETE_PRESCRIPTION");
	const canExpirePrescription = hasAuthority("UPDATE_PRESCRIPTION");

	// --- Data Fetching Effect (Keep original logic) ---
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true); // Use original setLoading
			// Fetch prescriptions based on filter/permissions
			if (canReadPrescription) {
				await fetchPrescriptions();
			} else {
				setPrescriptions([]); // Clear if no permission
			}
			// Fetch all medications if not already loaded
			if (!medicationsLoaded) {
				await fetchAllMedications().then(() => setMedicationsLoaded(true));
			}
			setLoading(false); // Use original setLoading
		};
		fetchData();
		// Dependencies seem reasonable
	}, [page, size, searchPatientId, fetchAllMedications, medicationsLoaded, setLoading, canReadPrescription]);

	const fetchPrescriptions = async () => {
		// No need to set loading here, handled by useEffect
		if (!canReadPrescription) return; // Already checked in effect, but safe

		try {
			if (searchPatientId) {
				await fetchPrescriptionsByPatientId(searchPatientId, page, size);
			} else {
				// Original behavior likely didn't fetch all by default if no patient selected
				// Fetching all could be slow. Let's keep it as clearing the list if no filter.
				setPrescriptions([]);
				// If you *want* to fetch all when no filter, uncomment below:
				// await usePrescriptionStore.getState().fetchAllPrescriptions(page, size);
			}
		} catch (error) {
			console.error("Error during fetchPrescriptions call:", error);
			// Error notification is handled within the store methods
		}
		// No need to set loading false here
	};

	// --- Handlers (Keep original structure where possible) ---

	const handleSearchPatientFilter = (patientId) => {
		setSearchPatientId(patientId);
		setPage(0); // Reset page on filter change
	};

	const handleMedicationSearch = async (value) => {
		setMedicationSearchTerm(value);
		if (value && value.length > 1) {
			// Trigger search on 2+ chars
			try {
				const searchResults = await searchMedications({
					searchTerm: value,
					page: 0,
					size: 10,
				});
				setMedicationOptions(
					searchResults?.map((medication) => ({
						label: medication.name, // Keep it simple unless strength needed
						value: medication.id.toString(),
						medication, // Keep full object for AI checks
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
		if (value && value.length > 1) {
			await searchPatientOptions(value);
		} else {
			clearPatientOptions();
		}
	};

	const handlePatientSelect = async (value, option) => {
		try {
			const patient = await fetchPatientById(value);
			setSelectedPatient(patient);
			form.setFieldsValue({ patientId: value });
			// Optional: Update the search input display value if needed
			// setPatientSearchTerm(`${patient.firstName} ${patient.lastName}`);
		} catch (error) {
			console.error("Failed to fetch selected patient:", error);
		}
	};

	const showModal = async (prescription, viewOnly = false) => {
		// Permission checks (keep as they were)
		if (!canCreatePrescription && !prescription) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to create prescriptions." });
			return;
		}
		if (prescription && !canUpdatePrescription && !viewOnly) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to edit prescriptions." });
			return;
		}
		if (prescription && !canReadPrescription && viewOnly) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to view prescriptions." });
			return;
		}

		// Reset relevant state for modal
		setSelectedPrescription(null);
		setSelectedPatient(null);
		setMedicationForms({});
		form.resetFields();
		setMedicationSearchTerm("");
		setMedicationOptions([]); // Clear previous search options
		setPatientSearchTerm("");
		clearPatientOptions();
		setConflictWarnings([]); // Reset AI warnings
		setPatientHistoryWarnings([]);
		setIsViewOnly(viewOnly);

		setSelectedPrescription(prescription);

		if (prescription) {
			setLoading(true); // Indicate loading inside modal for existing data
			try {
				const patient = await fetchPatientById(prescription.patientId);
				setSelectedPatient(patient);

				// Set form fields from the fetched prescription
				form.setFieldsValue({
					...prescription, // Spread existing data
					patientId: patient.id, // Set patientId for AutoComplete
				});

				// Initialize medicationForms from the prescription's medications
				const initialMedForms = (prescription.prescribedMedications || []).reduce((acc, pm, index) => {
					acc[index] = {
						id: pm.id,
						medicationId: pm.medicationId?.toString(),
						dosage: pm.dosage,
						route: pm.route,
						amount: pm.amount,
						expired: pm.expired || false,
					};
					// Add medication to options if not already there (for display)
					if (pm.medicationId && pm.medicationName) {
						setMedicationOptions((prevOptions) => {
							if (!prevOptions.some((opt) => opt.value === pm.medicationId?.toString())) {
								return [
									...prevOptions,
									{
										label: pm.medicationName,
										value: pm.medicationId?.toString(),
										medication: { id: pm.medicationId, name: pm.medicationName },
									},
								];
							}
							return prevOptions;
						});
					}
					return acc;
				}, {});
				setMedicationForms(initialMedForms);
			} catch (error) {
				console.error("Failed to fetch details for existing prescription:", error);
				notification.error({ message: "Error", description: "Could not load prescription details." });
				handleCancel(); // Close modal if loading fails
				return;
			} finally {
				setLoading(false); // Stop modal loading indicator
			}
		} else {
			// Reset for new prescription
			form.resetFields();
			form.setFieldsValue({ validityDays: 30 }); // Set default validity
			setMedicationForms({});
			setSelectedPatient(null);
			setPatientSearchTerm("");
		}

		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		// Reset state related to the modal
		setSelectedPrescription(null);
		setSelectedPatient(null);
		form.resetFields();
		// setPrescribedMedications([]); // Not strictly needed if medicationForms is source
		setMedicationForms({});
		setMedicationSearchTerm("");
		setMedicationOptions([]);
		setPatientSearchTerm("");
		clearPatientOptions();
		setIsViewOnly(false);
		setConflictWarnings([]);
		setPatientHistoryWarnings([]);
		setCheckingConflicts(false); // Reset AI check status
		setCheckingPatientHistory(false);
	};

	const handleAddMedication = () => {
		const existingIndices = Object.keys(medicationForms).map(Number);
		const newIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0;
		setMedicationForms({
			...medicationForms,
			// Default new medication entry
			[newIndex]: { medicationId: null, dosage: "", route: "", amount: 1, expired: false },
		});
	};

	const handleRemoveMedication = (indexToRemove) => {
		setMedicationForms((prevForms) => {
			const newForms = { ...prevForms };
			delete newForms[indexToRemove];
			return newForms;
		});
		// Optionally reset AI warnings when meds change significantly
		setConflictWarnings([]);
		setPatientHistoryWarnings([]);
	};

	const handleMedicationChange = (index, field, value) => {
		setMedicationForms((prevForms) => ({
			...prevForms,
			[index]: { ...prevForms[index], [field]: value },
		}));
		// Optionally reset AI warnings on change
		setConflictWarnings([]);
		setPatientHistoryWarnings([]);
	};

	const handleExpirePrescription = async (prescription) => {
		if (!canExpirePrescription) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to expire prescriptions." });
			return;
		}
		Modal.confirm({
			title: "Expire Prescription?",
			content: `Mark prescription #${prescription.id} as expired?`,
			okText: "Yes, Expire",
			okType: "danger",
			onOk: async () => {
				setLoading(true);
				try {
					// Fetch latest data before updating is safer
					const currentPrescription = await getPrescriptionById(prescription.id);
					if (!currentPrescription) throw new Error("Prescription not found.");

					const payload = { ...currentPrescription, validityDays: 0 }; // Signal expiration
					await updatePrescription(prescription.id, payload);
					fetchPrescriptions(); // Refresh list
					// Success notification handled by store
				} catch (error) {
					console.error("Error expiring prescription:", error);
					notification.error({ message: "Error", description: `Failed to expire: ${error.message}` });
				} finally {
					setLoading(false);
				}
			},
		});
	};

	const handleFormSubmit = async () => {
		// Permission checks
		if (selectedPrescription && !canUpdatePrescription) {
			notification.error({ message: "Permission Denied", description: "Cannot update prescription." });
			return;
		}
		if (!selectedPrescription && !canCreatePrescription) {
			notification.error({ message: "Permission Denied", description: "Cannot create prescription." });
			return;
		}

		try {
			const values = await form.validateFields();

			const patientIdToSubmit = selectedPatient ? selectedPatient.id : values.patientId;
			if (!patientIdToSubmit) {
				notification.error({ message: "Validation Error", description: "Patient is required." });
				form.scrollToField("patientId");
				return;
			}

			// Map medicationForms state to the array format needed by the API
			const medicationArray = Object.values(medicationForms)
				.filter((formState) => formState && formState.medicationId != null && formState.medicationId !== "")
				.map((formState) => {
					if (!formState.dosage || !formState.route || !formState.amount) {
						// Basic check, rely on form validation mostly
						console.warn("Incomplete medication entry found:", formState);
					}
					const medInfo =
						medicationOptions.find((opt) => opt.value === formState.medicationId)?.medication ||
						medications?.find((m) => m.id.toString() === formState.medicationId);
					return {
						id: formState.id || null, // Include for updates
						medicationId: parseInt(formState.medicationId, 10),
						dosage: formState.dosage,
						route: formState.route,
						amount: formState.amount,
						expired: formState.expired || false,
						medicationName: medInfo?.name, // Include name if available
					};
				});

			if (medicationArray.length === 0) {
				notification.error({ message: "Validation Error", description: "Add at least one medication." });
				return;
			}

			// Construct the payload
			const payload = {
				...values, // Contains validityDays, note etc.
				patientId: patientIdToSubmit,
				prescribedMedications: medicationArray,
			};

			setLoading(true); // Indicate saving process
			if (selectedPrescription) {
				await updatePrescription(selectedPrescription.id, payload);
			} else {
				await createPrescription(payload);
			}

			fetchPrescriptions(); // Refresh the list
			handleCancel(); // Close modal
			// Success notification handled by store
		} catch (errorInfo) {
			console.log("Form validation/submission failed:", errorInfo);
			if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
				notification.error({ message: "Validation Error", description: "Please check the required fields." });
				form.scrollToField(errorInfo.errorFields[0].name[0] || errorInfo.errorFields[0].name); // Scroll to first error
			} else {
				notification.error({ message: "Save Error", description: "Failed to save prescription." });
			}
		} finally {
			setLoading(false); // Stop saving indicator
		}
	};

	const handleDelete = async (prescriptionId) => {
		if (!canDeletePrescription) {
			notification.error({ message: "Permission Denied", description: "Cannot delete prescription." });
			return;
		}
		Modal.confirm({
			title: "Confirm Deletion",
			content: "Are you sure you want to delete this prescription?",
			okText: "Delete",
			okType: "danger",
			onOk: async () => {
				setLoading(true);
				try {
					await deletePrescription(prescriptionId);
					fetchPrescriptions(); // Refresh
					// Success notification handled by store
				} catch (error) {
					console.error("Error deleting prescription:", error);
					// Error notification handled by store
				} finally {
					setLoading(false);
				}
			},
		});
	};

	const handleTableChange = (pagination) => {
		setPage(pagination.current - 1);
		setSize(pagination.pageSize);
	};

	// --- AI Conflict/History Check Functions (Keep these) ---

	// Helper to get current medication names from the form
	const getMedicationNamesFromForm = () => {
		return Object.values(medicationForms)
			.filter((formState) => formState && formState.medicationId != null && formState.medicationId !== "")
			.map((formState) => {
				const medOption = medicationOptions.find((opt) => opt.value === formState.medicationId);
				const med = medOption ? medOption.medication : medications?.find((m) => m.id.toString() === formState.medicationId);
				return med?.name;
			})
			.filter(Boolean)
			.join(", ");
	};

	const checkMedicationConflicts = async () => {
		// Prerequisite checks for AI readiness
		if (apiKeyLoading || apiKeyError || !model) {
			notification.warn({ message: "AI Not Ready", description: `Cannot check conflicts. ${apiKeyError || "AI loading or not initialized."}` });
			return;
		}
		if (!medicationsLoaded) {
			notification.warn({ message: "Data Loading", description: "Medications not loaded yet." });
			return;
		}
		const currentMedications = Object.values(medicationForms).filter((form) => form && form.medicationId);
		if (currentMedications.length < 2) {
			notification.info({ message: "Need More Meds", description: "Add at least two medications to check interactions." });
			setConflictWarnings([]);
			return;
		}

		const medicationNames = getMedicationNamesFromForm();
		if (!medicationNames) {
			notification.error({ message: "Error", description: "Could not get medication names." });
			setConflictWarnings([]);
			return;
		}

		setCheckingConflicts(true);
		setConflictWarnings([]);

		// Keep the refined prompt from before
		const prompt = `Analyze the potential interactions between the following medications: ${medicationNames}. Provide the response in the format: Severity: [NONE|MINOR|MODERATE|SEVERE]\nExplanation: [Brief explanation.]\nWarnings: [Bulleted list using '-' or state "- No specific warnings."]. Base warnings on common interactions like GI issues, liver/kidney impact, bleeding risk, CNS effects, effectiveness changes, absorption issues, or state if interaction is unknown/requires caution.`; // Simplified prompt example

		try {
			const chatSession = model.startChat({ generationConfig, history: [] });
			const result = await chatSession.sendMessage(prompt);
			const responseText = result.response.text();
			const parsedResponse = parseResponse(responseText); // Use the parsing function
			if (parsedResponse) {
				setConflictWarnings([parsedResponse]);
				if (parsedResponse.Severity !== "NONE") {
					// Notify if not NONE
					notification.warning({
						message: `Potential ${parsedResponse.Severity} Interaction`,
						description: parsedResponse.Explanation,
						duration: 5,
					});
				}
			} else {
				throw new Error("Failed to parse AI response.");
			}
		} catch (error) {
			console.error("Error checking medication conflicts:", error);
			notification.error({ message: "AI Error", description: `Conflict check failed: ${error.message}` });
			setConflictWarnings([{ Severity: "UNKNOWN", Explanation: `Error: ${error.message}`, Warnings: ["- Check failed."] }]);
		} finally {
			setCheckingConflicts(false);
		}
	};

	const checkPatientHistory = async () => {
		// Prerequisite checks for AI readiness and selected patient
		if (apiKeyLoading || apiKeyError || !model) {
			notification.warn({
				message: "AI Not Ready",
				description: `Cannot check patient history. ${apiKeyError || "AI loading or not initialized."}`,
			});
			return;
		}
		if (!selectedPatient) {
			notification.warn({ message: "No Patient Selected", description: "Select a patient first." });
			return;
		}
		if (!medicationsLoaded) {
			notification.warn({ message: "Data Loading", description: "Medications not loaded yet." });
			return;
		}
		const currentMedications = Object.values(medicationForms).filter((form) => form && form.medicationId);
		if (currentMedications.length === 0) {
			notification.info({ message: "No Meds Added", description: "Add medications to check against history." });
			setPatientHistoryWarnings([]);
			return;
		}

		const medicationNames = getMedicationNamesFromForm();
		if (!medicationNames) {
			notification.error({ message: "Error", description: "Could not get medication names." });
			setPatientHistoryWarnings([]);
			return;
		}

		setCheckingPatientHistory(true);
		setPatientHistoryWarnings([]);

		const patientAllergies = selectedPatient?.allergies || "None reported";
		const patientHistory = selectedPatient?.medicalHistory || "None reported";

		// Keep the refined prompt from before
		const prompt = `Analyze risks of prescribing: ${medicationNames} for patient with Allergies: ${patientAllergies} and History: ${patientHistory}. Format: Severity: [NONE|MINOR|MODERATE|SEVERE]\nExplanation: [Brief explanation.]\nWarnings: [Bulleted list using '-' linking meds to risks (e.g., "- Risk of allergy due to [Allergy] with [Medication Name].", "- Use [Medication Name] with caution due to [Condition].") or state "- No specific warnings based on history."].`; // Simplified prompt example

		try {
			const chatSession = model.startChat({ generationConfig, history: [] });
			const result = await chatSession.sendMessage(prompt);
			const responseText = result.response.text();
			const parsedResponse = parseResponse(responseText); // Use the parsing function
			if (parsedResponse) {
				setPatientHistoryWarnings([parsedResponse]);
				if (parsedResponse.Severity !== "NONE") {
					// Notify if not NONE
					notification.warning({
						message: `Potential ${parsedResponse.Severity} Risk (History)`,
						description: parsedResponse.Explanation,
						duration: 5,
					});
				}
			} else {
				throw new Error("Failed to parse AI response.");
			}
		} catch (error) {
			console.error("Error checking patient history:", error);
			notification.error({ message: "AI Error", description: `Patient history check failed: ${error.message}` });
			setPatientHistoryWarnings([{ Severity: "UNKNOWN", Explanation: `Error: ${error.message}`, Warnings: ["- Check failed."] }]);
		} finally {
			setCheckingPatientHistory(false);
		}
	};
	// --- END AI Check Functions ---

	// --- Parsing and Rendering Functions (Keep these for AI) ---
	const parseResponse = (response) => {
		// Keep the robust parsing logic
		if (!response || typeof response !== "string") {
			console.error("Invalid AI response format:", response);
			return { Severity: "UNKNOWN", Explanation: "Invalid AI response.", Warnings: ["- Review manually."] };
		}
		const lines = response
			.split(/[\r\n]+/)
			.map((line) => line.trim())
			.filter(Boolean);
		let severity = "UNKNOWN";
		let explanation = "Could not parse explanation.";
		const warnings = [];
		const severityLine = lines.find((line) => line.startsWith("Severity:"));
		if (severityLine) {
			const sev = severityLine.split(":")[1]?.trim().toUpperCase();
			if (severityColors[sev]) severity = sev;
		}
		const explanationLine = lines.find((line) => line.startsWith("Explanation:"));
		if (explanationLine) explanation = explanationLine.split("Explanation:")[1]?.trim() || explanation;
		const warningsHeaderIndex = lines.findIndex((line) => line.startsWith("Warnings:"));
		if (warningsHeaderIndex !== -1) {
			for (let i = warningsHeaderIndex + 1; i < lines.length; i++) {
				if (lines[i].startsWith("-")) warnings.push(lines[i].substring(1).trim());
			}
		}
		if (warnings.length === 0) warnings.push(severity === "NONE" ? "No specific warnings." : "Review AI response manually.");
		return { Severity: severity, Explanation: explanation, Warnings: warnings };
	};

	const renderWarning = (warning, index) => {
		// Keep the warning rendering
		if (!warning || !warning.Severity) return null;
		const { Severity, Explanation, Warnings } = warning;
		const color = severityColors[Severity] || "default";
		return (
			<div key={index} style={{ marginTop: 10, border: "1px solid #eee", padding: "8px", borderRadius: "4px", background: "#fffbe6" }}>
				<Tag color={color}>{Severity}</Tag>
				<p style={{ margin: "5px 0" }}>{Explanation}</p>
				{Warnings && Warnings.length > 0 && (
					<ul style={{ listStyleType: "disc", paddingLeft: 20, margin: 0 }}>
						{Warnings.map((warnText, warnIndex) => (
							<li key={warnIndex} style={{ fontSize: "0.9em", color: "#555" }}>
								{warnText}
							</li>
						))}
					</ul>
				)}
			</div>
		);
	};
	// --- END Parsing/Rendering ---

	// --- Utility Functions (Keep isPrescriptionValid) ---
	const isPrescriptionValid = (prescription) => {
		if (!prescription || !prescription.expirationDate) return false;
		return dayjs().isBefore(dayjs(prescription.expirationDate).endOf("day"));
	};

	// --- Table Columns Definition (Reverted to simpler structure) ---
	const columns = [
		{
			title: "Patient",
			dataIndex: "patientName", // Assuming this is added to the data source
			key: "patientName",
			render: (text) => (canReadPrescription ? text : "***"),
		},
		{
			title: "Validity",
			dataIndex: "expirationDate",
			key: "validity",
			render: (_, record) =>
				canReadPrescription ? isPrescriptionValid(record) ? <Tag color="green">Valid</Tag> : <Tag color="red">Expired</Tag> : "***",
		},
		{
			title: "Medications",
			dataIndex: "prescribedMedications",
			key: "prescribedMedications",
			// Simple rendering for medications list
			render: (prescribedMeds) => {
				if (!canReadPrescription) return "***";
				if (!prescribedMeds || prescribedMeds.length === 0) return "-";
				return (
					<ul style={{ margin: 0, paddingLeft: 15 }}>
						{prescribedMeds.map((med, i) => (
							<li key={i}>
								{med.medicationName || `ID: ${med.medicationId}`} ({med.dosage})
							</li>
						))}
					</ul>
				);
			},
		},
		{
			title: "Expiration Date",
			dataIndex: "expirationDate",
			key: "expirationDate",
			render: (date) => (canReadPrescription ? (date ? dayjs(date).format("YYYY-MM-DD") : "N/A") : "***"),
		},
		{
			title: "Notes",
			dataIndex: "note",
			key: "notes",
			render: (text) => (canReadPrescription ? text : "***"),
			ellipsis: true, // Keep ellipsis if it was desired originally
		},
		{
			title: "Actions",
			key: "actions",
			// Revert action button complexity if needed, keep permissions
			render: (_, record) => (
				<Space size="middle">
					{canExpirePrescription && isPrescriptionValid(record) && (
						<Button type="default" onClick={() => handleExpirePrescription(record)} size="small">
							Expire
						</Button>
					)}
					{canReadPrescription && (
						<Button type="default" icon={<EyeOutlined />} onClick={() => showModal(record, true)} size="small"></Button>
					)}
					{canUpdatePrescription && (
						<Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record, false)} size="small"></Button>
					)}
					{canDeletePrescription && (
						<Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small"></Button>
					)}
				</Space>
			),
		},
	];

	// Map patient names to the prescriptions data source
	// Keep this mapping simple
	const tableDataSource = prescriptions.map((p) => ({
		...p,
		key: p.id, // React requires a unique key
		patientName: [p.patientFirstName, p.patientLastName].filter(Boolean).join(" ") || `Patient ID: ${p.patientId}`,
	}));

	// --- Main Render (Reverted UI changes) ---
	if (loading && !isModalVisible) {
		// Original loading check
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div style={{ padding: "20px" }}>
			{" "}
			{/* Keep original padding */}
			<Title level={2}>Prescription List</Title> {/* Keep original title */}
			{/* Keep original header row structure */}
			<Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
				<Col xs={24} sm={12} md={8}>
					<AutoComplete
						style={{ width: "100%" }}
						options={patientOptions}
						onSearch={handlePatientSearch}
						onSelect={handleSearchPatientFilter}
						placeholder="Search for a patient"
						filterOption={false}
						disabled={!canReadPrescription}
						allowClear
						onClear={() => handleSearchPatientFilter(null)}
					/>
				</Col>
				<Col xs={24} sm={12} md={8}>
					{canCreatePrescription && (
						<Button type="primary" onClick={() => showModal(null)}>
							Add New Prescription
						</Button>
					)}
				</Col>
				{/* REMOVED AI Status Tag from here */}
			</Row>
			{/* Keep original table container style */}
			<div style={{ margin: "0 -16px" }}>
				{canReadPrescription ? ( // Check permission before rendering table
					<Table
						columns={columns}
						dataSource={tableDataSource} // Use mapped data
						rowKey="id"
						loading={loading} // Use original loading prop
						pagination={{
							current: page + 1,
							pageSize: size,
							total: total,
							onChange: handleTableChange,
							// Revert pagination options if changed
						}}
						scroll={{ x: "max-content" }} // Keep scroll if originally present
						// Remove extra onChange for sorting/filtering if not needed
					/>
				) : (
					// Show minimal message if no read permission
					!loading && <p>You do not have permission to view prescriptions.</p>
				)}
			</div>
			{/* --- Modal (Keep original styling unless essential for AI checks) --- */}
			<Modal
				title={isViewOnly ? "View Prescription" : selectedPrescription ? "Edit Prescription" : "Add Prescription"}
				open={isModalVisible}
				onCancel={handleCancel}
				width={"90%"} // Keep original width
				// Revert style changes if not needed
				// style={{ maxWidth: "90vw" }}
				// styles={{ body: { overflowX: "auto" } }}
				footer={
					!isViewOnly
						? [
								<Button key="cancel" onClick={handleCancel}>
									Cancel
								</Button>,
								// AI Check Buttons - Disable based on AI status
								<Button
									key="history"
									type="default"
									onClick={checkPatientHistory}
									loading={checkingPatientHistory}
									disabled={
										apiKeyLoading ||
										!!apiKeyError ||
										!model ||
										!selectedPatient ||
										checkingConflicts ||
										checkingPatientHistory ||
										Object.values(medicationForms).filter((f) => f && f.medicationId).length === 0 ||
										(!canCreatePrescription && !selectedPrescription) ||
										(!canUpdatePrescription && selectedPrescription)
									}
									title={
										apiKeyLoading
											? "AI loading..."
											: apiKeyError
											? `AI Error: ${apiKeyError}`
											: !selectedPatient
											? "Select Patient"
											: "Check Patient History"
									}>
									Check Patient History
								</Button>,
								<Button
									key="check"
									type="default"
									onClick={checkMedicationConflicts}
									loading={checkingConflicts}
									disabled={
										apiKeyLoading ||
										!!apiKeyError ||
										!model ||
										Object.values(medicationForms).filter((f) => f && f.medicationId).length < 2 ||
										checkingConflicts ||
										checkingPatientHistory ||
										(!canCreatePrescription && !selectedPrescription) ||
										(!canUpdatePrescription && selectedPrescription)
									}
									title={
										apiKeyLoading
											? "AI loading..."
											: apiKeyError
											? `AI Error: ${apiKeyError}`
											: Object.values(medicationForms).filter((f) => f && f.medicationId).length < 2
											? "Need >= 2 meds"
											: "Check Conflicts"
									}>
									Check Conflicts (≥2 meds)
								</Button>,
								// Submit Button
								<Button
									key="submit"
									type="primary"
									loading={loading} // Show loading on submit button
									onClick={handleFormSubmit}
									disabled={
										loading ||
										(!canCreatePrescription && !selectedPrescription) ||
										(!canUpdatePrescription && selectedPrescription)
									}>
									{selectedPrescription ? "Update" : "Save"}
								</Button>,
						  ]
						: [
								<Button key="cancel" onClick={handleCancel}>
									Close
								</Button>,
						  ]
				}>
				{/* Form Content (Keep original structure) */}
				<Spin spinning={loading && selectedPrescription} tip="Loading Details...">
					{" "}
					{/* Loading for existing data */}
					<Form form={form} layout="vertical">
						{/* Patient Field */}
						<Form.Item label="Patient" name="patientId" rules={[{ required: true, message: "Please select a patient" }]}>
							<AutoComplete
								options={patientOptions}
								disabled={isViewOnly || !!selectedPrescription || !canCreatePrescription} // Disable if editing or viewOnly
								onSearch={handlePatientSearch}
								onSelect={handlePatientSelect}
								placeholder="Select a patient"
								filterOption={false}
								// Optional: Control display value if needed
								// value={patientSearchTerm || (selectedPatient ? selectedPatient.id : undefined)}
							/>
						</Form.Item>
						{/* Validity Field */}
						<Form.Item
							label="Validity in Days"
							name="validityDays"
							rules={[{ required: true, message: "Please enter the validity in days" }]}>
							<InputNumber
								disabled={
									isViewOnly ||
									(!canCreatePrescription && !selectedPrescription) ||
									(!canUpdatePrescription && selectedPrescription)
								}
								min={0}
								style={{ width: "100%" }}
								placeholder="Enter the validity in days"
							/>
						</Form.Item>

						{/* Medication Forms (Keep structure) */}
						{Object.entries(medicationForms).map(([index, medication]) => (
							<div key={index} style={{ border: "1px solid #e8e8e8", padding: "10px", marginBottom: "10px", position: "relative" }}>
								<Row gutter={16}>
									<Col xs={24} md={12}>
										{/* Medication AutoComplete */}
										<Form.Item
											label={`Medication ${parseInt(index) + 1}`}
											name={["meds", index, "id"]}
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
												onSelect={(value) => handleMedicationChange(index, "medicationId", value)} // Use onSelect
											/>
										</Form.Item>
									</Col>
									<Col xs={24} md={12}>
										{/* Dosage Input */}
										<Form.Item
											label="Dosage"
											name={["meds", index, "dosage"]}
											rules={[{ required: true, message: "Please enter the dosage" }]}>
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
										{/* Route Input */}
										<Form.Item
											label="Route"
											name={["meds", index, "route"]}
											rules={[{ required: true, message: "Please enter the route" }]}>
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
										{/* Amount Input */}
										<Form.Item
											label="Amount"
											name={["meds", index, "amount"]}
											rules={[{ required: true, message: "Please enter the amount" }]}>
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
								{/* Remove Button */}
								{!isViewOnly &&
									(canCreatePrescription || canUpdatePrescription) && ( // Show if allowed to edit/create
										<Button
											type="dashed"
											danger
											onClick={() => handleRemoveMedication(index)}
											size="small"
											style={{ position: "absolute", top: 5, right: 5 }}>
											Remove
										</Button>
									)}
							</div>
						))}

						{/* Add Medication Button */}
						{!isViewOnly &&
							(canCreatePrescription || canUpdatePrescription) && ( // Show if allowed to edit/create
								<Button type="dashed" onClick={handleAddMedication} style={{ width: "100%" }} block>
									Add Medication
								</Button>
							)}

						{/* Notes Field */}
						<Form.Item label="Notes" name="note" style={{ marginTop: 20 }}>
							<TextArea
								disabled={
									isViewOnly ||
									(!canCreatePrescription && !selectedPrescription) ||
									(!canUpdatePrescription && selectedPrescription)
								}
								rows={3} // Keep original rows if specified
							/>
						</Form.Item>

						{/* AI Warnings Display Area (Keep this section) */}
						{(patientHistoryWarnings.length > 0 || conflictWarnings.length > 0) && !isViewOnly && (
							<div style={{ marginTop: 16, background: "#fafafa", padding: 10, border: "1px solid #eee" }}>
								<Title level={5} style={{ marginTop: 0 }}>
									AI Analysis:
								</Title>
								{patientHistoryWarnings.map((warning, idx) => renderWarning(warning, `hist-${idx}`))}
								{conflictWarnings.map((warning, idx) => renderWarning(warning, `conf-${idx}`))}
							</div>
						)}
					</Form>
				</Spin>
			</Modal>
		</div>
	);
};

export default PrescriptionList;
