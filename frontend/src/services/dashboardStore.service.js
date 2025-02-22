// src/services/dashboardStore.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Make sure this path is correct

const DASHBOARD_API_BASE_URL = "http://localhost:8080/api/dashboard";

export const useDashboardStore = create((set, get) => ({
	admissionCount: null, // Not needed for trend, keep if used elsewhere
	loading: false,
	error: null,

	// Keep fetchAdmissionCount if other parts of your app use it.
	setAdmissionCount: (count) => set({ admissionCount: count }), // Keep if used elsewhere
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	fetchAdmissionTrend: async (startDateString, endDateString, includeOpen, includeFuture, includePast) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${DASHBOARD_API_BASE_URL}/admissions/trend`, {
				// New endpoint
				params: {
					startDate: startDateString, // Pass strings directly
					endDate: endDateString,
					includeOpen,
					includeFuture,
					includePast,
				},
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			// Return the data directly.  No need to set in Zustand
			return response.data;
		} catch (error) {
			set({
				loading: false,
				error: error.message,
				admissionCount: null, // Might not be needed
			});
			// Handle 401 Unauthorized (e.g., redirect to login)
			if (error.response && error.response.status === 401) {
				localStorage.removeItem("user"); // Clear user data
				window.location.href = "/login"; // Redirect to login page
			} else {
				notification.error({
					message: "Error",
					description: `Failed to fetch admission trend: ${error?.response?.data?.message || error.message}`,
				});
			}

			throw error; // Re-throw the error so the calling component can handle it if needed
		}
	},
	// Keep if used somewhere else in the code.
	fetchAdmissionCount: async (startDateString, endDateString, includeOpen, includeFuture, includePast) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${DASHBOARD_API_BASE_URL}/admissions/count`, {
				params: {
					startDate: startDateString, // Pass strings directly
					endDate: endDateString,
					includeOpen,
					includeFuture,
					includePast,
				},
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false, admissionCount: response.data.admissionCount });
			return response.data.admissionCount;
		} catch (error) {
			set({
				loading: false,
				error: error.message,
				admissionCount: null,
			});
			// Handle 401 Unauthorized (e.g., redirect to login)
			if (error.response && error.response.status === 401) {
				localStorage.removeItem("user"); // Clear user data
				window.location.href = "/login"; // Redirect to login page
			} else {
				notification.error({
					message: "Error",
					description: `Failed to fetch admission count: ${error?.response?.data?.message || error.message}`,
				});
			}

			throw error; // Re-throw the error so the calling component can handle it if needed
		}
	},
	fetchPaymentStatistics: async (startDateString, endDateString) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${DASHBOARD_API_BASE_URL}/payments/statistics`, {
				params: {
					startDate: startDateString,
					endDate: endDateString,
				},
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			return response.data; // Return the PaymentStatisticsDTO
		} catch (error) {
			set({ loading: false, error: error.message });
			// Handle 401 Unauthorized (e.g., redirect to login)
			if (error.response && error.response.status === 401) {
				localStorage.removeItem("user"); // Clear user data
				window.location.href = "/login"; // Redirect to login page
			} else {
				notification.error({
					message: "Error",
					description: `Failed to fetch payment statistics: ${error?.response?.data?.message || error.message}`,
				});
			}
			throw error; // Important for component error handling
		}
	},
	// src/services/dashboardStore.js

	fetchPaymentTrend: async (startDateString, endDateString) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${DASHBOARD_API_BASE_URL}/payments/trend`, {
				// Use the new endpoint
				params: {
					startDate: startDateString,
					endDate: endDateString,
				},
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			return response.data; // Return the list of PaymentTrendDTO objects
		} catch (error) {
			set({ loading: false, error: error.message });
			// Handle 401 Unauthorized (e.g., redirect to login)
			if (error.response && error.response.status === 401) {
				localStorage.removeItem("user"); // Clear user data
				window.location.href = "/login"; // Redirect to login page
			} else {
				notification.error({
					message: "Error",
					description: `Failed to fetch payment trend: ${error?.response?.data?.message || error.message}`,
				});
			}
			throw error;
		}
	},
}));
