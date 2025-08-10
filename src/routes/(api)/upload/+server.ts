import { json } from '@sveltejs/kit'
import { validateMediaType, getMediaType, validateMediaSize } from '$lib/utils/mediaValidation'
import { validateVideoOnServer } from '$lib/utils/mediaServerValidation'
import fs from 'fs'
import path from 'path'
import os from 'os'
import type { RequestHandler } from './$types'

// Configuration constants
const MAX_VIDEO_SIZE = 25 // MB
const MAX_IMAGE_SIZE = 10 // MB
const MAX_VIDEO_DURATION = 10 // seconds

/**
 * POST handler for media uploads
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Get FormData from request
    const formData = await request.formData()
    const file = formData.get('media') as File
    
    if (!file) {
      return json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Client-side validation again (belt and suspenders approach)
    const mediaType = getMediaType(file)
    if (!mediaType) {
      return json({ success: false, error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size based on media type
    const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    const sizeError = validateMediaSize(file, maxSize, mediaType)
    if (sizeError) {
      return json({ success: false, error: sizeError }, { status: 400 })
    }

    // For video files, we need to save to disk temporarily to check duration
    if (mediaType === 'video') {
      const tempDir = path.join(os.tmpdir(), 'uploads')
      
      // Create temp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      
      // Generate a unique filename using timestamp
      const timestamp = Date.now()
      const tempFilePath = path.join(tempDir, `temp-${timestamp}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
      
      try {
        // Convert File to Buffer and write to temp file
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        fs.writeFileSync(tempFilePath, buffer)
        
        // Validate video on server (duration and other checks)
        const validation = await validateVideoOnServer(
          tempFilePath,
          MAX_VIDEO_DURATION,
          MAX_VIDEO_SIZE
        )
        
        // Remove temp file
        try {
          fs.unlinkSync(tempFilePath)
        } catch (e) {
          console.error('Error removing temp file:', e)
        }
        
        // Return error if validation failed
        if (!validation.valid) {
          return json({ success: false, error: validation.error }, { status: 400 })
        }
      } catch (error) {
        // Clean up temp file in case of error
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath)
          }
        } catch (e) {
          console.error('Error cleaning up temp file:', e)
        }
        
        console.error('Error processing video:', error)
        return json(
          { success: false, error: 'Error processing video file' },
          { status: 500 }
        )
      }
    }
    
    // At this point, file has passed all validations
    // Here you would upload to Cloudinary
    
    // This is a placeholder for the actual Cloudinary upload
    // const cloudinaryResult = await uploadToCloudinary(file, mediaType)
    
    return json({ 
      success: true, 
      message: 'File validated successfully',
      mediaType
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return json(
      { success: false, error: 'Server error processing upload' },
      { status: 500 }
    )
  }
} 