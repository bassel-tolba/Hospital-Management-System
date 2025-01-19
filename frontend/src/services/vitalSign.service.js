import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service";
import { notification } from "antd";

const VITAL_SIGNS_API_BASE_URL = `http://localhost:8080/api/vital-signs`;

export const useVitalSignStore = create((set, get) => ({
	vitalSigns: [],
	loading: false,
	totalElements: 0,
	error: null,
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setVitalSigns: (vitalSigns) => set({ vitalSigns }),
	clearError: () => set({ error: null }),
	fetchVitalSigns: async (page, size, patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${VITAL_SIGNS_API_BASE_URL}/patient/${patientId}`, {
				params: { page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				vitalSigns: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch vital signs: ${error.message}`,
			});
			throw error;
		}
	},
	createVitalSign: async (vitalSignData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.post(VITAL_SIGNS_API_BASE_URL, vitalSignData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Vital sign Created Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create vital sign: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	updateVitalSign: async (id, vitalSignData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.put(`${VITAL_SIGNS_API_BASE_URL}/${id}`, vitalSignData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Vital sign updated Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update vital sign: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	deleteVitalSign: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${VITAL_SIGNS_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Vital sign Deleted Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete vital sign: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
}));
