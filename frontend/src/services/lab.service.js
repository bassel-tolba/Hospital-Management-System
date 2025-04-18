// lab.service.js
import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service";
import { notification } from "antd";

const LAB_TEST_API_BASE_URL = `/api/lab-tests`;
const LAB_RESULT_API_BASE_URL = `/api/lab-results`;

export const useLabStore = create((set, get) => ({
	labTests: [],
	labResults: [],
	loading: false,
	totalElements: 0,
	error: null,

	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	clearError: () => set({ error: null }),

	fetchLabTests: async (searchTerm = "", testCode = "") => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(LAB_TEST_API_BASE_URL, {
				params: { testName: searchTerm, testCode: testCode },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				labTests: response.data,
				loading: false,
			});
			return response.data;
		} catch (error) {
			handleError(error, "Failed to fetch lab tests");
			throw error;
		}
	},

	createLabTest: async (labTestData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(LAB_TEST_API_BASE_URL, labTestData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Lab Test created successfully: ${response.data.testName}`,
			});
			return response.data;
		} catch (error) {
			handleError(error, "Failed to create lab test");
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	// Add updateLabTest function
	updateLabTest: async (id, labTestData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${LAB_TEST_API_BASE_URL}/${id}`, labTestData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Lab Test updated successfully: ${response.data.testName}`,
			});
			return response.data;
		} catch (error) {
			handleError(error, "Failed to update lab test");
			throw error; // Re-throw the error for the component to handle
		} finally {
			set({ loading: false });
		}
	},

	deleteLabTest: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${LAB_TEST_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: "Lab Test deleted successfully",
			});
			// No need to return anything from a delete operation
		} catch (error) {
			// Check for the specific error structure
			if (error.response && error.response.status === 400 && error.response.data.message) {
				handleError({ message: error.response.data.message }, "Failed to delete lab test");
			} else if (error.response && error.response.status === 404) {
				handleError({ message: error.response.data }, "Failed to delete lab test");
			} else {
				handleError(error, "Failed to delete lab test");
			}
			throw error; // IMPORTANT: Re-throw for component handling
		} finally {
			set({ loading: false });
		}
	},
	fetchLabResults: async (page, size, patientId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${LAB_RESULT_API_BASE_URL}/patient/${patientId}`, {
				params: { page, size },
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			set({
				labResults: response.data.content,
				totalElements: response.data.totalElements,
				loading: false,
			});
		} catch (error) {
			handleError(error, "Failed to fetch lab results");
			throw error;
		}
	},

	createLabResult: async (labResultData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(LAB_RESULT_API_BASE_URL, labResultData, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			notification.success({
				message: "Success",
				description: `Lab Result created successfully: ${response.data.id}`,
			});
			return response.data;
		} catch (error) {
			handleError(error, "Failed to create lab result");
			throw error;
		} finally {
			set({ loading: false });
		}
	},
	getLabResultById: async (id) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${LAB_RESULT_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user?.token}` },
			});
			return response.data;
		} catch (error) {
			handleError(error, "Failed to get lab result");
			throw error;
		} finally {
			set({ loading: false });
		}
	},
}));

const handleError = (error, message) => {
	notification.error({
		message: "Error",
		description: `${message}: ${error.message}`,
	});
};
