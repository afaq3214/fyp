import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import Product from "../models/Product.js";
import User from "../models/User.js";
import { Wishlist } from "../models/Wishlist.js";
import auth from "../middleware/auth.js";
import fs from 'fs';
import natural from 'natural';
import stopword from 'stopword';
import ActivityService from "../services/activityService.js";

const tfidf = new natural.TfIdf();

// Function to generate tags using TF-IDF
function generateAutoTags(text) {
  // 1. Tokenize text
  const tokenizer = new natural.WordTokenizer();
  let tokens = tokenizer.tokenize(text.toLowerCase());

  // 2. Remove stopwords (the, a, of, etc.)
  tokens = stopword.removeStopwords(tokens);

  const cleanText = tokens.join(" ");

  // 3. Feed text to TF-IDF
  tfidf.addDocument(cleanText);

  const scores = [];

  // 4. Extract words with their importance score
  tfidf.listTerms(0).forEach(item => {
    if (item.term.length > 2) {  // ignore very small words
      scores.push({ tag: capitalize(item.term), score: item.tfidf });
    }
  });

  // 5. Sort & take top 6 relevant tags
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => item.tag);
}

// Capitalize first letter (Optional)
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const router = express.Router();
const TfIdf = natural.TfIdf;

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for product media uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
}).array('media', 5); // Allow up to 5 files

function generateTags(title, description) {
  const tfidf = new TfIdf();
  tfidf.addDocument(title + ' ' + description);
  
  const tags = [];
  tfidf.listTerms(0).forEach(item => {
    if (item.tfidf > 5) {
      tags.push(item.term);
    }
  });
  
  return tags.slice(0, 5); // Return top 5 tags
}

/**
 * 📌 Add a new product (Module 2: Product Submission)
 */
router.post("/AddProduct", auth, (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Parse JSON strings back to objects/arrays
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const aiPitchSuggestions = req.body.aiPitchSuggestions ? JSON.parse(req.body.aiPitchSuggestions) : [];
      const contentToAnalyze = `
  ${req.body.title}
  ${req.body.pitch}
  ${req.body.description}
`;

const autoTags = generateAutoTags(contentToAnalyze);
      const collaborators = req.body.collaborators ? JSON.parse(req.body.collaborators) : [];

      // Handle multiple file uploads
      const media = req.files ? req.files.map(file => `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`) : [];

      const product = new Product({
  title: req.body.title,
  pitch: req.body.pitch,
  description: req.body.description,
  category: req.body.category,
  
  media,
  websiteUrl: req.body.websiteUrl,
  demoUrl: req.body.demoUrl,
  repoUrl: req.body.repoUrl,
  aiPitchSuggestions,
  autoTags,  // ✅ Now contains TF-IDF generated tags
  author_id: req.user?.id,
  author_name: req.user?.name,
  author_profile: req.user?.profilePicture,
  collaborators
});

    await product.save();
    
    // Log activity for product launch
    await ActivityService.logProductLaunch(
      req.user.id,
      product.title,
      product._id
    );
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

});

/**
 * 📌 Get all products (Module 3: Discovery Hub + Trend Pulse)
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // ✅ Fetch all products
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Ranking with Momentum – Popular Products
 * GET /api/products/ranking/popular?limit=20
 * Sorted by upvotes count (desc), then by total comments.
 */
