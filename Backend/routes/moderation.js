import express from "express";
import ModerationQueue from "../models/ModerationQueue.js";
import ContentWarning from "../models/ContentWarning.js";
import Comments from "../models/Comments.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import contentModerationService from "../services/contentModerationService.js";
import auth from "../middleware/auth.js";
import { notification } from "./notification.js";

const router = express.Router();

// Middleware to check if user is moderator
const isModerator = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
            return res.status(403).json({ message: "Access denied. Moderator privileges required." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Error checking moderator privileges", error: error.message });
    }
};

// ===============================
// ANALYZE CONTENT (for real-time checking)
// ===============================
router.post("/analyze", auth, async (req, res) => {
    try {
        const { content, contentType = 'comment' } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const analysis = contentModerationService.analyzeContent(content, contentType);
        
        res.status(200).json({
            analysis,
            warning: analysis.warning ? contentModerationService.generateUserWarning(analysis) : null
        });

    } catch (error) {
        res.status(500).json({ message: "Error analyzing content", error: error.message });
    }
});

// ===============================
// AUTO-FLAG CONTENT
// ===============================
router.post("/flag", auth, async (req, res) => {
    try {
        const { contentId, contentType, content, userId } = req.body;
        
        if (!contentId || !contentType || !content || !userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Analyze content
        const analysis = contentModerationService.analyzeContent(content, contentType);
        
        // If content requires moderation, add to queue
        if (analysis.requiresModeration) {
            const queueItem = new ModerationQueue({
                contentId,
                contentType,
                userId,
                analysis,
                contentSnapshot: { content }
            });

            await queueItem.save();

            // Create warning for user if needed
            if (analysis.warning && analysis.score >= 30) {
                const warning = new ContentWarning({
                    userId,
                    warningType: analysis.flags[0] || 'manual_review',
                    severity: analysis.riskLevel === 'high' ? 'high' : 'medium',
                    contentId,
                    contentType,
                    message: contentModerationService.generateUserWarning(analysis),
                    source: 'ai_detection',
                    moderationQueueId: queueItem._id,
                    metadata: {
                        detectedWords: analysis.detectedIssues,
                        analysisScore: analysis.score,
                        riskLevel: analysis.riskLevel,
                        originalContent: content
                    }
                });

                await warning.save();

                // Send notification to user
                try {
                    await notification(userId, warning.message, 'warning');
                } catch (notifError) {
                    console.error("Error sending warning notification:", notifError);
                }
            }

            res.status(201).json({
                message: "Content flagged for moderation",
                queueId: queueItem._id,
                analysis,
                warningSent: analysis.warning && analysis.score >= 30
            });
        } else {
            res.status(200).json({
                message: "Content approved",
                analysis,
                requiresModeration: false
            });
        }

    } catch (error) {
        res.status(500).json({ message: "Error flagging content", error: error.message });
    }
});

// ===============================
// DEBUG: Check current user role
// ===============================
router.get("/check-role", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email role');
        res.status(200).json({ 
            message: "Current user info",
            user: user
        });
    } catch (error) {
        res.status(500).json({ message: "Error checking user role", error: error.message });
    }
});

