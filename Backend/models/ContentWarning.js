import mongoose from "mongoose";

const ContentWarningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Warning details
    warningType: {
        type: String,
        enum: ['harsh_language', 'spam_indicators', 'negative_sentiment', 'suspicious_patterns', 'formatting_issues', 'manual_review'],
        required: true
    },

    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },

    // Content that triggered the warning
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'contentType'
    },

    contentType: {
        type: String,
        required: true,
        enum: ['Comment', 'Product', 'User']
    },

    // Warning message
    message: {
        type: String,
        required: true
    },

    // AI-generated or manual
    source: {
        type: String,
        enum: ['ai_detection', 'user_report', 'moderator'],
        default: 'ai_detection'
    },

    // Warning status
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'appealed', 'resolved'],
        default: 'active'
    },

    // User acknowledgment
    acknowledgedAt: {
        type: Date
    },

    // Appeal information
    appeal: {
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reviewedAt: Date,
        response: String
    },

    // Related moderation queue item
    moderationQueueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ModerationQueue"
    },

    // Consequences
    consequences: [{
        type: {
            type: String,
            enum: ['content_removed', 'temporary_restriction', 'warning_points', 'notification_sent']
        },
        description: String,
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Warning points (for user reputation system)
    points: {
        type: Number,
        default: 0
    },

    // Expiration (if applicable)
    expiresAt: {
        type: Date
    },

    // Metadata
    metadata: {
        detectedWords: [String],
        detectedPatterns: [String],
        analysisScore: Number,
        riskLevel: String,
        originalContent: String
    }

}, { 
    timestamps: true,
    indexes: [
        { userId: 1, status: 1 },
        { warningType: 1, createdAt: -1 },
        { severity: 1, status: 1 },
        { expiresAt: 1 }
    ]
});

// Virtual for checking if warning is expired
ContentWarningSchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if warning can be appealed
ContentWarningSchema.virtual('canBeAppealed').get(function() {
    return this.status === 'active' && !this.isExpired;
});

// Method to acknowledge warning
ContentWarningSchema.methods.acknowledge = function() {
    this.status = 'acknowledged';
    this.acknowledgedAt = new Date();
    return this.save();
};

// Method to submit appeal
ContentWarningSchema.methods.submitAppeal = function(reason) {
    this.appeal.reason = reason;
    this.appeal.status = 'pending';
    this.status = 'appealed';
    return this.save();
};

// Method to review appeal
ContentWarningSchema.methods.reviewAppeal = function(reviewerId, approved, response) {
    this.appeal.status = approved ? 'approved' : 'rejected';
    this.appeal.reviewedBy = reviewerId;
    this.appeal.reviewedAt = new Date();
    this.appeal.response = response;
    
    if (approved) {
        this.status = 'resolved';
    }
    
    return this.save();
};

// Static method to get user warning statistics
ContentWarningSchema.statics.getUserWarningStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalWarnings: { $sum: 1 },
                activeWarnings: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                totalPoints: { $sum: '$points' },
                warningsByType: {
                    $push: {
                        type: '$warningType',
                        severity: '$severity'
                    }
                }
            }
        }
    ]);

    return stats[0] || {
        totalWarnings: 0,
        activeWarnings: 0,
        totalPoints: 0,
        warningsByType: []
    };
};

// Static method to get active warnings for user
ContentWarningSchema.statics.getActiveWarnings = function(userId) {
    return this.find({
        userId,
        status: 'active',
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    }).sort({ createdAt: -1 });
};

// Static method to check if user has reached warning threshold
ContentWarningSchema.statics.checkWarningThreshold = async function(userId, threshold = 100) {
    const stats = await this.getUserWarningStats(userId);
    return stats.totalPoints >= threshold;
};

// Pre-save middleware to set warning points based on severity
ContentWarningSchema.pre('save', function(next) {
    if (this.isNew && !this.points) {
        const severityPoints = {
            'low': 5,
            'medium': 15,
            'high': 30,
            'critical': 50
        };
        this.points = severityPoints[this.severity] || 10;
    }
    next();
});

export default mongoose.model("ContentWarning", ContentWarningSchema);
