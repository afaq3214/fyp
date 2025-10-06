import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import { put } from "@vercel/blob";  // For uploading to Vercel Blob
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

// Configure multer for in-memory storage (no disk writes for serverless)
const storage = multer.memoryStorage();
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
 * 📌 Upload Profile Picture (Vercel Blob for serverless)
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

    // Upload to Vercel Blob (public URL)
    const blob = await put(`profile-pics/${req.user._id}-${Date.now()}-${req.file.originalname}`, 
      req.file.buffer, 
      { 
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN  // Optional: for private blobs
      }
    );

    const imageUrl = blob.url;  // Permanent public URL
    user.profilePicture = imageUrl;
    await user.save();

    console.log("Uploaded image URL:", imageUrl);

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fyp", { expiresIn: "1d" });

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
 * 📌 Forgot Password (Store OTP in DB for persistence)
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in User model (add otp/otpExpires fields if not present)
    user.otp = otp;
    user.otpExpires = new Date(expiresAt);
    await user.save();

    // In production, send OTP via email/SMS (e.g., Nodemailer, Twilio)
    console.log(`OTP for ${email}: ${otp} (expires at ${new Date(expiresAt).toISOString()})`);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Reset Password (Check OTP from DB)
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;  // Clear OTP
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Get all users (for testing)
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

// Google OAuth (use env var for Client ID)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fyp", { expiresIn: "1d" });

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