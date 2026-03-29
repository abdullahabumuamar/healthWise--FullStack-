import { useState, useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import ArticleModal from '../../components/admin/ArticleModal'
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal'
import { useArticles } from '../../context/ArticlesContext'
import { useToast } from '../../components/common/ToastContainer'
import { formatDateForInput } from '../../utils/dateUtils'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
import styles from '../../assets/style/ManageHealthyTips.module.css'

export default function ManageArticles() {
  const { articles, addArticle, updateArticle, deleteArticle } = useArticles()
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    console.log('ManageArticles - Articles updated:', articles)
  }, [articles])

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    subtitle: '',
    author: '',
    date: '',
    shortDescription: '',
    fullContent: '',
    references: ''
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

  const handleAddArticle = () => {
    setIsAddModalOpen(true)
    setFormData({
      image: '',
      title: '',
      subtitle: '',
      author: '',
      date: '',
      shortDescription: '',
      fullContent: '',
      references: ''
    })
    setImagePreview(null)
  }

  const handleEdit = (articleId) => {
    const article = articles.find(a => a.id === articleId)
    if (article) {
      setSelectedArticle(article)
      // Handle references - convert array to string for textarea
      const referencesText = Array.isArray(article.references) 
        ? article.references.join('\n') 
        : (article.references || '')
      
      // Format date for date input (YYYY-MM-DD format)
      const formattedDate = article.date ? formatDateForInput(article.date) : ''
      
      setFormData({
        image: article.image || '',
        title: article.title || '',
        subtitle: article.subtitle || '',
        author: article.author || '',
        date: formattedDate,
        shortDescription: article.shortDescription || '',
        fullContent: article.content || article.fullContent || '',
        references: referencesText
      })
      setImagePreview(article.image || null)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (articleId) => {
    const article = articles.find(a => a.id === articleId)
    if (article) {
      setSelectedArticle(article)
      setIsDeleteModalOpen(true)
    }
  }

  const handleSubmitAdd = async () => {
    if (!formData.image || !formData.title || !formData.shortDescription || !formData.fullContent || !formData.author || !formData.date) {
      showError('Please fill in all required fields (Image, Title, Subtitle, Author, Date, Short Description, and Full Content)')
      return
    }

    try {
      await addArticle(formData)
      console.log('Article added successfully')
      showSuccess('Article added successfully!')
      setIsAddModalOpen(false)
      setFormData({
        image: '',
        title: '',
        subtitle: '',
        author: '',
        date: '',
        shortDescription: '',
        fullContent: '',
        references: ''
      })
      setImagePreview(null)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add article. Please try again.')
      console.error('Error adding article:', error)
    }
  }

  const handleSubmitEdit = async () => {
    if (!formData.image || !formData.title || !formData.shortDescription || !formData.fullContent || !formData.author || !formData.date) {
      showError('Please fill in all required fields')
      return
    }

    if (selectedArticle) {
      try {
        await updateArticle(selectedArticle.id, formData)
        showSuccess('Article updated successfully!')
        setIsEditModalOpen(false)
        setSelectedArticle(null)
        setFormData({
          image: '',
          title: '',
          subtitle: '',
          author: '',
          date: '',
          shortDescription: '',
          fullContent: '',
          references: ''
        })
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to update article. Please try again.')
        console.error('Error updating article:', error)
      }
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedArticle) {
      try {
        await deleteArticle(selectedArticle.id)
        showSuccess('Article deleted successfully!')
        setIsDeleteModalOpen(false)
        setSelectedArticle(null)
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to delete article. Please try again.')
        console.error('Error deleting article:', error)
      }
    }
  }

  const closeModals = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedArticle(null)
    setFormData({
      image: '',
      title: '',
      subtitle: '',
      author: '',
      date: '',
      shortDescription: '',
      fullContent: '',
      references: ''
    })
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
                <h1 className={styles.title}>Manage Articles</h1>
                <button className={styles.addButton} onClick={handleAddArticle}>
                  Add New Article
                </button>
              </div>

              {articles.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateText}>No articles added yet. Click "Add New Article" to get started.</p>
                </div>
              ) : (
                <div className={styles.tipsGrid}>
                  {articles.map((article) => (
                    <div key={article.id} className={styles.tipCard}>
                      <img 
                        src={article.image || 'https://via.placeholder.com/400x200?text=No+Image'} 
                        alt={article.title}
                        className={styles.tipCardImage}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'
                        }}
                      />
                      <div className={styles.tipCardContent}>
                        <h3 className={styles.tipCardTitle}>{article.title}</h3>
                        <div className={styles.tipCardActions}>
                          <button 
                            className={styles.editButton}
                            onClick={() => handleEdit(article.id)}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteButton}
                            onClick={() => handleDelete(article.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Article Modal */}
              <ArticleModal
                isOpen={isAddModalOpen}
                isEdit={false}
                formData={formData}
                onClose={closeModals}
                onSubmit={handleSubmitAdd}
                onInputChange={handleInputChange}
                onImageChange={handleImageChange}
                imagePreview={imagePreview}
              />

              {/* Edit Article Modal */}
              <ArticleModal
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
                title="Delete Article"
                message="Are you sure you want to delete this article?"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
