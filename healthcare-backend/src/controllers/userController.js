import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Tip from '../models/Tip.js';
import Article from '../models/Article.js';
import SymptomCheck from '../models/SymptomCheck.js';
import DietPlan from '../models/DietPlan.js';
import ExercisePlan from '../models/ExercisePlan.js';
import { formatPatientData, formatUserData, formatResponseArray } from '../utils/helpers.js';
import { validateEmail, validatePassword, validateDate, sanitizeEmail, sanitizeInput } from '../utils/validators.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all patients
 * @route   GET /api/patients
 * @access  Private/Admin
 */
export const getPatients = async (req, res) => {
  try {
    const users = await User.find({ role: 'patient' }).sort({ createdAt: -1 });
    
    // Join with Patient model to get saved items
    const patients = await Promise.all(
      users.map(async (user) => {
        const patientProfile = await Patient.findOne({ user: user._id });
        return formatPatientData(user, patientProfile);
      })
    );

    res.json(patients);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch patients'
    });
  }
};

/**
 * @desc    Get all admins
 * @route   GET /api/admins
 * @access  Private/Admin
 */
export const getAdmins = async (req, res) => {
  try {
    const users = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
    const admins = users.map(user => formatUserData(user));
    
    res.json(admins);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admins'
    });
  }
};

/**
 * @desc    Get patient by ID
 * @route   GET /api/patients/:id
 * @access  Private (own profile or admin)
 */
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Check if user is accessing their own profile or is admin
    if (userRole !== 'admin' && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this patient'
      });
    }

    const user = await User.findById(id);

    if (!user || user.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const patientProfile = await Patient.findOne({ user: user._id });
    const formattedPatient = formatPatientData(user, patientProfile);

    res.json(formattedPatient);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch patient'
    });
  }
};

/**
 * @desc    Get admin by ID
 * @route   GET /api/admins/:id
 * @access  Private/Admin
 */
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    const user = await User.findById(id);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const formattedAdmin = formatUserData(user);
    res.json(formattedAdmin);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin'
    });
  }
};

/**
 * @desc    Create new patient (Admin only)
 * @route   POST /api/patients
 * @access  Private/Admin
 */
export const createPatient = async (req, res) => {
  try {
    const { email, password, dateOfBirth, gender } = req.body;

    // Validation
    if (!email || !password || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and date of birth'
      });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.error
      });
    }

    // Validate date
    const dateValidation = validateDate(dateOfBirth);
    if (!dateValidation.valid) {
      return res.status(400).json({
        success: false,
        message: dateValidation.error
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizeEmail(email) });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email: sanitizeEmail(email),
      password,
      dateOfBirth: dateValidation.date,
      gender: gender || null,
      role: 'patient'
    });

    // Create patient profile
    const patientProfile = await Patient.create({ user: user._id });

    // Format response
    const formattedPatient = formatPatientData(user, patientProfile);

    res.status(201).json(formattedPatient);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create patient'
    });
  }
};

/**
 * @desc    Update patient
 * @route   PUT /api/patients/:id
 * @access  Private (own profile or admin)
 */
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, dateOfBirth, gender, password } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Check if user is updating their own profile or is admin
    if (userRole !== 'admin' && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this patient'
      });
    }

    const user = await User.findById(id);

    if (!user || user.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Validate and update email if provided
    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.error
        });
      }
      
      // Check if email already exists (excluding current user)
      const emailExists = await User.findOne({ email: sanitizeEmail(email), _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      user.email = sanitizeEmail(email);
    }

    // Validate and update password if provided
    if (password !== undefined && password.trim() !== '') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error
        });
      }
      user.password = password; // Will be hashed by pre-save hook
    }

    // Validate and update dateOfBirth if provided
    if (dateOfBirth !== undefined) {
      const dateValidation = validateDate(dateOfBirth);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }
      user.dateOfBirth = dateValidation.date;
    }

    // Update gender if provided
    if (gender !== undefined) {
      if (gender === null || gender === '' || ['male', 'female', 'other'].includes(gender)) {
        user.gender = gender === '' ? null : gender;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender value'
        });
      }
    }

    await user.save();

    // Get updated patient with saved items
    const patientProfile = await Patient.findOne({ user: user._id });
    const formattedPatient = formatPatientData(user, patientProfile);

    res.json(formattedPatient);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update patient'
    });
  }
};

/**
 * @desc    Update admin
 * @route   PUT /api/admins/:id
 * @access  Private/Admin
 */
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, dateOfBirth, gender, password } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    const user = await User.findById(id);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Validate and update email if provided
    if (email !== undefined) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({
          success: false,
          message: emailValidation.error
        });
      }
      
      // Check if email already exists (excluding current user)
      const emailExists = await User.findOne({ email: sanitizeEmail(email), _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      user.email = sanitizeEmail(email);
    }

    // Validate and update password if provided
    if (password !== undefined && password.trim() !== '') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error
        });
      }
      user.password = password; // Will be hashed by pre-save hook
    }

    // Validate and update dateOfBirth if provided
    if (dateOfBirth !== undefined) {
      const dateValidation = validateDate(dateOfBirth);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error
        });
      }
      user.dateOfBirth = dateValidation.date;
    }

    // Update gender if provided
    if (gender !== undefined) {
      if (gender === null || gender === '' || ['male', 'female', 'other'].includes(gender)) {
        user.gender = gender === '' ? null : gender;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender value'
        });
      }
    }

    await user.save();
    const formattedAdmin = formatUserData(user);

    res.json(formattedAdmin);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update admin'
    });
  }
};

