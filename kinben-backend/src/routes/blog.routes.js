import express from 'express';
import {
  getBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from '../controllers/blogController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:id', getBlogPostById);
router.get('/slug/:slug', getBlogPostBySlug);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createBlogPost);
router.patch('/:id', authMiddleware, adminMiddleware, updateBlogPost);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBlogPost);

export default router;

