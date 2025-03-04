import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { deleteRecipe } from '$lib/server/db/recipe'
import * as v from 'valibot'

const deleteRecipeSchema = v.object({
  id: v.string()
})

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(deleteRecipeSchema, data)

  const success = await deleteRecipe(input.id, locals.user.id)
  if (!success) {
    error(404, { message: 'Recipe not found or you do not have permission to delete it' })
  }

  return json({ success: true })
} 