// Backend/scheduler.js
import cron from 'node-cron';
import Quests from './models/Quests.js';

const DIGEST_CRON = process.env.DIGEST_CRON || '0 9 * * 0'; // Sunday 9:00 AM

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

// Weekly digest (AI Recommendations): call send-digest endpoint
async function runWeeklyDigest() {
  try {
    const base = process.env.API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(base + '/api/recommendations/send-digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    console.log('[' + new Date().toISOString() + '] Weekly digest completed:', data);
  } catch (err) {
    console.error('Weekly digest error:', err.message);
  }
}

// Schedule the task to run every day at midnight
export function startScheduler() {
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily reset of user progress...');
    resetDailyProgress();
  }, {
    timezone: "Asia/Karachi"
  });

  cron.schedule(DIGEST_CRON, () => {
    console.log('Running weekly digest...');
    runWeeklyDigest();
  }, {
    timezone: "Asia/Karachi"
  });

  console.log('Scheduler started - Daily reset 00:00, Weekly digest ' + DIGEST_CRON);
}