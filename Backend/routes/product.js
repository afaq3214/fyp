import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import Product from "../models/Product.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import fs from 'fs';
import natural from 'natural';
import stopword from 'stopword';

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
