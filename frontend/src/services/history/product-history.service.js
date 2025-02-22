// src/services/history/product-history.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "../auth.service";

const PRODUCT_API_BASE_URL = `http://localhost:8080/api/products`;

export const useProductHistoryStore = create((set, get) => ({
	productHistory: [],
	loading: false,
	error: null,
	page: 0,
	size: 10,
	total: 0,
	totalPages: 0,
	setProductHistory: (productHistory) => set({ productHistory }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setPage: (page) => set({ page }),
	setSize: (size) => set({ size }),
	setTotal: (total) => set({ total }),
	setTotalPages: (totalPages) => set({ totalPages }),
	clearError: () => set({ error: null }),

	fetchProductHistory: async (productId, startDate, endDate, page = 0, size = 10) => {
		set({ loading: true, error: null, page, size });
		try {
			const user = useAuthStore.getState().user;
			const params = { page, size };

			if (productId) {
				params.productId = productId;
			}
			if (startDate) {
				params.start = startDate;
			}
			if (endDate) {
				params.end = endDate;
			}

			const response = await axios.get(`${PRODUCT_API_BASE_URL}/history`, {
				params,
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			set({
				productHistory: response.data.history, // Access the correct data fields
				total: response.data.totalElements,
				totalPages: response.data.totalPages,
				loading: false,
			});

			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get products history: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	clearProductHistory: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PRODUCT_API_BASE_URL}/history`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				productHistory: [],
				total: 0,
				loading: false,
			});
			notification.success({
				message: "Success",
				description: "Product history cleared successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to clear product history: ${error.message}`,
			});
			throw error; // Re-throw the error so the calling function can handle it
		}
	},
}));
