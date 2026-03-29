import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDietRecommendationsController,
  getDietHistory,
  deleteDietPlan,
  saveDietPlan,
} from '../controllers/dietController.js';

const router = express.Router();

router.post('/recommendations', protect, getDietRecommendationsController);
router.post('/save', protect, saveDietPlan);
router.delete('/:id', protect, deleteDietPlan);
router.get('/history', protect, getDietHistory);

export default router;

