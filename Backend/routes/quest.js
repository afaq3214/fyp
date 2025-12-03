import express from "express";
import auth from "../middleware/auth.js";
import Quests from "../models/Quests.js";
const router = express.Router();

router.get("/", auth, async (req, res) => {
    try {
        const quests = await Quests.find({ userId: req.user.id });
        res.json(quests);
    } catch (error) {
        console.error('Error fetching quests:', error);
        res.status(500).json({ error: 'Failed to fetch quests' });
    }
});

export default router;