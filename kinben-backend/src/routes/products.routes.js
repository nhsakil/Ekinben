import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getCategories,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { responseCache } from '../utils/cache.js';

const router = express.Router();

// Public routes with caching
// Products list: cache for 5 minutes (products change infrequently)
router.get('/', responseCache('products', 300), getProducts);

// Categories: cache for 24 hours (rarely change)
router.get('/categories', responseCache('categories', 86400), getCategories);

// Search: cache for 10 minutes
router.get('/search', responseCache('search', 600), searchProducts);

// Individual product by ID: cache for 1 hour
router.get('/:id', responseCache('product-id', 3600), getProductById);

// Individual product by slug: cache for 1 hour
router.get('/slug/:slug', responseCache('product-slug', 3600), getProductBySlug);

// Admin routes (no caching on mutations)
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.patch('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