router.get("/ranking/popular", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const products = await Product.aggregate([
      { $addFields: { upvotesCount: { $size: { $ifNull: ["$upvotes", []] } } } },
      { $sort: { upvotesCount: -1, totalcomments: -1 } },
      { $limit: limit },
    ]);
    const withCounts = products.map((p) => {
      const up = p.upvotesCount ?? (Array.isArray(p.upvotes) ? p.upvotes.length : 0);
      const rev = p.totalcomments ?? (Array.isArray(p.reviews) ? p.reviews.length : 0);
      return { ...p, upvotesCount: up, reviewsCount: rev, reviews: rev };
    });
    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Ranking with Momentum – Fresh Products
 * GET /api/products/ranking/fresh?limit=20&days=14
 * Newest first; optional filter by days since creation.
 */
router.get("/ranking/fresh", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const days = parseInt(req.query.days, 10) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const products = await Product.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Ranking with Momentum – Hidden Gems
 * GET /api/products/ranking/hidden-gems?limit=20
 * Good engagement but lower visibility: not in top by upvotes, scored by momentum (engagement / time).
 */
router.get("/ranking/hidden-gems", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const all = await Product.find().lean();
    const withMeta = all.map((p) => {
      const upvotesCount = Array.isArray(p.upvotes) ? p.upvotes.length : 0;
      const reviewsCount = p.totalcomments ?? (Array.isArray(p.reviews) ? p.reviews.length : 0);
      const daysSince = Math.max(
        1,
        (Date.now() - new Date(p.createdAt).getTime()) / (24 * 60 * 60 * 1000)
      );
      const momentum = (upvotesCount + reviewsCount * 1.5) / daysSince;
      return { ...p, upvotesCount, reviewsCount, momentum, daysSince };
    });
    const byUpvotes = [...withMeta].sort((a, b) => b.upvotesCount - a.upvotesCount);
    const topCount = Math.max(1, Math.floor(byUpvotes.length * 0.25));
    const excludedIds = new Set(byUpvotes.slice(0, topCount).map((p) => p._id.toString()));
    const hidden = withMeta
      .filter(
        (p) =>
          !excludedIds.has(p._id.toString()) &&
          (p.upvotesCount >= 1 || p.reviewsCount >= 1)
      )
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, limit)
      .map((p) => ({ ...p, reviews: p.reviewsCount }));
    res.json(hidden);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Get distinct autoTags for Smart Filters (Topic filter)
 * GET /api/products/tags
 */
router.get("/tags", async (req, res) => {
  try {
    const tags = await Product.aggregate([
      { $unwind: { path: "$autoTags", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$autoTags" } },
      { $sort: { _id: 1 } },
      { $project: { tag: "$_id", _id: 0 } },
    ]);
    const list = tags.map((t) => t.tag).filter(Boolean);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Ranking with Momentum – Smart Filters
 * GET /api/products/ranking/smart
 * Query: category, sort (popular|fresh|momentum|hidden_gems|rising_week), tags (comma), diversity=maker, minUpvotes, minComments, limit
 */
router.get("/ranking/smart", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const category = req.query.category;
    const sort = (req.query.sort || "popular").toLowerCase();
    const tagsParam = req.query.tags; // comma-separated, e.g. "AI,Productivity"
    const diversity = (req.query.diversity || "").toLowerCase();
    const minUpvotes = Math.max(0, parseInt(req.query.minUpvotes, 10) || 0);
    const minComments = Math.max(0, parseInt(req.query.minComments, 10) || 0);

    const query = {};
    if (category && category !== "All Categories") query.category = category;
    if (tagsParam && typeof tagsParam === "string") {
      const tagList = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length) {
        query.autoTags = { $in: tagList.map((t) => new RegExp(`^${t}$`, "i")) };
      }
    }

    let products = await Product.find(query).lean();

    const withMeta = products.map((p) => {
      const upvotesCount = Array.isArray(p.upvotes) ? p.upvotes.length : 0;
      const reviewsCount = p.totalcomments ?? (Array.isArray(p.reviews) ? p.reviews.length : 0);
      const daysSince = Math.max(
        1,
        (Date.now() - new Date(p.createdAt).getTime()) / (24 * 60 * 60 * 1000)
      );
      const momentum = (upvotesCount + reviewsCount * 1.5) / daysSince;
      return { ...p, upvotesCount, reviewsCount, momentum };
    });

    // Min engagement filters
    let filtered = withMeta.filter(
      (p) => p.upvotesCount >= minUpvotes && p.reviewsCount >= minComments
    );

    if (sort === "rising_week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter((p) => new Date(p.createdAt) >= oneWeekAgo);
      filtered.sort((a, b) => b.momentum - a.momentum);
    } else if (sort === "fresh") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "momentum") {
      filtered.sort((a, b) => b.momentum - a.momentum);
    } else if (sort === "hidden_gems") {
      const byUpvotes = [...filtered].sort((a, b) => b.upvotesCount - a.upvotesCount);
      const topCount = Math.max(1, Math.floor(byUpvotes.length * 0.25));
      const excludedIds = new Set(byUpvotes.slice(0, topCount).map((p) => p._id.toString()));
      filtered = filtered
        .filter(
          (p) =>
            !excludedIds.has(p._id.toString()) &&
            (p.upvotesCount >= 1 || p.reviewsCount >= 1)
        )
        .sort((a, b) => b.momentum - a.momentum);
    } else {
      filtered.sort(
        (a, b) =>
          b.upvotesCount - a.upvotesCount ||
          (b.reviewsCount - a.reviewsCount)
      );
    }

    // One per maker: keep first (best) product per author
    if (diversity === "maker") {
      const seen = new Set();
      filtered = filtered.filter((p) => {
        const key = p.author_id ? p.author_id.toString() : p.author_name || p._id.toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const out = filtered
      .slice(0, limit)
      .map((p) => ({ ...p, reviews: p.reviewsCount ?? p.totalcomments ?? 0 }));
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Get products by logged-in user
 */
router.get("/user/my-products", auth, async (req, res) => {
  try {
    const products = await Product.find({ author_id: req.user.id })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({
      message: "Products fetched successfully",
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 Get single product by slug (SEO)
 */
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.slug })
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


/**
 * 📌 Update/Edit a product
 */
router.put("/:id", auth, (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if user is the author
      if (product.author_id.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to edit this product" });
      }

      // Parse JSON strings back to objects/arrays
      const tags = req.body.tags ? JSON.parse(req.body.tags) : product.tags;
      const collaborators = req.body.collaborators ? JSON.parse(req.body.collaborators) : product.collaborators;

      // Handle multiple file uploads
      let media = product.media; // Keep existing media by default
      if (req.files && req.files.length > 0) {
        // Delete old media files if they exist
        product.media.forEach(mediaUrl => {
          const fileName = mediaUrl.split('/').pop();
          const filePath = path.join(process.cwd(), 'uploads/products', fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });

        // Add new media files
        media = req.files.map(file => 
          `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
        );
      }

      // Update product fields
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title || product.title,
          pitch: req.body.pitch || product.pitch,
          description: req.body.description || product.description,
          category: req.body.category || product.category,
          tags,
          media,
          websiteUrl: req.body.websiteUrl || product.websiteUrl,
          demoUrl: req.body.demoUrl || product.demoUrl,
          repoUrl: req.body.repoUrl || product.repoUrl,
          collaborators,
          updatedAt: new Date()
        },
        { new: true }
      );

      res.json({ 
        message: "✅ Product updated successfully", 
        product: updatedProduct 
      });
    } catch (error) {
      console.error('Edit product error:', error);
      res.status(400).json({ error: error.message });
    }
  });
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

/**
 * 📌 Delete a product
 * - Only product author or admin can delete
 * - Removes media files from uploads/products
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Authorization: allow author or admin
    const requesterId = req.user.id || req.user._id;
    const isAuthor = product.author_id && product.author_id.toString() === requesterId;
    const isAdmin = req.user.role === "admin";
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "Unauthorized to delete this product" });
    }

    // Delete media files from disk (if stored in uploads/products)
    if (Array.isArray(product.media)) {
      product.media.forEach(mediaUrl => {
        try {
          const fileName = mediaUrl.split("/").pop();
          if (!fileName) return;
          const filePath = path.join(process.cwd(), "uploads", "products", fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn("Failed to delete media file:", mediaUrl, err.message);
        }
      });
    }

    // Remove product from all wishlists
    await Wishlist.updateMany(
      { 'items.productId': req.params.id },
      { $pull: { items: { productId: req.params.id } } }
    );

    // Remove product document
    await Product.findByIdAndDelete(req.params.id);

    // Optionally: update related user stats (decrement counts) - keep minimal here

    res.json({ message: "✅ Product deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: error.message });
  }
});



export default router;
