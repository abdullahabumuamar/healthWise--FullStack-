import mongoose from 'mongoose';

const symptomCheckSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  symptoms: {
    type: String,
    required: true
  },
  aiAnalysis: {
    type: String,
    required: true
  },
  recommendations: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('SymptomCheck', symptomCheckSchema);

