// Backend/scheduler.js
import cron from 'node-cron';
import Quests from './models/Quests.js';

// This function will reset daily progress for all users
async function resetDailyProgress() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Reset all users' daily progress
    await Quests.updateMany(
      {}, // Match all documents
      {
        $set: {
          upvotesToday: 0,
          commentsToday: 0,
          rewardGiven: false,
          date: today
        }
      }
    );
    
    console.log(`[${new Date().toISOString()}] Daily progress reset completed`);
  } catch (error) {
    console.error('Error resetting daily progress:', error);
  }
}

// Schedule the task to run every day at midnight
export function startScheduler() {
  // Run at 00:00 every day
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily reset of user progress...');
    resetDailyProgress();
  }, {
    timezone: "Asia/Karachi" // Adjust timezone as needed
  });
  
  console.log('Scheduler started - Daily reset scheduled for 00:00 every day');
}