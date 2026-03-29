import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'About HealthWise'
  },
  subtitle: {
    type: String,
    default: 'Empowering healthy living through knowledge and smart tools.'
  },
  missionText: {
    type: String,
    default: ''
  },
  missionImage: {
    type: String,
    default: ''
  },
  visionText: {
    type: String,
    default: ''
  },
  visionImage: {
    type: String,
    default: ''
  },
  servicesCards: [{
    id: Number,
    title: String,
    description: String,
    image: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('About', aboutSchema);

