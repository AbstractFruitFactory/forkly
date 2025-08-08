import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { uploadImage, deleteImage } from '$lib/server/cloudinary'
import { updateUserProfile } from '$lib/server/db/user'

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized')

  const formData = await request.formData()
  const file = formData.get('avatar') as File | null

  if (!file || typeof file === 'string' || file.size === 0) {
    throw error(400, 'No file uploaded')
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw error(400, 'Invalid file type')
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) throw error(400, 'File size exceeds 5MB')

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (locals.user.avatarUrl) {
    await deleteImage(locals.user.avatarUrl)
  }

  const avatarUrl = await uploadImage(buffer, { folder: 'avatars' })
  await updateUserProfile(locals.user.id, { avatarUrl })

  return json({ avatarUrl })
}
