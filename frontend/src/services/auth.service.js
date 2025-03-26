import axios from "axios";
import { create } from "zustand";

const API_URL = `http://localhost:8080/api/auth`;
const API_VOICE_URL = `http://localhost:8080/api/analyze-voice`;

export const useAuthStore = create((set, get) => ({
	user: JSON.parse(localStorage.getItem("user")) || null,
	status: "idle", //  'idle', 'loading', 'success', 'failed'
	error: null,

	hasAuthority: (permission) => {
		const user = get().user;
		if (!user || !user.authorities) {
			return false;
		}
		return user.authorities.some((auth) => auth === permission); //check entire value
	},

	setUser: (user) => {
		set({ user });
	},
	setStatus: (status) => {
		set({ status });
	},
	setError: (error) => {
		set({ error });
	},
	clearError: () => {
		set({ error: null });
	},

	analyzeAudio: async (audioBase64) => {
		// ... (your analyzeAudio function remains the same) ...
		try {
			const response = await axios.post(
				API_VOICE_URL,
				{
					audio: audioBase64,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			return response.data.analysis;
		} catch (error) {
			console.error("Error analyzing audio", error);
			return "undetermined";
		}
	},

	login: async (username, password) => {
		set({ status: "loading", error: null });
		try {
			const response = await axios.post(API_URL + "/login", {
				username,
				password,
			});

			if (response.data.token) {
				localStorage.setItem("user", JSON.stringify(response.data));
				set({ user: response.data, status: "success" }); // Set status to "success"
				return response.data;
			} else {
				// Handle the case where the login was successful, but no token was returned.
				set({ status: "success", user: response.data, error: null }); // Still success, but potentially incomplete data.
				console.warn("Login successful, but no token received.", response.data);
				return response.data; // Or perhaps throw new Error("No token received");
			}
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Login failed";
			set({ error: errorMessage, status: "failed" });
			// Don't re-throw; handled by setting status and error
			throw new Error(errorMessage); // so it can catch the error in login
		}
	},

	logout: () => {
		localStorage.removeItem("user");
		set({ user: null, status: "idle" }); // Reset status on logout
	},

	register: async (username, password, roleId, firstName, lastName, specialty, unitIds, profilePicture) => {
		set({ status: "loading", error: null });
		try {
			const formData = new FormData();
			formData.append(
				"user",
				new Blob(
					[
						JSON.stringify({
							username,
							password,
							roleId,
							firstName,
							lastName,
							specialty,
							unitIds,
						}),
					],
					{ type: "application/json" }
				)
			);

			if (profilePicture) {
				formData.append("profilePicture", profilePicture);
			}

			const response = await axios.post(API_URL + "/register", formData, {
				headers: {
					"Content-Type": "multipart/form-data", // Correct header!
				},
			});
			console.log("Registration success, user data:", response.data);
			set({ status: "success" }); // Set status to 'success'
			return response.data;
		} catch (error) {
			console.log("Registration error:", error);
			const errorMessage = error.response?.data?.message || error.message || "Registration failed";
			set({ error: errorMessage, status: "failed" });
			throw error;
		}
	},

	getCurrentUser: () => {
		return JSON.parse(localStorage.getItem("user"));
	},
}));
