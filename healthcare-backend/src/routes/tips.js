import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getTips,
  getTipById,
  createTip,
  updateTip,
  deleteTip
} from '../controllers/tipController.js';

const router = express.Router();

// Public routes
router.get('/', getTips);
router.get('/:id', getTipById);

// Admin routes
router.post('/', protect, authorize('admin'), createTip);
router.put('/:id', protect, authorize('admin'), updateTip);
router.delete('/:id', protect, authorize('admin'), deleteTip);

export default router;
