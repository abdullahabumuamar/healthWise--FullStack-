/**
 * Date utility functions
 */

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string or date string
 * @param {object} options - Formatting options
 * @param {string} options.monthFormat - 'long' or 'short' (default: 'long')
 * @param {string} options.fallback - Fallback value if date is invalid (default: '')
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  const { monthFormat = 'long', fallback = '' } = options

  if (!dateString) return fallback

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return fallback
    }

    const formatOptions = {
      year: 'numeric',
      month: monthFormat,
      day: 'numeric'
    }

    return date.toLocaleDateString('en-US', formatOptions)
  } catch (error) {
    console.error('Error formatting date:', error)
    return fallback
  }
}

/**
 * Format date for admin dashboard (short month format)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'N/A'
 */
export function formatDateShort(dateString) {
  return formatDate(dateString, { monthFormat: 'short', fallback: 'N/A' })
}

/**
 * Format date for display (long month format)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or empty string
 */
export function formatDateLong(dateString) {
  return formatDate(dateString, { monthFormat: 'long', fallback: '' })
}

/**
 * Convert date to YYYY-MM-DD format for HTML date input
 * @param {string} dateString - ISO date string or date string
 * @returns {string} Date in YYYY-MM-DD format or empty string
 */
export function formatDateForInput(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date for input:', error)
    return ''
  }
}

