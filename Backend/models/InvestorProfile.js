import mongoose from "mongoose";

const investorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  investmentFocus: [{ type: String }],
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  description: { type: String, default: "" },
  requirements: { type: String, default: "" },
  lookingFor: { type: String, default: "" },
  stage: [{ type: String, enum: ["idea", "mvp", "growth", "scale"] }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("InvestorProfile", investorProfileSchema);
