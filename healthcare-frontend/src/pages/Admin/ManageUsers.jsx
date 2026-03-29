import { useState } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import UserModal from '../../components/admin/UserModal'
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal'
import { useUsers } from '../../context/UsersContext'
import usePagination from '../../hooks/usePagination'
import useSearch from '../../hooks/useSearch'
import { useToast } from '../../components/common/ToastContainer'
import { formatDateShort, formatDateForInput } from '../../utils/dateUtils'
import { VALIDATION_MESSAGES } from '../../utils/constants'
import { validateEmail, validatePassword, validateDateOfBirth, sanitizeEmail } from '../../utils/validation'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
import styles from '../../assets/style/ManageUsers.module.css'

// Search icon SVG (inline since we don't have it as separate file)
const SearchIcon = () => (
  <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

export default function ManageUsers() {
  const { users, addUser, updateUser, deleteUser } = useUsers()
  const { success: showSuccess, error: showError } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  // Use custom hooks for search and pagination
  const filteredUsers = useSearch(users, searchTerm, 'email')
  const {
    currentPage,
    totalPages,
    currentItems: currentUsers,
    indexOfFirstItem: indexOfFirstUser,
    handlePageChange
  } = usePagination(filteredUsers)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    dob: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddUser = () => {
    setIsAddModalOpen(true)
    setFormData({ email: '', password: '', dob: '' })
  }

  const handleEdit = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      // Convert ISO date string to YYYY-MM-DD format for date input
      const dateOfBirth = user.dateOfBirth || user.dob || ''
      const formattedDate = dateOfBirth ? formatDateForInput(dateOfBirth) : ''
      
      setFormData({
        email: user.email,
        password: '', // Don't show password in edit
        dob: formattedDate
      })
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setIsDeleteModalOpen(true)
    }
  }

  const handleSubmitAdd = async () => {
    // Validate email
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      showError(emailValidation.error)
      return
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      showError(passwordValidation.error)
      return
    }

    // Validate date of birth
    const dobValidation = validateDateOfBirth(formData.dob)
    if (!dobValidation.valid) {
      showError(dobValidation.error)
      return
    }

    try {
      // Sanitize email before sending
      const sanitizedEmail = sanitizeEmail(formData.email)
      
      await addUser({
        email: sanitizedEmail,
        password: formData.password,
        dob: formData.dob
      })
      showSuccess('User added successfully')
      setIsAddModalOpen(false)
      setFormData({ email: '', password: '', dob: '' })
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add user. Please try again.')
      console.error('Error adding user:', error)
    }
  }

  const handleSubmitEdit = async () => {
    // Validate email
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      showError(emailValidation.error)
      return
    }

    // Validate date of birth
    const dobValidation = validateDateOfBirth(formData.dob)
    if (!dobValidation.valid) {
      showError(dobValidation.error)
      return
    }

    // Validate password if provided
    if (formData.password && formData.password.trim() !== '') {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid) {
        showError(passwordValidation.error)
        return
      }
    }

    try {
      // Prepare update data
      const updateData = {
        email: sanitizeEmail(formData.email),
        dateOfBirth: formData.dob
      }
      
      // Only include password if it's provided and not empty
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password
      }

      await updateUser(selectedUser.id, updateData)
      showSuccess('User updated successfully')
      setIsEditModalOpen(false)
      setSelectedUser(null)
      setFormData({ email: '', password: '', dob: '' })
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update user. Please try again.')
      console.error('Error updating user:', error)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(selectedUser.id)
      showSuccess('User deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete user. Please try again.')
      console.error('Error deleting user:', error)
    }
  }

  const closeModals = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
    setFormData({ email: '', password: '', dob: '' })
  }


  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <AdminNavbar onMenuToggle={setIsSidebarOpen} isMenuOpen={isSidebarOpen} />
      <div className="container">
        <main className="main" style={{ paddingTop: 16 }}>
          <div className={layoutStyles.layout}>
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className={layoutStyles.content}>
              <div className={styles.header}>
                <h1 className={styles.title}>User management</h1>
                <div className={styles.searchContainer}>
                  <div className={styles.searchBox}>
                    <SearchIcon />
                      <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        handlePageChange(1)
                      }}
                    />
                  </div>
                  <button className={styles.createButton} onClick={handleAddUser}>
                    Add User
                  </button>
                </div>
              </div>

              <div className={styles.tableWrap}>
                {currentUsers.length > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>No</th>
                        <th className={styles.th}>Email</th>
                        <th className={styles.th}>DOB</th>
                        <th className={styles.th}>Reg. Date</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, index) => (
                        <tr key={user.id} className={styles.row}>
                          <td className={styles.td}>{indexOfFirstUser + index + 1}</td>
                          <td className={styles.td}>{user.email}</td>
                          <td className={styles.td}>{formatDateShort(user.dateOfBirth || user.dob)}</td>
                          <td className={styles.td}>{formatDateShort(user.createdAt || user.registeredDate || user.regDate)}</td>
                          <td className={styles.td}>
                            <div className={styles.actions}>
                              <button
                                className={styles.editButton}
                                onClick={() => handleEdit(user.id)}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDelete(user.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateTitle}>No users found</div>
                    <div className={styles.emptyStateText}>
                      {searchTerm ? 'Try adjusting your search terms' : 'No users available'}
                    </div>
                  </div>
                )}
              </div>

              {filteredUsers.length > 0 && (
                <div className={styles.tableFooter}>
                  <div className={styles.userCount}>
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} total
                  </div>
                  <div className={styles.pagination}>
                    <button
                      className={`${styles.paginationButton} ${currentPage === 1 ? styles.paginationButtonDisabled : ''}`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            className={`${styles.paginationButton} ${currentPage === page ? styles.paginationButtonActive : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page}>...</span>
                      }
                      return null
                    })}
                    <button
                      className={`${styles.paginationButton} ${currentPage === totalPages ? styles.paginationButtonDisabled : ''}`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        isEdit={false}
        formData={formData}
        onClose={closeModals}
        onSubmit={handleSubmitAdd}
        onInputChange={handleInputChange}
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={isEditModalOpen}
        isEdit={true}
        formData={formData}
        onClose={closeModals}
        onSubmit={handleSubmitEdit}
        onInputChange={handleInputChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}


