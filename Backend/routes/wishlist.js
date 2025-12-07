import express from 'express';
import { Wishlist } from '../models/Wishlist.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let wishlist = await Wishlist.findOne({ userId })
      .populate('items.productId', 'title description media upvotes category tags createdAt');
    
    if (!wishlist) {
      // Create a new wishlist for the user
      wishlist = new Wishlist({
        userId,
        name: 'My Wishlist',
        description: 'Products I love and want to save'
      });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist
router.post('/add', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, notes } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        name: 'My Wishlist',
        description: 'Products I love and want to save'
      });
    }
    
    // Check if item already exists in wishlist
    const existingItem = wishlist.items.find(item => 
      item.productId.toString() === productId
    );
    
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add item to wishlist
    wishlist.items.push({
      productId,
      notes: notes || ''
    });
    
    await wishlist.save();
    
    // Return updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findOne({ userId })
      .populate('items.productId', 'title description media upvotes category tags createdAt');
    
    res.status(201).json(updatedWishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Remove item from wishlist
    wishlist.items = wishlist.items.filter(item => 
      item.productId.toString() !== productId
    );
    
    await wishlist.save();
    
    // Return updated wishlist with populated product details
    const updatedWishlist = await Wishlist.findOne({ userId })
      .populate('items.productId', 'title description media upvotes category tags createdAt');
    
    res.json(updatedWishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
});

// Update wishlist details
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, description, isPublic } = req.body;
    
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      // Create if doesn't exist
      wishlist = new Wishlist({ userId });
    }
    
    if (name !== undefined) wishlist.name = name;
    if (description !== undefined) wishlist.description = description;
    if (isPublic !== undefined) wishlist.isPublic = isPublic;
    
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
});

// Update item notes
router.put('/item/:productId/notes', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { notes } = req.body;
    
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    const item = wishlist.items.find(item => 
      item.productId.toString() === productId
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    
    item.notes = notes;
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error updating item notes:', error);
    res.status(500).json({ message: 'Failed to update item notes' });
  }
});

// Check if product is in user's wishlist
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.json({ isInWishlist: false });
    }
    
    const isInWishlist = wishlist.items.some(item => 
      item.productId.toString() === productId
    );
    
    res.json({ isInWishlist });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ message: 'Failed to check wishlist' });
  }
});

// Get public wishlist by user ID
router.get('/public/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId, isPublic: true })
      .populate('items.productId', 'title description media upvotes category tags createdAt')
      .populate('userId', 'name profilePicture');
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Public wishlist not found' });
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching public wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch public wishlist' });
  }
});

export default router;
