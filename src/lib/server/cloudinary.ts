import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '$env/static/private'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
})

type UploadOptions = {
  folder?: 'recipe-images' | 'recipe-videos' | 'instruction-media' | 'avatars'
  transformation?: {
    width?: number
    height?: number
    crop?: string
    gravity?: string
    quality?: string
    duration?: number
  }
  resource_type?: 'image' | 'video' | 'auto'
}

export const uploadMedia = async (
  mediaBuffer: Buffer,
  options: UploadOptions = { folder: 'recipe-images', resource_type: 'auto' }
): Promise<string> => {
  const defaultOptions = {
    allowed_formats: options.resource_type === 'video' 
      ? ['mp4', 'mov', 'avi', 'webm'] 
      : ['jpg', 'png', 'jpeg', 'webp'],
    max_file_size: options.resource_type === 'video' ? 50000000 : 10000000 // 50MB for videos, 10MB for images
  }

  if (options.folder === 'avatars') {
    options.transformation = {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    }
  } else if (options.folder === 'instruction-media' && options.resource_type === 'video') {
    options.transformation = {
      ...options.transformation,
      quality: 'auto',
      duration: 30 // Limit videos to 30 seconds
    }
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        ...defaultOptions,
        ...options,
        resource_type: options.resource_type || 'auto'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(mediaBuffer)
  })
}

// Keep the old function for backward compatibility
export const uploadImage = async (
  imageBuffer: Buffer,
  options: Omit<UploadOptions, 'resource_type'> = { folder: 'recipe-images' }
): Promise<string> => {
  return uploadMedia(imageBuffer, { ...options, resource_type: 'image' })
}

export const deleteImage = async (url: string): Promise<void> => {
  const matches = url.match(/\/v\d+\/(.+?)\.[^.]+$/)
  if (!matches) return

  const publicId = matches[1]
  await cloudinary.uploader.destroy(publicId)
}