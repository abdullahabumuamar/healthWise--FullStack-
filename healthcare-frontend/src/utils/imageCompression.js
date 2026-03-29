/**
 * Image compression utility
 * Compresses images to reduce file size while maintaining acceptable quality
 */

/**
 * Compress an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1920)
 * @param {number} options.maxHeight - Maximum height (default: 1080)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @param {number} options.maxSizeKB - Maximum file size in KB (default: 500)
 * @returns {Promise<string>} - Compressed base64 string
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        // Create canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            // Check if we need further compression
            const sizeKB = blob.size / 1024
            
            if (sizeKB > maxSizeKB) {
              // Recursively compress with lower quality
              const newQuality = Math.max(0.1, quality - 0.1)
              compressImage(file, { ...options, quality: newQuality })
                .then(resolve)
                .catch(reject)
            } else {
              // Convert blob to base64
              const reader2 = new FileReader()
              reader2.onloadend = () => resolve(reader2.result)
              reader2.onerror = () => reject(new Error('Failed to convert blob to base64'))
              reader2.readAsDataURL(blob)
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Compress a base64 image string
 * @param {string} base64String - Base64 image string
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed base64 string
 */
export async function compressBase64Image(base64String, options = {}) {
  // Convert base64 to blob
  const response = await fetch(base64String)
  const blob = await response.blob()
  
  // Convert blob to file
  const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
  
  // Compress the file
  return compressImage(file, options)
}

/**
 * Get image file size in KB
 * @param {string} base64String - Base64 image string
 * @returns {number} - File size in KB
 */
export function getImageSizeKB(base64String) {
  if (!base64String) return 0
  // Remove data URL prefix
  const base64 = base64String.split(',')[1] || base64String
  // Calculate size: base64 is ~33% larger than binary
  const sizeInBytes = (base64.length * 3) / 4
  return sizeInBytes / 1024
}

