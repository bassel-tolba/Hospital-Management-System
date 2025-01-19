import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service"; // Assuming you have an auth service
import { notification } from "antd";

const IMAGE_REPORT_API_BASE_URL = `http://localhost:8080/api/imagereports`;
const PATIENT_API_BASE_URL = `http://localhost:8080/api/patients`;
const USER_API_BASE_URL = `http://localhost:8080/api/users`;

export const useImageReportStore = create((set, get) => ({
	imageReports: [],
	loading: false,
	totalElements: 0,
	error: null,
	patients: [],
	users: [],
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
	fetchUsers: async (searchTerm = "") => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${USER_API_BASE_URL}`, {
				params: { searchTerm },
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
	fetchImageReports: async (page, size, patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			let url = IMAGE_REPORT_API_BASE_URL;
			if (patientId) {
				url = `${IMAGE_REPORT_API_BASE_URL}/patient/${patientId}`;
			}
			const response = await axios.get(url, {
				params: { page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});

			set({
				imageReports: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch image reports: ${error.message}`,
			});
			throw error;
		}
	},

	createImageReport: async (imageReportData, imageFiles) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const formData = new FormData();
			formData.append(
				"imageReportDTO",
				new Blob([JSON.stringify(imageReportData)], {
					type: "application/json",
				})
			);
			if (imageFiles) {
				imageFiles.forEach((file) => formData.append("imageFiles", file));
			}

			await axios.post(IMAGE_REPORT_API_BASE_URL, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
				},
			});
			notification.success({
				message: "Success",
				description: `Image Report Created Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create image report: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	updateImageReport: async (id, imageReportData, imageFiles) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;

			const formData = new FormData();
			//we remove the imageUrls property from imageReportData so it does not get added to the backend
			const { imageUrls, ...newImageReportData } = imageReportData;

			formData.append(
				"imageReportDTO",
				new Blob([JSON.stringify(newImageReportData)], {
					type: "application/json",
				})
			);
			if (imageFiles) {
				imageFiles.forEach((file) => formData.append("imageFiles", file));
			}

			await axios.put(`${IMAGE_REPORT_API_BASE_URL}/${id}`, formData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "multipart/form-data",
				},
			});
			notification.success({
				message: "Success",
				description: `Image Report Updated Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update image report: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	deleteImageReport: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${IMAGE_REPORT_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Image Report Deleted Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete image report: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
}));
