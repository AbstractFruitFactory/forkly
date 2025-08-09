/**
 * Media validation utilities that can be used on both client and server
 */

/**
 * Validates media file type
 * @param file The file to validate
 * @param mediaType The expected media type ('image', 'video', or 'both')
 * @returns An error message if invalid, empty string if valid
 */
export function validateMediaType(
  file: { type: string },
  mediaType: 'image' | 'video' | 'both' = 'both'
): string {
  if (mediaType === 'image' && !file.type.startsWith('image/')) {
    return 'Please select an image file'
  }

  if (mediaType === 'video' && !file.type.startsWith('video/')) {
    return 'Please select a video file'
  }

  if (mediaType === 'both' && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return 'Please select an image or video file'
  }

  return ''
}

/**
 * Validates media file size
 * @param file The file to validate
 * @param maxSize Maximum file size in MB
 * @param fileType The type of the file ('image' or 'video')
 * @returns An error message if invalid, empty string if valid
 */
export function validateMediaSize(
  file: { size: number },
  maxSize: number,
  fileType: 'image' | 'video'
): string {
  if (file.size > maxSize * 1024 * 1024) {
    return `${fileType === 'image' ? 'Image' : 'Video'} must be less than ${maxSize}MB`
  }
  return ''
}

/**
 * Determines the media type from file information
 * @param file File object with type property
 * @returns 'image', 'video', or null if not a valid media type
 */
export function getMediaType(file: { type: string }): 'image' | 'video' | undefined {
  if (file.type.startsWith('image/')) {
    return 'image'
  } else if (file.type.startsWith('video/')) {
    return 'video'
  } else {
    return undefined
  }
}

/**
 * Validates video duration (client-side only)
 * @param videoElement Video element with duration information
 * @param maxDuration Maximum duration in seconds
 * @returns An error message if invalid, empty string if valid
 */
export function validateVideoDuration(
  videoElement: { duration: number },
  maxDuration: number
): string {
  if (videoElement.duration > maxDuration) {
    return `Video must be shorter than ${maxDuration} seconds`
  }
  return ''
}

/**
 * Gets a video element's duration (browser environments only)
 * @param videoUrl URL of the video to check
 * @returns Promise resolving to the video duration in seconds
 */
export function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      resolve(video.duration)
    }
    
    video.onerror = () => {
      reject(new Error('Could not load video metadata'))
    }
    
    video.src = videoUrl
  })
} 