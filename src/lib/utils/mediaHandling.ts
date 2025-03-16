/**
 * Utility functions for handling media uploads
 */

/**
 * Validates and processes a media file
 * @param file The file to process
 * @param options Configuration options
 * @returns Object containing validation results and preview URL
 */
export function handleMediaFile(
  file: File,
  options: {
    type?: 'image' | 'video' | 'both'
    maxSize?: number
  } = {}
) {
  const { type = 'both', maxSize = type === 'video' ? 50 : 10 } = options
  let error = ''
  let preview = ''
  let mediaType: 'image' | 'video' | null = null

  // Validate file type
  if (type === 'image' && !file.type.startsWith('image/')) {
    error = 'Please select an image file'
    return { error, preview, mediaType, file }
  }

  if (type === 'video' && !file.type.startsWith('video/')) {
    error = 'Please select a video file'
    return { error, preview, mediaType, file }
  }

  if (type === 'both' && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    error = 'Please select an image or video file'
    return { error, preview, mediaType, file }
  }

  // Set media type
  mediaType = file.type.startsWith('image/') ? 'image' : 'video'

  // Validate file size
  if (file.size > maxSize * 1024 * 1024) {
    error = `${mediaType === 'image' ? 'Image' : 'Video'} must be less than ${maxSize}MB`
    return { error, preview, mediaType, file }
  }

  // Create preview
  preview = URL.createObjectURL(file)

  return { error, preview, mediaType, file }
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