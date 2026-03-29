/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, error: null };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }

  return { valid: true, error: null };
};

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @returns {object} - { valid: boolean, error: string, date: Date }
 */
export const validateDate = (date) => {
  if (!date) {
    return { valid: false, error: 'Date is required', date: null };
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format', date: null };
  }

  // Check if date is not in the future
  if (dateObj > new Date()) {
    return { valid: false, error: 'Date cannot be in the future', date: null };
  }

  return { valid: true, error: null, date: dateObj };
};

/**
 * Validate Base64 image string
 * @param {string} base64String - Base64 string to validate
 * @param {number} maxSizeMB - Maximum size in MB (default: 5)
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateBase64Image = (base64String, maxSizeMB = 5) => {
  if (!base64String || typeof base64String !== 'string') {
    return { valid: false, error: 'Image is required' };
  }

  // Check if it's a valid Base64 string
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
  if (!base64Regex.test(base64String)) {
    // Allow empty string or just base64 without prefix
    if (base64String.trim() === '') {
      return { valid: true, error: null };
    }
    
    // Check if it's just base64 data without prefix
    const base64DataRegex = /^[A-Za-z0-9+/=]+$/;
    if (base64DataRegex.test(base64String)) {
      // It's valid base64 but without prefix - this is acceptable
      return { valid: true, error: null };
    }
    
    return { valid: false, error: 'Invalid Base64 image format' };
  }

  // Extract the base64 data part
  const base64Data = base64String.split(',')[1] || base64String;
  
  // Calculate size (Base64 is ~33% larger than original)
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeMB) {
    return { 
      valid: false, 
      error: `Image size exceeds maximum allowed size of ${maxSizeMB}MB` 
    };
  }

  // Check image type from Base64 prefix
  const imageTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
  const matches = base64String.match(/data:image\/([^;]+)/i);
  if (matches && !imageTypes.includes(matches[1].toLowerCase())) {
    return { valid: false, error: 'Unsupported image type. Use JPEG, PNG, GIF, or WEBP' };
  }

  return { valid: true, error: null };
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input.trim();
};

/**
 * Sanitize email (trim and lowercase)
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return email;
  }

  return email.trim().toLowerCase();
};

