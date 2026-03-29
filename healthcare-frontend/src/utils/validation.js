/**
 * Validation utility functions for input validation and sanitization
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    return { valid: false, error: 'Email cannot be empty' }
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  // Email length validation (RFC 5321)
  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email is too long (maximum 254 characters)' }
  }
  
  return { valid: true }
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  
  // Minimum length
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  // Maximum length
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (maximum 128 characters)' }
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }
  
  // Number
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}

/**
 * Validates date of birth
 * @param {string} dateOfBirth - Date string to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return { valid: false, error: 'Date of birth is required' }
  }
  
  const date = new Date(dateOfBirth)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to compare dates only
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }
  
  // Check if date is in the future
  if (date > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' }
  }
  
  // Check if date is too old (reasonable age limit, e.g., 150 years)
  const minDate = new Date()
  minDate.setFullYear(today.getFullYear() - 150)
  if (date < minDate) {
    return { valid: false, error: 'Date of birth is too old' }
  }
  
  // Check minimum age (e.g., 13 years old)
  const minAge = new Date()
  minAge.setFullYear(today.getFullYear() - 13)
  if (date > minAge) {
    return { valid: false, error: 'You must be at least 13 years old' }
  }
  
  return { valid: true }
}

/**
 * Sanitizes input by trimming whitespace
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.trim()
}

/**
 * Sanitizes email by trimming and converting to lowercase
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export const sanitizeEmail = (email) => {
  return sanitizeInput(email).toLowerCase()
}

/**
 * Validates password confirmation match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' }
  }
  return { valid: true }
}

/**
 * Validates input length
 * @param {string} input - Input to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field for error message
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validateLength = (input, minLength, maxLength, fieldName = 'Input') => {
  if (!input && minLength > 0) {
    return { valid: false, error: `${fieldName} is required` }
  }
  
  if (input && input.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }
  
  if (input && input.length > maxLength) {
    return { valid: false, error: `${fieldName} must be no more than ${maxLength} characters` }
  }
  
  return { valid: true }
}

