import express from "express";
import auth from "../middleware/auth.js";
import InvestorProfile from "../models/InvestorProfile.js";
import FundingApplication from "../models/FundingApplication.js";
import InvestorBookmark from "../models/InvestorBookmark.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Create or update investor profile
router.post("/profile", auth, async (req, res) => {
  try {
    const { investmentFocus, budget, description, requirements, stage, lookingFor } = req.body;
    let profile = await InvestorProfile.findOne({ userId: req.user._id });
    if (profile) {
      if (investmentFocus !== undefined) profile.investmentFocus = investmentFocus;
      if (budget !== undefined) profile.budget = budget;
      if (description !== undefined) profile.description = description;
      if (requirements !== undefined) profile.requirements = requirements;
      if (stage !== undefined) profile.stage = stage;
      if (lookingFor !== undefined) profile.lookingFor = lookingFor;
      await profile.save();
    } else {
      profile = await InvestorProfile.create({
        userId: req.user._id,
        investmentFocus: investmentFocus || [],
        budget: budget || { min: 0, max: 0 },
        description: description || "",
        requirements: requirements || "",
        stage: stage || [],
        lookingFor: lookingFor || ""
      });
    }
    res.status(200).json({ message: "Investor profile saved", data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active investor profiles
router.get("/profiles", async (req, res) => {
  try {
    const profiles = await InvestorProfile.find({ isActive: true })
      .populate("userId", "name profilePicture bio location jobTitle")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: profiles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my investor profile
router.get("/profile/me", auth, async (req, res) => {
  try {
    const profile = await InvestorProfile.findOne({ userId: req.user._id })
      .populate("userId", "name profilePicture bio");
    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor profile by userId
router.get("/profile/:userId", async (req, res) => {
  try {
    const profile = await InvestorProfile.findOne({ userId: req.params.userId })
      .populate("userId", "name profilePicture bio location jobTitle");
    if (!profile) return res.status(404).json({ error: "Investor profile not found" });
    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Creator applies for funding
router.post("/apply", auth, async (req, res) => {
  try {
    const { productId, investorId, pitch, fundingAmount, equity } = req.body;
    if (!pitch) return res.status(400).json({ error: "Pitch is required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existing = await FundingApplication.findOne({
      productId,
      creatorId: req.user._id,
      investorId
    });
    if (existing) return res.status(400).json({ error: "Application already submitted to this investor" });

    const application = await FundingApplication.create({
      productId,
      creatorId: req.user._id,
      investorId,
      pitch,
      fundingAmount,
      equity
    });

    await Notification.create({
      userId: investorId,
      type: "follow",
      description: `${req.user.name} submitted a funding application for "${product.title}"`,
      fromUser: req.user._id
    });

    res.status(201).json({ message: "Funding application submitted", data: application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incoming applications (investor)
router.get("/applications", auth, async (req, res) => {
  try {
    const applications = await FundingApplication.find({ investorId: req.user._id })
      .populate("productId", "title pitch media category")
      .populate("creatorId", "name profilePicture bio")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submitted applications (creator)
router.get("/my-applications", auth, async (req, res) => {
  try {
    const applications = await FundingApplication.find({ creatorId: req.user._id })
      .populate("productId", "title pitch media category")
      .populate("investorId", "name profilePicture bio")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update application status (investor)
router.put("/application/:id", auth, async (req, res) => {
  try {
    const { status, investorNote } = req.body;
    const application = await FundingApplication.findById(req.params.id)
      .populate("productId", "title");
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.investorId.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Not authorized" });

    application.status = status;
    if (investorNote !== undefined) application.investorNote = investorNote;
    await application.save();

    await Notification.create({
      userId: application.creatorId,
      type: "follow",
      description: `Your funding application for "${application.productId?.title}" was ${status}`,
      fromUser: req.user._id
    });

    res.status(200).json({ message: "Application updated", data: application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle bookmark
router.post("/bookmark", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const existing = await InvestorBookmark.findOne({ investorId: req.user._id, productId });
    if (existing) {
      await InvestorBookmark.deleteOne({ _id: existing._id });
      return res.status(200).json({ message: "Bookmark removed", bookmarked: false });
    }
    await InvestorBookmark.create({ investorId: req.user._id, productId });
    res.status(201).json({ message: "Product bookmarked", bookmarked: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get investor bookmarks
router.get("/bookmarks", auth, async (req, res) => {
  try {
    const bookmarks = await InvestorBookmark.find({ investorId: req.user._id })
      .populate("productId", "title pitch media category createdBy author_name upvotes")
      .sort({ createdAt: -1 });
    res.status(200).json({ data: bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check bookmark status
router.get("/bookmark/check/:productId", auth, async (req, res) => {
  try {
    const bookmark = await InvestorBookmark.findOne({
      investorId: req.user._id,
      productId: req.params.productId
    });
    res.status(200).json({ bookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed 3 demo investor profiles using existing users (dev/demo use)
router.post("/seed", async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const users = await User.find().limit(5);
    if (users.length < 1) return res.status(400).json({ error: "No users found to seed with" });

    const demoProfiles = [
      {
        lookingFor: "AI-powered SaaS products with strong early traction",
        description: "Serial entrepreneur and angel investor. I back bold founders solving real problems with AI and automation.",
        requirements: "Need a working MVP, at least 10 beta users, and a technical co-founder.",
        investmentFocus: ["AI/ML", "SaaS", "Dev Tools"],
        stage: ["mvp", "growth"],
        budget: { min: 10000, max: 100000 }
      },
      {
        lookingFor: "FinTech or HealthTech startups disrupting traditional industries",
        description: "VC partner focused on regulated industries. I bring domain expertise, networks, and patient capital.",
        requirements: "Regulatory awareness, defensible moat, and a clear path to $1M ARR.",
        investmentFocus: ["FinTech", "HealthTech", "E-commerce"],
        stage: ["growth", "scale"],
        budget: { min: 50000, max: 500000 }
      },
      {
        lookingFor: "EdTech and gaming products with strong engagement metrics",
        description: "Former game designer turned investor. Passionate about products that make learning and skill-building fun.",
        requirements: "Strong retention metrics, unique IP or content, and a passionate community.",
        investmentFocus: ["EdTech", "Gaming", "Social"],
        stage: ["idea", "mvp"],
        budget: { min: 5000, max: 50000 }
      }
    ];

    const created = [];
    for (let i = 0; i < Math.min(demoProfiles.length, users.length); i++) {
      const exists = await InvestorProfile.findOne({ userId: users[i]._id });
      if (!exists) {
        const profile = await InvestorProfile.create({ userId: users[i]._id, ...demoProfiles[i] });
        created.push(profile);
      }
    }

    res.status(201).json({ message: `Created ${created.length} demo investor profiles`, data: created });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
