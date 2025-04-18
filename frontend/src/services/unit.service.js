import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Import useAuthStore

const UNIT_API_BASE_URL = `/api/units`;

export const useUnitStore = create((set, get) => ({
	units: [],
	loading: false,
	error: null,
	total: 0,
	setUnits: (units) => set({ units }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createUnit: async (unitData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(UNIT_API_BASE_URL, unitData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Unit created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create unit: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getUnitById: async (unitId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${UNIT_API_BASE_URL}/${unitId}`, {
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
				description: `Failed to get unit: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllUnits: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(UNIT_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ units: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get units: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	updateUnit: async (unitId, unitData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${UNIT_API_BASE_URL}/${unitId}`, unitData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Unit updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update unit: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteUnit: async (unitId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${UNIT_API_BASE_URL}/${unitId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Unit deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete unit: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchUnits: async (searchTerm) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;

			const response = await axios.get(`${UNIT_API_BASE_URL}/search?searchTerm=${searchTerm}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			set({
				loading: false,
				units: response.data,
				total: response.data.length,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search unit: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
