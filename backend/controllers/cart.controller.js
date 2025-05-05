import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        // Make sure user exists and has cartItems property
        if (!req.user || !req.user.cartItems || !Array.isArray(req.user.cartItems)) {
            return res.json([]);
        }
        
        // Debug info
       // console.log("User cart items:", req.user.cartItems);
        
        // Filter out any invalid cart items
        const validCartItems = req.user.cartItems.filter(item => 
            item && item.product // Use product field from your schema
        );
        
        if (validCartItems.length === 0) {
            return res.json([]);
        }
        
        // Get product IDs from cart items
        const productIds = validCartItems.map(item => item.product);
        
        // Find products that match those IDs
        const products = await Product.find({ _id: { $in: productIds } });
        
        console.log("Found products:", products.length);
        
        // Map products to include quantity
        const cartItems = products.map(product => {
            // Find the corresponding cart item by product ID
            const cartItem = validCartItems.find(item => 
                item.product.toString() === product._id.toString()
            );
            
            // Include quantity if found, default to 1 if not
            const quantity = cartItem ? cartItem.quantity : 1;
            
            // Return product with quantity
            return {
                ...product.toJSON(),
                quantity
            };
        });
        
        res.json(cartItems);
    } catch (error) {
        console.log("Error in getting cart products", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        const user = req.user;
        
        // Initialize cartItems as an array if it doesn't exist
        if (!user.cartItems) {
            user.cartItems = [];
        }
        
        // Find if product exists in cart
        const existingItemIndex = user.cartItems.findIndex(item => 
            item && item.product && item.product.toString() === productId.toString()
        );
        
        if (existingItemIndex >= 0) {
            // Increment quantity if product already in cart
            user.cartItems[existingItemIndex].quantity = 
                (user.cartItems[existingItemIndex].quantity || 0) + 1;
        } else {
            // Add new item with quantity 1
            user.cartItems.push({ product: productId, quantity: 1 });
        }
        
        await user.save();
        
        // Return updated cart items with product details
        return getCartProducts(req, res);
    } catch (error) {
        console.log("Error in adding to cart", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        // Check if req.body exists before destructuring
        const productId = req.body ? req.body.productId : undefined;
        const user = req.user;
        
        if (!user.cartItems) {
            user.cartItems = [];
            await user.save();
            return res.json([]);
        }
        
        // Clear entire cart if no productId specified
        user.cartItems = [];
        await user.save();
        
        console.log("Cart cleared successfully");
        
        // Return updated cart items (which should be empty)
        return res.json([]);
    } catch (error) {
        console.log("Error in removing from cart", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId, quantity } = req.body;
        
        console.log("Update request:", { productId, quantity });
        
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        // Allow zero for removing products
        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ message: "Quantity must be a non-negative number" });
        }
        
        const user = req.user;
        
        if (!user.cartItems) {
            user.cartItems = [];
        }
        
        // Find the item in the cart
        const existingItemIndex = user.cartItems.findIndex(item => 
            item && item.product && item.product.toString() === productId.toString()
        );
        
        console.log("Existing item index:", existingItemIndex);
        
        if (existingItemIndex >= 0) {
            // Remove item if quantity is 0
            if (quantity === 0) {
                user.cartItems.splice(existingItemIndex, 1);
            } else {
                // Update quantity
                user.cartItems[existingItemIndex].quantity = quantity;
            }
            
            await user.save();
            
            // Return updated cart items with product details
            return getCartProducts(req, res);
        } else {
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.log("Error in updating quantity", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};