import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
} from '../controllers/userController.js';

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getAdmins);
router.get('/:id', protect, authorize('admin'), getAdminById);
router.put('/:id', protect, authorize('admin'), updateAdmin);
router.delete('/:id', protect, authorize('admin'), deleteAdmin);

export default router;

