// patientDetail.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const PATIENT_API_BASE_DATA_URL = `/api/patients-data`;
const IMAGE_REPORT_API_BASE_URL = `/api/imagereports`;

export const usePatientDetailStore = create((set, get) => ({
	loading: false,
	error: null,
	patient: null,
	admissions: [],
	appointments: [],
	assessments: [],
	billings: [],
	carePlans: [],
	prescriptions: [],
	vitalSigns: [],
	latestVitalSign: null, // NEW: Store the latest vital sign record
	productUsages: [],
	medicationAdministrations: [],
	imageReports: [],
	labResults: [],
	documents: [],
	quickNotes: [],
	procedureLogs: [],
	totalCounts: {},
	// NEW: Store filter states for each data type
	filters: {
		appointments: false,
		assessments: false,
		billings: false,
		carePlans: false,
		prescriptions: false,
		vitalSigns: false,
		productUsages: false,
		medicationAdministrations: false,
		imageReports: false,
		labResults: false,
		documents: false,
		procedureLogs: false,
	},
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	// NEW: Toggle filter for a specific data type
	toggleFilter: (dataType) =>
		set((state) => ({
			filters: {
				...state.filters,
				[dataType]: !state.filters[dataType], // Toggle the boolean
			},
		})),

	fetchPatientData: async (
		patientId,
		admissionsPage,
		appointmentsPage,
		assessmentsPage,
		billingsPage,
		carePlansPage,
		prescriptionsPage,
		vitalSignsPage, // Keep this parameter
		productUsagesPage,
		medicationAdministrationsPage,
		imageReportsPage,
		labResultsPage,
		documentsPage,
		quickNotesPage,
		procedureLogsPage,
		pageSize
	) => {
		set({ loading: true, error: null });
		let patientResponse;
		try {
			const user = useAuthStore.getState().user;
			const { filters } = get(); // Get current filter states

			patientResponse = await axios.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			const requests = [];
			const responses = {};

			// Quick Notes (no filtering needed)
			if (quickNotesPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/quick-notes`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: quickNotesPage - 1, size: pageSize },
						})
						.then((res) => {
							responses.quickNotes = res;
						})
				);
			}

			// All other data types: Include filterByAdmission parameter
			if (procedureLogsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/procedure-logs`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: procedureLogsPage - 1, size: pageSize, filterByAdmission: filters.procedureLogs }, // Pass filter
						})
						.then((res) => {
							responses.procedureLogs = res;
						})
				);
			}
			if (admissionsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/admissions`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: admissionsPage - 1, size: pageSize }, // No filter for admissions
						})
						.then((res) => {
							responses.admissions = res;
						})
				);
			}
			if (appointmentsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/appointments`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: appointmentsPage - 1, size: pageSize, filterByAdmission: filters.appointments }, // Pass filter
						})
						.then((res) => {
							responses.appointments = res;
						})
				);
			}
			if (assessmentsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/assessments`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: assessmentsPage - 1, size: pageSize, filterByAdmission: filters.assessments }, // Pass filter
						})
						.then((res) => {
							responses.assessments = res;
						})
				);
			}
			if (billingsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/billings`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: billingsPage - 1, size: pageSize, filterByAdmission: filters.billings }, // Pass filter
						})
						.then((res) => {
							responses.billings = res;
						})
				);
			}
			if (carePlansPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/care-plans`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: carePlansPage - 1, size: pageSize, filterByAdmission: filters.carePlans }, // Pass filter
						})
						.then((res) => {
							responses.carePlans = res;
						})
				);
			}
			if (prescriptionsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/prescriptions`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: prescriptionsPage - 1, size: pageSize, filterByAdmission: filters.prescriptions }, // Pass filter
						})
						.then((res) => {
							responses.prescriptions = res;
						})
				);
			}
			// Fetch Vital Signs (always fetch page 0 if needed, or respect the requested page)
			if (vitalSignsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/vital-signs`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							// Request page 0 if we specifically need the latest, otherwise use the provided page number
							// Let's assume the component will always pass vitalSignsPage=1 when it initially loads or wants the latest
							params: { page: vitalSignsPage - 1, size: pageSize, filterByAdmission: filters.vitalSigns, sort: "timestamp,desc" }, // Pass filter and sort
						})
						.then((res) => {
							responses.vitalSigns = res; // Store the full response
						})
				);
			}
			if (productUsagesPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/product-usages`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: productUsagesPage - 1, size: pageSize, filterByAdmission: filters.productUsages }, // Pass filter
						})
						.then((res) => {
							responses.productUsages = res;
						})
				);
			}
			if (medicationAdministrationsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/medication-administrations`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: {
								page: medicationAdministrationsPage - 1,
								size: pageSize,
								filterByAdmission: filters.medicationAdministrations, // Pass filter
							},
						})
						.then((res) => {
							responses.medicationAdministrations = res;
						})
				);
			}
			if (imageReportsPage) {
				requests.push(
					axios
						.get(`${IMAGE_REPORT_API_BASE_URL}/patient/${patientId}`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: imageReportsPage - 1, size: pageSize, filterByAdmission: filters.imageReports }, // Pass filter
						})
						.then((res) => {
							responses.imageReports = res;
						})
				);
			}

			if (labResultsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/lab-results`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: labResultsPage - 1, size: pageSize, filterByAdmission: filters.labResults }, // Pass filter
						})
						.then((res) => {
							responses.labResults = res;
						})
				);
			}
			if (documentsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/documents`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: documentsPage - 1, size: pageSize, filterByAdmission: filters.documents }, // Pass filter
						})
						.then((res) => {
							responses.documents = res;
						})
				);
			}

			await Promise.all(requests);

			// Determine the latest vital sign
			// Update latestVitalSign ONLY if vitalSignsPage was requested AND data exists
			const newLatestVitalSign =
				vitalSignsPage && responses.vitalSigns?.data?.content?.length > 0 ? responses.vitalSigns.data.content[0] : get().latestVitalSign;

			set((state) => ({
				...state,
				loading: false,
				patient: patientResponse.data,
				admissions: responses.admissions?.data?.content || state.admissions,
				appointments: responses.appointments?.data?.content || state.appointments,
				assessments: responses.assessments?.data?.content || state.assessments,
				billings: responses.billings?.data?.content || state.billings,
				carePlans: responses.carePlans?.data?.content || state.carePlans,
				prescriptions: responses.prescriptions?.data?.content || state.prescriptions,
				vitalSigns: responses.vitalSigns?.data?.content || state.vitalSigns,
				latestVitalSign: newLatestVitalSign, // UPDATE LATEST VITAL SIGN HERE
				productUsages: responses.productUsages?.data?.content || state.productUsages,
				medicationAdministrations: responses.medicationAdministrations?.data?.content || state.medicationAdministrations,
				imageReports: responses.imageReports?.data?.content || state.imageReports,
				labResults: responses.labResults?.data?.content || state.labResults,
				documents: responses.documents?.data?.content || state.documents,
				quickNotes: responses.quickNotes?.data?.content || state.quickNotes,
				procedureLogs: responses.procedureLogs?.data?.content || state.procedureLogs,
				totalCounts: {
					admissions: responses.admissions?.data?.totalElements || state.totalCounts?.admissions,
					appointments: responses.appointments?.data?.totalElements || state.totalCounts?.appointments,
					assessments: responses.assessments?.data?.totalElements || state.totalCounts?.assessments,
					billings: responses.billings?.data?.totalElements || state.totalCounts?.billings,
					carePlans: responses.carePlans?.data?.totalElements || state.totalCounts?.carePlans,
					prescriptions: responses.prescriptions?.data?.totalElements || state.totalCounts?.prescriptions,
					vitalSigns: responses.vitalSigns?.data?.totalElements || state.totalCounts?.vitalSigns,
					productUsages: responses.productUsages?.data?.totalElements || state.totalCounts?.productUsages,
					medicationAdministrations:
						responses.medicationAdministrations?.data?.totalElements || state.totalCounts?.medicationAdministrations,
					imageReports: responses.imageReports?.data?.totalElements || state.totalCounts?.imageReports,
					labResults: responses.labResults?.data?.totalElements || state.totalCounts?.labResults,
					documents: responses.documents?.data?.totalElements || state.totalCounts?.documents,
					quickNotes: responses.quickNotes?.data?.totalElements || state.totalCounts?.quickNotes,
					procedureLogs: responses.procedureLogs?.data?.totalElements || state.totalCounts?.procedureLogs,
				},
			}));
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch patient data: ${error.message}`,
			});
			throw error; // Re-throw to be caught by caller
		}
	},

	fetchProcedureLogs: async (patientId, page, pageSize, filterByAdmission) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/procedure-logs`, {
				headers: { Authorization: `Bearer ${user?.token}` },
				params: { page: page - 1, size: pageSize, filterByAdmission: filterByAdmission },
			});
			set((state) => ({
				...state,
				loading: false,
				procedureLogs: response.data.content,
				totalCounts: { ...state.totalCounts, procedureLogs: response.data.totalElements },
			}));
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to fetch procedure logs.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error;
		}
	},
	fetchQuickNotes: async (patientId, page, pageSize) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/quick-notes`, {
				headers: { Authorization: `Bearer ${user?.token}` },
				params: { page: page - 1, size: pageSize },
			});
			set((state) => ({
				...state,
				loading: false,
				quickNotes: response.data.content,
				totalCounts: { ...state.totalCounts, quickNotes: response.data.totalElements },
			}));
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to fetch quick notes.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error; // Re-throw to be caught by caller if needed
		}
	},

	createQuickNote: async (patientId, noteText, addedByUserId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(
				`${PATIENT_API_BASE_DATA_URL}/${patientId}/quick-notes`,
				{ noteText, addedByUser: addedByUserId },
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
						"Content-Type": "application/json",
					},
				}
			);
			// Refetch quick notes after creating
			get().fetchQuickNotes(patientId, 1, 10); // Assuming page 1, size 10
			set({ loading: false });
			return response.data; // Return the created note data
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to create quick note.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error; // Re-throw to be caught by caller
		}
	},

	updateQuickNote: async (quickNoteId, noteText, addedByUserId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(
				`${PATIENT_API_BASE_DATA_URL}/quick-notes/${quickNoteId}`,
				{ noteText, addedByUser: addedByUserId },
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const patientId = get().patient?.id; // Get current patient ID
			if (patientId) {
				get().fetchQuickNotes(patientId, 1, 10); // Refetch after update
			}

			set({ loading: false });
			return response.data; // Return updated note data
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to update quick note.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error; //rethrow
		}
	},

	deleteQuickNote: async (quickNoteId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PATIENT_API_BASE_DATA_URL}/quick-notes/${quickNoteId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});

			const patientId = get().patient?.id;
			if (patientId) {
				get().fetchQuickNotes(patientId, 1, 10); // Refetch after delete
			}

			set({ loading: false });
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to delete quick note.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error; // Rethrow
		}
	},
}));
