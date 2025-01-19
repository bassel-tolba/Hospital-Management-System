import axios from "axios";
import { create } from "zustand";

const API_URL = `http://localhost:8080/api/auth`;
const API_VOICE_URL = `http://localhost:8080/api/analyze-voice`; // Add new URL for voice analysis

// Zustand store setup
export const useAuthStore = create((set) => ({
	user: JSON.parse(localStorage.getItem("user")) || null,
	status: "idle",
	error: null,

	setUser: (user) => {
		console.log("Setting user:", user);
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
				console.log("Login success, user data:", response.data);
				localStorage.setItem("user", JSON.stringify(response.data));
				set({ user: response.data, status: "idle" });
				return response.data;
			}
			// If there's no token, but response is OK handle it (just in case)
			console.log("Login success, no token provided, user data:", response.data);
			set({ status: "idle" });
			return response.data;
		} catch (error) {
			console.log("Login error:", error);
			set({ error: error.message, status: "failed" });
			throw error; // Re-throw the error to be handled by the calling component
		}
	},
	logout: () => {
		localStorage.removeItem("user");
		set({ user: null });
	},
	register: async (username, password, role, firstName, lastName, specialty, unitIds) => {
		set({ status: "loading", error: null });
		try {
			const response = await axios.post(API_URL + "/register", {
				username,
				password,
				role,
				firstName,
				lastName,
				specialty,
				unitIds,
			});
			console.log("Registration success, user data:", response.data);
			set({ status: "idle" });
			return response.data; // Return the new user DTO
		} catch (error) {
			console.log("Registration error:", error);
			set({ error: error.message, status: "failed" });
			throw error; // Re-throw for error handling in components
		}
	},
	getCurrentUser: () => {
		return JSON.parse(localStorage.getItem("user"));
	},
}));
