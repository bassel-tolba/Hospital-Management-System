// patientDetail.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const PATIENT_API_BASE_DATA_URL = `http://localhost:8080/api/patients-data`;
const IMAGE_REPORT_API_BASE_URL = `http://localhost:8080/api/imagereports`;

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
	latestVitalSign: null,
	productUsages: [],
	medicationAdministrations: [],
	imageReports: [],
	labResults: [],
	documents: [],
	quickNotes: [],
	procedureLogs: [],
	totalCounts: {},
	filters: {
		admissions: false, // Added admissions filter
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

	toggleFilter: (dataType) =>
		set((state) => ({
			filters: {
				...state.filters,
				[dataType]: !state.filters[dataType],
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
		vitalSignsPage,
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
			const { filters } = get();

			patientResponse = await axios.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			const requests = [];
			const responses = {};

			if (quickNotesPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/quick-notes`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: quickNotesPage - 1, size: pageSize }, // No filterByAdmission for quick notes typically
						})
						.then((res) => {
							responses.quickNotes = res;
						})
				);
			}
			if (procedureLogsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/procedure-logs`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: procedureLogsPage - 1, size: pageSize, filterByAdmission: filters.procedureLogs },
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
							params: { page: admissionsPage - 1, size: pageSize, filterByAdmission: filters.admissions }, // Added filter support
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
							params: { page: appointmentsPage - 1, size: pageSize, filterByAdmission: filters.appointments },
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
							params: { page: assessmentsPage - 1, size: pageSize, filterByAdmission: filters.assessments },
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
							params: { page: billingsPage - 1, size: pageSize, filterByAdmission: filters.billings },
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
							params: { page: carePlansPage - 1, size: pageSize, filterByAdmission: filters.carePlans },
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
							params: { page: prescriptionsPage - 1, size: pageSize, filterByAdmission: filters.prescriptions },
						})
						.then((res) => {
							responses.prescriptions = res;
						})
				);
			}
			if (vitalSignsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/vital-signs`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: vitalSignsPage - 1, size: pageSize, filterByAdmission: filters.vitalSigns, sort: "timestamp,desc" },
						})
						.then((res) => {
							responses.vitalSigns = res;
						})
				);
			}
			if (productUsagesPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/product-usages`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: productUsagesPage - 1, size: pageSize, filterByAdmission: filters.productUsages },
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
								filterByAdmission: filters.medicationAdministrations,
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
							params: { page: imageReportsPage - 1, size: pageSize, filterByAdmission: filters.imageReports },
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
							params: { page: labResultsPage - 1, size: pageSize, filterByAdmission: filters.labResults },
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
							params: { page: documentsPage - 1, size: pageSize, filterByAdmission: filters.documents }, // Assuming documents might be filterable
						})
						.then((res) => {
							responses.documents = res;
						})
				);
			}

			await Promise.all(requests);

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
				latestVitalSign: newLatestVitalSign,
				productUsages: responses.productUsages?.data?.content || state.productUsages,
				medicationAdministrations: responses.medicationAdministrations?.data?.content || state.medicationAdministrations,
				imageReports: responses.imageReports?.data?.content || state.imageReports,
				labResults: responses.labResults?.data?.content || state.labResults,
				documents: responses.documents?.data?.content || state.documents,
				quickNotes: responses.quickNotes?.data?.content || state.quickNotes,
				procedureLogs: responses.procedureLogs?.data?.content || state.procedureLogs,
				totalCounts: {
					admissions: responses.admissions?.data?.totalElements ?? state.totalCounts?.admissions,
					appointments: responses.appointments?.data?.totalElements ?? state.totalCounts?.appointments,
					assessments: responses.assessments?.data?.totalElements ?? state.totalCounts?.assessments,
					billings: responses.billings?.data?.totalElements ?? state.totalCounts?.billings,
					carePlans: responses.carePlans?.data?.totalElements ?? state.totalCounts?.carePlans,
					prescriptions: responses.prescriptions?.data?.totalElements ?? state.totalCounts?.prescriptions,
					vitalSigns: responses.vitalSigns?.data?.totalElements ?? state.totalCounts?.vitalSigns,
					productUsages: responses.productUsages?.data?.totalElements ?? state.totalCounts?.productUsages,
					medicationAdministrations:
						responses.medicationAdministrations?.data?.totalElements ?? state.totalCounts?.medicationAdministrations,
					imageReports: responses.imageReports?.data?.totalElements ?? state.totalCounts?.imageReports,
					labResults: responses.labResults?.data?.totalElements ?? state.totalCounts?.labResults,
					documents: responses.documents?.data?.totalElements ?? state.totalCounts?.documents,
					quickNotes: responses.quickNotes?.data?.totalElements ?? state.totalCounts?.quickNotes,
					procedureLogs: responses.procedureLogs?.data?.totalElements ?? state.totalCounts?.procedureLogs,
				},
			}));
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch patient data: ${error.message}`,
			});
			throw error;
		}
	},

	fetchAllDataForReport: async (patientId, reportScope = "all") => {
		const user = useAuthStore.getState().user;
		if (!user || !user.token) {
			notification.error({ message: "Authentication Error", description: "User token not found." });
			throw new Error("User token not found.");
		}
		const headers = { Authorization: `Bearer ${user.token}` };
		const pageSize = 100;

		const allFetchedData = {
			admissions: [],
			appointments: [],
			assessments: [],
			billings: [],
			carePlans: [],
			prescriptions: [],
			vitalSigns: [],
			productUsages: [],
			medicationAdministrations: [],
			imageReports: [],
			labResults: [],
			procedureLogs: [],
		};

		const filterByActiveAdmissionForReport = reportScope === "active";

		const fetchDataPaged = async (dataType, endpoint, additionalParams = {}) => {
			let currentPage = 0;
			let totalPages = 1;
			const accumulatedData = [];

			// Data types that should NOT be filtered by admission for a patient file, even in "active" scope.
			// Admissions list itself provides context. Documents are usually not admission-specific.
			const neverFilterByAdmissionForReport = ["admissions", "documents"];

			const paramsForCall = {
				...additionalParams,
				size: pageSize,
			};

			if (filterByActiveAdmissionForReport && !neverFilterByAdmissionForReport.includes(dataType)) {
				paramsForCall.filterByAdmission = true;
			} else {
				// For "all" scope, or for types like "admissions", explicitly do not filter by admission.
				paramsForCall.filterByAdmission = false;
			}

			while (currentPage < totalPages) {
				try {
					const response = await axios.get(endpoint, {
						headers,
						params: { ...paramsForCall, page: currentPage },
					});
					if (response.data && response.data.content) {
						accumulatedData.push(...response.data.content);
						totalPages = response.data.totalPages;
						if (totalPages === 0) break; // No data
					} else {
						console.warn(`Unexpected response structure for ${dataType} page ${currentPage}:`, response.data);
						break;
					}
					currentPage++;
				} catch (error) {
					console.error(`Error fetching ${dataType} page ${currentPage}:`, error);
					notification.error({ message: "Report Data Fetch Error", description: `Failed to fetch ${dataType}. Report may be incomplete.` });
					break;
				}
			}
			return accumulatedData;
		};

		// fetchAdmissionsPaged is a specific case of fetchDataPaged where filterByAdmission is always false
		// because the admissions list in the report should show all admissions for context.
		const fetchAdmissionsPagedForReport = async () => {
			let currentPage = 0;
			let totalPages = 1;
			const accumulatedData = [];
			while (currentPage < totalPages) {
				try {
					const response = await axios.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/admissions`, {
						headers,
						params: { page: currentPage, size: pageSize, filterByAdmission: false }, // Always false for the main admissions list
					});
					if (response.data && response.data.content) {
						accumulatedData.push(...response.data.content);
						totalPages = response.data.totalPages;
						if (totalPages === 0) break;
					} else {
						break;
					}
					currentPage++;
				} catch (error) {
					console.error(`Error fetching admissions for report page ${currentPage}:`, error);
					notification.error({ message: "Report Data Fetch Error", description: `Failed to fetch admissions. Report may be incomplete.` });
					break;
				}
			}
			return accumulatedData;
		};

		try {
			const results = await Promise.all([
				fetchAdmissionsPagedForReport(), // Always fetches all admissions
				fetchDataPaged("appointments", `${PATIENT_API_BASE_DATA_URL}/${patientId}/appointments`),
				fetchDataPaged("assessments", `${PATIENT_API_BASE_DATA_URL}/${patientId}/assessments`),
				fetchDataPaged("billings", `${PATIENT_API_BASE_DATA_URL}/${patientId}/billings`),
				fetchDataPaged("carePlans", `${PATIENT_API_BASE_DATA_URL}/${patientId}/care-plans`),
				fetchDataPaged("prescriptions", `${PATIENT_API_BASE_DATA_URL}/${patientId}/prescriptions`),
				fetchDataPaged("vitalSigns", `${PATIENT_API_BASE_DATA_URL}/${patientId}/vital-signs`, { sort: "timestamp,desc" }),
				fetchDataPaged("productUsages", `${PATIENT_API_BASE_DATA_URL}/${patientId}/product-usages`),
				fetchDataPaged("medicationAdministrations", `${PATIENT_API_BASE_DATA_URL}/${patientId}/medication-administrations`),
				fetchDataPaged("imageReports", `${IMAGE_REPORT_API_BASE_URL}/patient/${patientId}`),
				fetchDataPaged("labResults", `${PATIENT_API_BASE_DATA_URL}/${patientId}/lab-results`),
				fetchDataPaged("procedureLogs", `${PATIENT_API_BASE_DATA_URL}/${patientId}/procedure-logs`),
			]);

			allFetchedData.admissions = results[0];
			allFetchedData.appointments = results[1];
			allFetchedData.assessments = results[2];
			allFetchedData.billings = results[3];
			allFetchedData.carePlans = results[4];
			allFetchedData.prescriptions = results[5];
			allFetchedData.vitalSigns = results[6];
			allFetchedData.productUsages = results[7];
			allFetchedData.medicationAdministrations = results[8];
			allFetchedData.imageReports = results[9];
			allFetchedData.labResults = results[10];
			allFetchedData.procedureLogs = results[11];
		} catch (error) {
			console.error("Error fetching all data for report:", error);
			notification.error({ message: "Major Report Error", description: "Could not fetch all necessary data for the report." });
			throw error;
		}

		return allFetchedData;
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
			throw error;
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
			// Fetch the current page of quick notes to update the list, or just the first page
			const currentPage = Math.floor((get().totalCounts.quickNotes || 0) / 10); // Assuming 10 per page
			get().fetchQuickNotes(patientId, currentPage + 1, 10);
			set({ loading: false });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to create quick note.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error;
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
			const patientId = get().patient?.id;
			if (patientId) {
				// Determine which page the updated note might be on, or just refresh current view
				// For simplicity, refreshing the first page or a common view.
				get().fetchQuickNotes(patientId, 1, 10); // Refresh first page
			}
			set({ loading: false });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to update quick note.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error;
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
				get().fetchQuickNotes(patientId, 1, 10); // Refresh first page
			}
			set({ loading: false });
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to delete quick note.";
			set({ error: errorMessage, loading: false });
			notification.error({ message: "Error", description: errorMessage });
			throw error;
		}
	},
}));
