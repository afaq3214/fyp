import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  badgeName: String,
  badgeIcon: String,
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
});

// Create compound index to prevent duplicate badges
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model('UserBadge', userBadgeSchema);