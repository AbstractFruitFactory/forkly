/**
 * Utility functions for handling media uploads
 */
import { validateMediaType, validateMediaSize, getMediaType, validateVideoDuration, getVideoDuration } from './mediaValidation'

/**
 * Validates and processes a media file
 * @param file The file to process
 * @param options Configuration options
 * @returns Promise resolving to validation results and preview URL
 */
export function handleMediaFile(
  file: File,
  options: {
    type?: 'image' | 'video' | 'both'
    maxSize?: number
    maxDuration?: number
  } = {}
): Promise<{
  error: string
  preview: string
  mediaType: 'image' | 'video' | null
  file: File
}> {
  const { type = 'both', maxSize = type === 'video' ? 50 : 10, maxDuration } = options
  let error = ''
  let preview = ''
  
  // Validate file type
  error = validateMediaType(file, type)
  if (error) {
    return Promise.resolve({ error, preview, mediaType: null, file })
  }

  // Set media type
  const mediaType = getMediaType(file)
  
  // Validate file size
  if (mediaType) {
    error = validateMediaSize(file, maxSize, mediaType)
    if (error) {
      return Promise.resolve({ error, preview, mediaType, file })
    }
  }

  // Create preview
  preview = URL.createObjectURL(file)

  // Check video duration if needed
  if (mediaType === 'video' && maxDuration) {
    return getVideoDuration(preview)
      .then(duration => {
        const durationError = validateVideoDuration({ duration }, maxDuration)
        
        if (durationError) {
          // Clean up preview if there's an error
          cleanupPreview(preview)
          return { error: durationError, preview: '', mediaType, file }
        }
        return { error, preview, mediaType, file }
      })
      .catch(err => {
        console.error('Error checking video duration:', err)
        cleanupPreview(preview)
        return { 
          error: 'Could not validate video duration', 
          preview: '', 
          mediaType, 
          file 
        }
      })
  }

  return Promise.resolve({ error, preview, mediaType, file })
}

/**
 * Cleans up a preview URL
 * @param preview The preview URL to clean up
 */
export function cleanupPreview(preview: string) {
  if (preview) {
    URL.revokeObjectURL(preview)
  }
} 