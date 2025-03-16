import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { uploadImage } from '$lib/server/cloudinary'

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'You must be logged in to upload images')
  }
  
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      throw error(400, 'No image file provided')
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw error(400, 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed')
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw error(400, 'File size exceeds the 5MB limit')
    }
    
    // Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const imageUrl = await uploadImage(buffer, { folder: 'recipe-comments' })
    console.log('Image uploaded to Cloudinary:', imageUrl)
    
    return json({ imageUrl })
  } catch (err) {
    console.error('Error uploading image:', err)
    if (err instanceof Error) {
      throw error(500, err.message)
    }
    throw error(500, 'Failed to upload image')
  }
} 