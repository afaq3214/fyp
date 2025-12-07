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
    otp: { type: Number, default: 0 }, // count of OTPs sent for rate limiting
    // Achievements
    badges: [
      {
        badge: { type: String, ref: "Badge" },
        awardedAt: { type: Date, default: Date.now }
      }
    ],

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

    // Activity tracking for badges
    upvotesGiven: {
      type: Number,
      default: 0
    },
    commentsGiven: {
      type: Number,
      default: 0
    },
    productsDiscovered: {
      type: Number,
      default: 0
    },
    emojisReceived: {
      type: Number,
      default: 0
    },
    consecutiveLoginDays: {
      type: Number,
      default: 0
    },
    lastLoginDate: Date,
    reputationScore: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    
    // Badge fields
    totalBadgesEarned: {
      type: Number,
      default: 0
    },
    
    // Premium subscription fields
    isPremium: {
      type: Boolean,
      default: false
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription"
    }
  },
  { timestamps: true }
);

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ role: 1 });

// Pre-init hook to clean up createdAt field during document initialization
userSchema.pre('init', function(data) {
  if (data.createdAt && typeof data.createdAt === 'string') {
    data.createdAt = new Date(data.createdAt.trim().replace(/\n$/, ''));
  }
});

// Pre-save hook to clean up createdAt field
userSchema.pre('save', function(next) {
  if (this.createdAt && typeof this.createdAt === 'string') {
    this.createdAt = new Date(this.createdAt.trim().replace(/\n$/, ''));
  } else if (this.createdAt && this.createdAt.toString && typeof this.createdAt.toString() === 'string') {
    const createdAtStr = this.createdAt.toString();
    if (createdAtStr.includes('\n')) {
      this.createdAt = new Date(createdAtStr.trim().replace(/\n$/, ''));
    }
  }
  next();
});

export default mongoose.model("User", userSchema);
