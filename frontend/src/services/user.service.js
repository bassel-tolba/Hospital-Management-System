import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const USER_API_BASE_URL = `http://localhost:8080/api/users`;

export const useUserStore = create((set, get) => ({
	users: [],
	loading: false,
	error: null,
	total: 0,
	currentUser: null,
	setUsers: (users) => set({ users }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	getCurrentUser: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${USER_API_BASE_URL}/me`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false, currentUser: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get current user: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	createUser: async (userData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(USER_API_BASE_URL, userData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create user: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getUserById: async (userId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${USER_API_BASE_URL}/${userId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get user: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getAllUsers: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${USER_API_BASE_URL}/all`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get users: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	getUsersByRole: async (role) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${USER_API_BASE_URL}/byrole/${role}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false, users: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get users by role: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	updateUser: async (userId, userData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${USER_API_BASE_URL}/${userId}`, userData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update user: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteUser: async (userId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${USER_API_BASE_URL}/${userId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User deleted successfully.",
			});
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete user: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	searchUsers: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const params = new URLSearchParams(searchParams).toString();
			const response = await axios.get(`${USER_API_BASE_URL}/search?${params}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			if (response.status === 401) {
				//handle logout
				console.log("user needs to log out");
				useAuthStore.getState().logout();
				return;
			}
			set({
				loading: false,
				users: response.data.content,
				total: response.data.totalElements,
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search users: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	updateUserUnits: async (userId, unitIds) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${USER_API_BASE_URL}/updateunits/${userId}`, unitIds, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update user units: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	updateUserRooms: async (userId, roomIds) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${USER_API_BASE_URL}/updaterooms/${userId}`, roomIds, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update user rooms: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	updateUserPatients: async (userId, patientIds) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${USER_API_BASE_URL}/updatepatients/${userId}`, patientIds, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update user patients: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
