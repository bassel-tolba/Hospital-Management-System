import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const BED_API_BASE_URL = `http://localhost:8080/api/beds`;

export const useBedStore = create((set, get) => ({
	beds: [],
	loading: false,
	error: null,
	totalElements: 0,
	setBeds: (beds) => set({ beds }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotalElements: (totalElements) => set({ totalElements }),
	clearError: () => set({ error: null }),

	createBed: async (bedData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(BED_API_BASE_URL, bedData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Bed created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create bed: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getBedById: async (bedId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${BED_API_BASE_URL}/${bedId}`, {
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
				description: `Failed to get bed: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllBeds: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(BED_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ beds: response.data.content });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get beds: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	updateBed: async (bedId, bedData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${BED_API_BASE_URL}/${bedId}`, bedData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Bed updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update bed: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteBed: async (bedId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${BED_API_BASE_URL}/${bedId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Bed deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete bed: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchBeds: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const { searchTerm, roomId, unitId, page = 0, size = 10 } = searchParams;
			let url = `${BED_API_BASE_URL}?page=${page}&size=${size}`;

			if (searchTerm) {
				url += `&searchTerm=${searchTerm}`;
			}

			if (roomId) {
				url += `&roomId=${roomId}`;
			}
			if (unitId) {
				url += `&unitId=${unitId}`;
			}

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				beds: response.data.content,
				totalElements: response.data.totalElements,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search beds: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	freeAllExpiredBeds: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(
				`${BED_API_BASE_URL}/free-expired`,
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
				description: "Expired beds freed successfully.",
			});
			return response.data;
		} catch (error) {
			set({ loading: false, error: error.message });
			notification.error({
				message: "Error",
				description: `Failed to free expired beds: ${error?.response?.data?.message || error.message}`,
			});
		}
	},
}));
