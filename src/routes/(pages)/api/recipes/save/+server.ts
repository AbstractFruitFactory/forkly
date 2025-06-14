import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipeById } from '$lib/server/db/recipe'
import { toggleRecipeSave } from '$lib/server/db/save'
import * as v from 'valibot'

const saveRecipeSchema = v.object({
  id: v.string(),
  collectionName: v.optional(v.string())
})

export type RecipesSaveResponse = {
  saved: boolean
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(saveRecipeSchema, data)

  const existingRecipe = await getRecipeById(input.id)
  if (!existingRecipe) error(404, { message: 'Recipe not found' })

  const saved = await toggleRecipeSave(input.id, locals.user.id, input.collectionName)

  const response: RecipesSaveResponse = {
    saved
  }

  return json(response)
} 