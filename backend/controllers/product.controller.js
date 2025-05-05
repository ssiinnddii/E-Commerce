import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); // find all products
        res.json(products);
    } catch (error) {
        console.log("Error in getting all products", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
      let featuredProducts = await redis.get("featured_products");
      if(featuredProducts) {
          return res.json(JSON.parse(featuredProducts));
      }
      // if the products is not in redis, fetch from mongodb
      // .lean is gonna return a plain js object instead of a mongodb doc 
      // which is good for performance
      featuredProducts = await Product.find({ isFeatured: true }).lean();
      if(!featuredProducts) {
          return res.status(404).json({ message: "No featured products found" });
      }
      // store in redis for future quick access
      await redis.set("featured_products", JSON.stringify(featuredProducts));
      res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getting all products", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price,  image, category} = req.body;
        let cloudinaryResponse = null;
        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            })
        }
        const product = await Product.create({ 
            name, 
            description, 
            price, 
            category, 
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : ""
        });
        res.status(201).json(product);
    } catch (error) {
        console.log("Error in createProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Image deleted successfully");
            } catch (error) {
                console.log("Error in deleting image", error.message);
            }
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { 
                $sample: { size: 3 } 
            },
            {
                $project: {
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1
                }
            }
        ]);
        res.json(products);
    } catch (error) {
        console.log("Error in getting recommended products", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    try {
        const products = await Product.find({category});
        res.json(products); 
    } catch (error) {
       console.log("Error in getting products by category", error.message);
       res.status(500).json({ message: "Server error", error: error.message }); 
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const productId = req.params.id; // This was missing - getting productId from request params
        
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Toggle the featured status
        product.isFeatured = !product.isFeatured;
        
        // Save the updated product
        const updatedProduct = await product.save();
        
        // Update the Redis cache for featured products
        await updateFeaturedProductsCache();
        
        res.json({
            success: true,
            isFeatured: product.isFeatured,
            message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`
        });
    } catch (error) {
        console.log("Error in toggling featured product", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
async function updateFeaturedProductsCache() {
    try {
        // the lean() method returns a plain js object instead of a mongodb doc
        // which is good for performance
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in updating featured products cache", error.message);
    }
}