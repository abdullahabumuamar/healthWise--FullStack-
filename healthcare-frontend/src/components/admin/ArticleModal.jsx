import { useState, useRef, useEffect } from 'react'
import useFileUpload from '../../hooks/useFileUpload'
import { useToast } from '../common/ToastContainer'
import { VALIDATION_MESSAGES } from '../../utils/constants'
import styles from '../../assets/style/ManageHealthyTips.module.css'
import helpIcon from '../../assets/icons/helpicon.svg'

export default function ArticleModal({ isOpen, isEdit, formData, onClose, onSubmit, onInputChange, onImageChange, imagePreview }) {
  const [localImagePreview, setLocalImagePreview] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef(null)
  const { error: showError } = useToast()

  const {
    preview: hookPreview,
    isDragging,
    fileInputRef,
    dropZoneRef,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFileDialog,
    reset
  } = useFileUpload({
    onSuccess: (base64String) => {
      onImageChange({ target: { value: base64String } })
    },
    onError: (error) => {
      showError(error)
    }
  })

  useEffect(() => {
    if (!isOpen) {
      setLocalImagePreview(null)
      setShowTooltip(false)
      reset()
    }
  }, [isOpen, reset])

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false)
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])

  const handleMouseEnter = () => {
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  useEffect(() => {
    if (isOpen && isEdit && formData.image && !localImagePreview && !imagePreview && !hookPreview) {
      setLocalImagePreview(formData.image)
    }
  }, [isOpen, isEdit, formData.image, imagePreview, hookPreview])

  // Sync hook preview with parent when it changes
  useEffect(() => {
    if (hookPreview && hookPreview !== imagePreview) {
      onImageChange({ target: { value: hookPreview } })
    }
  }, [hookPreview, imagePreview, onImageChange])

  if (!isOpen) return null

  const handleRemoveImage = () => {
    setLocalImagePreview(null)
    reset()
    onImageChange({ target: { value: '' } })
  }

  const displayPreview = hookPreview || imagePreview || localImagePreview || formData.image

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Edit Article' : 'Add New Article'}</h2>
          <button className={styles.modalCloseButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="image">Upload Image</label>
            <input
              ref={fileInputRef}
              type="file"
              id="image"
              name="image"
              accept="image/*"
              className={styles.hiddenFileInput}
              onChange={handleFileChange}
              key={isOpen ? 'open' : 'closed'}
            />
            {displayPreview ? (
              <div className={styles.imagePreviewContainer}>
                <img 
                  src={displayPreview} 
                  alt="Preview" 
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  className={styles.removeImageButton}
                  onClick={handleRemoveImage}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div
                ref={dropZoneRef}
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
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
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.formInput}
              placeholder="Enter article title"
              value={formData.title || ''}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="subtitle">Subtitle</label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              className={styles.formInput}
              placeholder="Enter article subtitle"
              value={formData.subtitle || ''}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              className={styles.formInput}
              placeholder="Enter author name"
              value={formData.author || ''}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              className={styles.formInput}
              value={formData.date || ''}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="shortDescription">Short Description</label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              className={styles.formTextarea}
              placeholder="Enter short description"
              rows="3"
              value={formData.shortDescription || ''}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.labelWithIcon}>
              <label className={styles.formLabel} htmlFor="fullContent">Full Content</label>
              <div 
                className={styles.tooltipContainer} 
                ref={tooltipRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img 
                  src={helpIcon} 
                  alt="Help" 
                  className={styles.helpIcon}
                  onClick={() => setShowTooltip(!showTooltip)}
                />
                {showTooltip && (
                  <div 
                    className={styles.tooltip}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={styles.tooltipHeader}>Formatting Guide</div>
                    <div className={styles.tooltipContent}>
                      <p>If a line starts with a number followed by a dot, parenthesis, or dash (for example: <strong>1.</strong>, <strong>2)</strong>, or <strong>3-</strong>) that line of text will appear in <strong>bold</strong> when displayed.</p>
                      <p>Lines starting with <strong>#</strong> will also appear in <strong>bold</strong>. The <strong>#</strong> symbol will not be shown.</p>
                      <p>Everything else is normal text.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <textarea
              id="fullContent"
              name="fullContent"
              className={styles.formTextarea}
              placeholder="Enter full content"
              rows="8"
              value={formData.fullContent || ''}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="references">References (Optional)</label>
            <textarea
              id="references"
              name="references"
              className={styles.formTextarea}
              placeholder="Enter references (optional)"
              rows="3"
              value={formData.references || ''}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={onClose}>
            Cancel
          </button>
          <button className={`${styles.modalButton} ${styles.modalButtonPrimary}`} onClick={onSubmit}>
            {isEdit ? 'Save Changes' : 'Add Article'}
          </button>
        </div>
      </div>
    </div>
  )
}

