import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} from '../controllers/articleController.js';

const router = express.Router();

// Public routes
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Admin routes
router.post('/', protect, authorize('admin'), createArticle);
router.put('/:id', protect, authorize('admin'), updateArticle);
router.delete('/:id', protect, authorize('admin'), deleteArticle);

export default router;
