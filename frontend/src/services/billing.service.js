import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Assuming this path

const BILLING_API_BASE_URL = `http://localhost:8080/api/billings`;

export const useBillingStore = create((set, get) => ({
	billings: [],
	loading: false,
	error: null,
	page: 0,
	pageSize: 10,
	totalElements: 0,
	totalPages: 0,
	activeBill: null,

	setBillings: (billings) => set({ billings }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setActiveBill: (activeBill) => set({ activeBill }),
	setPage: (page) => set({ page }),
	clearError: () => set({ error: null }),
	resetBillings: () => set({ billings: [], totalElements: 0 }),

	fetchActiveBill: async (patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${BILLING_API_BASE_URL}/active?patientId=${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });

			set({ activeBill: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get active bill : ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	fetchBillings: async (page = get().page, pageSize = get().pageSize, patientId = null) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			let url = `${BILLING_API_BASE_URL}?page=${page}&size=${pageSize}`;
			if (patientId) {
				url += `&patientId=${patientId}`;
			}

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ billings: response.data.content });
			set({ totalPages: response.data.totalPages });
			set({ totalElements: response.data.totalElements });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get billings : ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	fetchBillingById: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${BILLING_API_BASE_URL}/${id}`, {
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
				description: `Failed to get billing : ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	createPayment: async (billingId, paymentData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(`${BILLING_API_BASE_URL}/${billingId}/payments`, paymentData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Payment added successfully!",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create payment : ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	updateBilling: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(
				`${BILLING_API_BASE_URL}/${id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update billing : ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
