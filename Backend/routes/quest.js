import express from "express";
import auth from "../middleware/auth.js";
import Quests from "../models/Quests.js";
import { getUserQuestProgress } from "../services/questService.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const quests = await Quests.find({ userId: req.user.id });
        const user = await User.findOne({ _id: req.user.id });
        
        res.json({
            quests: quests,
            userPoints: user?.points || 0
        });
    } catch (error) {
        console.error('Error fetching quests:', error);
        res.status(500).json({ error: 'Failed to fetch quests' });
    }
});

router.get("/progress", auth, async (req, res) => {
    try {
        const progress = await getUserQuestProgress(req.user.id);
        res.json(progress);
    } catch (error) {
        console.error('Error fetching quest progress:', error);
        res.status(500).json({ error: 'Failed to fetch quest progress' });
    }
});

// Add this route
router.post("/claim-reward", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split("T")[0];
        
        const progress = await Quests.findOne({ userId, date: today });
        
        if (!progress) {
            return res.status(404).json({ error: "No quest progress found for today" });
        }
        
        if (!progress.rewardGiven) {
            return res.status(400).json({ error: "Daily quests not completed yet" });
        }
        
        // Reward already claimed
        return res.status(200).json({ 
            message: "Reward already claimed",
            reward: 5 // dailyQuests.reward
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to claim reward' });
    }
});

export default router;