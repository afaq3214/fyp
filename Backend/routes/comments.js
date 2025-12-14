import express from "express";
import Comments from "../models/Comments.js";
import auth from "../middleware/auth.js";
import { updateDailyProgress } from "../services/updateDailyProgress.js";
import { UpdateBadge } from "../services/badgeService.js";
import Product from "../models/Product.js";
import { notification } from "./notification.js";
import ActivityService from "../services/activityService.js";
const router = express.Router();


// ===============================
// ADD COMMENT
// ===============================
router.post("/add",auth ,async (req, res) => {
    try {
        const { productId, userId, username, comment, emoji, rating } = req.body;
     
        if (!productId || !userId || !comment) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if user is trying to comment on their own product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.author_id.toString() === req.user.id) {
            return res.status(403).json({ message: "You cannot comment on your own product" });
        }
        const newComment = new Comments({
            productId,
            userId,
            username:req.user.name,
            profilePicture:req.user.profilePicture,
            comment,
            emoji,
            rating
           
        });
        
          try {
                          await notification(product.author_id, "You have received an comment on your product", "upvote");
                      } catch (notifError) {
                          console.error("Error sending notification:", notifError);
                      }  
        
        await newComment.save();
        
        // Log activity for comment
        await ActivityService.logComment(
            userId,
            product.title,
            productId
        );
        
        const progress = await updateDailyProgress(userId, "comment");
        await UpdateBadge(userId, 'comment');
        res.status(201).json({ message: "Comment added successfully", comment: newComment,quest:progress });

    } catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
});


// ===============================
// GET ALL COMMENTS FOR A PRODUCT
// ===============================
router.get("/product/:productId", async (req, res) => {
    try {
        const comments = await Comments.find({ productId: req.params.productId })
            .sort({ createdAt: -1 }); // newest first

        res.status(200).json(comments);

    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
});


// ===============================
// UPDATE EMOJI FEEDBACK
// ===============================
router.patch("/emoji/:commentId", async (req, res) => {
    try {
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ message: "Emoji is required" });
        }

        const updated = await Comments.findByIdAndUpdate(
            req.params.commentId,
            { emoji },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.status(200).json({ message: "Emoji updated", comment: updated });

    } catch (error) {
        res.status(500).json({ message: "Error updating emoji", error: error.message });
    }
});


// ===============================
// DELETE COMMENT
// ===============================
router.delete("/delete/:commentId", async (req, res) => {
    try {
        const deleted = await Comments.findByIdAndDelete(req.params.commentId);

        if (!deleted) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
});


export default router;
