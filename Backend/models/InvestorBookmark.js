import mongoose from "mongoose";

const investorBookmarkSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }
}, { timestamps: true });

investorBookmarkSchema.index({ investorId: 1, productId: 1 }, { unique: true });

export default mongoose.model("InvestorBookmark", investorBookmarkSchema);
