// src/services/product.service.js
import axios from "axios";
import { create } from "zustand";
import { notification } from "antd";
import { useAuthStore } from "./auth.service";

const PRODUCT_API_BASE_URL = `http://localhost:8080/api/products`;

export const useProductStore = create((set, get) => ({
	products: [],
	loading: false,
	error: null,
	total: 0,
	setProducts: (products) => set({ products }),
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setTotal: (total) => set({ total }),
	clearError: () => set({ error: null }),

	createProduct: async (productData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.post(PRODUCT_API_BASE_URL, productData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Product created successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to create product: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	updateProduct: async (productId, productData) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.put(`${PRODUCT_API_BASE_URL}/${productId}`, productData, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Product updated successfully.",
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to update product: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	getProductById: async (productId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(`${PRODUCT_API_BASE_URL}/${productId}`, {
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
				description: `Failed to get product: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	fetchAllProducts: async () => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const response = await axios.get(PRODUCT_API_BASE_URL, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			set({ products: response.data });
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to get products: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},

	deleteProduct: async (productId) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			await axios.delete(`${PRODUCT_API_BASE_URL}/${productId}`, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({ loading: false });
			notification.success({
				message: "Success",
				description: "Product deleted successfully.",
			});
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to delete product: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
	searchProducts: async (searchParams) => {
		set({ loading: true, error: null });
		try {
			const user = useAuthStore.getState().user;
			const { searchTerm, page = 0, size = 10 } = searchParams;
			let url = `${PRODUCT_API_BASE_URL}/search?page=${page}&size=${size}`;
			if (searchTerm) {
				url += `&searchTerm=${searchTerm}`;
			}
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			});
			set({
				loading: false,
				products: response.data.content, // Access content array from the backend response
				total: response.data.totalElements,
			});
			return response.data;
		} catch (error) {
			set({ error: error.message, loading: false });
			notification.error({
				message: "Error",
				description: `Failed to search products: ${error?.response?.data?.message || error.message}`,
			});
			throw error;
		}
	},
}));
