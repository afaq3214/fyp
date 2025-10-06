import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname.replace(ext, "")}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  }
});

// Increase JSON payload limit
router.use(express.json({ limit: "10mb" }));
router.use(express.urlencoded({ limit: "10mb", extended: true }));

// In-memory store for OTPs (use a database in production)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 📌 Register
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: "✅ User registered successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * 📌 Update Profile
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      bio,
      profilePicture,
      makerStory,
      portfolio,
      github,
      twitter,
      linkedin,
      website,
      badges,
      achievements
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        bio,
        profilePicture,
        makerStory,
        portfolio,
        github,
        twitter,
        linkedin,
        website,
        badges,
        achievements
      },
      { new: true }
    ).select("-password");

    console.log("Updated user profilePicture:", updatedUser.profilePicture);

    res.json({
      message: "✅ Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Upload Profile Picture
 */
router.post("/profile/picture", auth, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    console.log("Uploaded image URL:", imageUrl);
    console.log("Saved file path:", path.join("uploads", req.file.filename));

    res.json({
      message: "✅ Profile picture updated successfully",
      profilePicture: imageUrl
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "❌ User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "❌ Invalid password" });

    const token = jwt.sign({ id: user._id }, "fyp", { expiresIn: "1d" });

    res.json({
      message: "✅ Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Forgot Password
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    otpStore.set(email, { otp, expiresAt });

    // In production, send OTP via email (mocked here)
    console.log(`OTP for ${email}: ${otp} (expires at ${new Date(expiresAt).toISOString()})`);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Reset Password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const stored = otpStore.get(email);

    if (!stored || stored.otp !== otp || stored.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    otpStore.delete(email); // Clear OTP after use

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Get all users (for testing in Postman)
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Get single user by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Replace with your Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "770104627723-hf0muapqiuktipev3kv9c8ct78q3m146.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * 📌 Sign in with Google
 */
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "No Google ID token provided" });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Google payload:", payload);

    // Extract user info from Google payload
    const { sub, email, name, picture } = payload;

    // Find or create user in your DB
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        profilePicture: picture,
        googleId: sub,
        role: "user",
        status: "active",
      });
      await user.save();
    }

    // Create JWT for your app
    const token = jwt.sign({ id: user._id }, "fyp", { expiresIn: "1d" });

    res.json({
      message: "✅ Google sign-in successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

// Global error handler
router.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large. Please upload a smaller image." });
  }
  console.error("Global error:", err);
  res.status(500).json({ error: err.message });
});

export default router;