// src/services/permission.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Import the auth store

const PERMISSION_API_BASE_URL = `/api/permissions`;

export const usePermissionStore = create((set) => ({
	permissions: [],
	loading: false,
	error: null,

	fetchAllPermissions: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user; // Get the user from the auth store
			const response = await axios.get(PERMISSION_API_BASE_URL, {
				headers: { Authorization: `Bearer ${user?.token}` }, // Add authorization header
			});
			set({ permissions: response.data, loading: false });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to fetch permissions";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error; // Re-throw the error for calling components to handle
		}
	},
}));
