import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: 'HealthWise Team'
  },
  date: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: true
  },
  references: [{
    type: String
  }],
  image: {
    type: String, // Base64 encoded image string
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Article', articleSchema);

