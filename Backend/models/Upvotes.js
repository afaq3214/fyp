import mongoose from "mongoose";

const upvoteSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true, // one upvote document per product
  },
  userIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  ]
}, {
  timestamps: true
});
export default mongoose.model("Upvotes", upvoteSchema);

