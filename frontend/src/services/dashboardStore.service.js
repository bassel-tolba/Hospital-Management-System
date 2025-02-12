// src/services/dashboardStore.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const DASHBOARD_API_BASE_URL = "http://localhost:8080/api/dashboard";

export const useDashboardStore = create((set, get) => ({
	dashboardData: null,
	loading: false,
	error: null,
	setDashboardData: (data) => set({ dashboardData: data }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	fetchDashboardData: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(DASHBOARD_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false, dashboardData: response.data });
			return response.data;
		} catch (error) {
			set({
				loading: false,
				error: error.message,
				dashboardData: null,
			});
			if (error.response && error.response.status === 401) {
				localStorage.removeItem("user");
				window.location.href = "/login";
			} else {
				notification.error({
					message: "Error",
					description: `Failed to fetch dashboard data: ${error?.response?.data?.message || error.message}`,
				});
			}
			throw error;
		}
	},
}));
