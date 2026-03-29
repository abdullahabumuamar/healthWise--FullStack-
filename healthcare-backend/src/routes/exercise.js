import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getExerciseRecommendationsController,
  getExerciseHistory,
  deleteExercisePlan,
  saveExercisePlan,
} from '../controllers/exerciseController.js';

const router = express.Router();

router.post('/recommendations', protect, getExerciseRecommendationsController);
router.post('/save', protect, saveExercisePlan);
router.delete('/:id', protect, deleteExercisePlan);
router.get('/history', protect, getExerciseHistory);

export default router;

