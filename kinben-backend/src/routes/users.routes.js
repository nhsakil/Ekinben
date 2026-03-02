import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', getUserProfile);
router.patch('/profile', updateUserProfile);

// Address routes
router.post('/addresses', createAddress);
router.get('/addresses', getAddresses);
router.patch('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;
