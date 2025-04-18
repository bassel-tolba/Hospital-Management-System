import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service"; // Corrected import
import { notification } from "antd";

const DOCUMENT_TYPE_API_BASE_URL = `/api/documenttypes`;

export const useDocumentTypeStore = create((set, get) => ({
	// Added get
	documentTypes: [],
	loading: false,
	totalElements: 0,
	error: null,
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	fetchDocumentTypes: async (page, size) => {
		set({ loading: true, error: null });
		try {
			// Use get() to access the current state.
			const token = useAuthStore.getState().user?.token; // Get the token

			const response = await axios.get(DOCUMENT_TYPE_API_BASE_URL, {
				params: { page, size },
				headers: { Authorization: `Bearer ${token}` }, // Use the token here
			});
			set({
				documentTypes: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
			return response;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch document types: ${error.message}`,
			});
			throw error;
		}
	},
	createDocumentType: async (documentTypeData) => {
		set({ loading: true, error: null });
		try {
			// Use get() to access user
			const token = useAuthStore.getState().user?.token;
			await axios.post(DOCUMENT_TYPE_API_BASE_URL, documentTypeData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			notification.success({
				message: "Success",
				description: `Document Type Created Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create document type: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	updateDocumentType: async (id, documentTypeData) => {
		set({ loading: true, error: null });
		try {
			const token = useAuthStore.getState().user?.token;
			await axios.put(`${DOCUMENT_TYPE_API_BASE_URL}/${id}`, documentTypeData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			notification.success({
				message: "Success",
				description: `Document Type Updated Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update document type: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	deleteDocumentType: async (id) => {
		set({ loading: true, error: null });
		try {
			const token = useAuthStore.getState().user?.token;
			await axios.delete(`${DOCUMENT_TYPE_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			notification.success({
				message: "Success",
				description: `Document Type Deleted Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete document type: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
}));
