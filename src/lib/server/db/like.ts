import { db } from '.'
import { recipeLike } from './schema'
import { and, eq } from 'drizzle-orm'

export async function isRecipeLiked(recipeId: string, userId: string) {
  const existingLike = await db
    .select()
    .from(recipeLike)
    .where(
      and(eq(recipeLike.recipeId, recipeId), eq(recipeLike.userId, userId))
    )

  return existingLike.length > 0
}

export async function toggleRecipeLike(recipeId: string, userId: string) {
  const existingLike = await isRecipeLiked(recipeId, userId)

  if (existingLike) {
    await db.delete(recipeLike).where(
      and(eq(recipeLike.recipeId, recipeId), eq(recipeLike.userId, userId))
    )
    return false
  } else {
    await db.insert(recipeLike).values({
      userId,
      recipeId
    })
    return true
  }
}

export async function removeRecipeLike(recipeId: string, userId: string) {
  await db.delete(recipeLike).where(
    and(eq(recipeLike.recipeId, recipeId), eq(recipeLike.userId, userId))
  )
}

export async function getUserLikedRecipeIds(userId: string) {
  const likes = await db
    .select({ recipeId: recipeLike.recipeId })
    .from(recipeLike)
    .where(eq(recipeLike.userId, userId))

  return likes.map(like => like.recipeId)
} 