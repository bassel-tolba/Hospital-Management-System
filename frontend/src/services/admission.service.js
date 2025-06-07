// admission.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const ADMISSION_API_BASE_URL = `http://localhost:8080/api/admissions`;
const ADMISSION_TYPE_API_BASE_URL = `http://localhost:8080/api/admissionTypes`;

export const useAdmissionStore = create((set, get) => ({
	admissions: [],
	admissionTypes: [],
	loading: false,
	error: null,
	total: 0,
	setAdmissions: (admissions) => set({ admissions }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),
	setAdmissionTypes: (admissionTypes) => set({ admissionTypes }),

	fetchAllAdmissionTypes: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(ADMISSION_TYPE_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false, admissionTypes: response.data });
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get admission types: ${error?.response?.data?.message || error.message}`,
			});
		}
	},

	createAdmissionType: async (admissionTypeData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(ADMISSION_TYPE_API_BASE_URL, admissionTypeData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Admission type created successfully.",
			});
			get().fetchAllAdmissionTypes(); // Fetch updated types
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create admission type: ${error?.response?.data?.message || error.message}`,
			});
			throw error; // Re-throw the error so the calling component can handle it if needed.
		}
	},

	updateAdmissionType: async (admissionTypeId, admissionTypeData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${ADMISSION_TYPE_API_BASE_URL}/${admissionTypeId}`, admissionTypeData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Admission type updated successfully.",
			});
			get().fetchAllAdmissionTypes(); // Refresh the list
			return response.data; // Return the updated data
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update admission type: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteAdmissionType: async (admissionTypeId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${ADMISSION_TYPE_API_BASE_URL}/${admissionTypeId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Admission type deleted successfully.",
			});
			get().fetchAllAdmissionTypes(); // Refresh the list
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete admission type: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	createAdmission: async (admissionData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(ADMISSION_API_BASE_URL, admissionData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Admission created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create admission: ${error?.response?.data?.message || error.message}`,
			});
			throw error; // Re-throw for component-level handling
		}
	},

	getAdmissionById: async (admissionId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${ADMISSION_API_BASE_URL}/${admissionId}`, {
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
				description: `Failed to get admission: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllAdmissions: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(ADMISSION_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ admissions: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get admissions: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	fetchOpenAdmissions: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${ADMISSION_API_BASE_URL}/open`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ admissions: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get open admissions: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	updateAdmission: async (admissionId, admissionData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${ADMISSION_API_BASE_URL}/${admissionId}`, admissionData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Admission updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update admission: ${error?.response?.data?.message || error.message}`,
			});
			throw error; // Re-throw for component-level handling
		}
	},

	deleteAdmission: async (admissionId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${ADMISSION_API_BASE_URL}/${admissionId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Admission deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete admission: ${error?.response?.data?.message || error.message}`,
			});
			throw error; // Re-throw for component-level handling
		}
	},
	searchAdmissions: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const { patientId, bedId, page = 0, size = 10 } = searchParams;
			let url = `${ADMISSION_API_BASE_URL}?page=${page}&size=${size}`;

			if (patientId) {
				url += `&patientId=${patientId}`;
			}
			if (bedId) {
				url += `&bedId=${bedId}`;
			}
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				admissions: response.data,
				total: response.data.length,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search admissions: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
