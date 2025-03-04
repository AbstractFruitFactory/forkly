import { db } from '.'
import { recipeBookmark } from './schema'
import { and, eq } from 'drizzle-orm'

export async function isRecipeBookmarked(recipeId: string, userId: string) {
  const existingBookmark = await db
    .select()
    .from(recipeBookmark)
    .where(
      and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId))
    )

  return existingBookmark.length > 0
}

export async function toggleRecipeBookmark(recipeId: string, userId: string) {
  const existingBookmark = await isRecipeBookmarked(recipeId, userId)

  if (existingBookmark) {
    await db.delete(recipeBookmark).where(
      and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId))
    )
    return false
  } else {
    await db.insert(recipeBookmark).values({
      userId,
      recipeId
    })
    return true
  }
}

export async function removeRecipeBookmark(recipeId: string, userId: string) {
  await db.delete(recipeBookmark).where(
    and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId))
  )
}

export async function getUserBookmarkedRecipeIds(userId: string) {
  const bookmarks = await db
    .select({ recipeId: recipeBookmark.recipeId })
    .from(recipeBookmark)
    .where(eq(recipeBookmark.userId, userId))

  return bookmarks.map(b => b.recipeId)
} 