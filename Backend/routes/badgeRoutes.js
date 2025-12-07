import express from 'express';
import auth from '../middleware/auth.js';
import Badge from '../models/Badge.js';
import User from '../models/User.js';
const router = express.Router();

// Get all available badges
router.get('/:id', async (req, res) => {
  try {
    const userBadges = await User.findById(req.params.id).select('badges');
    
    if (!userBadges) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract badge keys from user's badges array
    const badgeKeys = userBadges.badges.map(b => b.badge);
    
    // Find all Badge documents matching those keys
    const badges = await Badge.find({ key: { $in: badgeKeys } });
    
    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get user's badge progress (earned + in progress)


// Check and grant badges



export default router;