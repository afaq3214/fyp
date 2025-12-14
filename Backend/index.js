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
import badgeRoutes from './routes/badgeRoutes.js';
import notificationRoutes from "./routes/notification.js"
import wishlistRoutes from "./routes/wishlist.js";
import userRoutes from "./routes/user.js";
import activityRoutes from "./routes/activity.js";
import { startScheduler } from "./scheduler.js";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS (restrict origin in prod: e.g., { origin: 'https://your-frontend.vercel.app' })
app.use(cors());
 
startScheduler();
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
app.use('/api/badge', badgeRoutes);
app.use('/api/notification',notificationRoutes)
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);
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

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  // Initialize default badges
 
});