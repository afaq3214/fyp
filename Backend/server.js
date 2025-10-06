import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors());

// Middleware for JSON parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large. Please upload a smaller image." });
  }
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));