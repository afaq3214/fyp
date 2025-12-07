import Badge from "../models/Badge.js";

const sampleBadges = [
  { key: "firstLogin", name: "Welcome Aboard", description: "Completed your first login" },
  { key: "first5upvotes", name: "Upvote Starter", description: "Made your first 5 upvotes" },
  { key: "first10comments", name: "Comment King", description: "Made 10 comments" },
  { key: "daily_warrior", name: "Daily Warrior", description: "Completed daily quests 7 days in a row" },
  { key: "comment_king", name: "Comment Master", description: "Made 50 comments" },
  { key: "upvote_master", name: "Upvote Master", description: "Made 100 upvotes" }
];

export async function initializeBadges() {
  for (const badge of sampleBadges) {
    await Badge.findOneAndUpdate(
      { key: badge.key },
      badge,
      { upsert: true }
    );
  }
  console.log("Sample badges initialized");
}