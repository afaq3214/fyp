import mongoose from "mongoose";

const BadgeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // unique ID (e.g. "first5upvotes")
  title: { type: String, required: true },             // display name
  description: { type: String, default: "" },          // badge info
  iconUrl: { type: String, default: "" },              // url to badge image

  // Condition to earn this badge
  condition: {
    type: {
      type: String,
      required: true,
      enum: ["upvote", "comment", "login", "custom"],  // more can be added
    },
    value: { type: Number, required: true },           // target count (e.g. 5 upvotes)
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Badge", BadgeSchema);
