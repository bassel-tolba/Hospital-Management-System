import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service"; // Adjust path if needed
import { notification } from "antd";

const TYPE_API_URL = `http://localhost:8080/api/assessment-types`;

export const useAssessmentTypeStore = create((set, get) => ({
	// State
	types: [], // List of types (usually without content)
	loadingList: false,
	loadingDetail: false, // For fetching single type with content
	loadingSubmit: false, // For create/update/delete actions
	error: null,

	// Actions
	clearError: () => set({ error: null }),

	// Fetch list of types (name, displayName)
	fetchTypes: async () => {
		set({ loadingList: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			const response = await axios.get(TYPE_API_URL, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			set({ types: response.data || [], loadingList: false });
			console.log("Fetched assessment types list:", response.data);
			return response.data;
		} catch (error) {
			const errorMsg = `Failed to fetch assessment types: ${error.response?.data?.message || error.message}`;
			console.error(errorMsg, error);
			set({ error: errorMsg, loadingList: false, types: [] });
			notification.error({ message: "Error Loading Types", description: errorMsg });
			// Don't rethrow, let UI handle state
			return []; // Return empty array on error
		}
	},

	// Fetch a single type by ID (including content) - needed for editing
	fetchTypeById: async (id) => {
		set({ loadingDetail: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			const response = await axios.get(`${TYPE_API_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			set({ loadingDetail: false });
			console.log("Fetched assessment type detail:", response.data);
			return response.data; // Return the full DTO
		} catch (error) {
			const errorMsg = `Failed to fetch assessment type ${id}: ${error.response?.data?.message || error.message}`;
			console.error(errorMsg, error);
			set({ error: errorMsg, loadingDetail: false });
			notification.error({ message: `Error Loading Type ${id}`, description: errorMsg });
			return null; // Indicate failure
		}
	},

	// Create a new assessment type
	createType: async (typeData) => {
		set({ loadingSubmit: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			const response = await axios.post(TYPE_API_URL, typeData, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			set({ loadingSubmit: false });
			notification.success({ message: "Success", description: "Assessment type created successfully." });
			get().fetchTypes(); // Refresh the list after creating
			return response.data; // Return created object
		} catch (error) {
			const errorMsg = `Failed to create assessment type: ${error.response?.data?.message || error.message}`;
			console.error(errorMsg, error);
			set({ error: errorMsg, loadingSubmit: false });
			notification.error({ message: "Error Creating Type", description: errorMsg });
			throw error; // Re-throw so the form knows submission failed
		}
	},

	// Update an existing assessment type
	updateType: async (id, typeData) => {
		set({ loadingSubmit: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			const response = await axios.put(`${TYPE_API_URL}/${id}`, typeData, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			set({ loadingSubmit: false });
			notification.success({ message: "Success", description: "Assessment type updated successfully." });
			get().fetchTypes(); // Refresh the list after updating
			return response.data; // Return updated object
		} catch (error) {
			const errorMsg = `Failed to update assessment type ${id}: ${error.response?.data?.message || error.message}`;
			console.error(errorMsg, error);
			set({ error: errorMsg, loadingSubmit: false });
			notification.error({ message: `Error Updating Type ${id}`, description: errorMsg });
			throw error; // Re-throw so the form knows submission failed
		}
	},

	// Delete an assessment type
	deleteType: async (id) => {
		set({ loadingSubmit: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			await axios.delete(`${TYPE_API_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			set({ loadingSubmit: false });
			notification.success({ message: "Success", description: "Assessment type deleted successfully." });
			get().fetchTypes(); // Refresh the list after deleting
			return true; // Indicate success
		} catch (error) {
			const errorMsg = `Failed to delete assessment type ${id}: ${error.response?.data?.message || error.message}`;
			console.error(errorMsg, error);
			set({ error: errorMsg, loadingSubmit: false });
			notification.error({ message: `Error Deleting Type ${id}`, description: errorMsg });
			return false; // Indicate failure
		}
	},
}));
