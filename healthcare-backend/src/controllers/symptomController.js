import SymptomCheck from '../models/SymptomCheck.js';
import Patient from '../models/Patient.js';
import { analyzeSymptoms, checkOllamaHealth } from '../services/ollamaService.js';

/**
 * @desc    Analyze symptoms using AI
 * @route   POST /api/symptoms/analyze
 * @access  Private
 */
export const analyzeSymptomsController = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const userId = req.user._id;

    // Validation
    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide symptoms to analyze',
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

    // Get AI analysis
    const aiAnalysis = await analyzeSymptoms(symptoms);

    // Determine severity (keyword-based logic)
    let severity = 'low';
    const severeKeywords = [
      'emergency',
      'urgent',
      'immediate',
      'severe',
      'critical',
      'life-threatening',
      'call 911',
      'emergency room',
      'seek immediate',
    ];
    const analysisLower = aiAnalysis.toLowerCase();
    if (severeKeywords.some((keyword) => analysisLower.includes(keyword))) {
      severity = 'high';
    } else if (
      analysisLower.includes('moderate') ||
      analysisLower.includes('soon') ||
      analysisLower.includes('within 24') ||
      analysisLower.includes('within a day')
    ) {
      severity = 'medium';
    }

    // Return analysis without saving (user will save manually)
    res.json({
      success: true,
      data: {
        analysis: aiAnalysis,
        recommendations: aiAnalysis,
        severity,
        symptoms, // Include symptoms for saving later
      },
    });
  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze symptoms. Please try again.',
    });
  }
};

/**
 * @desc    Get user's symptom check history
 * @route   GET /api/symptoms/history
 * @access  Private
 */
export const getSymptomHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const patient = await Patient.findOne({ user: userId }).populate(
      'symptomChecks'
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    // Sort by most recent first
    const sortedChecks = patient.symptomChecks.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      data: sortedChecks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a symptom check entry
 * @route   DELETE /api/symptoms/:id
 * @access  Private
 */
export const deleteSymptomCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Symptom check ID is required',
      });
    }

    const symptomCheck = await SymptomCheck.findById(id);

    if (!symptomCheck) {
      return res.status(404).json({
        success: false,
        message: 'Symptom check entry not found',
      });
    }

    // Ensure the user owns this symptom check
    const patient = await Patient.findOne({ user: userId });
    if (!patient || String(symptomCheck.patient) !== String(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this symptom check',
      });
    }

    await SymptomCheck.findByIdAndDelete(id);

    // Remove from patient's array
    patient.symptomChecks = patient.symptomChecks.filter(
      (checkId) => String(checkId) !== String(id)
    );
    await patient.save();

    res.json({
      success: true,
      message: 'Symptom check deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting symptom check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete symptom check',
    });
  }
};

/**
 * @desc    Save symptom check analysis
 * @route   POST /api/symptoms/save
 * @access  Private
 */
export const saveSymptomCheck = async (req, res) => {
  try {
    const { symptoms, analysis, recommendations, severity } = req.body;
    const userId = req.user._id;

    // Validation
    if (!symptoms || !analysis) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms and analysis are required',
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

    // Save symptom check
    const symptomCheck = await SymptomCheck.create({
      patient: patient._id,
      symptoms,
      aiAnalysis: analysis,
      recommendations: recommendations || analysis,
      severity: severity || 'low',
    });

    // Update patient's symptom checks
    patient.symptomChecks.push(symptomCheck._id);
    await patient.save();

    res.json({
      success: true,
      message: 'Symptom check saved successfully',
      data: {
        checkId: symptomCheck._id,
      },
    });
  } catch (error) {
    console.error('Error saving symptom check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save symptom check',
    });
  }
};
