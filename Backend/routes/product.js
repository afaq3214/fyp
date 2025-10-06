import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * 📌 Add a new product (Module 2: Product Submission)
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      pitch,
      description,
      category,
      tags,
      media,
      websiteUrl,
      demoUrl,
      repoUrl,
      aiPitchSuggestions,
      autoTags,
      collaborators
    } = req.body;

    const product = new Product({
      title,
      pitch,
      description,
      category,
      tags,
      media,
      websiteUrl,
      demoUrl,
      repoUrl,
      aiPitchSuggestions,
      autoTags,
      createdBy: req.user?.id, // assumes JWT auth middleware
      collaborators
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 📌 Get all products (Module 3: Discovery Hub + Trend Pulse)
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" })
      .populate("createdBy", "name badges")
      .populate("collaborators", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Get single product by slug (SEO)
 */
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("createdBy", "name badges")
      .populate("collaborators", "name");

    if (!product) return res.status(404).json({ error: "Product not found" });

    // Track impressions for Trend Pulse
    product.impressions += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Upvote a product (Module 4: Interaction System)
 */
router.post("/:id/upvote", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Prevent duplicate upvotes
    if (!product.upvotes.includes(req.user.id)) {
      product.upvotes.push(req.user.id);
      await product.save();
    }

    res.json({ upvotes: product.upvotes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Add a review (Module 4: Micro-reviews)
 */
router.post("/:id/review", async (req, res) => {
  try {
    const { text, rating, emojiTags } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.reviews.push({
      user: req.user.id,
      text,
      rating,
      emojiTags
    });

    // Update momentum score dynamically
    product.momentumScore += 10;
    await product.save();

    res.json(product.reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Admin approval/rejection (Module 6: Admin Panel)
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
