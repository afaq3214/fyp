import express from "express";
import Product from "../models/Product.js";
import natural from "natural";
import { removeStopwords } from "stopword";

const router = express.Router();
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// POST /api/discover/problem — rank products by relevance to a user-described problem
router.post("/problem", async (req, res) => {
  try {
    const { problem } = req.body;
    if (!problem || !problem.trim())
      return res.status(400).json({ error: "Problem description is required" });

    const products = await Product.find({ flagged: { $ne: true } })
      .populate("createdBy", "name profilePicture");

    if (!products.length)
      return res.status(200).json({ data: [], query: problem, totalFound: 0, keywords: [] });

    // Tokenize and strip stopwords
    const rawTokens = tokenizer.tokenize(problem.toLowerCase()) || [];
    const queryTokens = removeStopwords(rawTokens).filter(t => t.length > 2);

    if (!queryTokens.length)
      return res.status(200).json({ data: [], query: problem, totalFound: 0, keywords: [] });

    // Build TF-IDF corpus
    const tfidf = new TfIdf();
    products.forEach(product => {
      const docText = [
        product.title || "",
        product.pitch || "",
        product.description || "",
        (product.autoTags || []).join(" "),
        product.category || ""
      ].join(" ").toLowerCase();
      tfidf.addDocument(docText);
    });

    // Score each product
    const scoredProducts = products.map((product, index) => {
      let score = 0;

      queryTokens.forEach(term => {
        score += tfidf.tfidf(term, index);
      });

      // Title match bonus
      const titleLower = (product.title || "").toLowerCase();
      queryTokens.forEach(term => {
        if (titleLower.includes(term)) score += 3;
      });

      // Tag match bonus
      const tagsLower = (product.autoTags || []).map(t => t.toLowerCase());
      queryTokens.forEach(term => {
        if (tagsLower.some(tag => tag.includes(term))) score += 2;
      });

      // Pitch match bonus
      const pitchLower = (product.pitch || "").toLowerCase();
      queryTokens.forEach(term => {
        if (pitchLower.includes(term)) score += 1;
      });

      const productText = [
        product.title, product.pitch, product.description,
        ...(product.autoTags || [])
      ].join(" ").toLowerCase();

      const matchedKeywords = queryTokens.filter(term => productText.includes(term));

      return { product, score, matchedKeywords };
    });

    const results = scoredProducts
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(({ product, score, matchedKeywords }) => ({
        ...product.toObject(),
        relevanceScore: Math.round(score * 100) / 100,
        matchedKeywords
      }));

    res.status(200).json({
      data: results,
      query: problem,
      totalFound: results.length,
      keywords: queryTokens
    });
  } catch (error) {
    console.error("Discovery error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
