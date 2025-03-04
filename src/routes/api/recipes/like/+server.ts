import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipeById } from '$lib/server/db/recipe'
import { toggleRecipeLike, removeRecipeLike } from '$lib/server/db/like'
import * as v from 'valibot'

const likeRecipeSchema = v.object({
  id: v.string()
})

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(likeRecipeSchema, data)

  const existingRecipe = await getRecipeById(input.id)
  if (!existingRecipe) error(404, { message: 'Recipe not found' })

  const liked = await toggleRecipeLike(input.id, locals.user.id)
  return json({ liked })
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(likeRecipeSchema, data)

  const existingRecipe = await getRecipeById(input.id)
  if (!existingRecipe) error(404, { message: 'Recipe not found' })

  await removeRecipeLike(input.id, locals.user.id)
  return json({ success: true })
} 