import Quests from "../models/Quests.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";

const dailyQuests = {
  upvoteGoal: 2,
  commentGoal: 3,
  reward: 5
};

export async function getUserQuestProgress(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    let progress = await Quests.findOne({ userId, date: today });
    
    if (!progress) {
      progress = {
        upvotesToday: 0,
        commentsToday: 0,
        rewardGiven: false
      };
    }
    
    const user = await User.findById(userId).select('points badges');
    const userBadges = await Badge.find({ key: { $in: user.badges || [] } });
    
    return {
      dailyQuests: {
        upvotesToday: progress.upvotesToday,
        commentsToday: progress.commentsToday,
        upvotesRemaining: Math.max(0, dailyQuests.upvoteGoal - progress.upvotesToday),
        commentsRemaining: Math.max(0, dailyQuests.commentGoal - progress.commentsToday),
        completed: progress.rewardGiven,
        reward: dailyQuests.reward
      },
      userStats: {
        points: user.points || 0,
        badges: userBadges
      }
    };
  } catch (error) {
    console.error('Error getting user quest progress:', error);
    throw error;
  }
}

export async function grantBadge(userId, badgeKey) {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Check if user already has this badge
    const alreadyEarned = user.badges.some(b => b.badge === badgeKey);
    
    if (!alreadyEarned) {
      // Push the correct structure matching your schema
      user.badges.push({
        badge: badgeKey,  // String like "daily_warrior"
        awardedAt: new Date()
      });
      
      await user.save();
      console.log("Badge granted:", badgeKey);
    } else {
      console.log("Badge already earned by user");
    }
  } catch (error) {
    console.error("Error granting badge:", error.message);
  }
}