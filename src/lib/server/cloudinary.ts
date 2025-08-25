import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '$env/static/private'
import { v2 as cloudinary } from 'cloudinary'
import { dev } from '$app/environment'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
})

type UploadOptions = {
  folder?: 'recipe-images' | 'recipe-videos' | 'instruction-media' | 'avatars' | 'recipe-comments'
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
    max_file_size: options.resource_type === 'video' ? 25000000 : 10000000 // 25MB for videos, 10MB for images
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
      duration: 10 // Limit videos to 10 seconds
    }
  }

  const effectiveFolder = options.folder ? `${options.folder}${dev ? '-dev' : ''}` : undefined

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        ...defaultOptions,
        ...options,
        resource_type: options.resource_type || 'auto',
        folder: effectiveFolder
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(mediaBuffer)
  })
}

export const uploadImage = async (
  imageBuffer: Buffer,
  options: Omit<UploadOptions, 'resource_type'> = { folder: 'recipe-images' }
): Promise<string> => uploadMedia(imageBuffer, { ...options, resource_type: 'image' })

export const deleteImage = async (url: string): Promise<void> => {
  const matches = url.match(/\/v\d+\/(.+?)\.[^.]+$/)
  if (!matches) return

  const publicId = matches[1]
  await cloudinary.uploader.destroy(publicId)
}

export const deleteVideo = async (url: string): Promise<void> => {
  const matches = url.match(/\/v\d+\/(.+?)\.[^.]+$/)
  if (!matches) return

  const publicId = matches[1]
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
}

function extractPublicIdFromUrl(url: string): string | null {
  const m = url.match(/\/v\d+\/(.+?)\.[^.]+$/)
  return m ? m[1] : null
}

export async function moveToFolder(
  url: string,
  targetFolder: 'recipe-images' | 'recipe-videos' | 'instruction-media',
  resourceType: 'image' | 'video'
): Promise<string> {
  const currentPublicId = extractPublicIdFromUrl(url)
  if (!currentPublicId) return url
  const parts = currentPublicId.split('/')
  const restPath = parts.length > 1 ? parts.slice(1).join('/') : parts[0]
  const targetFolderWithEnv = `${targetFolder}${dev ? '-dev' : ''}`
  const newPublicId = `${targetFolderWithEnv}/${restPath}`
  try {
    const res = await cloudinary.uploader.rename(currentPublicId, newPublicId, {
      resource_type: resourceType,
      type: 'upload',
      overwrite: true,
      invalidate: true
    } as any)
    try {
      await cloudinary.api.update(newPublicId, { asset_folder: targetFolderWithEnv, resource_type: resourceType } as any)
    } catch { }
    return res.secure_url
  } catch {
    return url
  }
}

export const cleanupUploadedMediaFromObject = async (imageUrl?: string, instructions?: { mediaUrl?: string, mediaType?: 'video' | 'image' }[]) => {
  if (imageUrl) {
    try { await deleteImage(imageUrl) } catch { }
  }
  if (instructions) {
    for (const ins of instructions) {
      if (ins.mediaUrl) {
        if (ins.mediaType === 'video') { try { await deleteVideo(ins.mediaUrl) } catch { } }
        else { try { await deleteImage(ins.mediaUrl) } catch { } }
      }
    }
  }
}

export const moveMediaFromTmpFolder = async (
  imageUrl?: string,
  instructions?: { mediaUrl?: string; mediaType?: 'video' | 'image' }[]
): Promise<{ imageUrl?: string; instructions?: { mediaUrl?: string; mediaType?: 'video' | 'image' }[] }> => {
  let updatedImageUrl = imageUrl
  if (updatedImageUrl && updatedImageUrl.includes('-tmp')) {
    updatedImageUrl = await moveToFolder(updatedImageUrl, 'recipe-images', 'image')
  }
  const updatedInstructions = instructions ? [...instructions] : undefined
  if (updatedInstructions) {
    for (const ins of updatedInstructions) {
      if (ins.mediaUrl && ins.mediaUrl.includes('-tmp')) {
        ins.mediaUrl = await moveToFolder(
          ins.mediaUrl,
          'instruction-media',
          ins.mediaType === 'video' ? 'video' : 'image'
        )
      }
    }
  }
  return { imageUrl: updatedImageUrl, instructions: updatedInstructions }
}