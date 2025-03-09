import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const NURSE_API_BASE_URL = `/api/nurses`;

export const useNurseStore = create((set, get) => ({
	nurses: [],
	loading: false,
	error: null,
	setNurses: (nurses) => set({ nurses }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	createNurse: async (nurseData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(NURSE_API_BASE_URL, nurseData, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create nurse: ${error.message}`,
			});
			throw error;
		}
	},

	getNurseWithDetails: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const nurse = await get().getNurseById(nurseId);
			const assignedPatients = await get().getAssignedPatients(nurseId);
			const assignedUnits = await get().getAssignedUnits(nurseId);
			const assignedRooms = await get().getAssignedRooms(nurseId);

			set({ loading: false });
			return { nurse, assignedPatients, assignedUnits, assignedRooms };
		} catch (error) {
			set({ error: error.message, loading: false });
			throw error;
		}
	},
	getNurseByUserId: async (userId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/user/${userId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get nurse by user id: ${error.message}`,
			});
			throw error;
		}
	},

	getNurseById: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/${nurseId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get nurse: ${error.message}`,
			});
			throw error;
		}
	},

	getAllNurses: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(NURSE_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({
				nurses: response.data.content,
				loading: false,
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get nurses: ${error.message}`,
			});
			throw error;
		}
	},

	updateNurse: async (nurseId, nurseData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${NURSE_API_BASE_URL}/${nurseId}`, nurseData, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update nurse: ${error.message}`,
			});
			throw error;
		}
	},

	deleteNurse: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${NURSE_API_BASE_URL}/${nurseId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete nurse: ${error.message}`,
			});
			throw error;
		}
	},
	assignNurseToPatient: async (nurseId, patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.post(
				`${NURSE_API_BASE_URL}/${nurseId}/patients/${patientId}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse assigned to patient successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to assign nurse to patient: ${error.message}`,
			});
			throw error;
		}
	},
	removeNurseFromPatient: async (nurseId, patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${NURSE_API_BASE_URL}/${nurseId}/patients/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse removed from patient successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to remove nurse from patient: ${error.message}`,
			});
			throw error;
		}
	},
	assignNurseToUnit: async (nurseId, unitId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.post(
				`${NURSE_API_BASE_URL}/${nurseId}/units/${unitId}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse assigned to unit successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to assign nurse to unit: ${error.message}`,
			});
			throw error;
		}
	},
	removeNurseFromUnit: async (nurseId, unitId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${NURSE_API_BASE_URL}/${nurseId}/units/${unitId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse removed from unit successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to remove nurse from unit: ${error.message}`,
			});
			throw error;
		}
	},
	assignNurseToRoom: async (nurseId, roomId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.post(
				`${NURSE_API_BASE_URL}/${nurseId}/rooms/${roomId}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			);
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse assigned to room successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to assign nurse to room: ${error.message}`,
			});
			throw error;
		}
	},
	removeNurseFromRoom: async (nurseId, roomId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${NURSE_API_BASE_URL}/${nurseId}/rooms/${roomId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Nurse removed from room successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to remove nurse from room: ${error.message}`,
			});
			throw error;
		}
	},
	getAssignedPatients: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/${nurseId}/patients`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get assigned patients: ${error.message}`,
			});
			throw error;
		}
	},
	getPatientSchedules: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/${nurseId}/schedules`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get patient schedules: ${error.message}`,
			});
			throw error;
		}
	},
	getPatientDetails: async (nurseId, patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/${nurseId}/patients/${patientId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get patient details: ${error.message}`,
			});
			throw error;
		}
	},
	// New methods to fetch rooms and units associated with a nurse
	getAssignedUnits: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/${nurseId}/units`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get assigned units: ${error.message}`,
			});
			throw error;
		}
	},
	getAssignedRooms: async (nurseId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/${nurseId}/rooms`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get assigned rooms: ${error.message}`,
			});
			throw error;
		}
	},
	getPatientsByUnit: async (nurseId, unitId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${NURSE_API_BASE_URL}/${nurseId}/units/${unitId}/patients`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			});
			set({ loading: false });
			return response.data;
		} catch (e) {
			set({ error: e.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get patients by unit: ${e.message}`,
			});
			throw e;
		}
	},
}));
