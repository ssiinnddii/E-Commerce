import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//routes
import authRoutes from "./routes/auth.route.js";  
import productRoutes from "./routes/product.route.js"; 
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // allows you to parse the body of the request
app.use(cookieParser());
// Use the auth routes  
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    connectDB();
});
