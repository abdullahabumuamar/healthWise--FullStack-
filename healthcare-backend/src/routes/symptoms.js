import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  analyzeSymptomsController,
  getSymptomHistory,
  deleteSymptomCheck,
  saveSymptomCheck,
} from '../controllers/symptomController.js';

const router = express.Router();

router.post('/analyze', protect, analyzeSymptomsController);
router.post('/save', protect, saveSymptomCheck);
router.delete('/:id', protect, deleteSymptomCheck);
router.get('/history', protect, getSymptomHistory);

export default router;