// ===============================
// GET MODERATION QUEUE
// ===============================
router.get("/queue", auth, async (req, res) => {
    try {
        const { 
            status = 'pending', 
            page = 1, 
            limit = 20, 
            riskLevel, 
            contentType 
        } = req.query;

        const filter = { status };
        if (riskLevel) filter.riskLevel = riskLevel;
        if (contentType) filter.contentType = contentType;

        const queue = await ModerationQueue.find(filter)
            .populate('userId', 'name email profilePicture')
            .populate('moderatedBy', 'name')
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ModerationQueue.countDocuments(filter);
        const stats = await ModerationQueue.getQueueStats();

        res.status(200).json({
            queue,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            stats
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching moderation queue", error: error.message });
    }
});

// ===============================
// MODERATE CONTENT (Approve/Reject)
// ===============================
router.post("/moderate/:queueId", auth, isModerator, async (req, res) => {
    try {
        const { action, reason } = req.body;
        const queueId = req.params.queueId;
        const moderatorId = req.user.id;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
        }

        const queueItem = await ModerationQueue.findById(queueId)
            .populate('contentId')
            .populate('userId');

        if (!queueItem) {
            return res.status(404).json({ message: "Queue item not found" });
        }

        if (action === 'approve') {
            await queueItem.approve(moderatorId, reason);
        } else {
            await queueItem.reject(moderatorId, reason);
            
            // Remove the content if rejected
            if (queueItem.contentType === 'Comment') {
                await Comments.findByIdAndDelete(queueItem.contentId._id);
            } else if (queueItem.contentType === 'Product') {
                await Product.findByIdAndUpdate(queueItem.contentId._id, { 
                    status: 'removed',
                    removedAt: new Date(),
                    removalReason: reason
                });
            }

            // Send notification to user
            try {
                const message = action === 'reject' 
                    ? `Your content has been removed for violating community guidelines. Reason: ${reason}`
                    : `Your content has been reviewed and approved.`;
                    
                await notification(queueItem.userId._id, message, 'moderation');
            } catch (notifError) {
                console.error("Error sending moderation notification:", notifError);
            }
        }

        res.status(200).json({
            message: `Content ${action}d successfully`,
            queueItem
        });

    } catch (error) {
        res.status(500).json({ message: "Error moderating content", error: error.message });
    }
});

// ===============================
// SEND WARNING TO USER
// ===============================
router.post("/warn/:queueId", auth, isModerator, async (req, res) => {
    try {
        const { warningMessage, severity = 'medium' } = req.body;
        const queueId = req.params.queueId;

        const queueItem = await ModerationQueue.findById(queueId)
            .populate('userId');

        if (!queueItem) {
            return res.status(404).json({ message: "Queue item not found" });
        }

        // Create warning
        const warning = new ContentWarning({
            userId: queueItem.userId._id,
            warningType: queueItem.analysis.flags[0] || 'manual_review',
            severity,
            contentId: queueItem.contentId,
            contentType: queueItem.contentType,
            message: warningMessage,
            source: 'moderator',
            moderationQueueId: queueItem._id,
            metadata: {
                detectedWords: queueItem.analysis.detectedIssues,
                analysisScore: queueItem.analysis.score,
                riskLevel: queueItem.analysis.riskLevel
            }
        });

        await warning.save();
        await queueItem.sendWarning(warningMessage);

        // Send notification to user
        try {
            await notification(queueItem.userId._id, warningMessage, 'warning');
        } catch (notifError) {
            console.error("Error sending warning notification:", notifError);
        }

        res.status(200).json({
            message: "Warning sent successfully",
            warning,
            queueItem
        });

    } catch (error) {
        res.status(500).json({ message: "Error sending warning", error: error.message });
    }
});

// ===============================
// GET USER WARNINGS
// ===============================
router.get("/warnings/:userId", auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'active' } = req.query;

        // Users can only see their own warnings unless they're moderators
        if (req.user.id !== userId) {
            const user = await User.findById(req.user.id);
            if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        const warnings = await ContentWarning.find({ 
            userId, 
            status 
        })
        .populate('moderationQueueId', 'status')
        .sort({ createdAt: -1 });

        const stats = await ContentWarning.getUserWarningStats(userId);

        res.status(200).json({
            warnings,
            stats
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching warnings", error: error.message });
    }
});

// ===============================
// ACKNOWLEDGE WARNING
// ===============================
router.post("/warnings/:warningId/acknowledge", auth, async (req, res) => {
    try {
        const { warningId } = req.params;

        const warning = await ContentWarning.findById(warningId);
        if (!warning) {
            return res.status(404).json({ message: "Warning not found" });
        }

        if (warning.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        await warning.acknowledge();

        res.status(200).json({
            message: "Warning acknowledged",
            warning
        });

    } catch (error) {
        res.status(500).json({ message: "Error acknowledging warning", error: error.message });
    }
});

// ===============================
// APPEAL WARNING
// ===============================
router.post("/warnings/:warningId/appeal", auth, async (req, res) => {
    try {
        const { warningId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: "Appeal reason is required" });
        }

        const warning = await ContentWarning.findById(warningId);
        if (!warning) {
            return res.status(404).json({ message: "Warning not found" });
        }

        if (warning.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!warning.canBeAppealed) {
            return res.status(400).json({ message: "This warning cannot be appealed" });
        }

        await warning.submitAppeal(reason);

        // Notify moderators about the appeal
        try {
            const moderators = await User.find({ role: { $in: ['admin', 'moderator'] } });
            for (const moderator of moderators) {
                await notification(moderator._id, 
                    `New appeal submitted for warning #${warning._id}`, 
                    'appeal'
                );
            }
        } catch (notifError) {
            console.error("Error sending appeal notification:", notifError);
        }

        res.status(200).json({
            message: "Appeal submitted successfully",
            warning
        });

    } catch (error) {
        res.status(500).json({ message: "Error submitting appeal", error: error.message });
    }
});

