import express from 'express';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getReviewsForModeration,
  approveReview,
  rejectReview
} from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/auth.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/product/:productId', getProductReviews);

// User routes (auth required)
router.post('/', authMiddleware, createReview);
router.patch('/:reviewId', authMiddleware, updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);
router.post('/:reviewId/helpful', optionalAuthMiddleware, markHelpful);

// Admin routes
router.get('/admin/pending', authMiddleware, adminMiddleware, getReviewsForModeration);
router.patch('/:reviewId/approve', authMiddleware, adminMiddleware, approveReview);
router.patch('/:reviewId/reject', authMiddleware, adminMiddleware, rejectReview);

export default router;
