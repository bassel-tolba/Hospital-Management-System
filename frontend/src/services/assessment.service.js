import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service";
import { notification } from "antd";

const ASSESSMENT_API_BASE_URL = `/api/assessments`;
const PATIENT_API_BASE_URL = `/api/patients`;

export const useAssessmentStore = create((set, get) => ({
	assessments: [],
	loading: false,
	totalElements: 0,
	error: null,
	patients: [],
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),
	fetchPatients: async (searchTerm = "") => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PATIENT_API_BASE_URL}`, {
				params: { searchTerm },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				patients: response.data.content,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch patients: ${error.message}`,
			});
			throw error;
		}
	},
	fetchAssessments: async (page, size, searchTerm = "", patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			let url = ASSESSMENT_API_BASE_URL;
			if (patientId) {
				url = `${ASSESSMENT_API_BASE_URL}/patient/${patientId}`;
			}
			const response = await axios.get(url, {
				params: { page, size, searchTerm },
				headers: { Authorization: `Bearer ${user?.token}` },
			});

			set({
				assessments: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch assessments: ${error.message}`,
			});
			throw error;
		}
	},
	createAssessment: async (assessmentData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.post(ASSESSMENT_API_BASE_URL, assessmentData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Assessment Created Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create assessment: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	updateAssessment: async (id, assessmentData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.put(`${ASSESSMENT_API_BASE_URL}/${id}`, assessmentData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Assessment updated Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update assessment: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	deleteAssessment: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${ASSESSMENT_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Assessment Deleted Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete assessment: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
}));
