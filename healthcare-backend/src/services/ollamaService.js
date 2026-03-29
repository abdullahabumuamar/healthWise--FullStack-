/**
 * Ollama Service
 * Handles all AI interactions using self-hosted Ollama
 * Model: llama3.2:3b
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

/**
 * Make a request to Ollama API
 * @param {string} endpoint - API endpoint (e.g., '/api/chat')
 * @param {object} data - Request body
 * @returns {Promise<object>} Response from Ollama
 */
const ollamaRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ollama request error:', error);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      throw new Error('Cannot connect to Ollama. Please ensure Ollama is running on ' + OLLAMA_BASE_URL);
    }
    throw new Error(`Failed to connect to Ollama: ${error.message}`);
  }
};

/**
 * Generate AI response using Ollama
 * @param {string} systemPrompt - System prompt/instructions
 * @param {string} userPrompt - User's question/input
 * @param {number} maxTokens - Maximum tokens in response (default: 2000)
 * @returns {Promise<string>} AI-generated response
 */
const generateResponse = async (systemPrompt, userPrompt, maxTokens = 2000) => {
  try {
    const response = await ollamaRequest('/api/chat', {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: maxTokens,
      },
    });

    if (response.message && response.message.content) {
      return response.message.content;
    }

    throw new Error('Invalid response format from Ollama');
  } catch (error) {
    console.error('Ollama generation error:', error);
    throw error;
  }
};

/**
 * Analyze symptoms using AI
 * @param {string} symptoms - User's symptoms description
 * @returns {Promise<string>} AI analysis and recommendations
 */
export const analyzeSymptoms = async (symptoms) => {
  const systemPrompt = `You are a helpful medical AI assistant. Analyze symptoms and provide:
1. Possible conditions (with clear disclaimers that this is NOT a diagnosis)
2. Recommendations for next steps
3. When to seek immediate medical attention

Always include disclaimers that your advice is not a substitute for professional medical care.
Be professional, empathetic, and clear in your responses.
Format your response in a clear, structured way.`;

  const userPrompt = `Please analyze the following symptoms and provide recommendations:

Symptoms: ${symptoms}

Provide a helpful, professional response with appropriate medical disclaimers.`;

  return await generateResponse(systemPrompt, userPrompt, 1500);
};

/**
 * Get diet recommendations using AI
 * @param {string} healthGoals - User's health goals
 * @param {string} dietaryPreferences - Dietary preferences (optional)
 * @param {string} restrictions - Dietary restrictions (optional)
 * @returns {Promise<string>} AI-generated diet recommendations
 */
export const getDietRecommendations = async (
  healthGoals,
  dietaryPreferences = '',
  restrictions = ''
) => {
  const systemPrompt = `You are a helpful nutrition AI assistant. Provide personalized dietary recommendations based on user's health goals, preferences, and restrictions.

Provide:
1. Personalized meal recommendations
2. Nutritional guidance
3. Sample meal plan
4. Tips for achieving health goals

Be specific, practical, and evidence-based. Always include a note that users should consult with a registered dietitian or healthcare provider for personalized medical nutrition therapy.
Format your response in a clear, structured way.`;

  const userPrompt = `Please provide personalized dietary recommendations based on:

Health Goals: ${healthGoals}
Dietary Preferences: ${dietaryPreferences || 'None specified'}
Restrictions: ${restrictions || 'None'}

Provide comprehensive, practical dietary advice.`;

  return await generateResponse(systemPrompt, userPrompt, 2000);
};

/**
 * Get exercise and sports recommendations using AI
 * @param {string} fitnessGoals - User's fitness goals
 * @param {string} currentFitnessLevel - Current fitness level (optional)
 * @param {string} preferences - Exercise preferences (optional)
 * @param {string} restrictions - Physical restrictions (optional)
 * @returns {Promise<string>} AI-generated exercise recommendations
 */
export const getExerciseRecommendations = async (
  fitnessGoals,
  currentFitnessLevel = '',
  preferences = '',
  restrictions = ''
) => {
  const systemPrompt = `You are a helpful fitness and sports AI assistant. Provide personalized exercise and sports recommendations based on user's fitness goals, current level, preferences, and restrictions.

Provide:
1. Personalized exercise recommendations
2. Workout routines tailored to goals
3. Sports activities that match preferences
4. Safety considerations and precautions
5. Progression plan

Be specific, practical, and safety-focused. Always include disclaimers that users should consult healthcare professionals or certified fitness trainers before starting new exercise programs, especially if they have health concerns or physical restrictions.
Format your response in a clear, structured way.`;

  const userPrompt = `Please provide personalized exercise and sports recommendations based on:

Fitness Goals: ${fitnessGoals}
Current Fitness Level: ${currentFitnessLevel || 'Not specified'}
Exercise Preferences: ${preferences || 'None specified'}
Physical Restrictions: ${restrictions || 'None'}

Provide comprehensive, safe, and practical exercise recommendations.`;

  return await generateResponse(systemPrompt, userPrompt, 2000);
};

/**
 * Check if Ollama is running and accessible
 * @returns {Promise<boolean>} True if Ollama is accessible
 */
export const checkOllamaHealth = async () => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Ollama health check failed:', error);
    return false;
  }
};

export default {
  analyzeSymptoms,
  getDietRecommendations,
  getExerciseRecommendations,
  checkOllamaHealth,
};
