import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const NURSE_ACTIVITY_API_BASE_URL = `/api/nurses`;

export const useNurseActivityStore = create((set, get) => ({
	activities: [],
	loading: false,
	error: null,
	setActivities: (activities) => set({ activities }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	recordActivity: async (nurseId, activityType, patientId, notes) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(
				`${NURSE_ACTIVITY_API_BASE_URL}/${nurseId}/activities`,
				{},
				{
					params: { activityType, patientId, notes },
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse activity recorded successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to record nurse activity: ${error.message}`,
			});
			throw error;
		}
	},

	getActivityById: async (activityId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_ACTIVITY_API_BASE_URL}/activities/${activityId}`, {
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
				description: `Failed to get nurse activity: ${error.message}`,
			});
			throw error;
		}
	},

	getAllActivities: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_ACTIVITY_API_BASE_URL}/activities`, {
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
				description: `Failed to get all nurse activities: ${error.message}`,
			});
			throw error;
		}
	},

	getAllActivitiesByNurse: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_ACTIVITY_API_BASE_URL}/${nurseId}/activities`, {
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
				description: `Failed to get nurse activities by nurse: ${error.message}`,
			});
			throw error;
		}
	},
	deleteActivity: async (activityId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${NURSE_ACTIVITY_API_BASE_URL}/activities/${activityId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse activity deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete nurse activity: ${error.message}`,
			});
			throw error;
		}
	},
}));
