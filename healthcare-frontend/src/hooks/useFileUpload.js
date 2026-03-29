import { useState, useRef, useCallback } from 'react'
import { FILE_UPLOAD, VALIDATION_MESSAGES } from '../utils/constants'
import { compressImage } from '../utils/imageCompression'

/**
 * Custom hook for file upload logic
 * @param {object} options - Upload options
 * @param {number} options.maxSize - Max file size in bytes (default: from constants)
 * @param {Array} options.allowedTypes - Allowed file types (default: from constants)
 * @param {function} options.onSuccess - Callback when file is successfully processed
 * @param {function} options.onError - Callback when file processing fails
 * @returns {object} File upload state and functions
 */
export default function useFileUpload(options = {}) {
  const {
    maxSize = FILE_UPLOAD.MAX_SIZE,
    allowedTypes = FILE_UPLOAD.ALLOWED_TYPES,
    onSuccess,
    onError,
    compress = true, // Enable compression by default
    compressionOptions = {} // Compression options
  } = options

  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const validateFile = useCallback((file) => {
    if (!file) {
      return { valid: false, error: 'No file selected' }
    }

    // Check file type - support both exact match and category match (e.g., 'image/*')
    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        // Category match (e.g., 'image/*')
        const category = type.split('/')[0]
        return file.type.startsWith(category + '/')
      }
      // Exact match
      return file.type === type
    })

    // If allowedTypes contains image types, also accept any image type
    const acceptsImages = allowedTypes.some(type => type.startsWith('image/'))
    const isImageFile = file.type.startsWith('image/')

    if (!isAllowed && !(acceptsImages && isImageFile)) {
      const error = acceptsImages
        ? VALIDATION_MESSAGES.IMAGE_TYPE_INVALID
        : 'Invalid file type'
      return { valid: false, error }
    }

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: VALIDATION_MESSAGES.IMAGE_SIZE_EXCEEDED }
    }

    return { valid: true, error: null }
  }, [maxSize, allowedTypes])

  const processFile = useCallback(async (file) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      if (onError) {
        onError(validation.error)
      } else {
        alert(validation.error)
      }
      return false
    }

    setIsProcessing(true)

    try {
      let result
      
      // Compress image if it's an image file and compression is enabled
      if (compress && file.type.startsWith('image/')) {
        try {
          result = await compressImage(file, compressionOptions)
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError)
          // Fallback to original if compression fails
          const reader = new FileReader()
          result = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsDataURL(file)
          })
        }
      } else {
        // Non-image files or compression disabled - use original
        const reader = new FileReader()
        result = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      }

      setPreview(result)
      setIsProcessing(false)
      if (onSuccess) {
        onSuccess(result)
      }
      return true
    } catch (error) {
      setIsProcessing(false)
      const errorMessage = error.message || 'Error processing file'
      if (onError) {
        onError(errorMessage)
      } else {
        alert(errorMessage)
      }
      return false
    }
  }, [validateFile, onSuccess, onError, compress, compressionOptions])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
      // Reset input to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [processFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && processFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [processFile])

  const handleRemoveFile = useCallback(() => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const reset = useCallback(() => {
    setPreview(null)
    setIsDragging(false)
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return {
    preview,
    isDragging,
    isProcessing,
    fileInputRef,
    dropZoneRef,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemoveFile,
    openFileDialog,
    processFile,
    reset,
    setPreview
  }
}

