import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// User routes (authenticated)
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/:orderId', authMiddleware, getOrderById);
router.post('/:orderId/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.patch('/:orderId', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
