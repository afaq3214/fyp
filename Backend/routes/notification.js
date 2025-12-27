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

// Get all notifications for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean();
        res.json(notifications);
    } catch (error) {
        console.error("Error in notification GET:", error);
        res.status(500).json({ error: error.message });
    }
});

// Mark all notifications as viewed for the authenticated user
router.post('/mark-viewed', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                userId: req.user._id, 
                viewed: false 
            },
            { 
                $set: { viewed: true } 
            }
        );
        
        // Get the updated notifications to return
        const updatedNotifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
            
        res.json({ 
            message: 'All notifications marked as viewed',
            notifications: updatedNotifications
        });
    } catch (error) {
        console.error("Error marking notifications as viewed:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a notification
router.delete('/:notificationId', auth, async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        // Verify the notification belongs to the user
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or access denied' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router