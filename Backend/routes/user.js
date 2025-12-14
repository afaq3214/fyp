import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get top users by points
router.get("/top-users", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topUsers = await User.find({ points: { $gt: 0 } })
      .select('name profilePicture points badges')
      .sort({ points: -1 })
      .limit(limit)
      .lean();
    
    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({ error: 'Failed to fetch top users' });
  }
});

export default router;
