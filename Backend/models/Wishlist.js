import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  }
});

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    default: 'My Wishlist',
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 300,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  items: [wishlistItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field when items are modified
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
