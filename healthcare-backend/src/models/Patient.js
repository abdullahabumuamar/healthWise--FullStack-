import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  savedTips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tip'
  }],
  savedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  symptomChecks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SymptomCheck'
  }],
    dietPlans: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietPlan'
    }],
    exercisePlans: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExercisePlan'
    }]
}, {
  timestamps: true
});

export default mongoose.model('Patient', patientSchema);

