import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupons");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	
	applyCoupon: async (code) => {
		try {
			const response = await axios.post("/coupons/validate", { code });
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
		try {
			const res = await axios.get("/cart");
			console.log("Cart items received:", res.data);
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			console.error("Error getting cart items:", error);
			set({ cart: [] });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	
	clearCart: async () => {
		try {
			// This endpoint is used to clear the entire cart after purchase
			await axios.delete("/cart"); // Call backend to clear cart
			set({ cart: [], coupon: null, total: 0, subtotal: 0, isCouponApplied: false });
			toast.success("Cart cleared");
		} catch (error) {
			console.error("Error clearing cart:", error);
			toast.error(error.response?.data?.message || "Failed to clear cart");
		}
	},
	
	addToCart: async (product) => {
		try {
			const response = await axios.post("/cart", { productId: product._id });
			toast.success("Product added to cart");
			
			// Update the whole cart with the response from the server
			set({ cart: response.data });
			get().calculateTotals();
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	
	removeFromCart: async (productId) => {
		try {
			// First, update the quantity to 0 which should trigger removal
			const response = await axios.put("/cart", { 
				id: productId,
				quantity: 0
			});
			
			toast.success("Product removed from cart");
			
			// Update the whole cart with the response from the server
			set({ cart: response.data });
			get().calculateTotals();
		} catch (error) {
			console.error("Error removing from cart:", error);
			toast.error(error.response?.data?.message || "Failed to remove product");
		}
	},
	
	updateQuantity: async (productId, quantity) => {
		try {
			console.log(`Updating product ${productId} to quantity ${quantity}`);
			
			if (quantity <= 0) {
				// If quantity is 0 or negative, remove item from cart
				return get().removeFromCart(productId);
			}

			// Make sure we're sending exactly what the backend expects
			const response = await axios.put("/cart", { 
				id: productId,  // The id field expected by backend
				quantity: quantity  // The quantity value
			});
			
			console.log("Update response:", response.data);
			
			// Update the whole cart with the response from the server
			set({ cart: response.data });
			get().calculateTotals();
			toast.success("Quantity updated");
		} catch (error) {
			console.error("Error updating quantity:", error);
			// Show more detailed error info
			if (error.response) {
				console.log("Error response data:", error.response.data);
				toast.error(error.response.data.message || "Failed to update quantity");
			} else {
				toast.error("Failed to update quantity");
			}
		}
	},
	
	calculateTotals: () => {
		const { cart, coupon } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		let total = subtotal;

		if (coupon) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	},
}))