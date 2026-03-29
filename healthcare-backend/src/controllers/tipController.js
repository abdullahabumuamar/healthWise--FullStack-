import Tip from '../models/Tip.js';
import Patient from '../models/Patient.js';
import { formatResponse, formatResponseArray } from '../utils/helpers.js';
import { validateBase64Image, sanitizeInput } from '../utils/validators.js';

/**
 * @desc    Get all tips
 * @route   GET /api/tips
 * @access  Public
 */
export const getTips = async (req, res) => {
  try {
    const tips = await Tip.find().sort({ createdAt: -1 });
    const formattedTips = formatResponseArray(tips);
    
    res.json(formattedTips);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch tips'
    });
  }
};

/**
 * @desc    Get tip by ID
 * @route   GET /api/tips/:id
 * @access  Public
 */
export const getTipById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required'
      });
    }

    const tip = await Tip.findById(id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }

    const formattedTip = formatResponse(tip);
    res.json(formattedTip);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tip ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch tip'
    });
  }
};

/**
 * @desc    Create new tip
 * @route   POST /api/tips
 * @access  Private/Admin
 */
export const createTip = async (req, res) => {
  try {
    const { title, subtitle, content, image } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Validate image if provided
    if (image && image.trim() !== '') {
      const imageValidation = validateBase64Image(image);
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: imageValidation.error
        });
      }
    }

    // Prepare tip data
    const tipData = {
      title: sanitizeInput(title),
      subtitle: subtitle ? sanitizeInput(subtitle) : '',
      content: sanitizeInput(content),
      image: image || ''
    };

    const tip = await Tip.create(tipData);
    const formattedTip = formatResponse(tip);

    res.status(201).json(formattedTip);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create tip'
    });
  }
};

/**
 * @desc    Update tip
 * @route   PUT /api/tips/:id
 * @access  Private/Admin
 */
export const updateTip = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, image } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required'
      });
    }

    const tip = await Tip.findById(id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }

    // Validate image if provided
    if (image && image.trim() !== '') {
      const imageValidation = validateBase64Image(image);
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: imageValidation.error
        });
      }
    }

    // Update fields
    if (title !== undefined) tip.title = sanitizeInput(title);
    if (subtitle !== undefined) tip.subtitle = sanitizeInput(subtitle);
    if (content !== undefined) tip.content = sanitizeInput(content);
    if (image !== undefined) tip.image = image || '';

    await tip.save();
    const formattedTip = formatResponse(tip);

    res.json(formattedTip);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tip ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update tip'
    });
  }
};

/**
 * @desc    Delete tip
 * @route   DELETE /api/tips/:id
 * @access  Private/Admin
 */
export const deleteTip = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required'
      });
    }

    const tip = await Tip.findById(id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found'
      });
    }

    // Delete the tip
    await Tip.findByIdAndDelete(id);

    // Cleanup: Remove this tip ID from all patients' savedTips arrays
    // Using $pull to remove the ObjectId from all patients who saved this tip
    await Patient.updateMany(
      {},
      { $pull: { savedTips: id } }
    );

    res.json({
      success: true,
      message: 'Tip deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tip ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete tip'
    });
  }
};

