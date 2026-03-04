import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    profilePicture: String,
    username: {
        type: String,
        required: false // optional
    },

    comment: {
        type: String,
        required: true,
        trim: true
    },

    emoji: {
        type: String, // e.g. "❤️", "😀", "👍"
        required: false
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false
    },

    // AI: sentiment analysis (positive / negative / neutral)
    sentimentScore: { type: Number, default: 0 },
    sentimentLabel: { type: String, enum: ["positive", "negative", "neutral"], default: "neutral" },

}, { timestamps: true });

export default mongoose.model("Comment", CommentSchema);
