import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const MEDICATION_API_BASE_URL = `http://localhost:8080/api/medications`;

export const useMedicationStore = create((set, get) => ({
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
			set({ medications: response.data });
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
	increaseStock: async (medicationId, quantity) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.patch(
				`${MEDICATION_API_BASE_URL}/${medicationId}/increase-stock?quantity=${quantity}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication stock increased successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to increase medication stock: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	decreaseStock: async (medicationId, quantity) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.patch(
				`${MEDICATION_API_BASE_URL}/${medicationId}/decrease-stock?quantity=${quantity}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Medication stock decreased successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to decrease medication stock: ${error?.response?.data?.message || error.message}`,
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
}));
