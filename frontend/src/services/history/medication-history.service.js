import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "../auth.service";

const MEDICATION_API_BASE_URL = `http://localhost:8080/api/medications`;

export const useMedicationHistoryStore = create((set, get) => ({
	medicationHistory: [],
	loading: false,
	error: null,
	setMedicationHistory: (medicationHistory) => set({ medicationHistory }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	fetchMedicationHistory: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${MEDICATION_API_BASE_URL}/history`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ medicationHistory: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get medications history : ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
