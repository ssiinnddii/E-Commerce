import Product from "../models/product.model.js";
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); // find all products
        res.json(products);
    } catch (error) {
        console.log("Error in getting all products", error.message);
    }
}