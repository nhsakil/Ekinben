import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist
} from '../controllers/wishlistController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get wishlist
router.get('/', getWishlist);

// Check if product in wishlist
router.get('/check/:productId', isInWishlist);

// Add to wishlist
router.post('/', addToWishlist);

// Remove from wishlist
router.delete('/:itemId', removeFromWishlist);

// Clear wishlist
router.delete('/', clearWishlist);

export default router;