/**
 * @desc    Delete patient
 * @route   DELETE /api/patients/:id
 * @access  Private/Admin
 */
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const user = await User.findById(id);

    if (!user || user.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Find patient profile
    const patient = await Patient.findOne({ user: user._id });

    if (patient) {
      // Delete all related records
      // Delete symptom checks
      await SymptomCheck.deleteMany({ patient: patient._id });
      
      // Delete diet plans
      await DietPlan.deleteMany({ patient: patient._id });
      
      // Delete exercise plans
      await ExercisePlan.deleteMany({ patient: patient._id });
      
      // Delete patient profile
      await Patient.findByIdAndDelete(patient._id);
    }
    
    // Delete user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Patient and all related data deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete patient'
    });
  }
};

/**
 * @desc    Delete admin
 * @route   DELETE /api/admins/:id
 * @access  Private/Admin
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Prevent deleting yourself
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(id);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete admin'
    });
  }
};

/**
 * @desc    Save tip for patient
 * @route   POST /api/patients/:id/save-tip
 * @access  Private (own profile or admin)
 */
export const saveTip = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    if (!tipId) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required'
      });
    }

    // Check if user is accessing their own profile or is admin
    if (userRole !== 'admin' && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this patient'
      });
    }

    // Verify patient exists
    const user = await User.findById(id);
    if (!user || user.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify tip exists
    const tip = await Tip.findById(tipId);
    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }

    // Get or create patient profile
    let patientProfile = await Patient.findOne({ user: user._id });
    if (!patientProfile) {
      patientProfile = await Patient.create({ user: user._id });
    }

    // Check if tip is already saved
    const tipObjectId = new mongoose.Types.ObjectId(tipId);
    if (patientProfile.savedTips.some(savedId => savedId.toString() === tipId)) {
      return res.status(400).json({
        success: false,
        message: 'Tip is already saved'
      });
    }

    // Add tip to saved tips
    patientProfile.savedTips.push(tipObjectId);
    await patientProfile.save();

    // Get updated patient data
    const updatedUser = await User.findById(id);
    const updatedPatientProfile = await Patient.findOne({ user: id });
    const formattedPatient = formatPatientData(updatedUser, updatedPatientProfile);

    res.json({
      success: true,
      patient: formattedPatient
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save tip'
    });
  }
};

/**
 * @desc    Remove saved tip from patient
 * @route   DELETE /api/patients/:id/save-tip/:tipId
 * @access  Private (own profile or admin)
 */
export const unsaveTip = async (req, res) => {
  try {
    const { id, tipId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!id || !tipId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and Tip ID are required'
      });
    }

    // Check if user is accessing their own profile or is admin
    if (userRole !== 'admin' && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this patient'
      });
    }

    // Get patient profile
    const patientProfile = await Patient.findOne({ user: id });
    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Remove tip from saved tips
    patientProfile.savedTips = patientProfile.savedTips.filter(
      savedId => savedId.toString() !== tipId
    );
    await patientProfile.save();

    // Get updated patient data
    const updatedUser = await User.findById(id);
    const updatedPatientProfile = await Patient.findOne({ user: id });
    const formattedPatient = formatPatientData(updatedUser, updatedPatientProfile);

    res.json({
      success: true,
      patient: formattedPatient
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unsave tip'
    });
  }
};

/**
 * @desc    Save article for patient
 * @route   POST /api/patients/:id/save-article
 * @access  Private (own profile or admin)
 */
export const saveArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { articleId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }

    // Check if user is accessing their own profile or is admin
    if (userRole !== 'admin' && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this patient'
      });
    }

    // Verify patient exists
    const user = await User.findById(id);
    if (!user || user.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get or create patient profile
    let patientProfile = await Patient.findOne({ user: user._id });
    if (!patientProfile) {
      patientProfile = await Patient.create({ user: user._id });
    }

    // Check if article is already saved
    if (patientProfile.savedArticles.some(savedId => savedId.toString() === articleId)) {
      return res.status(400).json({
        success: false,
        message: 'Article is already saved'
      });
    }

    // Add article to saved articles
    const articleObjectId = new mongoose.Types.ObjectId(articleId);
    patientProfile.savedArticles.push(articleObjectId);
    await patientProfile.save();

    // Get updated patient data
    const updatedUser = await User.findById(id);
    const updatedPatientProfile = await Patient.findOne({ user: id });
    const formattedPatient = formatPatientData(updatedUser, updatedPatientProfile);

    res.json({
      success: true,
      patient: formattedPatient
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save article'
    });
  }
};

/**
 * @desc    Remove saved article from patient
 * @route   DELETE /api/patients/:id/save-article/:articleId
 * @access  Private (own profile or admin)
 */
export const unsaveArticle = async (req, res) => {
  try {
    const { id, articleId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!id || !articleId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and Article ID are required'
      });
    }

    // Check if user is accessing their own profile or is admin
    if (userRole !== 'admin' && id !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this patient'
      });
    }

    // Get patient profile
    const patientProfile = await Patient.findOne({ user: id });
    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Remove article from saved articles
    patientProfile.savedArticles = patientProfile.savedArticles.filter(
      savedId => savedId.toString() !== articleId
    );
    await patientProfile.save();

    // Get updated patient data
    const updatedUser = await User.findById(id);
    const updatedPatientProfile = await Patient.findOne({ user: id });
    const formattedPatient = formatPatientData(updatedUser, updatedPatientProfile);

    res.json({
      success: true,
      patient: formattedPatient
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unsave article'
    });
  }
};

