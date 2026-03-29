import mongoose from 'mongoose';

const dietPlanSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  healthGoals: {
    type: String,
    required: true
  },
  dietaryPreferences: {
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
  mealPlan: {
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

export default mongoose.model('DietPlan', dietPlanSchema);

