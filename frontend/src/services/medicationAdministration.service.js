// src/services/medicationAdministration.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Import useAuthStore

const MEDICATION_ADMINISTRATION_API_BASE_URL = `/api/medication-administrations`;

export const useMedicationAdministrationStore = create((set, get) => ({
	medicationAdministrations: [],
	loading: false,
	error: null,
	total: 0,
	setMedicationAdministrations: (medicationAdministrations) => set({ medicationAdministrations }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createMedicationAdministration: async (medicationAdministrationData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(MEDICATION_ADMINISTRATION_API_BASE_URL, medicationAdministrationData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication administration created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create medication administration: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getMedicationAdministrationById: async (medicationAdministrationId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${MEDICATION_ADMINISTRATION_API_BASE_URL}/${medicationAdministrationId}`, {
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
				description: `Failed to get medication administration: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllMedicationAdministrations: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(MEDICATION_ADMINISTRATION_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ medicationAdministrations: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get medication administrations: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteMedicationAdministration: async (medicationAdministrationId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${MEDICATION_ADMINISTRATION_API_BASE_URL}/${medicationAdministrationId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication administration deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete medication administration: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchMedicationAdministrations: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const { page = 0, size = 10, patientId } = searchParams;
			let url = `${MEDICATION_ADMINISTRATION_API_BASE_URL}?page=${page}&size=${size}`;

			if (patientId) {
				url += `&patientId=${patientId}`;
			}
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				medicationAdministrations: response.data.content, // Access the content
				total: response.data.totalElements, // Access the totalElements
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search medication administrations: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
