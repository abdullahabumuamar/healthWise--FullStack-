import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPatients,
  getAdmins,
  getPatientById,
  getAdminById,
  updatePatient,
  updateAdmin,
  deletePatient,
  deleteAdmin,
  saveTip,
  unsaveTip,
  saveArticle,
  unsaveArticle
} from '../controllers/userController.js';

const router = express.Router();

// Admin routes - Get all users
router.get('/patients', protect, authorize('admin'), getPatients);
router.get('/admins', protect, authorize('admin'), getAdmins);

// Protected routes - Get user by ID
router.get('/patients/:id', protect, getPatientById);
router.get('/admins/:id', protect, authorize('admin'), getAdminById);

// Protected routes - Update users
router.put('/patients/:id', protect, updatePatient);
router.put('/admins/:id', protect, authorize('admin'), updateAdmin);

// Admin routes - Delete users
router.delete('/patients/:id', protect, authorize('admin'), deletePatient);
router.delete('/admins/:id', protect, authorize('admin'), deleteAdmin);

// Protected routes - Patient saved items
router.post('/patients/:id/save-tip', protect, saveTip);
router.delete('/patients/:id/save-tip/:tipId', protect, unsaveTip);
router.post('/patients/:id/save-article', protect, saveArticle);
router.delete('/patients/:id/save-article/:articleId', protect, unsaveArticle);

export default router;
