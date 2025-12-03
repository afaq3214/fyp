import Quests from "../models/Quests.js";
import User from "../models/User.js";
import { dailyLimits } from "../Data/DailyLImits.js";
const dailyQuests = {
  upvoteGoal: 2,       // user must upvote 3 products
  commentGoal: 3,      // user must give 3 comments
  reward: 5            // reward points/upvotes user gets after completion
};

async function grantReward(userId) {
  await User.findByIdAndUpdate(userId, {
    $inc: { points: dailyQuests.reward }
  });
}

export async function updateDailyProgress(userId, action) {
  const today = new Date().toISOString().split("T")[0];

  let progress = await Quests.findOne({ userId });
 if (action === "upvote" && progress.upvotesToday >= dailyLimits.upvoteGoal) {
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
    progress.upvotesToday == dailyQuests.upvoteGoal &&
    progress.commentsToday == dailyQuests.commentGoal &&
    !progress.rewardGiven
  ) {
    // Grant rewards
   const reward= await grantReward(userId);

    progress.rewardGiven = true;
    await progress.save();

    return { completed: true, reward: dailyQuests.reward };
  }

  return { completed: false };
  
}
