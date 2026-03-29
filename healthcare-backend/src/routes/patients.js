import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  saveTip,
  unsaveTip,
  saveArticle,
  unsaveArticle
} from '../controllers/userController.js';

const router = express.Router();

// Admin route - Get all patients
router.get('/', protect, authorize('admin'), getPatients);

// Admin route - Create new patient
router.post('/', protect, authorize('admin'), createPatient);

// Protected route - Get patient by ID
router.get('/:id', protect, getPatientById);

// Protected route - Update patient
router.put('/:id', protect, updatePatient);

// Admin route - Delete patient
router.delete('/:id', protect, authorize('admin'), deletePatient);

// Protected routes - Patient saved items
router.post('/:id/save-tip', protect, saveTip);
router.delete('/:id/save-tip/:tipId', protect, unsaveTip);
router.post('/:id/save-article', protect, saveArticle);
router.delete('/:id/save-article/:articleId', protect, unsaveArticle);

export default router;

