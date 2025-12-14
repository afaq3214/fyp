import express from 'express';
const router = express.Router();
import Activity from '../models/Activity.js';
import auth from '../middleware/auth.js';

// Get user's activity
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'name profilePicture');
    
    const total = await Activity.countDocuments({ userId });
    
    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Create activity (for internal use)
router.post('/', auth, async (req, res) => {
  try {
    const { type, action, target, targetId, description, metadata } = req.body;
    
    const activity = new Activity({
      userId: req.user.id,
      type,
      action,
      target,
      targetId,
      description,
      metadata
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Get recent activity across all users (for admin/feed)
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const activities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name profilePicture');
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

export default router;
