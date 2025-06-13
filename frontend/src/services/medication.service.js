// medication.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const MEDICATION_API_BASE_URL = `http://localhost:8080/api/medications`;

export const useMedicationStore = create((set, get) => ({
	// ... (other store properties and functions) ...
	medications: [],
	loading: false,
	error: null,
	total: 0,
	setMedications: (medications) => set({ medications }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createMedication: async (medicationData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(MEDICATION_API_BASE_URL, medicationData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create medication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	updateMedication: async (medicationId, medicationData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${MEDICATION_API_BASE_URL}/${medicationId}`, medicationData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update medication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getMedicationById: async (medicationId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${MEDICATION_API_BASE_URL}/${medicationId}`, {
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
				description: `Failed to get medication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllMedications: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(MEDICATION_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			const medicationsWithStock = response.data.map((med) => ({
				...med,
				stock: med.stock, // The backend already calculates this
			}));
			set({ medications: medicationsWithStock });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get medications: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteMedication: async (medicationId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${MEDICATION_API_BASE_URL}/${medicationId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete medication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	addBatch: async (medicationId, batchData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(`${MEDICATION_API_BASE_URL}/${medicationId}/add-batch`, batchData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication batch added successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to add medication batch: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	updateBatch: async (batchId, batchData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${MEDICATION_API_BASE_URL}/batches/${batchId}`, batchData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication batch updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update medication batch: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteBatch: async (batchId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${MEDICATION_API_BASE_URL}/batches/${batchId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication batch deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete medication batch: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	searchMedications: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const { searchTerm, page = 0, size = 10 } = searchParams;
			let url = `${MEDICATION_API_BASE_URL}/search?page=${page}&size=${size}`;

			if (searchTerm) {
				url += `&searchTerm=${searchTerm}`;
			}

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				medications: response.data,
				total: response.data.length,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search medications: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	// UPDATED FUNCTION
	getBatchesForMedication: async (medicationId, { startDate, endDate }) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const params = new URLSearchParams();
			if (startDate) params.append("start", startDate);
			if (endDate) params.append("end", endDate);

			const queryString = params.toString();
			const url = `${MEDICATION_API_BASE_URL}/${medicationId}/batches${queryString ? `?${queryString}` : ""}`;

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			return response.data; // Return the array of batches
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get batches for medication: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
