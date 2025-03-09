import axios from "axios";
import { useAuthStore } from "./auth.service";

const USER_API_BASE_URL = `/api/users`;

const userApi = axios.create({
	baseURL: USER_API_BASE_URL,
});

userApi.interceptors.request.use(
	(config) => {
		const user = useAuthStore.getState().user;
		if (user?.token) {
			config.headers.Authorization = `Bearer ${user.token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default userApi;
