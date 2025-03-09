import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service";
import { notification } from "antd";

const DOCUMENT_API_BASE_URL = `/api/documents`;
const DOCUMENT_TYPE_API_BASE_URL = `/api/documenttypes`;
const PATIENT_API_BASE_URL = `/api/patients`;
const USER_API_BASE_URL = `/api/users`;

export const useDocumentStore = create((set, get) => ({
	documents: [],
	loading: false,
	totalElements: 0,
	error: null,
	documentTypes: [],
	patients: [],
	users: [],
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),
	fetchPatients: async ({ searchTerm = "", page = 0, size = 10 }) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PATIENT_API_BASE_URL}`, {
				params: { searchTerm, page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				patients: response.data.content,
				loading: false,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch patients: ${error.message}`,
			});
			throw error;
		}
	},
	fetchUsers: async ({ searchTerm = "", page = 0, size = 10 }) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			// If you can't fetch users with a GET and a search term, you may need to change this
			const response = await axios.get(`${USER_API_BASE_URL}`, {
				params: { searchTerm, page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				users: response.data.content,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch users: ${error.message}`,
			});
			throw error;
		}
	},
	fetchDocumentTypes: async (page = 0, size = 10) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(DOCUMENT_TYPE_API_BASE_URL, {
				params: { page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				documentTypes: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch document types: ${error.message}`,
			});
			throw error;
		}
	},
	fetchDocuments: async (page = 0, size = 10, patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			let url = DOCUMENT_API_BASE_URL;
			if (patientId) {
				url = `${DOCUMENT_API_BASE_URL}/patient/${patientId}`;
			}
			const response = await axios.get(url, {
				params: { page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});

			set({
				documents: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch documents: ${error.message}`,
			});
			throw error;
		}
	},
	createDocument: async (documentData, file) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append(
				"documentDTO",
				new Blob([JSON.stringify(documentData)], {
					type: "application/json",
				})
			);
			if (file) {
				formData.append("file", file);
			}

			await axios.post(DOCUMENT_API_BASE_URL, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
				},
			});
			notification.success({
				message: "Success",
				description: `Document Created Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create document: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	updateDocument: async (id, documentData, file) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;

			const formData = new FormData();
			formData.append(
				"documentDTO",
				new Blob([JSON.stringify(documentData)], {
					type: "application/json",
				})
			);
			if (file) {
				formData.append("file", file);
			}

			await axios.put(`${DOCUMENT_API_BASE_URL}/${id}`, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
				},
			});
			notification.success({
				message: "Success",
				description: `Document Updated Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update document: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	deleteDocument: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${DOCUMENT_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Document Deleted Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete document: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
}));
