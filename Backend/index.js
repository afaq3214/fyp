import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import path from "path";
import { fileURLToPath } from "url";
import upvoteRoutes from "./routes/upvotes.js"
import commentRoutes from "./routes/comments.js"
import questRoutes from "./routes/quest.js"
dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS (restrict origin in prod: e.g., { origin: 'https://your-frontend.vercel.app' })
app.use(cors());

// Middleware for JSON parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files from the uploads directory (LOCAL ONLY; see notes for prod)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upvotes", upvoteRoutes);
app.use("/api/comments", commentRoutes);
console.log('Routes mounted: /api/quest');
app.use("/api/quest", questRoutes);
// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large. Please upload a smaller image." });
  }
  res.status(500).json({ error: err.message });
});

// Export for Vercel (remove app.listen for production)
export default app;

// Local development only (comment out for deploy)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}