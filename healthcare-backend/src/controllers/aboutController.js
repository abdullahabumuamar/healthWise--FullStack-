import About from '../models/About.js';
import { formatResponse } from '../utils/helpers.js';
import { validateBase64Image, sanitizeInput } from '../utils/validators.js';

/**
 * @desc    Get about page data
 * @route   GET /api/about
 * @access  Public
 */
export const getAbout = async (req, res) => {
  try {
    const about = await About.findOne();

    // Frontend expects array format even if single item
    if (!about) {
      return res.json([]);
    }

    const formattedAbout = formatResponse(about);
    res.json([formattedAbout]); // Return as array
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch about page'
    });
  }
};

/**
 * @desc    Create about page (if doesn't exist)
 * @route   POST /api/about
 * @access  Private/Admin
 */
export const createAbout = async (req, res) => {
  try {
    // Check if about page already exists
    const existingAbout = await About.findOne();
    if (existingAbout) {
      return res.status(400).json({
        success: false,
        message: 'About page already exists. Use PUT to update.'
      });
    }

    const { title, subtitle, missionText, missionImage, visionText, visionImage, servicesCards } = req.body;

    // Validate images if provided
    if (missionImage && missionImage.trim() !== '') {
      const imageValidation = validateBase64Image(missionImage);
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `Mission image: ${imageValidation.error}`
        });
      }
    }

    if (visionImage && visionImage.trim() !== '') {
      const imageValidation = validateBase64Image(visionImage);
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `Vision image: ${imageValidation.error}`
        });
      }
    }

    // Prepare about data
    const aboutData = {
      title: title ? sanitizeInput(title) : 'About HealthWise',
      subtitle: subtitle ? sanitizeInput(subtitle) : 'Empowering healthy living through knowledge and smart tools.',
      missionText: missionText ? sanitizeInput(missionText) : '',
      missionImage: missionImage || '',
      visionText: visionText ? sanitizeInput(visionText) : '',
      visionImage: visionImage || '',
      servicesCards: Array.isArray(servicesCards) ? servicesCards : []
    };

    const about = await About.create(aboutData);
    const formattedAbout = formatResponse(about);

    res.status(201).json(formattedAbout);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create about page'
    });
  }
};

/**
 * @desc    Update about page
 * @route   PUT /api/about/:id
 * @access  Private/Admin
 */
export const updateAbout = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, missionText, missionImage, visionText, visionImage, servicesCards } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'About page ID is required'
      });
    }

    const about = await About.findById(id);

    if (!about) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    // Validate images if provided
    if (missionImage && missionImage.trim() !== '') {
      const imageValidation = validateBase64Image(missionImage);
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `Mission image: ${imageValidation.error}`
        });
      }
    }

    if (visionImage && visionImage.trim() !== '') {
      const imageValidation = validateBase64Image(visionImage);
      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `Vision image: ${imageValidation.error}`
        });
      }
    }

    // Update fields
    if (title !== undefined) about.title = sanitizeInput(title);
    if (subtitle !== undefined) about.subtitle = sanitizeInput(subtitle);
    if (missionText !== undefined) about.missionText = sanitizeInput(missionText);
    if (missionImage !== undefined) about.missionImage = missionImage || '';
    if (visionText !== undefined) about.visionText = sanitizeInput(visionText);
    if (visionImage !== undefined) about.visionImage = visionImage || '';
    if (servicesCards !== undefined) {
      about.servicesCards = Array.isArray(servicesCards) ? servicesCards : [];
    }

    await about.save();
    const formattedAbout = formatResponse(about);

    res.json(formattedAbout);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid about page ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update about page'
    });
  }
};

