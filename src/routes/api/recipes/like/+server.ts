import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe, recipeLike } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import * as v from 'valibot'

const likeRecipeSchema = v.object({
  id: v.string()
})

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(likeRecipeSchema, data)

  const existingRecipe = await db
    .select()
    .from(recipe)
    .where(eq(recipe.id, input.id))
    .limit(1)

  if (!existingRecipe.length) error(404, { message: 'Recipe not found' })

  // Check if user has already liked the recipe
  const existingLike = await db
    .select()
    .from(recipeLike)
    .where(
      and(eq(recipeLike.recipeId, input.id), eq(recipeLike.userId, locals.user.id))
    )

  if (existingLike.length > 0) {
    // Unlike
    await db.delete(recipeLike).where(
      and(eq(recipeLike.recipeId, input.id), eq(recipeLike.userId, locals.user.id))
    )
    return json({ liked: false })
  } else {
    // Like
    await db.insert(recipeLike).values({
      userId: locals.user.id,
      recipeId: input.id
    })
    return json({ liked: true })
  }
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(likeRecipeSchema, data)

  const existingRecipe = await db
    .select()
    .from(recipe)
    .where(eq(recipe.id, input.id))
    .limit(1)

  if (!existingRecipe.length) error(404, { message: 'Recipe not found' })

  await db.delete(recipeLike).where(
    and(eq(recipeLike.recipeId, input.id), eq(recipeLike.userId, locals.user.id))
  )

  return json({ success: true })
} 