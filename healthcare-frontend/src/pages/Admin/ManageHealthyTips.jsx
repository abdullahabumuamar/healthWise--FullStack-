import { useState, useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import TipModal from '../../components/admin/TipModal'
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal'
import { useHealthTips } from '../../context/HealthTipsContext'
import { useToast } from '../../components/common/ToastContainer'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
import styles from '../../assets/style/ManageHealthyTips.module.css'

export default function ManageHealthyTips() {
  const { tips, addTip, updateTip, deleteTip } = useHealthTips()
  const { success: showSuccess, error: showError } = useToast()

  // Debug: Log tips changes
  useEffect(() => {
    console.log('ManageHealthyTips - Tips updated:', tips)
  }, [tips])

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTip, setSelectedTip] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    content: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, image: value }))
    if (value) {
      setImagePreview(value)
    } else {
      setImagePreview(null)
    }
  }

  const handleAddTip = () => {
    setIsAddModalOpen(true)
    setFormData({ image: '', title: '', subtitle: '', content: '' })
    setImagePreview(null)
  }

  const handleEdit = (tipId) => {
    const tip = tips.find(t => t.id === tipId)
    if (tip) {
      setSelectedTip(tip)
      setFormData({
        image: tip.image || '',
        title: tip.title || '',
        subtitle: tip.subtitle || '',
        content: tip.content || ''
      })
      setImagePreview(tip.image || null)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (tipId) => {
    const tip = tips.find(t => t.id === tipId)
    if (tip) {
      setSelectedTip(tip)
      setIsDeleteModalOpen(true)
    }
  }

  const handleSubmitAdd = async () => {
    console.log('Submitting tip with data:', formData)
    
    if (!formData.image || !formData.title || !formData.content) {
      showError('Please fill in all required fields (Image, Title, and Content)')
      console.log('Validation failed - Missing fields:', {
        image: !!formData.image,
        title: !!formData.title,
        content: !!formData.content
      })
      return
    }

    try {
      await addTip(formData)
      console.log('Tip added successfully')
      showSuccess('Health tip added successfully!')
      setIsAddModalOpen(false)
      setFormData({ image: '', title: '', subtitle: '', content: '' })
      setImagePreview(null)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add tip. Please try again.')
      console.error('Error adding tip:', error)
    }
  }

  const handleSubmitEdit = async () => {
    if (!formData.image || !formData.title || !formData.content) {
      showError('Please fill in all required fields')
      return
    }

    if (selectedTip) {
      try {
        await updateTip(selectedTip.id, formData)
        showSuccess('Health tip updated successfully!')
        setIsEditModalOpen(false)
        setSelectedTip(null)
        setFormData({ image: '', title: '', subtitle: '', content: '' })
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to update tip. Please try again.')
        console.error('Error updating tip:', error)
      }
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedTip) {
      try {
        await deleteTip(selectedTip.id)
        showSuccess('Health tip deleted successfully!')
        setIsDeleteModalOpen(false)
        setSelectedTip(null)
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete tip. Please try again.')
        console.error('Error deleting tip:', error)
      }
    }
  }

  const closeModals = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedTip(null)
    setFormData({ image: '', title: '', subtitle: '', content: '' })
    setImagePreview(null)
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
                <h1 className={styles.title}>Manage Health Tips</h1>
                <button className={styles.addButton} onClick={handleAddTip}>
                  Add New Tip
                </button>
              </div>

              {tips.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No health tips added yet. Click "Add New Tip" to get started.</p>
                </div>
              ) : (
                <div className={styles.tipsGrid}>
                  {tips.map((tip) => (
                    <div key={tip.id} className={styles.tipCard}>
                      <img 
                        src={tip.image || 'https://via.placeholder.com/400x200?text=No+Image'} 
                        alt={tip.title}
                        className={styles.tipCardImage}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'
                        }}
                      />
                      <div className={styles.tipCardContent}>
                        <h3 className={styles.tipCardTitle}>{tip.title}</h3>
                        <div className={styles.tipCardActions}>
                          <button 
                            className={styles.editButton}
                            onClick={() => handleEdit(tip.id)}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteButton}
                            onClick={() => handleDelete(tip.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Tip Modal */}
              <TipModal
                isOpen={isAddModalOpen}
                isEdit={false}
                formData={formData}
                onClose={closeModals}
                onSubmit={handleSubmitAdd}
                onInputChange={handleInputChange}
                onImageChange={handleImageChange}
                imagePreview={imagePreview}
              />

              {/* Edit Tip Modal */}
              <TipModal
                isOpen={isEditModalOpen}
                isEdit={true}
                formData={formData}
                onClose={closeModals}
                onSubmit={handleSubmitEdit}
                onInputChange={handleInputChange}
                onImageChange={handleImageChange}
                imagePreview={imagePreview}
              />

              {/* Delete Confirmation Modal */}
              <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeModals}
                onConfirm={handleConfirmDelete}
                title="Delete Health Tip"
                message="Are you sure you want to delete this health tip?"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
