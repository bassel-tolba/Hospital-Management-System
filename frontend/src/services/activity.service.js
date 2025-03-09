import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const ACTIVITY_API_BASE_URL = `/api/activities`;

export const useActivityStore = create((set, get) => ({
	allActivities: [],
	userActivities: [],
	loading: false,
	error: null,
	currentActivity: null,

	setAllActivities: (allActivities) => set({ allActivities }),
	setUserActivities: (userActivities) => set({ userActivities }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),
	setCurrentActivity: (currentActivity) => set({ currentActivity }),

	// --- Activity Creation ---
	createActivity: async (activityData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(ACTIVITY_API_BASE_URL, activityData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Activity created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create activity: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	// --- Get Activities for User ---
	getAvailableActivitiesForUser: async (userId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${ACTIVITY_API_BASE_URL}/user/${userId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false, userActivities: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get activities for user: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	getActivityById: async (activityId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${ACTIVITY_API_BASE_URL}/${activityId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false, currentActivity: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get activity: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	// --- Update Activity State ---
	updateActivityState: async (activityId, state) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(
				`${ACTIVITY_API_BASE_URL}/${activityId}/state/${state}`,
				{},
				{
					headers: { Authorization: `Bearer ${user?.token}` },
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Activity state updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update activity state: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	// --- Get All Activities ---
	getAllActivities: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${ACTIVITY_API_BASE_URL}/all`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false, allActivities: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get all activities: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	// --- Delete Activity ---
	deleteActivity: async (activityId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${ACTIVITY_API_BASE_URL}/${activityId}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Activity deleted successfully.",
			});
		} catch (error) {
			set({ error: error.response?.data?.message || error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete activity: ${error.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
