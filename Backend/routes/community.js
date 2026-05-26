import express from "express";
import auth from "../middleware/auth.js";
import Follow from "../models/Follow.js";
import CollaborationRequest from "../models/CollaborationRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const router = express.Router();

// Follow a user
router.post("/follow", auth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId === req.user._id.toString())
      return res.status(400).json({ error: "Cannot follow yourself" });

    const existing = await Follow.findOne({ followerId: req.user._id, followingId: userId });
    if (existing) return res.status(400).json({ error: "Already following this user" });

    await Follow.create({ followerId: req.user._id, followingId: userId });

    const target = await User.findById(userId).select("name");

    await Notification.create({
      userId,
      type: "follow",
      description: `${req.user.name} started following you`,
      fromUser: req.user._id
    });

    res.status(201).json({ message: `Now following ${target?.name}`, following: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow a user
router.delete("/unfollow/:userId", auth, async (req, res) => {
  try {
    const result = await Follow.deleteOne({ followerId: req.user._id, followingId: req.params.userId });
    if (!result.deletedCount) return res.status(404).json({ error: "Not following this user" });
    res.status(200).json({ message: "Unfollowed", following: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check follow status
router.get("/follow/check/:userId", auth, async (req, res) => {
  try {
    const follow = await Follow.findOne({ followerId: req.user._id, followingId: req.params.userId });
    res.status(200).json({ following: !!follow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get followers of a user
router.get("/followers/:userId", async (req, res) => {
  try {
    const follows = await Follow.find({ followingId: req.params.userId })
      .populate("followerId", "name profilePicture bio jobTitle location");
    res.status(200).json({ data: follows.map(f => f.followerId), count: follows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users a user is following
router.get("/following/:userId", async (req, res) => {
  try {
    const follows = await Follow.find({ followerId: req.params.userId })
      .populate("followingId", "name profilePicture bio jobTitle location");
    res.status(200).json({ data: follows.map(f => f.followingId), count: follows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get full network (followers + following)
router.get("/network/:userId", async (req, res) => {
  try {
    const [followers, following] = await Promise.all([
      Follow.find({ followingId: req.params.userId })
        .populate("followerId", "name profilePicture bio jobTitle location"),
      Follow.find({ followerId: req.params.userId })
        .populate("followingId", "name profilePicture bio jobTitle location")
    ]);
    res.status(200).json({
      data: {
        followers: followers.map(f => f.followerId),
        following: following.map(f => f.followingId),
        followersCount: followers.length,
        followingCount: following.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for discovery / find people)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("name profilePicture bio jobTitle location createdAt")
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send collaboration request
router.post("/collaborate", auth, async (req, res) => {
  try {
    const { toUserId, productId, message, skills } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "Message is required" });
    if (toUserId === req.user._id.toString())
      return res.status(400).json({ error: "Cannot send collaboration request to yourself" });

    const existing = await CollaborationRequest.findOne({
      fromUserId: req.user._id,
      toUserId,
      status: "pending"
    });
    if (existing) return res.status(400).json({ error: "Collaboration request already sent" });

    const collab = await CollaborationRequest.create({
      fromUserId: req.user._id,
      toUserId,
      productId: productId || undefined,
      message,
      skills: skills || []
    });

    await Notification.create({
      userId: toUserId,
      type: "follow",
      description: `${req.user.name} sent you a collaboration request`,
      fromUser: req.user._id
    });

    res.status(201).json({ message: "Collaboration request sent", data: collab });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incoming collaboration requests
router.get("/collaborations", auth, async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ toUserId: req.user._id })
      .populate("fromUserId", "name profilePicture bio jobTitle")
      .populate("productId", "title pitch")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sent collaboration requests
router.get("/sent-collaborations", auth, async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ fromUserId: req.user._id })
      .populate("toUserId", "name profilePicture bio")
      .populate("productId", "title pitch")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept / reject collaboration request
router.put("/collaborate/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CollaborationRequest.findById(req.params.id)
      .populate("fromUserId", "name _id");
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.toUserId.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Not authorized" });

    request.status = status;
    await request.save();

    await Notification.create({
      userId: request.fromUserId._id,
      type: "follow",
      description: `${req.user.name} ${status} your collaboration request`,
      fromUser: req.user._id
    });

    res.status(200).json({ message: `Request ${status}`, data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Community feed — products from followed users
router.get("/feed/:userId", async (req, res) => {
  try {
    const following = await Follow.find({ followerId: req.params.userId }).select("followingId");
    const followingIds = following.map(f => f.followingId);

    const products = await Product.find({ createdBy: { $in: followingIds } })
      .populate("createdBy", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
