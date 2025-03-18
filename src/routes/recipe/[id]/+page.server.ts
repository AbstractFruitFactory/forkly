import { error, fail } from '@sveltejs/kit'
import { getRecipeWithDetails } from '$lib/server/db/recipe'
import type { PageServerLoad, Actions } from './$types'
import { addComment, getComments } from '$lib/server/db/recipe-comments'
import { uploadImage } from '$lib/server/cloudinary'
import * as v from 'valibot'

export const load: PageServerLoad = async ({ params, locals }) => {
  const result = await getRecipeWithDetails(params.id, locals.user?.id)
  if (!result) throw error(404, 'Recipe not found')

  const comments = await getComments(params.id)

  return {
    ...result,
    comments
  }
}

const commentSchema = v.object({
  content: v.pipe(
    v.string(),
    v.minLength(1, 'Comment cannot be empty'),
    v.maxLength(1000, 'Comment is too long (maximum 1000 characters)')
  )
})

export const actions: Actions = {
  addComment: async ({ request, params, locals }) => {
    if (!locals.user) return fail(401, { error: 'You must be logged in to comment' })
    if (!params.id) return fail(400, { error: 'Recipe ID is required' })

    const formData = await request.formData()
    const content = formData.get('content')
    const imageFile = formData.get('image') as File | undefined

    if (!content || typeof content !== 'string') {
      return fail(400, { error: 'Comment content is required' })
    }

    const trimmedContent = content.trim()
    
    const validatedData = v.safeParse(commentSchema, {
      content: trimmedContent
    })

    if (!validatedData.success) return fail(400, { error: validatedData.issues[0].message })

    let imageUrl: string | undefined = undefined

    if (imageFile && imageFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(imageFile.type)) {
        return fail(400, { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' })
      }

      const maxSize = 5 * 1024 * 1024 // 5MB
      if (imageFile.size > maxSize) return fail(400, { error: 'File size exceeds the 5MB limit' })

      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      imageUrl = await uploadImage(buffer, { folder: 'recipe-comments' })
    }

    await addComment(params.id, locals.user.id, trimmedContent, imageUrl)

    return { success: true }
  }
}