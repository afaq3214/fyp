import mongoose from "mongoose";

const fundingApplicationSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pitch: { type: String, required: true },
  fundingAmount: { type: Number },
  equity: { type: Number },
  status: { type: String, enum: ["pending", "accepted", "rejected", "withdrawn"], default: "pending" },
  investorNote: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("FundingApplication", fundingApplicationSchema);