// ===============================
// REPORT CONTENT (User reports)
// ===============================
router.post("/report", auth, async (req, res) => {
    try {
        console.log('📝 Report request received:', req.body);
        console.log('👤 User ID:', req.user.id);
        
        const { contentId, contentType, reason, description } = req.body;
        const reporterId = req.user.id;
        
        if (!contentId || !contentType || !reason) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate content type
        if (!['Comment', 'Product'].includes(contentType)) {
            console.log('❌ Invalid content type:', contentType);
            return res.status(400).json({ message: "Invalid content type" });
        }

        // Find the content being reported
        let content;
        if (contentType === 'Comment') {
            content = await Comments.findById(contentId);
        } else if (contentType === 'Product') {
            content = await Product.findById(contentId);
        }

        if (!content) {
            console.log('❌ Content not found:', contentId);
            return res.status(404).json({ message: `${contentType} not found` });
        }

        console.log('✅ Content found:', content);

        // Check if user is reporting their own content
        if (content.userId && content.userId.toString() === reporterId) {
            console.log('❌ User trying to report own content');
            return res.status(403).json({ message: "You cannot report your own content" });
        }

        // Analyze the content to determine severity
        const contentText = contentType === 'Comment' ? content.comment : content.description;
        const analysis = contentModerationService.analyzeContent(contentText || '', contentType.toLowerCase());
        
        console.log('🔍 Content analysis:', analysis);

        // Create moderation queue item for the report
        const queueItem = new ModerationQueue({
            contentId,
            contentType,
            userId: content.userId,
            analysis,
            contentSnapshot: content,
            autoFlagged: false,
            userReports: [{
                reportedBy: reporterId,
                reason,
                description,
                createdAt: new Date()
            }]
        });

        await queueItem.save();
        console.log('✅ Queue item created:', queueItem._id);

        // Notify moderators about the new report
        try {
            const moderators = await User.find({ role: { $in: ['admin', 'moderator'] } });
            for (const moderator of moderators) {
                await notification(moderator._id, 
                    `New user report: ${reason} on ${contentType} #${contentId}`, 
                    'report'
                );
            }
            console.log('✅ Moderifiers notified');
        } catch (notifError) {
            console.error("Error sending moderator notification:", notifError);
        }

        res.status(201).json({
            message: "Content reported successfully",
            queueId: queueItem._id,
            analysis
        });

    } catch (error) {
        console.error("❌ Error reporting content:", error);
        res.status(500).json({ message: "Error reporting content", error: error.message });
    }
});

// ===============================
// GET MODERATION STATISTICS
// ===============================
router.get("/stats", auth, isModerator, async (req, res) => {
    try {
        const queueStats = await ModerationQueue.getQueueStats();
        
        const recentActivity = await ModerationQueue.find({
            moderatedAt: { $exists: true }
        })
        .populate('moderatedBy', 'name')
        .sort({ moderatedAt: -1 })
        .limit(10);

        const topFlaggers = await ModerationQueue.aggregate([
            { $match: { autoFlagged: false } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }
        ]);

        res.status(200).json({
            queueStats,
            recentActivity,
            topFlaggers
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching moderation statistics", error: error.message });
    }
});

export default router;
