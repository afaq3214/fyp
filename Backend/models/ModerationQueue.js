import mongoose from "mongoose";

const ModerationQueueSchema = new mongoose.Schema({
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

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Content analysis results
    analysis: {
        isAppropriate: { type: Boolean, required: true },
        riskLevel: { 
            type: String, 
            enum: ['minimal', 'low', 'medium', 'high'], 
            required: true 
        },
        flags: [{ type: String }],
        score: { type: Number, required: true },
        warning: { type: String },
        detectedIssues: [{ type: String }]
    },

    // Moderation status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'under_review'],
        default: 'pending'
    },

    // Moderation details
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    moderatedAt: {
        type: Date
    },

    moderationReason: {
        type: String
    },

    // Auto-flagging info
    autoFlagged: {
        type: Boolean,
        default: true
    },

    // User reports (if any)
    userReports: [{
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reason: {
            type: String,
            enum: ['spam', 'harassment', 'inappropriate_content', 'hate_speech', 'violence', 'other']
        },
        description: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Action taken
    action: {
        type: String,
        enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned'],
        default: 'none'
    },

    // Warning sent to user
    warningSent: {
        type: Boolean,
        default: false
    },

    warningMessage: {
        type: String
    },

    // Escalation
    escalated: {
        type: Boolean,
        default: false
    },

    escalatedAt: {
        type: Date
    },

    // Priority for moderation queue
    priority: {
        type: Number,
        default: 0 // Higher number = higher priority
    },

    // Content snapshot (for audit trail)
    contentSnapshot: {
        type: mongoose.Schema.Types.Mixed
    }

}, { 
    timestamps: true,
    indexes: [
        { status: 1, createdAt: -1 }, // For queue processing
        { priority: -1, status: 1 }, // For priority-based processing
        { contentType: 1, contentId: 1 }, // For content lookup
        { userId: 1, status: 1 } // For user history
    ]
});

// Virtual for checking if item is high priority
ModerationQueueSchema.virtual('isHighPriority').get(function() {
    return this.riskLevel === 'high' || this.priority >= 50;
});

// Method to approve content
ModerationQueueSchema.methods.approve = function(moderatorId, reason = '') {
    this.status = 'approved';
    this.moderatedBy = moderatorId;
    this.moderatedAt = new Date();
    this.moderationReason = reason;
    this.action = 'none';
    return this.save();
};

// Method to reject content
ModerationQueueSchema.methods.reject = function(moderatorId, reason, action = 'content_removed') {
    this.status = 'rejected';
    this.moderatedBy = moderatorId;
    this.moderatedAt = new Date();
    this.moderationReason = reason;
    this.action = action;
    return this.save();
};

// Method to send warning
ModerationQueueSchema.methods.sendWarning = function(warningMessage) {
    this.warningSent = true;
    this.warningMessage = warningMessage;
    this.action = 'warning';
    return this.save();
};

// Method to escalate
ModerationQueueSchema.methods.escalate = function() {
    this.escalated = true;
    this.escalatedAt = new Date();
    this.priority = Math.max(this.priority + 20, 70);
    return this.save();
};

// Static method to get queue statistics
ModerationQueueSchema.statics.getQueueStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgScore: { $avg: '$score' }
            }
        }
    ]);

    const total = await this.countDocuments();
    const highRisk = await this.countDocuments({ riskLevel: 'high', status: 'pending' });
    const overdue = await this.countDocuments({ 
        status: 'pending', 
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });

    return {
        total,
        highRisk,
        overdue,
        byStatus: stats.reduce((acc, stat) => {
            acc[stat._id] = { count: stat.count, avgScore: stat.avgScore };
            return acc;
        }, {})
    };
};

// Pre-save middleware to set priority based on risk level
ModerationQueueSchema.pre('save', function(next) {
    if (this.isNew && !this.priority) {
        const riskPriorities = {
            'minimal': 0,
            'low': 10,
            'medium': 30,
            'high': 60
        };
        this.priority = riskPriorities[this.riskLevel] || 0;
    }
    next();
});

export default mongoose.model("ModerationQueue", ModerationQueueSchema);
