import express from 'express';
import {
  subscribeNewsletter,
  getSubscribers,
  unsubscribeNewsletter,
  removeSubscriber,
  getNewsletterStats,
  batchUnsubscribe
} from '../controllers/newsletterController.js';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public route - Subscribe to newsletter
router.post('/subscribe', optionalAuthMiddleware, subscribeNewsletter);

// Unsubscribe route (public, uses token in email)
router.post('/unsubscribe/:id', unsubscribeNewsletter);

// Admin routes
router.get('/subscribers', authMiddleware, adminMiddleware, getSubscribers);
router.delete('/subscribers/:id', authMiddleware, adminMiddleware, removeSubscriber);
router.post('/subscribers/batch-unsubscribe', authMiddleware, adminMiddleware, batchUnsubscribe);
router.get('/stats', authMiddleware, adminMiddleware, getNewsletterStats);

export default router;
