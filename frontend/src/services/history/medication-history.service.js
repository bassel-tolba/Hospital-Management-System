import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "../auth.service";
import moment from "moment";

const MEDICATION_API_BASE_URL = `/api/medications`;

export const useMedicationHistoryStore = create((set, get) => ({
	medicationHistory: [],
	loading: false,
	error: null,
	page: 0,
	size: 10,
	total: 0, // Total number of elements
	totalPages: 0, //total Number of Pages.
	setMedicationHistory: (medicationHistory) => set({ medicationHistory }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setPage: (page) => set({ page }),
	setSize: (size) => set({ size }),
	setTotal: (total) => set({ total }),
	setTotalPages: (totalPages) => set({ totalPages }),
	clearError: () => set({ error: null }),

	fetchMedicationHistory: async (medicationId, startDate, endDate, page = 0, size = 10) => {
		set({ loading: true, error: null, page, size });
		try {
			const user = useAuthStore.getState().user;

			// Use axios's params object for ALL query parameters:
			const params = {
				page,
				size,
			};

			if (medicationId) {
				params.medicationId = medicationId;
			}
			if (startDate) {
				params.start = startDate;
			}
			if (endDate) {
				params.end = endDate;
			}

			const response = await axios.get(`${MEDICATION_API_BASE_URL}/history`, {
				params, // Pass the params object here
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			set({
				medicationHistory: response.data.history,
				total: response.data.totalElements,
				totalPages: response.data.totalPages,
				loading: false,
			});

			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get medications history: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	clearMedicationHistory: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${MEDICATION_API_BASE_URL}/history`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				medicationHistory: [],
				total: 0,
				loading: false,
			});
			notification.success({
				message: "Success",
				description: "Medication history cleared successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to clear medication history: ${error.message}`,
			});
			throw error; // Re-throw the error so the calling function can handle it
		}
	},
}));
