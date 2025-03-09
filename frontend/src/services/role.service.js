import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Import

const ROLE_API_BASE_URL = `/api/roles`;

export const useRoleStore = create((set, get) => ({
	// Added get
	roles: [],
	loading: false,
	error: null,

	fetchAllRoles: async () => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get(ROLE_API_BASE_URL);
			set({ roles: response.data, loading: false });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to fetch roles";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},

	getRoleById: async (id) => {
		set({ loading: true, error: null });
		try {
			const response = await axios.get(`${ROLE_API_BASE_URL}/${id}`);
			set({ loading: false });
			return response.data; // Return the single role
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to get role";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},

	createRole: async (roleData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(ROLE_API_BASE_URL, roleData, {
				headers: { Authorization: `Bearer ${user?.token}` }, // Add authorization header
			});
			set({ loading: false });
			notification.success({ message: "Success", description: "Role created successfully." });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to create role";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},

	updateRole: async (id, roleData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${ROLE_API_BASE_URL}/${id}`, roleData, {
				headers: { Authorization: `Bearer ${user?.token}` }, // Add authorization header
			});
			set({ loading: false });
			notification.success({ message: "Success", description: "Role updated successfully." });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to update role";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},

	deleteRole: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${ROLE_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` }, // Add authorization header
			});
			set({ loading: false });
			notification.success({ message: "Success", description: "Role deleted successfully." });
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to delete role";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},
}));
