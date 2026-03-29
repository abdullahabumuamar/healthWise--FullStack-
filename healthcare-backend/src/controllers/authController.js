import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, dateOfBirth, gender } = req.body;

    // Validation
    if (!email || !password || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and date of birth'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      dateOfBirth,
      gender: gender || null,
      role: 'patient'
    });

    // Create patient profile
    await Patient.create({ user: user._id });

    // Generate token
    const token = generateToken(user._id);

    // Format response to match frontend expectations
    // Frontend expects: id, email, dateOfBirth, gender, createdAt, savedTips, savedArticles, role
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        createdAt: user.createdAt,
        savedTips: [], // Empty array for new patient
        savedArticles: [], // Empty array for new patient
        role: 'patient'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (password is needed for comparison, but it's included by default in our schema)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Format response based on user role
    const { password: _, ...userWithoutPassword } = user.toObject();

    // For patients, include savedTips and savedArticles
    if (user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: user._id });
      
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          createdAt: user.createdAt,
          savedTips: patientProfile?.savedTips || [],
          savedArticles: patientProfile?.savedArticles || [],
          role: 'patient'
        }
      });
    }

    // For admins, return without savedTips/savedArticles
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        createdAt: user.createdAt,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

