import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
	products: [],
	loading: false,

	setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products", productData);
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
		} catch (error) {
			toast.error(error.response?.data?.error || "Failed to create product");
			set({ loading: false });
		}
	},
	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products");
			// Check the structure of the response and adapt accordingly
			const productsData = Array.isArray(response.data) ? response.data : response.data.products;
			console.log("API response:", response.data); // For debugging
			set({ products: productsData || [], loading: false });
		} catch (error) {
			console.error("Error fetching products:", error);
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);
			const productsData = Array.isArray(response.data) ? response.data : response.data.products;
			set({ products: productsData || [], loading: false });
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response?.data?.error || "Failed to fetch products");
		}
	},
	deleteProduct: async (productId) => {
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);
			set((state) => ({
				products: state.products.filter((product) => product._id !== productId),
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.error || "Failed to delete product");
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			console.log("Toggling featured for product ID:", productId); // Debug logging
			
			if (!productId) {
				throw new Error("Product ID is required");
			}
			
			// Updated endpoint to match your backend route
			const response = await axios.patch(`/products/${productId}/featured`);
			console.log("Toggle featured response:", response.data); // Debug logging
			
			// Update product in state based on response
			set((state) => ({
				products: state.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: !product.isFeatured } : product
				),
				loading: false,
			}));
			
			toast.success(response.data.message || "Product updated successfully");
		} catch (error) {
			console.error("Error toggling featured product:", error);
			set({ loading: false });
			toast.error(error.response?.data?.error || error.message || "Failed to update product");
		}
	},
	fetchFeaturedProducts: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");
			const productsData = Array.isArray(response.data) ? response.data : response.data.products;
			set({ products: productsData || [], loading: false });
		} catch (error) {
			console.error("Error fetching featured products:", error);
			set({ error: "Failed to fetch products", loading: false });
		}
	},
}))