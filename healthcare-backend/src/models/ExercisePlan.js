import mongoose from 'mongoose';

const exercisePlanSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fitnessGoals: {
    type: String,
    required: true
  },
  currentFitnessLevel: {
    type: String,
    default: ''
  },
  preferences: {
    type: String,
    default: ''
  },
  restrictions: {
    type: String,
    default: ''
  },
  aiRecommendations: {
    type: String,
    required: true
  },
  workoutPlan: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('ExercisePlan', exercisePlanSchema);

