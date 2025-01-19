import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Import useAuthStore

const PATIENT_API_BASE_URL = `http://localhost:8080/api/patients`;

export const usePatientStore = create((set, get) => ({
	patients: [],
	loading: false,
	error: null,
	total: 0,
	setPatients: (patients) => set({ patients }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createPatient: async (patientData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user; // Get the token
			const response = await axios.post(PATIENT_API_BASE_URL, patientData, {
				headers: {
					Authorization: `Bearer ${user?.token}`, // Set the token in the header
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Patient created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create patient: ${error.message}`,
			});
			throw error;
		}
	},

	getPatientById: async (patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user; // Get the token
			const response = await axios.get(`${PATIENT_API_BASE_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`, // Set the token in the header
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });

			notification.error({
				message: "Error",
				description: `Failed to get patient: ${error.message}`,
			});
			throw error;
		}
	},

	getAllPatients: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user; // Get the token
			const response = await axios.get(PATIENT_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`, // Set the token in the header
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get patients: ${error.message}`,
			});
			throw error;
		}
	},

	updatePatient: async (patientId, patientData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user; // Get the token
			const response = await axios.put(`${PATIENT_API_BASE_URL}/${patientId}`, patientData, {
				headers: {
					Authorization: `Bearer ${user?.token}`, // Set the token in the header
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Patient updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update patient: ${error.message}`,
			});
			throw error;
		}
	},

	deletePatient: async (patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user; // Get the token
			await axios.delete(`${PATIENT_API_BASE_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`, // Set the token in the header
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Patient deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete patient: ${error.message}`,
			});
			throw error;
		}
	},
	// In patient.service.js

	searchPatients: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;

			const params = new URLSearchParams(searchParams).toString();

			const response = await axios.get(`${PATIENT_API_BASE_URL}/search?${params}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			if (response.status === 401) {
				//handle logout
				console.log("user needs to log out");
				return;
			}

			set({
				loading: false,
				patients: response.data.content,
				total: response.data.totalElements,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search patient: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchPatientByFullName: async (name) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user; // Get the token
			const response = await axios.get(`${PATIENT_API_BASE_URL}/search/name?name=${name}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`, // Set the token in the header
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search patient by name: ${error.message}`,
			});
			throw error;
		}
	},
}));
