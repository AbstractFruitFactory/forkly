import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execPromise = promisify(exec)

/**
 * Server-side media validation utilities
 */

/**
 * Gets video duration using ffprobe (requires ffmpeg to be installed on server)
 * @param filePath Path to the video file
 * @returns Promise resolving to the video duration in seconds
 */
export async function getServerVideoDuration(filePath: string): Promise<number> {
  try {
    // ffprobe command to get video duration
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    )
    
    // Parse the duration as a float
    const duration = parseFloat(stdout.trim())
    
    if (isNaN(duration)) {
      throw new Error('Could not determine video duration')
    }
    
    return duration
  } catch (error) {
    console.error('Error getting video duration:', error)
    throw new Error('Failed to analyze video duration')
  }
}

/**
 * Validates a video file on the server
 * @param filePath Path to the video file
 * @param maxDuration Maximum duration in seconds
 * @param maxSize Maximum file size in MB
 * @returns Promise resolving to validation results
 */
export async function validateVideoOnServer(
  filePath: string, 
  maxDuration: number,
  maxSize: number
): Promise<{ valid: boolean; error: string }> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: 'File not found' }
    }
    
    // Check file size
    const stats = fs.statSync(filePath)
    if (stats.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `Video must be less than ${maxSize}MB` }
    }
    
    // Check video duration
    const duration = await getServerVideoDuration(filePath)
    if (duration > maxDuration) {
      return { valid: false, error: `Video must be shorter than ${maxDuration} seconds` }
    }
    
    return { valid: true, error: '' }
  } catch (error) {
    console.error('Video validation error:', error)
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    }
  }
} 