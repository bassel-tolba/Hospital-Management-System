import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service"; // Import useAuthStore

const ROOM_API_BASE_URL = ` /api/rooms`;

export const useRoomStore = create((set, get) => ({
	rooms: [],
	loading: false,
	error: null,
	total: 0,
	setRooms: (rooms) => set({ rooms }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createRoom: async (roomData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(ROOM_API_BASE_URL, roomData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Room created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create room: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getRoomById: async (roomId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${ROOM_API_BASE_URL}/${roomId}`, {
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
				description: `Failed to get room: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllRooms: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(ROOM_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ rooms: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get rooms: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	updateRoom: async (roomId, roomData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${ROOM_API_BASE_URL}/${roomId}`, roomData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Room updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update room: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteRoom: async (roomId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${ROOM_API_BASE_URL}/${roomId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Room deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete room: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchRooms: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const { searchTerm, unitId, page = 0, size = 10 } = searchParams;
			let url = `${ROOM_API_BASE_URL}?page=${page}&size=${size}`;

			if (searchTerm) {
				url += `&searchTerm=${searchTerm}`;
			}

			if (unitId) {
				url += `&unitId=${unitId}`;
			}

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});

			set({
				loading: false,
				rooms: response.data,
				total: response.data.totalElements, // Use totalElements from the response
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search rooms: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
