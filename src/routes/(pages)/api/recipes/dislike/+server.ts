import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipeById } from '$lib/server/db/recipe'
import { toggleRecipeDislike, removeRecipeDislike } from '$lib/server/db/dislike'
import * as v from 'valibot'

const dislikeRecipeSchema = v.object({
  id: v.string()
})

export type RecipesDislikeResponse = {
  disliked: boolean
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(dislikeRecipeSchema, data)

  const existingRecipe = await getRecipeById(input.id)
  if (!existingRecipe) error(404, { message: 'Recipe not found' })

  const disliked = await toggleRecipeDislike(input.id, locals.user.id)

  const response: RecipesDislikeResponse = {
    disliked
  }

  return json(response)
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(dislikeRecipeSchema, data)

  const existingRecipe = await getRecipeById(input.id)
  if (!existingRecipe) error(404, { message: 'Recipe not found' })

  await removeRecipeDislike(input.id, locals.user.id)
  return json({ success: true })
} 