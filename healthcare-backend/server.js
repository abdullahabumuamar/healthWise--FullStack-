import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './src/config/database.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { protect } from './src/middleware/auth.js';

// Import routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import patientRoutes from './src/routes/patients.js';
import adminRoutes from './src/routes/admins.js';
import articleRoutes from './src/routes/articles.js';
import tipRoutes from './src/routes/tips.js';
import aboutRoutes from './src/routes/about.js';
import symptomRoutes from './src/routes/symptoms.js';
import dietRoutes from './src/routes/diet.js';
import exerciseRoutes from './src/routes/exercise.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
// Increase body size limit to handle Base64 images (up to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/exercise', exerciseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test protected routes (for testing authentication)
app.get('/api/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

app.get('/api/test-protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

