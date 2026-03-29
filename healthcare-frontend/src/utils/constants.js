/**
 * Application constants
 */

// Pagination
export const PAGINATION = {
  USERS_PER_PAGE: 10,
  DEFAULT_PAGE: 1
}

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_SIZE_MB: 5
}

// Validation Messages
export const VALIDATION_MESSAGES = {
  IMAGE_REQUIRED: 'Please select an image file',
  IMAGE_SIZE_EXCEEDED: 'Image size should be less than 5MB',
  IMAGE_TYPE_INVALID: 'Please select a valid image file (PNG, JPG, GIF, WEBP)',
  FIELDS_REQUIRED: 'Please fill in all required fields',
  ALL_FIELDS_REQUIRED: 'Please fill in all fields'
}

// Input Length Limits
export const INPUT_LIMITS = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  CONTENT_MAX_LENGTH: 10000, // For articles/tips content
  TITLE_MAX_LENGTH: 200, // For article/tip titles
  NAME_MAX_LENGTH: 100 // For user names
}

// Age Requirements
export const AGE_REQUIREMENTS = {
  MIN_AGE: 13, // Minimum age to register
  MAX_AGE: 150 // Maximum reasonable age
}


