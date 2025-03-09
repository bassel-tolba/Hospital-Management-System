import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service"; // Assuming you have an auth service
import { notification } from "antd";

const IMAGE_REPORT_TYPE_API_BASE_URL = `/api/imagereporttypes`;

export const useImageReportTypeStore = create((set, get) => ({
	imageReportTypes: [],
	loading: false,
	totalElements: 0,
	error: null,
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	fetchImageReportTypes: async (page, size) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(IMAGE_REPORT_TYPE_API_BASE_URL, {
				params: { page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				imageReportTypes: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to fetch image report types: ${error.message}`,
			});
			throw error;
		}
	},

	createImageReportType: async (imageReportTypeData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.post(IMAGE_REPORT_TYPE_API_BASE_URL, imageReportTypeData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			notification.success({
				message: "Success",
				description: `Image Report Type Created Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create image report type: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	updateImageReportType: async (id, imageReportTypeData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;

			await axios.put(`${IMAGE_REPORT_TYPE_API_BASE_URL}/${id}`, imageReportTypeData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			notification.success({
				message: "Success",
				description: `Image Report Type Updated Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update image report type: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},

	deleteImageReportType: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${IMAGE_REPORT_TYPE_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Image Report Type Deleted Successfully`,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete image report type: ${error.message}`,
			});
			throw error;
		} finally {
			set({ loading: false });
		}
	},
}));
