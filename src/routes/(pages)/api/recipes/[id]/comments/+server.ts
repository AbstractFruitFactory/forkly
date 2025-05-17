import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getComments, addComment } from '$lib/server/db/recipe-comments'
import * as v from 'valibot'

export const GET: RequestHandler = async ({ params }) => {
  const recipeId = params.id
  
  if (!recipeId) {
    throw error(400, 'Recipe ID is required')
  }
  
  try {
    const comments = await getComments(recipeId)
    return json(comments)
  } catch (err) {
    console.error('Error fetching comments:', err)
    throw error(500, 'Failed to fetch comments')
  }
}

const commentSchema = v.object({
  content: v.pipe(
    v.string(),
    v.minLength(1, 'Comment cannot be empty'),
    v.maxLength(1000, 'Comment is too long')
  ),
  imageUrl: v.optional(v.string())
})

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const recipeId = params.id
  
  if (!recipeId) {
    throw error(400, 'Recipe ID is required')
  }
  
  if (!locals.user) {
    throw error(401, 'You must be logged in to comment')
  }
  
  try {
    const body = await request.json()
    const validatedData = v.parse(commentSchema, body)
    
    const newComment = await addComment(
      recipeId, 
      locals.user.id, 
      validatedData.content,
      validatedData.imageUrl
    )
    
    // Fetch the complete comment with user info to return
    const comments = await getComments(recipeId)
    const createdComment = comments.find(comment => comment.id === newComment.id)
    
    if (!createdComment) {
      throw error(500, 'Failed to retrieve created comment')
    }
    
    return json(createdComment)
  } catch (err) {
    if (err instanceof v.ValiError) {
      throw error(400, err.message)
    }
    console.error('Error adding comment:', err)
    throw error(500, 'Failed to add comment')
  }
} 