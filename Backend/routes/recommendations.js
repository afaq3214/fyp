// Backend/routes/recommendations.js – AI Recommendations module
import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Comments from "../models/Comments.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { sendDigestEmail } from "../services/digestEmail.js";

const router = express.Router();

// ===============================
// AI Suggested products (for logged-in user)
// ===============================
router.get("/suggested", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 30);

    // Products user has upvoted (to infer categories/tags)
    const upvotedProducts = await Product.find({
      upvotes: userId,
    })
      .lean()
      .limit(50);

    const categories = [...new Set(upvotedProducts.map((p) => p.category).filter(Boolean))];
    const tags = [];
    upvotedProducts.forEach((p) => {
      (p.autoTags || []).forEach((t) => tags.push(t));
    });
    const preferredTags = [...new Set(tags)].slice(0, 10);

    // Products user has commented on (to infer interest)
    const commented = await Comments.find({ userId }).distinct("productId");
    const commentedSet = new Set(commented.map((id) => id.toString()));

    let suggested = [];
    if (categories.length > 0 || preferredTags.length > 0) {
      const or = [];
      if (categories.length) or.push({ category: { $in: categories } });
      if (preferredTags.length) or.push({ autoTags: { $in: preferredTags } });
      suggested = await Product.find({
        $or: or,
        createdBy: { $ne: userId },
        author_id: { $ne: userId },
        _id: { $nin: commented.map((id) => id) },
      })
        .lean()
        .limit(limit * 2);
    }

    // Dedupe and add score
    const seen = new Set();
    suggested = suggested
      .filter((p) => {
        const id = p._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((p) => {
        const upvotesCount = Array.isArray(p.upvotes) ? p.upvotes.length : 0;
        const reviewsCount = p.totalcomments ?? (Array.isArray(p.reviews) ? p.reviews.length : 0);
        const daysSince = Math.max(1, (Date.now() - new Date(p.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        const momentum = (upvotesCount + reviewsCount * 1.5) / daysSince;
        return { ...p, upvotesCount, reviewsCount, momentum };
      })
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, limit);
    if (suggested.length < limit) {
      const existingIds = new Set(suggested.map((p) => p._id.toString()));
      const fallback = await Product.aggregate([
        { $addFields: { upvotesCount: { $size: { $ifNull: ["$upvotes", []] } } } },
        { $match: { _id: { $nin: [...existingIds].map((id) => new mongoose.Types.ObjectId(id)) }, author_id: { $ne: new mongoose.Types.ObjectId(userId) } } },
        { $sort: { upvotesCount: -1 } },
        { $limit: limit - suggested.length },
      ]);
      suggested = [...suggested, ...fallback].slice(0, limit);
    }

    const out = suggested.map((p) => ({
      ...p,
      reviews: p.reviewsCount ?? p.totalcomments ?? 0,
    }));
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Feedback sentiment insights (global or per product)
// ===============================
router.get("/sentiment", async (req, res) => {
  try {
    const productId = req.query.productId;
    const limit = parseInt(req.query.limit, 10) || 100;

    let match = {};
    if (productId) match.productId = new mongoose.Types.ObjectId(productId);

    const comments = await Comments.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const total = comments.length;
    let positive = 0,
      negative = 0,
      neutral = 0;
    let scoreSum = 0;
    const byProduct = {};

    comments.forEach((c) => {
      const label = c.sentimentLabel || "neutral";
      if (label === "positive") positive++;
      else if (label === "negative") negative++;
      else neutral++;
      scoreSum += c.sentimentScore ?? 0;
      if (c.productId) {
        const pid = c.productId.toString();
        if (!byProduct[pid]) byProduct[pid] = { positive: 0, negative: 0, neutral: 0, count: 0 };
        byProduct[pid][label]++;
        byProduct[pid].count++;
      }
    });

    const avgScore = total > 0 ? (scoreSum / total).toFixed(2) : 0;
    res.json({
      total,
      averageScore: parseFloat(avgScore),
      distribution: { positive, negative, neutral },
      byProduct: productId ? undefined : byProduct,
      recentSample: comments.slice(0, 5).map((c) => ({
        comment: c.comment?.substring(0, 120),
        sentimentLabel: c.sentimentLabel,
        sentimentScore: c.sentimentScore,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Digest preference (opt-in / opt-out)
// ===============================
router.put("/digest-preference", auth, async (req, res) => {
  try {
    const { optIn } = req.body;
    await User.findByIdAndUpdate(req.user.id, { digestOptIn: !!optIn });
    res.json({ message: "Digest preference updated", digestOptIn: !!optIn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/digest-preference", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("digestOptIn").lean();
    res.json({ digestOptIn: !!user?.digestOptIn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// Send weekly digest (called by scheduler or cron)
// ===============================
router.post("/send-digest", async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const products = await Product.aggregate([
      { $addFields: { upvotesCount: { $size: { $ifNull: ["$upvotes", []] } } } },
      { $sort: { upvotesCount: -1 } },
      { $limit: 15 },
    ]);
    const newProductsCount = await Product.countDocuments({ createdAt: { $gte: oneWeekAgo } });

    const comments = await Comments.find({ createdAt: { $gte: oneWeekAgo } }).lean();
    let positive = 0,
      negative = 0,
      neutral = 0;
    comments.forEach((c) => {
      const label = c.sentimentLabel || "neutral";
      if (label === "positive") positive++;
      else if (label === "negative") negative++;
      else neutral++;
    });

    const sentimentSummary = { positive, negative, neutral };
    const payload = {
      topProducts: products,
      sentimentSummary,
      newProductsCount,
    };

    const users = await User.find({ digestOptIn: true, email: { $exists: true, $ne: "" } })
      .select("email name")
      .lean();
    let sent = 0;
    for (const u of users) {
      const result = await sendDigestEmail(u.email, u.name, payload);
      if (result.ok && !result.skipped) sent++;
    }

    res.json({ message: "Digest run completed", recipients: users.length, sent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
