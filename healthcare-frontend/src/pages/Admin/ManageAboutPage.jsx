import { useState, useEffect, useRef } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { useAbout } from '../../context/AboutContext'
import { useToast } from '../../components/common/ToastContainer'
import { VALIDATION_MESSAGES, FILE_UPLOAD } from '../../utils/constants'
import layoutStyles from '../../assets/style/AdminLayout.module.css'
import styles from '../../assets/style/ManageHealthyTips.module.css'

export default function ManageAboutPage() {
  const { aboutData, updateAboutData } = useAbout()
  const { success: showSuccess, error: showError } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(aboutData)
  const [imagePreviews, setImagePreviews] = useState({})
  const [draggingStates, setDraggingStates] = useState({})
  const fileInputRefs = useRef({})
  const dropZoneRefs = useRef({})

  useEffect(() => {
    setFormData(aboutData)
    // Load image previews
    const previews = {}
    if (aboutData.mission.image) previews.mission = aboutData.mission.image
    if (aboutData.vision.image) previews.vision = aboutData.vision.image
    aboutData.whatWeOffer.cards.forEach(card => {
      if (card.image) previews[`card-${card.id}`] = card.image
    })
    setImagePreviews(previews)
  }, [aboutData])

  const handleInputChange = (section, field, value) => {
    setFormData(prev => {
      if (section === 'whatWeOffer') {
        const cardId = field.cardId
        const cardField = field.field
        return {
          ...prev,
          whatWeOffer: {
            ...prev.whatWeOffer,
            cards: prev.whatWeOffer.cards.map(card =>
              card.id === cardId ? { ...card, [cardField]: value } : card
            )
          }
        }
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }
    })
  }

  const processFile = async (file, section, cardId = null) => {
    if (!file) return false

    if (!file.type.startsWith('image/')) {
      showError(VALIDATION_MESSAGES.IMAGE_TYPE_INVALID)
      return false
    }

    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      showError(VALIDATION_MESSAGES.IMAGE_SIZE_EXCEEDED)
      return false
    }

    try {
      // Import compression utility dynamically
      const { compressImage } = await import('../../utils/imageCompression')
      
      // Compress the image
      const base64String = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeKB: 500
      })
      
      const previewKey = cardId ? `card-${cardId}` : section
      
      setImagePreviews(prev => ({ ...prev, [previewKey]: base64String }))
      
      if (cardId) {
        handleInputChange('whatWeOffer', { cardId, field: 'image' }, base64String)
      } else {
        handleInputChange(section, 'image', base64String)
      }
      return true
    } catch (error) {
      console.error('Error processing image:', error)
      showError('Failed to process image. Please try again.')
      return false
    }
  }

  const handleImageChange = (section, file, cardId = null) => {
    if (file) {
      if (fileInputRefs.current[cardId ? `image-${section}-${cardId}` : `image-${section}`]) {
        fileInputRefs.current[cardId ? `image-${section}-${cardId}` : `image-${section}`].value = ''
      }
      processFile(file, section, cardId)
    }
  }

  const handleDragOver = (e, previewKey) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingStates(prev => ({ ...prev, [previewKey]: true }))
  }

  const handleDragLeave = (e, previewKey) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingStates(prev => ({ ...prev, [previewKey]: false }))
  }

  const handleDrop = (e, section, cardId = null, previewKey) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingStates(prev => ({ ...prev, [previewKey]: false }))

    const file = e.dataTransfer.files[0]
    if (file && processFile(file, section, cardId)) {
      const inputId = cardId ? `image-${section}-${cardId}` : `image-${section}`
      if (fileInputRefs.current[inputId]) {
        fileInputRefs.current[inputId].value = ''
      }
    }
  }

  const handleDropZoneClick = (inputId) => {
    fileInputRefs.current[inputId]?.click()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateAboutData(formData)
      showSuccess('About page updated successfully!')
      setIsEditing(false)
    } catch (error) {
      showError('Failed to save about page. Please try again.')
      console.error('Error saving about page:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(aboutData)
    // Reset image previews
    const previews = {}
    if (aboutData.mission.image) previews.mission = aboutData.mission.image
    if (aboutData.vision.image) previews.vision = aboutData.vision.image
    aboutData.whatWeOffer.cards.forEach(card => {
      if (card.image) previews[`card-${card.id}`] = card.image
    })
    setImagePreviews(previews)
    setIsEditing(false)
  }

  const ImageUploadField = ({ section, cardId = null, previewKey }) => {
    const inputId = cardId ? `image-${section}-${cardId}` : `image-${section}`
    const displayPreview = imagePreviews[previewKey] || formData[section]?.image || (cardId && formData.whatWeOffer.cards.find(c => c.id === cardId)?.image)
    const isDragging = draggingStates[previewKey] || false
    
    return (
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          {section === 'mission' ? 'Mission Image' : section === 'vision' ? 'Vision Image' : 'Card Image'}
        </label>
        <input
          ref={el => fileInputRefs.current[inputId] = el}
          type="file"
          id={inputId}
          accept="image/*"
          className={styles.hiddenFileInput}
          onChange={(e) => handleImageChange(section, e.target.files[0], cardId)}
          disabled={!isEditing}
          key={isEditing ? 'editing' : 'not-editing'}
        />
        {displayPreview ? (
          <div className={styles.imagePreviewContainer}>
            <img 
              src={displayPreview} 
              alt="Preview" 
              className={styles.imagePreview}
            />
            {isEditing && (
              <button
                type="button"
                className={styles.removeImageButton}
                onClick={() => {
                  setImagePreviews(prev => {
                    const newPreviews = { ...prev }
                    delete newPreviews[previewKey]
                    return newPreviews
                  })
                  if (cardId) {
                    handleInputChange('whatWeOffer', { cardId, field: 'image' }, '')
                  } else {
                    handleInputChange(section, 'image', '')
                  }
                }}
              >
                Remove Image
              </button>
            )}
          </div>
        ) : (
          isEditing ? (
            <div
              ref={el => dropZoneRefs.current[previewKey] = el}
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
              onDragOver={(e) => handleDragOver(e, previewKey)}
              onDragLeave={(e) => handleDragLeave(e, previewKey)}
              onDrop={(e) => handleDrop(e, section, cardId, previewKey)}
              onClick={() => handleDropZoneClick(inputId)}
            >
              <div className={styles.dropZoneContent}>
                <div className={styles.dropZoneIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div className={styles.dropZoneText}>
                  <p className={styles.dropZoneTitle}>
                    {isDragging ? 'Drop image here' : 'Drag & drop image here'}
                  </p>
                  <p className={styles.dropZoneSubtitle}>or click to browse</p>
                  <p className={styles.dropZoneHint}>PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.readOnlyTextPlaceholder}>No image uploaded</div>
          )
        )}
      </div>
    )
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
                <h1 className={styles.title}>Manage About Page</h1>
                {!isEditing ? (
                  <button className={styles.addButton} onClick={handleEdit}>
                    Edit
                  </button>
                ) : (
                  <div className={styles.editActions}>
                    <button 
                      className={`${styles.modalButton} ${styles.modalButtonCancel}`}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button 
                      className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Page Header Section */}
              <div className={styles.sectionGroup}>
                <h2 className={styles.sectionGroupTitle}>Page Header</h2>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.header.title}
                      onChange={(e) => handleInputChange('header', 'title', e.target.value)}
                    />
                  ) : (
                    <div className={styles.readOnlyText}>{formData.header.title}</div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subtitle</label>
                  {isEditing ? (
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.header.subtitle}
                      onChange={(e) => handleInputChange('header', 'subtitle', e.target.value)}
                    />
                  ) : (
                    <div className={styles.readOnlyText}>{formData.header.subtitle}</div>
                  )}
                </div>
              </div>

              {/* Mission Section */}
              <div className={styles.sectionGroup}>
                <h2 className={styles.sectionGroupTitle}>Mission Section</h2>
                <ImageUploadField section="mission" previewKey="mission" />
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mission Text</label>
                  {isEditing ? (
                    <textarea
                      className={styles.formTextarea}
                      rows="4"
                      value={formData.mission.text}
                      onChange={(e) => handleInputChange('mission', 'text', e.target.value)}
                    />
                  ) : (
                    <div className={styles.readOnlyTextWrap}>{formData.mission.text}</div>
                  )}
                </div>
              </div>

              {/* Vision Section */}
              <div className={styles.sectionGroup}>
                <h2 className={styles.sectionGroupTitle}>Vision Section</h2>
                <ImageUploadField section="vision" previewKey="vision" />
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Vision Text</label>
                  {isEditing ? (
                    <textarea
                      className={styles.formTextarea}
                      rows="4"
                      value={formData.vision.text}
                      onChange={(e) => handleInputChange('vision', 'text', e.target.value)}
                    />
                  ) : (
                    <div className={styles.readOnlyTextWrap}>{formData.vision.text}</div>
                  )}
                </div>
              </div>

              {/* What We Offer Section */}
              <div className={`${styles.sectionGroup} ${styles.sectionGroupLast}`}>
                <h2 className={styles.sectionGroupTitle}>What We Offer</h2>
                <div className={styles.cardsGrid}>
                  {formData.whatWeOffer.cards.map((card) => (
                    <div key={card.id} className={styles.cardContainer}>
                      <ImageUploadField section="whatWeOffer" cardId={card.id} previewKey={`card-${card.id}`} />
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Card Title</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.formInput}
                            value={card.title}
                            onChange={(e) => handleInputChange('whatWeOffer', { cardId: card.id, field: 'title' }, e.target.value)}
                          />
                        ) : (
                          <div className={styles.readOnlyTextBold}>{card.title}</div>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Description</label>
                        {isEditing ? (
                          <textarea
                            className={styles.formTextarea}
                            rows="3"
                            value={card.description}
                            onChange={(e) => handleInputChange('whatWeOffer', { cardId: card.id, field: 'description' }, e.target.value)}
                          />
                        ) : (
                          <div className={styles.readOnlyText}>{card.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
