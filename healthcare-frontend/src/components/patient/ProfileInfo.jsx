import { useState, useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import api from '../../services/api'
import { useToast } from '../common/ToastContainer'
import PasswordInput from '../common/PasswordInput'
import { validateEmail, validatePassword, sanitizeEmail } from '../../utils/validation'
import styles from '../../assets/style/Profile.module.css'

export default function ProfileInfo() {
  const { user, setUser, updateUserInStorage } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [editingField, setEditingField] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Format date from YYYY-MM-DD or ISO string to MM / DD / YYYY
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month} / ${day} / ${year}`
  }

  // Convert date to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Format gender for display
  const formatGender = (gender) => {
    if (!gender) return 'Select Your Sex'
    return gender.charAt(0).toUpperCase() + gender.slice(1)
  }

  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '••••••••',
    dateOfBirth: user?.dateOfBirth ? formatDate(user.dateOfBirth) : '',
    dateOfBirthRaw: user?.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
    sex: user?.gender ? formatGender(user.gender) : 'Select Your Sex'
  })

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '••••••••',
        dateOfBirth: user.dateOfBirth ? formatDate(user.dateOfBirth) : '',
        dateOfBirthRaw: user.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
        sex: user.gender ? formatGender(user.gender) : 'Select Your Sex'
      })
    }
  }, [user])

  async function handleEdit(field) {
    setEditingField(field)
    // Fetch real password from API when editing password field
    if (field === 'password') {
      try {
        const endpoint = user?.role === 'admin' ? `/admins/${user.id}` : `/patients/${user.id}`
        const response = await api.get(endpoint)
        const userData = response.data
        // Set the real password if available
        if (userData.password) {
          setFormData(prev => ({ ...prev, password: userData.password }))
        } else {
          // Fallback to empty if password not available
          setFormData(prev => ({ ...prev, password: '' }))
        }
      } catch (error) {
        console.error('Error fetching password:', error)
        // Fallback to empty on error
        setFormData(prev => ({ ...prev, password: '' }))
      }
    } else if (field === 'dateOfBirth') {
      // Ensure dateOfBirthRaw is set when editing (convert ISO to YYYY-MM-DD)
      if (user?.dateOfBirth) {
        const dateForInput = formatDateForInput(user.dateOfBirth)
        setFormData(prev => ({
          ...prev,
          dateOfBirthRaw: dateForInput
        }))
      }
    }
  }

  async function handleSave(field) {
    try {
      setIsSaving(true)
      
      // Prepare update data based on field
      const updateData = {}
      
      if (field === 'email') {
        // Validate email format
        const emailValidation = validateEmail(formData.email)
        if (!emailValidation.valid) {
          showError(emailValidation.error)
          return
        }
        // Sanitize email (trim + lowercase)
        updateData.email = sanitizeEmail(formData.email)
      } else if (field === 'password') {
        if (!formData.password || formData.password === '••••••••') {
          showError('Please enter a new password')
          return
        }
        // Validate password strength (same as registration)
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.valid) {
          showError(passwordValidation.error)
          return
        }
        updateData.password = formData.password
      } else if (field === 'dateOfBirth') {
        // Use raw date value if available, otherwise convert formatted date
        if (formData.dateOfBirthRaw) {
          updateData.dateOfBirth = formData.dateOfBirthRaw
        } else {
          // Convert formatted date back to YYYY-MM-DD
          const dateParts = formData.dateOfBirth.split(' / ')
          if (dateParts.length === 3) {
            const [month, day, year] = dateParts
            updateData.dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          } else {
            updateData.dateOfBirth = formData.dateOfBirth
          }
        }
      } else if (field === 'sex') {
        if (formData.sex === 'Select Your Sex') {
          updateData.gender = null
        } else {
          updateData.gender = formData.sex.toLowerCase()
        }
      }
      
      // Determine API endpoint based on user role
      const endpoint = user?.role === 'admin' ? `/admins/${user.id}` : `/patients/${user.id}`
      
      // Get existing user data first
      const existingResponse = await api.get(endpoint)
      const existingUser = existingResponse.data
      
      // Merge with existing data
      const userData = {
        ...existingUser,
        ...updateData
      }
      
      // Update via API
      const response = await api.put(endpoint, userData)
      const updatedUser = response.data
      
      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = updatedUser
      
      // Update auth context
      setUser(userWithoutPassword)
      
      // Update user in storage (localStorage or sessionStorage based on rememberMe)
      updateUserInStorage(userWithoutPassword)
      
      // Reset form data
      if (field === 'password') {
        setFormData(prev => ({ ...prev, password: '••••••••' }))
      }
      
      showSuccess(`${field === 'email' ? 'Email' : field === 'password' ? 'Password' : field === 'dateOfBirth' ? 'Date of birth' : 'Gender'} updated successfully!`)
      setEditingField(null)
    } catch (error) {
      console.error('Error updating profile:', error)
      showError(error.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    const field = editingField
    setEditingField(null)
    // Reset password field to masked dots when canceling
    if (field === 'password') {
      setFormData(prev => ({ ...prev, password: '••••••••' }))
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <h3 className={styles.topTitle}>Profile</h3>

      <div className={styles.section}>
        <div className={styles.fieldGroup}>
          <strong>Login Information</strong>
        </div>
        
        {/* Email and Password Row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <div className={styles.label}>Email</div>
            {editingField === 'email' ? (
              <input 
                className={styles.input} 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            ) : (
              <div>{formData.email}</div>
            )}
            {editingField === 'email' && <div className={styles.help}>You need to enter your email</div>}
            <div className={styles.btnRow}>
              {editingField === 'email' ? (
                <>
                  <button className={styles.btn} onClick={() => handleSave('email')} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button className={styles.btn} onClick={handleCancel} disabled={isSaving}>Cancel</button>
                </>
              ) : (
                <button className={styles.edit} onClick={() => handleEdit('email')}>Edit</button>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Password</div>
            {editingField === 'password' ? (
              <PasswordInput
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter new password"
              />
            ) : (
              <div>{formData.password}</div>
            )}
            <div className={styles.btnRow}>
              {editingField === 'password' ? (
                <>
                  <button className={styles.btn} onClick={() => handleSave('password')} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button className={styles.btn} onClick={handleCancel} disabled={isSaving}>Cancel</button>
                </>
              ) : (
                <button className={styles.edit} onClick={() => handleEdit('password')}>Edit</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.fieldGroup}>
          <strong>Personal Information</strong>
        </div>
        
        {/* Date of Birth and Sex Row */}
        <div className={styles.row}>
          <div className={styles.field}>
            <div className={styles.label}>Date of Birth</div>
            {editingField === 'dateOfBirth' ? (
              <input 
                className={styles.input} 
                type="date"
                value={formData.dateOfBirthRaw || (user?.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '')}
                onChange={(e) => {
                  const dateValue = e.target.value
                  // Store both raw (YYYY-MM-DD) and formatted (MM / DD / YYYY) values
                  handleInputChange('dateOfBirth', dateValue ? formatDate(dateValue) : '')
                  handleInputChange('dateOfBirthRaw', dateValue)
                }}
              />
            ) : (
              <div>{formData.dateOfBirth}</div>
            )}
            <div className={styles.btnRow}>
              {editingField === 'dateOfBirth' ? (
                <>
                  <button className={styles.btn} onClick={() => handleSave('dateOfBirth')} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button className={styles.btn} onClick={handleCancel} disabled={isSaving}>Cancel</button>
                </>
              ) : (
                <button className={styles.edit} onClick={() => handleEdit('dateOfBirth')}>Edit</button>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Sex</div>
            {editingField === 'sex' ? (
              <select 
                className={styles.input}
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
              >
                <option value="Select Your Sex">Select Your Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div>{formData.sex}</div>
            )}
            <div className={styles.btnRow}>
              {editingField === 'sex' ? (
                <>
                  <button className={styles.btn} onClick={() => handleSave('sex')} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button className={styles.btn} onClick={handleCancel} disabled={isSaving}>Cancel</button>
                </>
              ) : (
                <button className={styles.edit} onClick={() => handleEdit('sex')}>Edit</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

