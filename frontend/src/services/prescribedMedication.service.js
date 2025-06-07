import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Import useAuthStore

const PRESCRIBED_MEDICATION_API_BASE_URL = `http://localhost:8080/api/prescribed-medications`;

export const usePrescribedMedicationStore = create((set, get) => ({
	prescribedMedications: [],
	loading: false,
	error: null,
	setPrescribedMedications: (prescribedMedications) => set({ prescribedMedications }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	createPrescribedMedication: async (prescribedMedicationData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(PRESCRIBED_MEDICATION_API_BASE_URL, prescribedMedicationData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "PrescribedMedication created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create PrescribedMedication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	getPrescribedMedicationById: async (prescribedMedicationId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PRESCRIBED_MEDICATION_API_BASE_URL}/${prescribedMedicationId}`, {
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
				description: `Failed to get PrescribedMedication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	fetchAllPrescribedMedications: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(PRESCRIBED_MEDICATION_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ prescribedMedications: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch PrescribedMedications: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deletePrescribedMedication: async (prescribedMedicationId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PRESCRIBED_MEDICATION_API_BASE_URL}/${prescribedMedicationId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "PrescribedMedication deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete PrescribedMedication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
