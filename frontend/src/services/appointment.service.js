// frontend/src/services/appointment.service.js (Add endAppointment)
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const APPOINTMENT_API_BASE_URL = `/api/appointments`;

export const useAppointmentStore = create((set, get) => ({
	appointments: [],
	userAppointments: [], // New state for user-specific appointments
	loading: false,
	error: null,
	total: 0,
	page: 0,
	size: 10,

	setAppointments: (appointments) => set({ appointments }),
	setUserAppointments: (userAppointments) => set({ userAppointments }), // Setter for userAppointments
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	setPage: (page) => set({ page }),
	setSize: (size) => set({ size }),
	clearError: () => set({ error: null }),

	createAppointment: async (appointmentData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(APPOINTMENT_API_BASE_URL, appointmentData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Appointment created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create appointment: ${error?.response?.data?.message || error.message}`,
			});
			throw error; // Re-throw to allow component to handle
		}
	},

	getAllAppointments: async (page = get().page, size = get().size) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${APPOINTMENT_API_BASE_URL}?page=${page}&size=${size}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				appointments: response.data.content,
				total: response.data.totalElements,
				page: response.data.number,
				size: response.data.size,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get appointments: ${error.message}`,
			});
			throw error;
		}
	},
	getAppointmentsByPatientId: async (patientId, page, size) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/patient/${patientId}?page=${page}&size=${size}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				appointments: response.data.content,
				total: response.data.totalElements,
				page: response.data.number,
				size: response.data.size,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get appointments: ${error.message}`,
			});
			throw error; // Re-throw for component handling
		}
	},
	getAppointmentsByPatientIdAndNotDeleted: async (patientId, page, size) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/patient/not-deleted/${patientId}?page=${page}&size=${size}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				appointments: response.data.content,
				total: response.data.totalElements,
				page: response.data.number,
				size: response.data.size,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get appointments: ${error.message}`,
			});
			throw error; // Re-throw for component handling
		}
	},

	getAppointmentsByUserId: async (userId, page, size) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/user/${userId}?page=${page}&size=${size}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				appointments: response.data.content,
				total: response.data.totalElements,
				page: response.data.number,
				size: response.data.size,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get appointments: ${error.message}`,
			});
			throw error;
		}
	},

	getAppointmentsByPatientIdAndUserId: async (patientId, userId, page, size) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/patient/${patientId}/user/${userId}?page=${page}&size=${size}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				appointments: response.data.content,
				total: response.data.totalElements,
				page: response.data.number,
				size: response.data.size,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get appointments: ${error.message}`,
			});
			throw error;
		}
	},

	searchAppointments: async (searchTerm, page, size) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/search?searchTerm=${searchTerm}&page=${page}&size=${size}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				appointments: response.data.content,
				total: response.data.totalElements,
				page: response.data.number,
				size: response.data.size,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search appointments: ${error.message}`,
			});
			throw error;
		}
	},
	getAppointmentById: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${APPOINTMENT_API_BASE_URL}/${id}`, {
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
				description: `Failed to get appointment: ${error.message}`,
			});
			throw error; // Re-throw for component handling
		}
	},
	// --- New Function: Get Appointments for Current User ---
	getUserAppointments: async (userId, page = 0, size = 10) => {
		// Added pagination
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(
				`${APPOINTMENT_API_BASE_URL}/user/${userId}?page=${page}&size=${size}`, // Use correct endpoint
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);
			set({
				loading: false,
				userAppointments: response.data.content, // Use the new state
				total: response.data.totalElements, // Update total if needed for pagination
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get user appointments: ${error.message}`,
			});
			throw error;
		}
	},

	endAppointment: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.patch(
				`${APPOINTMENT_API_BASE_URL}/${id}/end`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user?.token}`,
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Appointment ended successfully.",
			});
			return response.data; // Return updated appointment
		} catch (error) {
			set({ error: error.message, loading: false });
			const errorMessage = error.response?.data?.message || error.message;
			notification.error({
				message: "Error",
				description: `Failed to end appointment: ${errorMessage}`,
			});
			throw error; // Re-throw for component handling
		}
	},

	deleteAppointment: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${APPOINTMENT_API_BASE_URL}/${id}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Appointment deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete appointment: ${error.message}`,
			});
			throw error;
		}
	},
}));
