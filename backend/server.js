// backend/server.js - UPDATED WITH INTERVIEW ROUTES
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import vapiRoutes from "./routes/vapiRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js"; // ✅ NEW IMPORT

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vapi", vapiRoutes);
app.use("/api/interviews", interviewRoutes); // ✅ NEW ROUTE - Add this line

// Start server (✅ keep this for local runs)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});