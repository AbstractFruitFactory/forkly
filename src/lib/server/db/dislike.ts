import { db } from '.'
import { recipeDislike } from './schema'
import { and, eq } from 'drizzle-orm'

export const isRecipeDisliked = async (recipeId: string, userId: string) => {
  const existingDislike = await db
    .select()
    .from(recipeDislike)
    .where(
      and(eq(recipeDislike.recipeId, recipeId), eq(recipeDislike.userId, userId))
    )

  return existingDislike.length > 0
}

export const toggleRecipeDislike = async (recipeId: string, userId: string) => {
  const existingDislike = await isRecipeDisliked(recipeId, userId)

  if (existingDislike) {
    await db.delete(recipeDislike).where(
      and(eq(recipeDislike.recipeId, recipeId), eq(recipeDislike.userId, userId))
    )
    return false
  } else {
    await db.insert(recipeDislike).values({
      userId,
      recipeId
    })
    return true
  }
}

export const removeRecipeDislike = async (recipeId: string, userId: string) => {
  await db.delete(recipeDislike).where(
    and(eq(recipeDislike.recipeId, recipeId), eq(recipeDislike.userId, userId))
  )
} 