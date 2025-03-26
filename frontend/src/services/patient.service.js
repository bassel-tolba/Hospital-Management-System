// services/patient.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

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

	createPatient: async (patientData, profilePicture) => {
		// ... (Existing createPatient code - No changes needed here)
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append(
				"patient",
				new Blob([JSON.stringify(patientData)], {
					type: "application/json",
				})
			);
			if (profilePicture) {
				formData.append("profilePicture", profilePicture);
			}

			const response = await axios.post(PATIENT_API_BASE_URL, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
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
		// ... (Existing getPatientById code - No changes needed here)
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PATIENT_API_BASE_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
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
		// ... (Existing getAllPatients code - No changes needed here)
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(PATIENT_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
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

	updatePatient: async (patientId, patientData, profilePicture, removedProfilePictureUrl) => {
		// ... (Existing updatePatient code - No changes needed here)
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append(
				"patient",
				new Blob([JSON.stringify(patientData)], {
					type: "application/json",
				})
			);
			if (profilePicture) {
				formData.append("profilePicture", profilePicture);
			}
			if (removedProfilePictureUrl) {
				formData.append(
					"removedProfilePictureUrls",
					new Blob([JSON.stringify([removedProfilePictureUrl])], {
						type: "application/json",
					})
				);
			}
			const response = await axios.put(`${PATIENT_API_BASE_URL}/${patientId}`, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
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
		// ... (Existing deletePatient code - No changes needed here)
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PATIENT_API_BASE_URL}/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
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

	searchPatients: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			let url;

			// Check if any filter parameters are present
			if (searchParams.unitId || searchParams.roomId || searchParams.bedId) {
				// Use the /filter endpoint
				url = `${PATIENT_API_BASE_URL}/filter?${new URLSearchParams(searchParams).toString()}`;
			} else {
				// Use the /search endpoint for text search
				url = `${PATIENT_API_BASE_URL}/search?${new URLSearchParams(searchParams).toString()}`;
			}

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

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
				description: `Failed to search patients: ${error.message}`,
			});
			throw error; // Re-throw the error so the component can handle it
		}
	},
	searchPatientByFullName: async (name) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PATIENT_API_BASE_URL}/search/name?name=${name}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
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
