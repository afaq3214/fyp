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
  }
});

export default mongoose.model("Quests", QuestSchema);
