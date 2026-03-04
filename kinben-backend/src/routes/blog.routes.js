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
import { responseCache } from '../utils/cache.js';

const router = express.Router();

// Public routes with caching
// Blog list: cache for 30 minutes
router.get('/', responseCache('blog-list', 1800), getBlogPosts);

// Blog by ID: cache for 2 hours
router.get('/:id', responseCache('blog-id', 7200), getBlogPostById);

// Blog by slug: cache for 2 hours
router.get('/slug/:slug', responseCache('blog-slug', 7200), getBlogPostBySlug);

// Admin routes (no caching on mutations)
router.post('/', authMiddleware, adminMiddleware, createBlogPost);
router.patch('/:id', authMiddleware, adminMiddleware, updateBlogPost);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBlogPost);

export default router;