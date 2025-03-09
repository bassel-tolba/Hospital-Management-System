import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const PRESCRIPTION_API_BASE_URL = `/api/prescriptions`;

export const usePrescriptionStore = create((set, get) => ({
	prescriptions: [],
	loading: false,
	error: null,
	total: 0,
	setPrescriptions: (prescriptions) => set({ prescriptions }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createPrescription: async (prescriptionData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(PRESCRIPTION_API_BASE_URL, prescriptionData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Prescription created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create prescription: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	updatePrescription: async (prescriptionId, prescriptionData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${PRESCRIPTION_API_BASE_URL}/${prescriptionId}`, prescriptionData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Prescription updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update prescription: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getPrescriptionById: async (prescriptionId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PRESCRIPTION_API_BASE_URL}/${prescriptionId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get prescription: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchPrescriptionsByPatientId: async (patientId, page = 0, size = 10) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PRESCRIPTION_API_BASE_URL}/patient/${patientId}`, {
				params: { page, size },
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				prescriptions: response.data.content,
				total: response.data.totalElements,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch prescriptions for patient: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllPrescriptions: async (page = 0, size = 10) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(PRESCRIPTION_API_BASE_URL, {
				params: { page, size },
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				prescriptions: response.data.content,
				total: response.data.totalElements,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get prescriptions: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deletePrescription: async (prescriptionId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PRESCRIPTION_API_BASE_URL}/${prescriptionId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Prescription deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete prescription: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchPrescriptions: async (searchParams, page = 0, size = 10) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;

			const params = new URLSearchParams(searchParams).toString();

			const response = await axios.get(`${PRESCRIPTION_API_BASE_URL}/search?${params}`, {
				params: { page, size },
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			if (response.status === 401) {
				//handle logout
				console.log("user needs to log out");
				return;
			}

			set({
				loading: false,
				prescriptions: response.data.content,
				total: response.data.totalElements,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search prescriptions: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
