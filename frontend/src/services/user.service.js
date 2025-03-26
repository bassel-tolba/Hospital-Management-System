// frontend/src/services/user.service.js
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to get current user";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},
	createUser: async (userData, profilePicture) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append(
				"user",
				new Blob([JSON.stringify(userData)], {
					type: "application/json",
				})
			);
			if (profilePicture) {
				formData.append("profilePicture", profilePicture);
			}

			const response = await axios.post(USER_API_BASE_URL, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User created successfully.",
			});
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to create user";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to get user";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to get users";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},
	getUsersByRole: async (roleId) => {
		// Changed parameter to roleId
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${USER_API_BASE_URL}/byrole/${roleId}`, {
				// Corrected endpoint
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false, users: response.data });
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to get users by role";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},

	updateUser: async (userId, userData, profilePicture, removedProfilePictureUrl) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append(
				"user",
				new Blob([JSON.stringify(userData)], {
					type: "application/json",
				})
			);
			if (profilePicture) {
				formData.append("profilePicture", profilePicture);
			}
			if (removedProfilePictureUrl) {
				formData.append("removedProfilePictureUrls", new Blob([JSON.stringify([removedProfilePictureUrl])], { type: "application/json" }));
			}
			const response = await axios.put(`${USER_API_BASE_URL}/${userId}`, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User updated successfully.",
			});
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to update user";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to delete user";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to search users";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},
	updateUserUnits: async (userId, unitIds) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(
				`${USER_API_BASE_URL}/updateunits/${userId}`,
				unitIds, // Send the array directly as the request body
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
						"Content-Type": "application/json", // Explicitly set content type
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "User updated successfully.",
			});
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Failed to update user units";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to update user rooms";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
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
			const errorMessage = error.response?.data?.message || error.message || "Failed to update user patients";
			set({ error: errorMessage, loading: false });
			notification.error({
				message: "Error",
				description: errorMessage,
			});
			throw error;
		}
	},
}));
