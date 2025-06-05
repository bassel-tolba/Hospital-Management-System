// services/auth.service.js
import axios from "axios";
import { create } from "zustand";

const API_URL = `/api/auth`;
const API_VOICE_URL = `/api/analyze-voice`;

export const useAuthStore = create((set, get) => ({
	user: null,
	token: null,
	status: "idle",
	error: null,

	hasAuthority: (permission) => {
		const user = get().user;
		if (!user || !user.authorities) {
			return false;
		}
		return user.authorities.some((auth) => auth === permission);
	},

	setUserAndToken: (userData, navigate) => {
		// Added navigate parameter here
		if (userData && userData.token) {
			localStorage.setItem("user", JSON.stringify(userData));
			axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
			set({ user: userData, token: userData.token, status: "success", error: null });
			if (navigate) {
				// Check if navigate function is provided
				navigate("/profile"); // Redirect to profile page
			}
		} else {
			console.warn("setUserAndToken called with invalid data or missing token.", userData);
			get().logout(false, navigate); // Pass navigate to logout too, in case it needs to redirect
		}
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

	login: async (username, password, navigate) => {
		// Added navigate parameter here
		set({ status: "loading", error: null });
		try {
			const response = await axios.post(API_URL + "/login", {
				username,
				password,
			});

			if (response.data && response.data.token) {
				get().setUserAndToken(response.data, navigate); // Pass navigate to setUserAndToken
				return response.data;
			} else {
				const errorMessage = "Login successful, but no token received.";
				console.warn(errorMessage, response.data);
				set({ error: errorMessage, status: "failed", user: null, token: null });
				throw new Error(errorMessage);
			}
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Login failed";
			set({ error: errorMessage, status: "failed", user: null, token: null });
			axios.defaults.headers.common["Authorization"] = null;
			throw new Error(errorMessage);
		}
	},

	logout: (isFromInterceptor = false, navigate = null) => {
		// Added navigate parameter
		const wasUserLoggedIn = !!get().user;
		localStorage.removeItem("user");
		axios.defaults.headers.common["Authorization"] = null;
		set({ user: null, token: null, status: "idle", error: null });

		const currentPath = window.location.pathname;

		if ((wasUserLoggedIn || isFromInterceptor) && currentPath !== "/login") {
			if (navigate) {
				// Prefer react-router navigation if available
				navigate("/login", { replace: true });
			} else {
				window.location.href = "/login"; // Fallback to force reload
			}
		}
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
					"Content-Type": "multipart/form-data",
				},
			});
			set({ status: "success" });
			return response.data;
		} catch (error) {
			console.log("Registration error:", error);
			const errorMessage = error.response?.data?.message || error.message || "Registration failed";
			set({ error: errorMessage, status: "failed" });
			throw error;
		}
	},

	getCurrentUser: () => {
		return get().user;
	},

	initializeAuth: () => {
		const storedUser = localStorage.getItem("user");
		let userToSet = null;
		let tokenToSet = null;
		let statusToSet = "idle";

		if (storedUser) {
			try {
				const userData = JSON.parse(storedUser);
				if (userData && userData.token) {
					userToSet = userData;
					tokenToSet = userData.token;
					axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
					statusToSet = "success";
				} else {
					localStorage.removeItem("user");
					axios.defaults.headers.common["Authorization"] = null;
				}
			} catch (e) {
				console.error("Error parsing stored user data during init:", e);
				localStorage.removeItem("user");
				axios.defaults.headers.common["Authorization"] = null;
			}
		} else {
			axios.defaults.headers.common["Authorization"] = null;
		}
		set({ user: userToSet, token: tokenToSet, status: statusToSet, error: null });
	},
}));

// --- Axios Interceptors Setup ---
axios.interceptors.request.use(
	(config) => {
		const token = useAuthStore.getState().token;
		if (token && !(config.url.includes(`${API_URL}/login`) || config.url.includes(`${API_URL}/register`))) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const originalRequest = error.config;
		const { user, logout } = useAuthStore.getState();

		if (
			error.response &&
			(error.response.status === 401 || error.response.status === 403) &&
			!(originalRequest.url.includes(`${API_URL}/login`) || originalRequest.url.includes(`${API_URL}/register`))
		) {
			console.warn(`Authentication error (${error.response.status}) on ${originalRequest.url}. Logging out.`);
			if (user || axios.defaults.headers.common["Authorization"]) {
				logout(true); // Pass true to indicate it's from interceptor
			}
		}
		return Promise.reject(error);
	}
);

useAuthStore.getState().initializeAuth();
