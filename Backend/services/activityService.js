import Activity from '../models/Activity.js';

class ActivityService {
  static async logActivity(userId, type, action, target = null, targetId = null, metadata = {}) {
    try {
      const activity = new Activity({
        userId,
        type,
        action,
        target,
        targetId,
        metadata
      });
      
      await activity.save();
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to avoid breaking main functionality
      return null;
    }
  }

  static async logProductLaunch(userId, productTitle, productId) {
    return this.logActivity(
      userId,
      'launch',
      'Launched',
      productTitle,
      productId,
      { productTitle, productId }
    );
  }

  static async logProductUpdate(userId, productTitle, productId) {
    return this.logActivity(
      userId,
      'update',
      'Updated',
      productTitle,
      productId,
      { productTitle, productId }
    );
  }

  static async logUpvote(userId, productTitle, productId) {
    return this.logActivity(
      userId,
      'upvote',
      'Upvoted',
      productTitle,
      productId,
      { productTitle, productId }
    );
  }

  static async logReview(userId, productTitle, productId) {
    return this.logActivity(
      userId,
      'review',
      'Reviewed',
      productTitle,
      productId,
      { productTitle, productId }
    );
  }

  static async logComment(userId, productTitle, productId) {
    return this.logActivity(
      userId,
      'comment',
      'Commented on',
      productTitle,
      productId,
      { productTitle, productId }
    );
  }

  static async logBadgeEarned(userId, badgeName, badgeId) {
    return this.logActivity(
      userId,
      'badge',
      'Earned badge',
      badgeName,
      badgeId,
      { badgeName, badgeId }
    );
  }

  static async logMilestone(userId, milestone, target = null, targetId = null) {
    return this.logActivity(
      userId,
      'milestone',
      milestone,
      target,
      targetId,
      { milestone }
    );
  }

  static async logCollaboration(userId, projectTitle, projectId) {
    return this.logActivity(
      userId,
      'collab',
      'Collaborated on',
      projectTitle,
      projectId,
      { projectTitle, projectId }
    );
  }
}

export default ActivityService;
