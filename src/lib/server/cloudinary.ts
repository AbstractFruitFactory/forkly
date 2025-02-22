import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '$env/static/private'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
})

type UploadOptions = {
  folder?: 'recipe-images' | 'avatars'
  transformation?: {
    width?: number
    height?: number
    crop?: string
    gravity?: string
  }
}

export const uploadImage = async (
  imageBuffer: Buffer,
  options: UploadOptions = { folder: 'recipe-images' }
): Promise<string> => {
  const defaultOptions = {
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    max_file_size: 5000000 // 5MB
  }

  if (options.folder === 'avatars') {
    options.transformation = {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    }
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        ...defaultOptions,
        ...options
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(imageBuffer)
  })
}

export const deleteImage = async (url: string): Promise<void> => {
  const matches = url.match(/\/v\d+\/(.+?)\.[^.]+$/)
  if (!matches) return

  const publicId = matches[1]
  await cloudinary.uploader.destroy(publicId)
}