import DietPlan from '../models/DietPlan.js';
import Patient from '../models/Patient.js';
import { getDietRecommendations, checkOllamaHealth } from '../services/ollamaService.js';

/**
 * @desc    Get diet recommendations using AI
 * @route   POST /api/diet/recommendations
 * @access  Private
 */
export const getDietRecommendationsController = async (req, res) => {
  try {
    const { healthGoals, dietaryPreferences, restrictions } = req.body;
    const userId = req.user._id;

    // Validation
    if (!healthGoals || healthGoals.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide health goals',
      });
    }

    // Check if Ollama is available
    const ollamaAvailable = await checkOllamaHealth();
    if (!ollamaAvailable) {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.',
      });
    }

    // Get patient profile
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    // Get AI recommendations
    const aiRecommendations = await getDietRecommendations(
      healthGoals,
      dietaryPreferences || '',
      restrictions || ''
    );

    // Return recommendations without saving (user will save manually)
    res.json({
      success: true,
      data: {
        recommendations: aiRecommendations,
        mealPlan: aiRecommendations,
        healthGoals,
        dietaryPreferences: dietaryPreferences || '',
        restrictions: restrictions || '',
      },
    });
  } catch (error) {
    console.error('Diet recommendations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get diet recommendations. Please try again.',
    });
  }
};

/**
 * @desc    Get user's diet plan history
 * @route   GET /api/diet/history
 * @access  Private
 */
export const getDietHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const patient = await Patient.findOne({ user: userId }).populate('dietPlans');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    // Sort by most recent first
    const sortedPlans = patient.dietPlans.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      data: sortedPlans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a diet plan entry
 * @route   DELETE /api/diet/:id
 * @access  Private
 */
export const deleteDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Diet plan ID is required',
      });
    }

    const dietPlan = await DietPlan.findById(id);

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan entry not found',
      });
    }

    // Ensure the user owns this diet plan
    const patient = await Patient.findOne({ user: userId });
    if (!patient || String(dietPlan.patient) !== String(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this diet plan',
      });
    }

    await DietPlan.findByIdAndDelete(id);

    // Remove from patient's array
    patient.dietPlans = patient.dietPlans.filter(
      (planId) => String(planId) !== String(id)
    );
    await patient.save();

    res.json({
      success: true,
      message: 'Diet plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting diet plan:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete diet plan',
    });
  }
};

/**
 * @desc    Save diet plan
 * @route   POST /api/diet/save
 * @access  Private
 */
export const saveDietPlan = async (req, res) => {
  try {
    const { healthGoals, dietaryPreferences, restrictions, recommendations } = req.body;
    const userId = req.user._id;

    // Validation
    if (!healthGoals || !recommendations) {
      return res.status(400).json({
        success: false,
        message: 'Health goals and recommendations are required',
      });
    }

    // Get patient profile
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    // Save diet plan
    const dietPlan = await DietPlan.create({
      patient: patient._id,
      healthGoals,
      dietaryPreferences: dietaryPreferences || '',
      restrictions: restrictions || '',
      aiRecommendations: recommendations,
      mealPlan: recommendations,
    });

    // Update patient's diet plans
    patient.dietPlans.push(dietPlan._id);
    await patient.save();

    res.json({
      success: true,
      message: 'Diet plan saved successfully',
      data: {
        planId: dietPlan._id,
      },
    });
  } catch (error) {
    console.error('Error saving diet plan:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save diet plan',
    });
  }
};
