import { error, fail } from '@sveltejs/kit'
import { getRecipeWithDetails } from '$lib/server/db/recipe'
import type { PageServerLoad, Actions } from './$types'
import { uploadImage } from '$lib/server/cloudinary'
import * as v from 'valibot'
import { getCollections } from '$lib/server/db/save'
import { safeFetch } from '$lib/utils/fetch'
import type { CommentsResponse } from '../../../api/recipes/[id]/comments/+server'

export const load: PageServerLoad = ({ params, locals, fetch }) => {
  const recipe = getRecipeWithDetails(params.id, locals.user?.id).then(r => {
    return r as NonNullable<typeof r>
  })

  const comments = safeFetch<CommentsResponse>(fetch)(`/api/recipes/${params.id}/comments?page=0`).then((result) => {
    if (result.isErr()) {
      console.error('Failed to fetch comments:', result.error)
      return { comments: [], total: 0 }
    }
    return result.value
  })

  const collections = locals.user
    ? getCollections(locals.user.id)
    : Promise.resolve([])

  return {
    recipe,
    comments,
    collections
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
  addComment: async ({ request, params, locals, fetch }) => {
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

    const result = await safeFetch<{ id: string; content: string; imageUrl?: string }>(fetch)(
      `/api/recipes/${params.id}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: trimmedContent,
          imageUrl
        })
      }
    )

    if (result.isErr()) {
      return fail(500, { error: result.error.message || 'Failed to add comment' })
    }

    return { success: true }
  }
}