// src/services/patientProductUsage.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const PATIENT_PRODUCT_USAGE_API_BASE_URL = `http://localhost:8080/api/product-usage`;

export const usePatientProductUsageStore = create((set, get) => ({
	patientProductUsages: [],
	loading: false,
	error: null,
	total: 0,
	setPatientProductUsages: (patientProductUsages) => set({ patientProductUsages }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createPatientProductUsage: async (patientProductUsageData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(PATIENT_PRODUCT_USAGE_API_BASE_URL, patientProductUsageData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Product usage recorded successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to record product usage: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getPatientProductUsageById: async (patientProductUsageId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PATIENT_PRODUCT_USAGE_API_BASE_URL}/${patientProductUsageId}`, {
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
				description: `Failed to get product usage: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllPatientProductUsages: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(PATIENT_PRODUCT_USAGE_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ patientProductUsages: response.data.content });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get product usages: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deletePatientProductUsage: async (patientProductUsageId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PATIENT_PRODUCT_USAGE_API_BASE_URL}/${patientProductUsageId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Product usage deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete product usage: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchPatientProductUsages: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const { page = 0, size = 10, patientId } = searchParams;

			let url = `${PATIENT_PRODUCT_USAGE_API_BASE_URL}?page=${page}&size=${size}`;
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
				patientProductUsages: response.data.content,
				total: response.data.totalElements,
			});

			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search product usages: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
