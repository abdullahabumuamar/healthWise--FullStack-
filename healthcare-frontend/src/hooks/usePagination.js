import { useState, useMemo } from 'react'
import { PAGINATION } from '../utils/constants'

/**
 * Custom hook for pagination logic
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page (default: from constants)
 * @returns {object} Pagination state and functions
 */
export default function usePagination(items = [], itemsPerPage = PAGINATION.USERS_PER_PAGE) {
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE)

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage)
  }, [items.length, itemsPerPage])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = useMemo(() => {
    return items.slice(indexOfFirstItem, indexOfLastItem)
  }, [items, indexOfFirstItem, indexOfLastItem])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  // Reset to page 1 when items change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  return {
    currentPage,
    totalPages,
    currentItems,
    indexOfFirstItem,
    indexOfLastItem,
    itemsPerPage,
    handlePageChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage
  }
}

