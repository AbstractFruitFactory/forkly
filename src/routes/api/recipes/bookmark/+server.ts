import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe, recipeBookmark } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import * as v from 'valibot'

const bookmarkRecipeSchema = v.object({
  id: v.string()
})

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(bookmarkRecipeSchema, data)

  const existingRecipe = await db
    .select()
    .from(recipe)
    .where(eq(recipe.id, input.id))
    .limit(1)

  if (!existingRecipe.length) error(404, { message: 'Recipe not found' })

  // Check if user has already bookmarked the recipe
  const existingBookmark = await db
    .select()
    .from(recipeBookmark)
    .where(
      and(eq(recipeBookmark.recipeId, input.id), eq(recipeBookmark.userId, locals.user.id))
    )

  if (existingBookmark.length > 0) {
    // Remove bookmark
    await db.delete(recipeBookmark).where(
      and(eq(recipeBookmark.recipeId, input.id), eq(recipeBookmark.userId, locals.user.id))
    )
    return json({ bookmarked: false })
  } else {
    // Add bookmark
    await db.insert(recipeBookmark).values({
      userId: locals.user.id,
      recipeId: input.id
    })
    return json({ bookmarked: true })
  }
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(bookmarkRecipeSchema, data)

  const existingRecipe = await db
    .select()
    .from(recipe)
    .where(eq(recipe.id, input.id))
    .limit(1)

  if (!existingRecipe.length) error(404, { message: 'Recipe not found' })

  await db.delete(recipeBookmark).where(
    and(eq(recipeBookmark.recipeId, input.id), eq(recipeBookmark.userId, locals.user.id))
  )

  return json({ success: true })
} 