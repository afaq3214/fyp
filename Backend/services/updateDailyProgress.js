import Quests from "../models/Quests.js";
import User from "../models/User.js";
import { dailyLimits } from "../Data/DailyLImits.js";
import { grantBadge } from "./questService.js";
import { notification } from "../routes/notification.js";

const dailyQuests = {
  upvoteGoal: 2,       // user must upvote 3 products
  commentGoal: 3,      // user must give 3 comments
  reward: 5            // reward points/upvotes user gets after completion
};

async function grantReward(userId) {
  await User.findByIdAndUpdate(userId, {
    $inc: { points: dailyQuests.reward }
  });
  try {
                  await notification(userId, "You have received 5 points on completeting daily quest", "upvote");
              } catch (notifError) {
                  console.error("Error sending notification:", notifError);
              }
}

export async function updateDailyProgress(userId, action) {
  const today = new Date().toISOString().split("T")[0];

  let progress = await Quests.findOne({ userId });
  if(!progress){
    progress = new Quests({
      userId,
      date: today,
      upvotesToday: 0,
      commentsToday: 0
    });
  }
 if (action === "upvote" && progress.upvotesToday >= dailyLimits.upvotesPerDay) {
    return { completed: false, error: "Upvote limit reached for today (max 5)" };
  }
  // If it's a new day → reset counters
  if (!progress || progress.date !== today) {
    progress = await Quests.findOneAndUpdate(
      { userId },
      {
        userId,
        date: today,
        upvotesToday: 0,
        commentsToday: 0
      },
      { upsert: true, new: true }
    );
  }

  // Increase counter based on action
  if (action === "upvote") progress.upvotesToday += 1;
  if (action === "comment") progress.commentsToday += 1;

  await progress.save();
   if (
    progress.upvotesToday >= dailyQuests.upvoteGoal &&
    progress.commentsToday >= dailyQuests.commentGoal &&
    !progress.rewardGiven
  ) {
    // Grant rewards
    await grantReward(userId);
    
    // Grant badges
    // await grantBadge(userId, "daily_warrior");
    
    progress.rewardGiven = true;
    await progress.save();

    return { 
      completed: true, 
      reward: dailyQuests.reward,
      message: "Daily quests completed! You earned 5 points!"
    };
  }

  return { 
    completed: false,
    upvotesToday: progress.upvotesToday,
    commentsToday: progress.commentsToday,
    upvotesRemaining: Math.max(0, dailyQuests.upvoteGoal - progress.upvotesToday),
    commentsRemaining: Math.max(0, dailyQuests.commentGoal - progress.commentsToday)
  };
  
}
