import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import * as v from 'valibot'

const deleteRecipeSchema = v.object({
  id: v.string()
})

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(deleteRecipeSchema, data)

  const recipeToDelete = await db
    .select()
    .from(recipe)
    .where(and(
      eq(recipe.id, input.id),
      eq(recipe.userId, locals.user.id)
    ))
    .limit(1)

  if (!recipeToDelete.length) error(404, { message: 'Recipe not found or you do not have permission to delete it' })

  await db.delete(recipe).where(eq(recipe.id, input.id))
  return json({ success: true })
} 