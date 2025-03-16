import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { deleteComment } from '$lib/server/db/recipe-comments'

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const { id: recipeId, commentId } = params
  
  if (!recipeId || !commentId) {
    throw error(400, 'Recipe ID and Comment ID are required')
  }
  
  if (!locals.user) {
    throw error(401, 'You must be logged in to delete a comment')
  }
  
  try {
    const success = await deleteComment(commentId, locals.user.id)
    
    if (!success) {
      throw error(404, 'Comment not found or you do not have permission to delete it')
    }
    
    return json({ success: true })
  } catch (err) {
    console.error('Error deleting comment:', err)
    throw error(500, 'Failed to delete comment')
  }
} 