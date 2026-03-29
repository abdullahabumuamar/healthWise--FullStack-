import { useMemo } from 'react'

/**
 * Custom hook for search/filter logic
 * @param {Array} items - Array of items to search
 * @param {string} searchTerm - Search term
 * @param {string|Array} searchFields - Field(s) to search in
 * @returns {Array} Filtered items
 */
export default function useSearch(items = [], searchTerm = '', searchFields = '') {
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim()
    const fields = Array.isArray(searchFields) ? searchFields : [searchFields]

    return items.filter(item => {
      // If no specific fields provided, search in all string values
      if (!searchFields || (Array.isArray(fields) && fields.length === 0)) {
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerSearchTerm)
          }
          return false
        })
      }

      // Search in specific fields
      return fields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm)
        }
        return false
      })
    })
  }, [items, searchTerm, searchFields])

  return filteredItems
}

