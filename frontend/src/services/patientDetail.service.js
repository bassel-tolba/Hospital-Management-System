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
	productUsages: [],
	medicationAdministrations: [],
	imageReports: [],
	labResults: [],
	documents: [], // new
	totalCounts: {},
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

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
		documentsPage, //new
		pageSize
	) => {
		set({ loading: true, error: null });
		let patientResponse;
		try {
			const user = useAuthStore.getState().user;

			patientResponse = await axios.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			const requests = [];
			const responses = {};

			if (admissionsPage) {
				requests.push(
					axios
						.get(`${PATIENT_API_BASE_DATA_URL}/${patientId}/admissions`, {
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: admissionsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: appointmentsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: assessmentsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: billingsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: carePlansPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: prescriptionsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: vitalSignsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: productUsagesPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: medicationAdministrationsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: imageReportsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: labResultsPage - 1, size: pageSize },
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
							headers: {
								Authorization: `Bearer ${user?.token}`,
							},
							params: { page: documentsPage - 1, size: pageSize },
						})
						.then((res) => {
							responses.documents = res;
						})
				);
			}

			await Promise.all(requests);

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
				productUsages: responses.productUsages?.data?.content || state.productUsages,
				medicationAdministrations: responses.medicationAdministrations?.data?.content || state.medicationAdministrations,
				imageReports: responses.imageReports?.data?.content || state.imageReports,
				labResults: responses.labResults?.data?.content || state.labResults,
				documents: responses.documents?.data?.content || state.documents,
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
}));
