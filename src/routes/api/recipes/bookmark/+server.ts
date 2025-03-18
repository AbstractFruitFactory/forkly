import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipeById } from '$lib/server/db/recipe'
import { toggleRecipeBookmark, removeRecipeBookmark } from '$lib/server/db/bookmark'
import * as v from 'valibot'

const bookmarkRecipeSchema = v.object({
  id: v.string()
})

export type RecipesBookmarkResponse = {
  bookmarked: boolean
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(bookmarkRecipeSchema, data)

  const existingRecipe = await getRecipeById(input.id)
  if (!existingRecipe) error(404, { message: 'Recipe not found' })

  const bookmarked = await toggleRecipeBookmark(input.id, locals.user.id)

  const response: RecipesBookmarkResponse = {
    bookmarked
  }

  return json(response)
}

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  const input = v.parse(bookmarkRecipeSchema, data)

  const existingRecipe = await getRecipeById(input.id)
  if (!existingRecipe) error(404, { message: 'Recipe not found' })

  await removeRecipeBookmark(input.id, locals.user.id)
  return json({ success: true })
} 