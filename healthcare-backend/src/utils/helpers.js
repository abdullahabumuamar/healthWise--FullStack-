/**
 * Helper utility functions
 */

/**
 * Format MongoDB document to match frontend expectations
 * Converts _id to id and removes _id field
 * @param {object} doc - MongoDB document
 * @returns {object} - Formatted object with id instead of _id
 */
export const formatResponse = (doc) => {
  if (!doc) {
    return null;
  }

  // Handle Mongoose document
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Convert _id to id
  const formatted = {
    id: obj._id ? obj._id.toString() : obj.id,
    ...obj
  };

  // Remove _id and __v fields
  delete formatted._id;
  delete formatted.__v;

  return formatted;
};

/**
 * Format array of MongoDB documents
 * @param {array} docs - Array of MongoDB documents
 * @returns {array} - Array of formatted objects
 */
export const formatResponseArray = (docs) => {
  if (!Array.isArray(docs)) {
    return [];
  }

  return docs.map(doc => formatResponse(doc));
};

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} - ISO string or null
 */
export const formatDate = (date) => {
  if (!date) {
    return null;
  }

  if (date instanceof Date) {
    return date.toISOString();
  }

  if (typeof date === 'string') {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString();
    }
  }

  return null;
};

/**
 * Paginate results
 * @param {array} items - Array of items to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} - { items, total, page, limit, totalPages }
 */
export const paginateResults = (items, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 10);
  const total = items.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages
  };
};

/**
 * Search and filter array
 * @param {array} items - Array to search
 * @param {string} searchTerm - Search term
 * @param {array} searchFields - Fields to search in
 * @returns {array} - Filtered array
 */
export const searchFilter = (items, searchTerm, searchFields = []) => {
  if (!searchTerm || !searchTerm.trim()) {
    return items;
  }

  const term = searchTerm.toLowerCase().trim();

  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) {
        return false;
      }

      return String(value).toLowerCase().includes(term);
    });
  });
};

/**
 * Format patient data by joining User and Patient models
 * @param {object} user - User document
 * @param {object} patientProfile - Patient document (optional)
 * @returns {object} - Formatted patient object
 */
export const formatPatientData = (user, patientProfile = null) => {
  if (!user) {
    return null;
  }

  const formatted = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    dateOfBirth: formatDate(user.dateOfBirth),
    gender: user.gender || null,
    createdAt: formatDate(user.createdAt),
    role: 'patient',
    savedTips: patientProfile?.savedTips?.map(id => 
      id.toString ? id.toString() : id
    ) || [],
    savedArticles: patientProfile?.savedArticles?.map(id => 
      id.toString ? id.toString() : id
    ) || []
  };

  return formatted;
};

/**
 * Format admin/user data (without patient-specific fields)
 * @param {object} user - User document
 * @returns {object} - Formatted user object
 */
export const formatUserData = (user) => {
  if (!user) {
    return null;
  }

  const formatted = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    dateOfBirth: formatDate(user.dateOfBirth),
    gender: user.gender || null,
    createdAt: formatDate(user.createdAt),
    role: user.role || 'patient'
  };

  return formatted;
};

