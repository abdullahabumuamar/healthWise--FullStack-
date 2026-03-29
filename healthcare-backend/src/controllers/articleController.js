import Article from '../models/Article.js';
import Patient from '../models/Patient.js';
import { formatResponse, formatResponseArray } from '../utils/helpers.js';
import { validateBase64Image, sanitizeInput } from '../utils/validators.js';

/**
 * @desc    Get all articles
 * @route   GET /api/articles
 * @access  Public
 */
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    const formattedArticles = formatResponseArray(articles);
    
    res.json(formattedArticles);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch articles'
    });
  }
};

/**
 * @desc    Get article by ID
 * @route   GET /api/articles/:id
 * @access  Public
 */
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const formattedArticle = formatResponse(article);
    res.json(formattedArticle);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch article'
    });
  }
};

/**
 * @desc    Create new article
 * @route   POST /api/articles
 * @access  Private/Admin
 */
export const createArticle = async (req, res) => {
  try {
    const { title, subtitle, shortDescription, author, date, content, references, image } = req.body;

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

    // Prepare article data
    const articleData = {
      title: sanitizeInput(title),
      subtitle: subtitle ? sanitizeInput(subtitle) : '',
      shortDescription: shortDescription ? sanitizeInput(shortDescription) : '',
      author: author ? sanitizeInput(author) : 'HealthWise Team',
      date: date ? new Date(date) : new Date(),
      content: sanitizeInput(content),
      references: Array.isArray(references) ? references.map(ref => sanitizeInput(ref)) : [],
      image: image || ''
    };

    const article = await Article.create(articleData);
    const formattedArticle = formatResponse(article);

    res.status(201).json(formattedArticle);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create article'
    });
  }
};

/**
 * @desc    Update article
 * @route   PUT /api/articles/:id
 * @access  Private/Admin
 */
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, shortDescription, author, date, content, references, image } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
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
    if (title !== undefined) article.title = sanitizeInput(title);
    if (subtitle !== undefined) article.subtitle = sanitizeInput(subtitle);
    if (shortDescription !== undefined) article.shortDescription = sanitizeInput(shortDescription);
    if (author !== undefined) article.author = sanitizeInput(author);
    if (date !== undefined) article.date = new Date(date);
    if (content !== undefined) article.content = sanitizeInput(content);
    if (references !== undefined) {
      article.references = Array.isArray(references) 
        ? references.map(ref => sanitizeInput(ref)) 
        : [];
    }
    if (image !== undefined) article.image = image || '';

    await article.save();
    const formattedArticle = formatResponse(article);

    res.json(formattedArticle);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update article'
    });
  }
};

/**
 * @desc    Delete article
 * @route   DELETE /api/articles/:id
 * @access  Private/Admin
 */
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Delete the article
    await Article.findByIdAndDelete(id);

    // Cleanup: Remove this article ID from all patients' savedArticles arrays
    // Using $pull to remove the ObjectId from all patients who saved this article
    await Patient.updateMany(
      {},
      { $pull: { savedArticles: id } }
    );

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete article'
    });
  }
};

