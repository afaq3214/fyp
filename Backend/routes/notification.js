import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();
export async function notification(userId, description, type = 'badge') {
    try {
        const AddNotification = await Notification.create({
            userId: userId,
            description: description,
            type: type
        });
        console.log("Notification added:", AddNotification);
        return AddNotification;
    } catch (error) {
        console.error("Error adding notification:", error);
        throw error;
    }
}
// Add a notification
router.post('/add', auth, async (req, res) => {
    try {
        const { description, type } = req.body;
        const AddNotification = await Notification.create({
            userId: req.user._id,
            description: description,
            type: type || 'badge'
        });
        console.log("Test notification added:", AddNotification);
        res.json(AddNotification);
    } catch (error) {
        console.error("Error adding test notification:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        console.log("User from auth middleware:", req.user);
        console.log("User ID:", req.user._id);
        
        const notifications = await Notification.find({ userId: req.user._id });
        console.log("Found notifications:", notifications);
        
        res.json(notifications);
    } catch (error) {
        console.error("Error in notification GET:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router