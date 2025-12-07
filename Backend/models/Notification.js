import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ['badge', 'upvote', 'quest', 'comment', 'follow'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    viewed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
