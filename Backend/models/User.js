import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Core Authentication
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // optional if using OAuth
    googleId: { type: String }, // for Google login
    githubId: { type: String }, // for GitHub login

    // Profile Info
    bio: String,
    profilePicture: String,
    makerStory: String,
    location: String, // Added: User's city/country
    jobTitle: String, // Added: User's professional role
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Added: Account status

    // Portfolio
    portfolio: [
      {
        title: String,
        demoUrl: String,
        media: [String], // images/videos
        status: { type: String, enum: ['live', 'development'], default: 'development' }, // Added: Project status
        category: String, // Added: Project category
        upvotes: { type: Number, default: 0 }, // Added: Project upvotes
        comments: [{ // Added: Project comments
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          content: String,
          createdAt: { type: Date, default: Date.now }
        }]
      },
    ],

    // Social Links
    github: String,
    twitter: String,
    linkedin: String,
    website: String,

    // Engagement Metrics (Added)
    profileViews: { type: Number, default: 0 },
    totalUpvotes: { type: Number, default: 0 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Achievements
    badges: [String],
    achievements: [{ title: String, earnedAt: Date }],

    // Projects & Collaborations Metrics (Added)
    projectsCount: { type: Number, default: 0 },
    collaborationsCount: { type: Number, default: 0 },

    // Collaboration
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    collaborationInvites: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // System fields
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" }, // Added moderator role
    lastActive: { type: Date }, // Added: Track user activity
  },
  { timestamps: true }
);

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
