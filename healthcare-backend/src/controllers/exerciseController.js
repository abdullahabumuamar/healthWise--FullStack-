import ExercisePlan from '../models/ExercisePlan.js';
import Patient from '../models/Patient.js';
import { getExerciseRecommendations, checkOllamaHealth } from '../services/ollamaService.js';

/**
 * @desc    Get exercise and sports recommendations using AI
 * @route   POST /api/exercise/recommendations
 * @access  Private
 */
export const getExerciseRecommendationsController = async (req, res) => {
  try {
    const { fitnessGoals, currentFitnessLevel, preferences, restrictions } = req.body;
    const userId = req.user._id;

    // Validation
    if (!fitnessGoals || fitnessGoals.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fitness goals',
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
    const aiRecommendations = await getExerciseRecommendations(
      fitnessGoals,
      currentFitnessLevel || '',
      preferences || '',
      restrictions || ''
    );

    // Return recommendations without saving (user will save manually)
    res.json({
      success: true,
      data: {
        recommendations: aiRecommendations,
        workoutPlan: aiRecommendations,
        fitnessGoals,
        currentFitnessLevel: currentFitnessLevel || '',
        preferences: preferences || '',
        restrictions: restrictions || '',
      },
    });
  } catch (error) {
    console.error('Exercise recommendations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get exercise recommendations. Please try again.',
    });
  }
};

/**
 * @desc    Get user's exercise plan history
 * @route   GET /api/exercise/history
 * @access  Private
 */
export const getExerciseHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const patient = await Patient.findOne({ user: userId }).populate('exercisePlans');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    // Sort by most recent first
    const sortedPlans = patient.exercisePlans.sort(
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
 * @desc    Delete an exercise plan entry
 * @route   DELETE /api/exercise/:id
 * @access  Private
 */
export const deleteExercisePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Exercise plan ID is required',
      });
    }

    const exercisePlan = await ExercisePlan.findById(id);

    if (!exercisePlan) {
      return res.status(404).json({
        success: false,
        message: 'Exercise plan entry not found',
      });
    }

    // Ensure the user owns this exercise plan
    const patient = await Patient.findOne({ user: userId });
    if (!patient || String(exercisePlan.patient) !== String(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this exercise plan',
      });
    }

    await ExercisePlan.findByIdAndDelete(id);

    // Remove from patient's array
    patient.exercisePlans = patient.exercisePlans.filter(
      (planId) => String(planId) !== String(id)
    );
    await patient.save();

    res.json({
      success: true,
      message: 'Exercise plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting exercise plan:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete exercise plan',
    });
  }
};

/**
 * @desc    Save exercise plan
 * @route   POST /api/exercise/save
 * @access  Private
 */
export const saveExercisePlan = async (req, res) => {
  try {
    const { fitnessGoals, currentFitnessLevel, preferences, restrictions, recommendations } = req.body;
    const userId = req.user._id;

    // Validation
    if (!fitnessGoals || !recommendations) {
      return res.status(400).json({
        success: false,
        message: 'Fitness goals and recommendations are required',
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

    // Save exercise plan
    const exercisePlan = await ExercisePlan.create({
      patient: patient._id,
      fitnessGoals,
      currentFitnessLevel: currentFitnessLevel || '',
      preferences: preferences || '',
      restrictions: restrictions || '',
      aiRecommendations: recommendations,
      workoutPlan: recommendations,
    });

    // Update patient's exercise plans
    patient.exercisePlans.push(exercisePlan._id);
    await patient.save();

    res.json({
      success: true,
      message: 'Exercise plan saved successfully',
      data: {
        planId: exercisePlan._id,
      },
    });
  } catch (error) {
    console.error('Error saving exercise plan:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save exercise plan',
    });
  }
};
