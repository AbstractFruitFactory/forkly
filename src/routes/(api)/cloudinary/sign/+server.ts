import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { v2 as cloudinary } from 'cloudinary'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '$env/static/private'
import { mediaUploadSignLimiter } from '$lib/server/rate-limit'
import { dev } from '$app/environment'

export const GET: RequestHandler = async ({ url, locals, getClientAddress }) => {
  const isAuthed = Boolean(locals.user?.id)
  const identifier = locals.user?.id ?? getClientAddress?.() ?? 'anonymous'

  const { allowed, remaining, resetTime } = await mediaUploadSignLimiter.checkLimit(identifier)
  if (!allowed) return json({ error: 'Too many requests', remaining, resetTime }, { status: 429 })

  const allowedFolders = new Set([
    'recipe-images', 'recipe-videos', 'instruction-media', 'avatars', 'recipe-comments', 'anonymous-media',
    'recipe-images-tmp', 'recipe-videos-tmp', 'instruction-media-tmp'
  ])
  const requestedFolder = url.searchParams.get('folder') || 'recipe-images'
  const requestedType = url.searchParams.get('resource_type')

  const folderBase = isAuthed
    ? (allowedFolders.has(requestedFolder) ? requestedFolder : 'recipe-images')
    : 'anonymous-media'

  const folder = `${folderBase}${dev ? '-dev' : ''}`

  const resourceType = requestedType === 'video' ? 'video' : 'image'

  const timestamp = Math.floor(Date.now() / 1000)

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder
  }

  const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET)

  return json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder,
    resourceType,
    remaining,
    resetTime,
    isAuthed
  })
} 