import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const PROCEDURE_API_BASE_URL = `/api/procedures`;

export const useProcedureStore = create((set, get) => ({
	procedures: [],
	loading: false,
	error: null,
	total: 0,
	setProcedures: (procedures) => set({ procedures }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createProcedure: async (procedureData) => {
		console.log("createProcedure - Start", { procedureData });
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(PROCEDURE_API_BASE_URL, procedureData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			console.log("createProcedure - Success", { response });
			notification.success({
				message: "Success",
				description: "Procedure created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			console.error("createProcedure - Error", error);
			notification.error({
				message: "Error",
				description: `Failed to create procedure: ${error.message}`,
			});
			throw error;
		}
	},

	getProcedureById: async (procedureId) => {
		console.log("getProcedureById - Start", { procedureId });
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PROCEDURE_API_BASE_URL}/${procedureId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			console.log("getProcedureById - Success", { response });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			console.error("getProcedureById - Error", error);
			notification.error({
				message: "Error",
				description: `Failed to get procedure: ${error.message}`,
			});
			throw error;
		}
	},

	getAllProcedures: async () => {
		console.log("getAllProcedures - Start");
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(PROCEDURE_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			console.log("getAllProcedures - Success", { response });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			console.error("getAllProcedures - Error", error);
			notification.error({
				message: "Error",
				description: `Failed to get procedures: ${error.message}`,
			});
			throw error;
		}
	},

	updateProcedure: async (procedureId, procedureData) => {
		console.log("updateProcedure - Start", { procedureId, procedureData });
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${PROCEDURE_API_BASE_URL}/${procedureId}`, procedureData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			console.log("updateProcedure - Success", { response });
			notification.success({
				message: "Success",
				description: "Procedure updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			console.error("updateProcedure - Error", error);
			notification.error({
				message: "Error",
				description: `Failed to update procedure: ${error.message}`,
			});
			throw error;
		}
	},

	deleteProcedure: async (procedureId) => {
		console.log("deleteProcedure - Start", { procedureId });
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PROCEDURE_API_BASE_URL}/${procedureId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			console.log("deleteProcedure - Success");
			notification.success({
				message: "Success",
				description: "Procedure deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			console.error("deleteProcedure - Error", error);
			notification.error({
				message: "Error",
				description: `Failed to delete procedure: ${error.message}`,
			});
			throw error;
		}
	},

	searchProcedures: async (searchParams) => {
		console.log("searchProcedures - Start", { searchParams });
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const params = new URLSearchParams(searchParams).toString();
			const response = await axios.get(`${PROCEDURE_API_BASE_URL}/search?${params}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			if (response.status === 401) {
				// Handle logout if needed
				console.log("User needs to log out");
				return;
			}

			const { content, totalElements } = response.data;
			// Update state based on the paginated response
			set({
				loading: false,
				procedures: content,
				total: totalElements,
			});
			console.log("searchProcedures - Success", { content, totalElements });
		} catch (error) {
			set({ error: error.message, loading: false });
			console.error("searchProcedures - Error", error);
			notification.error({
				message: "Error",
				description: `Failed to search procedures: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
