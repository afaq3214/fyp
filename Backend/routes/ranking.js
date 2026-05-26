// Backend/routes/ranking.js – Ranking with Momentum module
import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Comments from "../models/Comments.js";

const router = express.Router();

// Helper function to calculate momentum score
const calculateMomentum = (product) => {
  const upvotesCount = Array.isArray(product.upvotes) ? product.upvotes.length : 0;
  const reviewsCount = product.totalcomments || (Array.isArray(product.reviews) ? product.reviews.length : 0);
  const daysSince = Math.max(1, (Date.now() - new Date(product.createdAt).getTime()) / (24 * 60 * 60 * 1000));
  return (upvotesCount + reviewsCount * 1.5) / daysSince;
};

// ===============================
// POPULAR PRODUCTS (Most upvoted)
// ===============================
router.get("/popular", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 30);
    const timeframe = req.query.timeframe || 'all'; // 'day', 'week', 'month', 'all'
    
    let dateFilter = {};
    if (timeframe === 'day') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'week') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'month') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const popularProducts = await Product.aggregate([
      { $match: dateFilter },
      { $addFields: { 
        upvotesCount: { $size: { $ifNull: ["$upvotes", []] } },
        momentumScore: { $divide: [{ $add: [{ $size: { $ifNull: ["$upvotes", []] } }, { $multiply: ["$totalcomments", 1.5] }] }, { $max: [1, { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000] }] }] }
      }},
      { $sort: { upvotesCount: -1, momentumScore: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'author_id', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    ]);

    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// FRESH PRODUCTS (Recently launched)
// ===============================
router.get("/fresh", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 30);
    const hours = parseInt(req.query.hours, 10) || 24; // Default last 24 hours
    
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const freshProducts = await Product.find({
      createdAt: { $gte: cutoffDate }
    })
    .populate('author_id', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

    // Add momentum calculation
    const productsWithMomentum = freshProducts.map(product => ({
      ...product,
      momentum: calculateMomentum(product),
      freshness: Math.round((Date.now() - new Date(product.createdAt).getTime()) / (60 * 60 * 1000)) // hours ago
    }));

    res.json(productsWithMomentum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// HIDDEN GEMS (High quality, low visibility)
// ===============================
router.get("/hidden-gems", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 30);
    const minReviews = parseInt(req.query.minReviews, 10) || 3;
    const maxUpvotes = parseInt(req.query.maxUpvotes, 10) || 50;
    
    const hiddenGems = await Product.aggregate([
      {
        $match: {
          $and: [
            { totalcomments: { $gte: minReviews } },
            { $expr: { $lt: [{ $size: { $ifNull: ["$upvotes", []] } }, maxUpvotes] } }
          ]
        }
      },
      { $addFields: { 
        upvotesCount: { $size: { $ifNull: ["$upvotes", []] } },
        avgReviewQuality: { $cond: [{ $gt: ["$totalcomments", 0] }, { $divide: [{ $multiply: ["$totalcomments", 2] }, "$upvotesCount"] }, 0] },
        momentumScore: { $divide: [{ $add: [{ $size: { $ifNull: ["$upvotes", []] } }, { $multiply: ["$totalcomments", 1.5] }] }, { $max: [1, { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000] }] }] }
      }},
      { $match: { avgReviewQuality: { $gte: 1.5 } } },
      { $sort: { avgReviewQuality: -1, momentumScore: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'author_id', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    ]);

    res.json(hiddenGems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// SMART FILTERS (Advanced filtering)
// ===============================
router.get("/smart-filters", async (req, res) => {
  try {
    const {
      category,
      tags,
      minUpvotes,
      maxUpvotes,
      minReviews,
      timeframe,
      sortBy = 'momentum',
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    
    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      filter.autoTags = { $in: tagArray };
    }
    
    // Upvotes range
    if (minUpvotes || maxUpvotes) {
      filter.$expr = {};
      const upvotesCountField = { $size: { $ifNull: ["$upvotes", []] } };
      if (minUpvotes) filter.$expr.$gte = [upvotesCountField, parseInt(minUpvotes)];
      if (maxUpvotes) filter.$expr.$lte = [upvotesCountField, parseInt(maxUpvotes)];
    }
    
    // Reviews minimum
    if (minReviews) {
      filter.totalcomments = { $gte: parseInt(minReviews) };
    }
    
    // Timeframe
    if (timeframe && timeframe !== 'all') {
      let days = 1;
      if (timeframe === 'week') days = 7;
      else if (timeframe === 'month') days = 30;
      else if (timeframe === 'year') days = 365;
      
      filter.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    // Sorting options
    let sortField = {};
    switch (sortBy) {
      case 'upvotes':
        sortField = { upvotesCount: -1 };
        break;
      case 'reviews':
        sortField = { totalcomments: -1 };
        break;
      case 'newest':
        sortField = { createdAt: -1 };
        break;
      case 'oldest':
        sortField = { createdAt: 1 };
        break;
      case 'momentum':
      default:
        sortField = { momentumScore: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.aggregate([
      { $match: filter },
      { $addFields: { 
        upvotesCount: { $size: { $ifNull: ["$upvotes", []] } },
        momentumScore: { $divide: [{ $add: [{ $size: { $ifNull: ["$upvotes", []] } }, { $multiply: ["$totalcomments", 1.5] }] }, { $max: [1, { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000] }] }] }
      }},
      { $sort: sortField },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'users', localField: 'author_id', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    ]);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: { category, tags, minUpvotes, maxUpvotes, minReviews, timeframe, sortBy }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// MOMENTUM TRENDS (Real-time trending)
// ===============================
router.get("/momentum-trends", async (req, res) => {
  try {
    const hours = parseInt(req.query.hours, 10) || 24; // Default last 24 hours
    
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const trendingProducts = await Product.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: cutoffDate } },
            { updatedAt: { $gte: cutoffDate } }
          ]
        }
      },
      { $addFields: { 
        upvotesCount: { $size: { $ifNull: ["$upvotes", []] } },
        momentumScore: { $divide: [{ $add: [{ $size: { $ifNull: ["$upvotes", []] } }, { $multiply: ["$totalcomments", 1.5] }] }, { $max: [1, { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 86400000] }] }] }
      }},
      { $sort: { momentumScore: -1 } },
      { $limit: 20 },
      { $lookup: { from: 'users', localField: 'author_id', foreignField: '_id', as: 'author' } },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    ]);

    res.json(trendingProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
