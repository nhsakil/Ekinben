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

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.patch('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
