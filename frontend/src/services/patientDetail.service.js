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
		admissions: false,
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
		pageSize,
	) => {
		set({ loading: true, error: null });
		let patientResponse;
		try {
			const { user, hasAuthority } = useAuthStore.getState();
			const { filters } = get();

			if (!hasAuthority("READ_PATIENT")) {
				set({ loading: false, error: "Permission Denied", patient: null });
				notification.error({ message: "Permission Denied", description: "You do not have permission to view patient details." });
				return;
			}

			patientResponse = await axios.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			const requests = [];
			const responses = {};

			// START: ==================== MODIFICATION ====================
			// ADDED: Permission checks before dispatching API calls.

			if (quickNotesPage && hasAuthority("READ_ACTIVITY")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/quick-notes`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: quickNotesPage - 1, size: pageSize },
						})
						.then((res) => {
							responses.quickNotes = res;
						}),
				);
			}
			if (procedureLogsPage && hasAuthority("READ_PROCEDURE_LOG")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/procedure-logs`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: procedureLogsPage - 1, size: pageSize, filterByAdmission: filters.procedureLogs },
						})
						.then((res) => {
							responses.procedureLogs = res;
						}),
				);
			}
			if (admissionsPage && hasAuthority("READ_ADMISSION")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/admissions`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: admissionsPage - 1, size: pageSize, filterByAdmission: filters.admissions },
						})
						.then((res) => {
							responses.admissions = res;
						}),
				);
			}
			if (appointmentsPage && hasAuthority("READ_APPOINTMENT")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/appointments`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: appointmentsPage - 1, size: pageSize, filterByAdmission: filters.appointments },
						})
						.then((res) => {
							responses.appointments = res;
						}),
				);
			}
			if (assessmentsPage && hasAuthority("READ_ASSESSMENT")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/assessments`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: assessmentsPage - 1, size: pageSize, filterByAdmission: filters.assessments },
						})
						.then((res) => {
							responses.assessments = res;
						}),
				);
			}
			if (billingsPage && hasAuthority("READ_BILLING")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/billings`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: billingsPage - 1, size: pageSize, filterByAdmission: filters.billings },
						})
						.then((res) => {
							responses.billings = res;
						}),
				);
			}
			if (carePlansPage && hasAuthority("READ_NURSING_CARE_PLAN")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/care-plans`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: carePlansPage - 1, size: pageSize, filterByAdmission: filters.carePlans },
						})
						.then((res) => {
							responses.carePlans = res;
						}),
				);
			}
			if (prescriptionsPage && hasAuthority("READ_PRESCRIPTION")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/prescriptions`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: prescriptionsPage - 1, size: pageSize, filterByAdmission: filters.prescriptions },
						})
						.then((res) => {
							responses.prescriptions = res;
						}),
				);
			}
			if (vitalSignsPage && hasAuthority("READ_VITAL_SIGN")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/vital-signs`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: vitalSignsPage - 1, size: pageSize, filterByAdmission: filters.vitalSigns, sort: "timestamp,desc" },
						})
						.then((res) => {
							responses.vitalSigns = res;
						}),
				);
			}
			if (productUsagesPage && hasAuthority("READ_PATIENT_PRODUCT_USAGE")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/product-usages`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: productUsagesPage - 1, size: pageSize, filterByAdmission: filters.productUsages },
						})
						.then((res) => {
							responses.productUsages = res;
						}),
				);
			}
			if (medicationAdministrationsPage && hasAuthority("READ_MEDICATION_ADMINISTRATION")) {
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
						}),
				);
			}
			if (imageReportsPage && hasAuthority("READ_IMAGE_REPORT")) {
				requests.push(
					axios
						.get(`${IMAGE_REPORT_API_BASE_URL}/patient/${patientId}`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: imageReportsPage - 1, size: pageSize, filterByAdmission: filters.imageReports },
						})
						.then((res) => {
							responses.imageReports = res;
						}),
				);
			}
			if (labResultsPage && hasAuthority("READ_LAB_RESULT")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/lab-results`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: labResultsPage - 1, size: pageSize, filterByAdmission: filters.labResults },
						})
						.then((res) => {
							responses.labResults = res;
						}),
				);
			}
			if (documentsPage && hasAuthority("READ_DOCUMENT")) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/documents`, {
							headers: { Authorization: `Bearer ${user?.token}` },
							params: { page: documentsPage - 1, size: pageSize, filterByAdmission: filters.documents },
						})
						.then((res) => {
							responses.documents = res;
						}),
				);
			}
			// END: ==================== MODIFICATION ====================

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
			// The error might be from the initial patient data fetch, which is critical.
			if (!patientResponse) {
				notification.error({
					message: "Error",
					description: `Failed to fetch patient data: ${error.message}`,
				});
			} else {
				console.error("Error fetching sub-data:", error); // Log other errors but don't show a breaking notification
			}
			// Do not re-throw error to allow partial data rendering
		}
	},

	fetchAllDataForReport: async (patientId, reportScope = "all") => {
		const { user, hasAuthority } = useAuthStore.getState();
		if (!user || !user.token || !hasAuthority("READ_PATIENT")) {
			notification.error({ message: "Authentication Error", description: "User token not found or insufficient permissions." });
			throw new Error("User token not found or insufficient permissions.");
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
			const neverFilterByAdmissionForReport = ["admissions", "documents"];
			const paramsForCall = { ...additionalParams, size: pageSize };

			if (filterByActiveAdmissionForReport && !neverFilterByAdmissionForReport.includes(dataType)) {
				paramsForCall.filterByAdmission = true;
			} else {
				paramsForCall.filterByAdmission = false;
			}

			while (currentPage < totalPages) {
				try {
					const response = await axios.get(endpoint, { headers, params: { ...paramsForCall, page: currentPage } });
					if (response.data && response.data.content) {
						accumulatedData.push(...response.data.content);
						totalPages = response.data.totalPages;
						if (totalPages === 0) break;
					} else {
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

		const fetchAdmissionsPagedForReport = async () => {
			return fetchDataPaged("admissions", `${PATIENT_API_BASE_DATA_URL}/${patientId}/admissions`);
		};

		try {
			// START: ==================== MODIFICATION ====================
			// ADDED: Permission checks before fetching data for the report.
			// Using Promise.resolve([]) as a placeholder for unauthorized requests.
			const dataFetchPromises = [
				hasAuthority("READ_ADMISSION") ? fetchAdmissionsPagedForReport() : Promise.resolve([]),
				hasAuthority("READ_APPOINTMENT")
					? fetchDataPaged("appointments", `${PATIENT_API_BASE_DATA_URL}/${patientId}/appointments`)
					: Promise.resolve([]),
				hasAuthority("READ_ASSESSMENT")
					? fetchDataPaged("assessments", `${PATIENT_API_BASE_DATA_URL}/${patientId}/assessments`)
					: Promise.resolve([]),
				hasAuthority("READ_BILLING") ? fetchDataPaged("billings", `${PATIENT_API_BASE_DATA_URL}/${patientId}/billings`) : Promise.resolve([]),
				hasAuthority("READ_NURSING_CARE_PLAN")
					? fetchDataPaged("carePlans", `${PATIENT_API_BASE_DATA_URL}/${patientId}/care-plans`)
					: Promise.resolve([]),
				hasAuthority("READ_PRESCRIPTION")
					? fetchDataPaged("prescriptions", `${PATIENT_API_BASE_DATA_URL}/${patientId}/prescriptions`)
					: Promise.resolve([]),
				hasAuthority("READ_VITAL_SIGN")
					? fetchDataPaged("vitalSigns", `${PATIENT_API_BASE_DATA_URL}/${patientId}/vital-signs`, { sort: "timestamp,desc" })
					: Promise.resolve([]),
				hasAuthority("READ_PATIENT_PRODUCT_USAGE")
					? fetchDataPaged("productUsages", `${PATIENT_API_BASE_DATA_URL}/${patientId}/product-usages`)
					: Promise.resolve([]),
				hasAuthority("READ_MEDICATION_ADMINISTRATION")
					? fetchDataPaged("medicationAdministrations", `${PATIENT_API_BASE_DATA_URL}/${patientId}/medication-administrations`)
					: Promise.resolve([]),
				hasAuthority("READ_IMAGE_REPORT")
					? fetchDataPaged("imageReports", `${IMAGE_REPORT_API_BASE_URL}/patient/${patientId}`)
					: Promise.resolve([]),
				hasAuthority("READ_LAB_RESULT")
					? fetchDataPaged("labResults", `${PATIENT_API_BASE_DATA_URL}/${patientId}/lab-results`)
					: Promise.resolve([]),
				hasAuthority("READ_PROCEDURE_LOG")
					? fetchDataPaged("procedureLogs", `${PATIENT_API_BASE_DATA_URL}/${patientId}/procedure-logs`)
					: Promise.resolve([]),
			];

			const results = await Promise.all(dataFetchPromises);
			// END: ==================== MODIFICATION ====================

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
		if (!useAuthStore.getState().hasAuthority("READ_PROCEDURE_LOG")) return;
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
		if (!useAuthStore.getState().hasAuthority("READ_ACTIVITY")) {
			set({ quickNotes: [], totalCounts: { ...get().totalCounts, quickNotes: 0 } });
			return;
		}
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
		if (!useAuthStore.getState().hasAuthority("CREATE_ACTIVITY")) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to create quick notes." });
			throw new Error("Permission Denied");
		}
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
				},
			);
			const currentPage = Math.floor((get().totalCounts.quickNotes || 0) / 10);
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
		if (!useAuthStore.getState().hasAuthority("UPDATE_ACTIVITY")) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to update quick notes." });
			throw new Error("Permission Denied");
		}
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
				},
			);
			const patientId = get().patient?.id;
			if (patientId) {
				get().fetchQuickNotes(patientId, 1, 10);
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
		if (!useAuthStore.getState().hasAuthority("DELETE_ACTIVITY")) {
			notification.error({ message: "Permission Denied", description: "You do not have permission to delete quick notes." });
			throw new Error("Permission Denied");
		}
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PATIENT_API_BASE_DATA_URL}/quick-notes/${quickNoteId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			const patientId = get().patient?.id;
			if (patientId) {
				get().fetchQuickNotes(patientId, 1, 10);
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
