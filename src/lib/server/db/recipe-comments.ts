import { db } from '.'
import { recipeComment, user } from './schema'
import { eq, and, desc } from 'drizzle-orm'
import { generateId } from '$lib/server/id'

export async function addComment(recipeId: string, userId: string, content: string, imageUrl?: string) {
  const commentId = generateId()
  
  const newComment = await db.insert(recipeComment).values({
    id: commentId,
    userId,
    recipeId,
    content,
    imageUrl
  }).returning()
  
  return newComment[0]
}

export async function getComments(recipeId: string) {
  const comments = await db
    .select({
      id: recipeComment.id,
      content: recipeComment.content,
      imageUrl: recipeComment.imageUrl,
      createdAt: recipeComment.createdAt,
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl
      }
    })
    .from(recipeComment)
    .innerJoin(user, eq(recipeComment.userId, user.id))
    .where(eq(recipeComment.recipeId, recipeId))
    .orderBy(desc(recipeComment.createdAt))
  
  return comments
}

export async function deleteComment(commentId: string, userId: string) {
  const deleted = await db
    .delete(recipeComment)
    .where(
      and(
        eq(recipeComment.id, commentId),
        eq(recipeComment.userId, userId)
      )
    )
    .returning()
  
  return deleted.length > 0
} 