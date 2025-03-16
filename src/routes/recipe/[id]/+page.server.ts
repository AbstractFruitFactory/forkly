import { error, fail } from '@sveltejs/kit'
import { getRecipeWithDetails } from '$lib/server/db/recipe'
import type { PageServerLoad, Actions } from './$types'
import { addComment, getComments } from '$lib/server/db/recipe-comments'
import { uploadImage } from '$lib/server/cloudinary'

export const load: PageServerLoad = async ({ params, locals, depends }) => {
  const recipeId = params.id
  const userId = locals.user?.id

  const result = await getRecipeWithDetails(recipeId, userId)
  if (!result) throw error(404, 'Recipe not found')

  // Get comments for this recipe
  const comments = await getComments(params.id)

  return {
    ...result,
    comments
  }
}

export const actions: Actions = {
  addComment: async ({ request, params, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'You must be logged in to comment' })
    }

    const recipeId = params.id
    if (!recipeId) {
      return fail(400, { error: 'Recipe ID is required' })
    }

    const formData = await request.formData()
    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null

    // Validate content
    if (!content.trim() && (!imageFile || imageFile.size === 0)) {
      return fail(400, { error: 'Comment cannot be empty' })
    }

    try {
      let imageUrl: string | undefined = undefined

      // Upload image if one is selected
      if (imageFile && imageFile.size > 0) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(imageFile.type)) {
          return fail(400, { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' })
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (imageFile.size > maxSize) {
          return fail(400, { error: 'File size exceeds the 5MB limit' })
        }

        // Upload to Cloudinary
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        imageUrl = await uploadImage(buffer, { folder: 'recipe-comments' })
      }

      // Add comment to database
      await addComment(recipeId, locals.user.id, content.trim(), imageUrl)

      return { success: true }
    } catch (err) {
      console.error('Error adding comment:', err)
      return fail(500, { error: 'Failed to add comment' })
    }
  }
}