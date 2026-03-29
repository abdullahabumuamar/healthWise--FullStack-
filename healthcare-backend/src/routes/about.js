import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAbout,
  createAbout,
  updateAbout
} from '../controllers/aboutController.js';

const router = express.Router();

// Public route
router.get('/', getAbout);

// Admin routes
router.post('/', protect, authorize('admin'), createAbout);
router.put('/:id', protect, authorize('admin'), updateAbout);

export default router;
