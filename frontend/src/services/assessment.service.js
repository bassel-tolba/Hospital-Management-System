import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./auth.service"; // Adjust path if needed
import { notification } from "antd";

const ASSESSMENT_API_BASE_URL = `http://localhost:8080/api/assessments`;
// PATIENT_API_BASE_URL might be needed if fetching patient details separately
// const PATIENT_API_BASE_URL = `http://localhost:8080/api/patients`;
const TYPE_API_URL = `http://localhost:8080/api/assessment-types`;

// Define the store creator function
const assessmentStoreCreator = (set, get) => ({
	// State for assessments list
	assessments: [],
	loadingAssessments: false,
	assessmentPagination: {
		current: 1,
		pageSize: 10,
		total: 0,
	},
	assessmentError: null,

	// State for assessment types
	assessmentTypes: [],
	loadingTypes: false,
	typeError: null,

	// State for single assessment type content (optional, if needed globally)
	selectedTypeContent: null,
	loadingTypeContent: false,
	typeContentError: null,

	// Actions
	setLoadingAssessments: (loading) => set({ loadingAssessments: loading }),
	setLoadingTypes: (loading) => set({ loadingTypes: loading }),
	setLoadingTypeContent: (loading) => set({ loadingTypeContent: loading }),
	clearErrors: () => set({ assessmentError: null, typeError: null, typeContentError: null }),

	// Fetch Paginated Assessments for a specific patient
	fetchAssessments: async (patientId, page, size) => {
		if (!patientId) {
			console.warn("fetchAssessments called without patientId");
			set({ assessments: [], assessmentPagination: { current: 1, pageSize: size, total: 0 }, loadingAssessments: false });
			return;
		}
		set({ loadingAssessments: true, assessmentError: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			const response = await axios.get(`${ASSESSMENT_API_BASE_URL}/patient/${patientId}`, {
				params: { page, size },
				headers: { Authorization: `Bearer ${user.token}` },
			});

			const { content, totalElements, number, pageSize } = response.data;
			set({
				assessments: content || [],
				assessmentPagination: {
					current: number + 1, // API is 0-based
					pageSize: pageSize,
					total: totalElements || 0,
				},
				loadingAssessments: false,
			});
			console.log(`Fetched ${content?.length || 0} assessments for patient ${patientId}`);
		} catch (error) {
			const errorMsg = `Failed to fetch assessments: ${error.response?.data?.message || error.message}`;
			set({
				assessmentError: errorMsg,
				loadingAssessments: false,
				assessments: [],
				assessmentPagination: { current: 1, pageSize: size, total: 0 },
			});
			notification.error({ message: "Error Fetching Assessments", description: errorMsg });
			// Do not re-throw here, let UI handle the error state
		}
	},

	// Fetch Assessment Types (list view - names & display names)
	fetchAssessmentTypes: async () => {
		set({ loadingTypes: true, typeError: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			const response = await axios.get(TYPE_API_URL, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			set({
				assessmentTypes: response.data || [],
				loadingTypes: false,
			});
			console.log(`Fetched ${response.data?.length || 0} assessment types`);
			return response.data;
		} catch (error) {
			const errorMsg = `Failed to fetch assessment types: ${error.response?.data?.message || error.message}`;
			set({ typeError: errorMsg, loadingTypes: false, assessmentTypes: [] });
			notification.error({ message: "Error Loading Templates", description: errorMsg });
			// Do not re-throw
		}
	},

	// Fetch specific assessment type content by name
	fetchAssessmentTypeContentByName: async (name) => {
		if (!name) {
			set({ selectedTypeContent: null, typeContentError: null, loadingTypeContent: false });
			return null;
		}
		set({ loadingTypeContent: true, typeContentError: null, selectedTypeContent: null });
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			const response = await axios.get(`${TYPE_API_URL}/by-name/${name}`, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			const content = response.data?.templateContent;
			set({
				selectedTypeContent: content,
				loadingTypeContent: false,
			});
			console.log(`Fetched content for assessment type: ${name}`);
			return content;
		} catch (error) {
			const errorMsg = `Failed to fetch content for type ${name}: ${error.response?.data?.message || error.message}`;
			set({ typeContentError: errorMsg, loadingTypeContent: false, selectedTypeContent: null });
			notification.error({ message: "Error Loading Template Content", description: errorMsg });
			// Do not re-throw
			return null; // Indicate failure
		}
	},

	// Create Assessment (moved loading indicator here)
	createAssessment: async (assessmentData) => {
		set({ loadingAssessments: true, assessmentError: null }); // Indicate loading
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");
			const response = await axios.post(ASSESSMENT_API_BASE_URL, assessmentData, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			notification.success({ message: "Success", description: "Assessment Created Successfully" });
			// Optionally: Manually add to assessments state or refetch page
			// get().fetchAssessments(assessmentData.patientId, 0, get().assessmentPagination.pageSize); // Refetch first page
			return response.data; // Return created DTO
		} catch (error) {
			const errorMsg = `Failed to create assessment: ${error.response?.data?.message || error.message}`;
			set({ assessmentError: errorMsg });
			notification.error({ message: "Error Creating Assessment", description: errorMsg });
			throw error; // Re-throw for form handling
		} finally {
			set({ loadingAssessments: false }); // Stop loading indicator
		}
	},

	// Update Assessment (moved loading indicator here)
	updateAssessment: async (id, assessmentData) => {
		set({ loadingAssessments: true, assessmentError: null }); // Indicate loading
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");
			const response = await axios.put(`${ASSESSMENT_API_BASE_URL}/${id}`, assessmentData, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			notification.success({ message: "Success", description: "Assessment Updated Successfully" });
			// Optionally: Manually update in assessments state or refetch current page
			// get().fetchAssessments(assessmentData.patientId, get().assessmentPagination.current - 1, get().assessmentPagination.pageSize);
			return response.data; // Return updated DTO
		} catch (error) {
			const errorMsg = `Failed to update assessment: ${error.response?.data?.message || error.message}`;
			set({ assessmentError: errorMsg });
			notification.error({ message: "Error Updating Assessment", description: errorMsg });
			throw error; // Re-throw for form handling
		} finally {
			set({ loadingAssessments: false }); // Stop loading indicator
		}
	},

	// Delete Assessment
	deleteAssessment: async (id, patientId) => {
		set({ loadingAssessments: true, assessmentError: null }); // Indicate loading
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");
			await axios.delete(`${ASSESSMENT_API_BASE_URL}/${id}`, {
				headers: { Authorization: `Bearer ${user.token}` },
			});
			notification.success({ message: "Success", description: "Assessment Deleted Successfully" });
			// Refetch the current or previous page after deletion
			const currentPage = get().assessmentPagination.current;
			const pageSize = get().assessmentPagination.pageSize;
			const total = get().assessmentPagination.total;
			const assessmentsOnCurrentPage = get().assessments.length;
			const pageToFetch = assessmentsOnCurrentPage === 1 && currentPage > 1 ? currentPage - 2 : currentPage - 1;
			get().fetchAssessments(patientId, Math.max(0, pageToFetch), pageSize);
		} catch (error) {
			const errorMsg = `Failed to delete assessment: ${error.response?.data?.message || error.message}`;
			set({ assessmentError: errorMsg });
			notification.error({ message: "Error Deleting Assessment", description: errorMsg });
			throw error; // Re-throw for potential UI handling
		} finally {
			set({ loadingAssessments: false }); // Stop loading indicator
		}
	},

	// AI Transcription (moved loading indicator here) - This only triggers the process
	transcribeAndPopulate: async (formData) => {
		set({ loadingAssessments: true, assessmentError: null }); // Use general loading/error or specific ones
		try {
			const user = useAuthStore.getState().user;
			if (!user?.token) throw new Error("User not authenticated.");

			// Log FormData contents (for debugging, be careful with sensitive data)
			// for (let [key, value] of formData.entries()) {
			//     console.log(`FormData AI: ${key}: ${value instanceof Blob ? `Blob size ${value.size}` : value}`);
			// }

			const response = await axios.post(`${ASSESSMENT_API_BASE_URL}/ai/transcribe-and-populate`, formData, {
				headers: {
					Authorization: `Bearer ${user.token}`,
					// Content-Type is set automatically
				},
				timeout: 120000, // 2 minute timeout
			});
			notification.success({ message: "Transcription Success", description: "Assessment notes populated." });
			return response.data; // Return { updatedHtml: "..." }
		} catch (error) {
			const errorMsg = `Transcription failed: ${error.response?.data?.message || error.message}`;
			set({ assessmentError: errorMsg });
			notification.error({ message: "Transcription Error", description: errorMsg });
			throw error; // Re-throw for form handling
		} finally {
			set({ loadingAssessments: false });
		}
	},
});

// Create the Zustand store
export const useAssessmentStore = create(assessmentStoreCreator);
