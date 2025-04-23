import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";  // Make sure this path is correct

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Use the auth routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
