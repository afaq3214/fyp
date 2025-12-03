import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Core Authentication
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // optional if using OAuth
    googleId: { type: String }, // for Google login
    emailVerified: { type: Boolean, default: false },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    // Profile Info
    bio: String,
    profilePicture: String,
    makerStory: String,
    location: String, // Added: User's city/country
    jobTitle: String, // Added: User's professional role
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Added: Account status
    points:Number,
    

    // Social Links
    github: String,
    twitter: String,
    linkedin: String,
    website: String,

    // Engagement Metrics (Added)
   
    totalUpvotes: { type: Number, default: 0 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    otp: { type: Number, default: 0 }, // count of OTPs sent for rate limiting
    // Achievements
    badges: [String],
    achievements: [{ title: String, earnedAt: Date }],

    // Projects & Collaborations Metrics (Added)
    projectsCount: { type: Number, default: 0 },
   
    // System fields
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" }, // Added moderator role
    lastActive: { type: Date }, // Added: Track user activity
  },
 
);

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
