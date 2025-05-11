import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

//routes
import authRoutes from "./routes/auth.route.js";  
import productRoutes from "./routes/product.route.js"; 
import { connectDB } from "./lib/db.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({limit: "150mb"})); // allows you to parse the body of the request
app.use(cookieParser());
// Use the auth routes  
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if(process.env.NODE_ENV === "production") {
    // Fix the path: Go up one directory from __dirname (which is backend) to reach root, then into frontend/dist
    const rootDir = path.resolve(__dirname, "..");
    app.use(express.static(path.join(rootDir, "frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(rootDir, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    connectDB();
});