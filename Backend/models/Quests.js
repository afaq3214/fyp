import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  date: {
    type: String, // store "YYYY-MM-DD"
    required: true
  },

  upvotesToday: {
    type: Number,
    default: 0
  },

  commentsToday: {
    type: Number,
    default: 0
  },

  emojisReactionsToday: {
    type: Number,
    default: 0
  },

  rewardGiven: {
    type: Boolean,
    default: false
  },

  // Weekly tracking
  weekStartDate: {
    type: String
  },

  weeklyProductsDiscovered: {
    type: Number,
    default: 0
  },

  weeklyEngagementPoints: {
    type: Number,
    default: 0
  },

  weeklyRewardGiven: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("Quests", QuestSchema);
