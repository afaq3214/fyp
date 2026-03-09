import express from "express";
import Sentiment from "sentiment";
import Comments from "../models/Comments.js";
import auth from "../middleware/auth.js";
import { updateDailyProgress } from "../services/updateDailyProgress.js";
import { UpdateBadge } from "../services/badgeService.js";
import Product from "../models/Product.js";
import { notification } from "./notification.js";
import ActivityService from "../services/activityService.js";
import contentModerationService from "../services/contentModerationService.js";

const router = express.Router();
const sentiment = new Sentiment();

function getSentimentLabel(score) {
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}


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
        product.totalcomments += 1;
        await product.save();

        if (product.author_id.toString() === req.user.id) {
            return res.status(403).json({ message: "You cannot comment on your own product" });
        }
        const sentimentResult = sentiment.analyze(comment || "");
        const sentimentScore = sentimentResult.score ?? 0;
        const sentimentLabel = getSentimentLabel(sentimentScore);

        // AI Content Moderation Check
        const moderationAnalysis = contentModerationService.analyzeContent(comment, 'comment');
        console.log('🔍 Moderation Analysis for comment:', comment);
        console.log('🔍 Analysis result:', moderationAnalysis);
        
        // Create the comment first
        const newComment = new Comments({
            productId,
            userId,
            username: req.user.name,
            profilePicture: req.user.profilePicture,
            comment,
            emoji,
            rating,
            sentimentScore,
            sentimentLabel,
        });

        await newComment.save();
        
        // If content is flagged, add to moderation queue
        if (moderationAnalysis.requiresModeration) {
            console.log('🚨 Content requires moderation!');
            try {
                const ModerationQueue = (await import("../models/ModerationQueue.js")).default;
                const ContentWarning = (await import("../models/ContentWarning.js")).default;
                
                const queueItem = new ModerationQueue({
                    contentId: newComment._id,
                    contentType: 'Comment',
                    userId,
                    analysis: moderationAnalysis,
                    contentSnapshot: { comment }
                });

                await queueItem.save();
                console.log('✅ Added to moderation queue:', queueItem._id);

                // Send warning if needed
                if (moderationAnalysis.warning && moderationAnalysis.score >= 10) {
                    const warning = new ContentWarning({
                        userId,
                        warningType: moderationAnalysis.flags[0] || 'manual_review',
                        severity: moderationAnalysis.riskLevel === 'high' ? 'high' : 'medium',
                        contentId: newComment._id,
                        contentType: 'Comment',
                        message: contentModerationService.generateUserWarning(moderationAnalysis),
                        source: 'ai_detection',
                        moderationQueueId: queueItem._id,
                        metadata: {
                            detectedWords: moderationAnalysis.detectedIssues,
                            analysisScore: moderationAnalysis.score,
                            riskLevel: moderationAnalysis.riskLevel,
                            originalContent: comment
                        }
                    });

                    await warning.save();
                    console.log('⚠️ Warning sent to user:', warning._id);
                    
                    try {
                        await notification(userId, warning.message, 'warning');
                    } catch (notifError) {
                        console.error("Error sending warning notification:", notifError);
                    }
                }

                // Continue with normal flow but include moderation info
                try {
                    await notification(product.author_id, "You have received an comment on your product", "upvote");
                } catch (notifError) {
                    console.error("Error sending notification:", notifError);
                }

                await ActivityService.logComment(userId, product.title, productId);
                const progress = await updateDailyProgress(userId, "comment");
                await UpdateBadge(userId, 'comment');

                return res.status(201).json({ 
                    message: "Comment added successfully but is under review", 
                    comment: newComment, 
                    quest: progress,
                    moderation: {
                        flagged: true,
                        requiresModeration: true,
                        warningSent: moderationAnalysis.warning && moderationAnalysis.score >= 10
                    }
                });

            } catch (modError) {
                console.error("Error in moderation process:", modError);
                // Continue with normal flow if moderation fails
            }
        } else {
            console.log('✅ Content is appropriate, no moderation needed');
        }

        // Normal flow for non-flagged content
        try {
            await notification(product.author_id, "You have received an comment on your product", "upvote");
        } catch (notifError) {
            console.error("Error sending notification:", notifError);
        }

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
