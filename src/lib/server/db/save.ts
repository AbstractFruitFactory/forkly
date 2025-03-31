import { db } from '.'
import { recipeBookmark } from './schema'
import { eq, and } from 'drizzle-orm'

/**
 * Check if a recipe is saved by a user
 */
export async function isRecipeSaved(recipeId: string, userId: string) {
  const bookmarks = await db
    .select()
    .from(recipeBookmark)
    .where(
      and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId))
    )
  return bookmarks.length > 0
}

/**
 * Toggle the saved status of a recipe for a user
 */
export async function toggleRecipeSave(recipeId: string, userId: string) {
  const existingSave = await isRecipeSaved(recipeId, userId)

  if (existingSave) {
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

/**
 * Remove a save from a recipe for a user
 */
export async function removeRecipeSave(recipeId: string, userId: string) {
  await db.delete(recipeBookmark).where(
    and(eq(recipeBookmark.recipeId, recipeId), eq(recipeBookmark.userId, userId))
  )
}

/**
 * Get all recipes saved by a user
 */
export async function getSavedRecipesByUser(userId: string) {
  const bookmarks = await db
    .select({
      recipeId: recipeBookmark.recipeId
    })
    .from(recipeBookmark)
    .where(eq(recipeBookmark.userId, userId))

  return bookmarks.map(bookmark => bookmark.recipeId)
} 