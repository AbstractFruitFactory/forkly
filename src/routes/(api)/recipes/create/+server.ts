import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { createRecipe } from '$lib/server/db/recipe-create'
import { validateAndTransformRecipe } from '$lib/server/db/recipe-validation'

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json()
  
  try {
    const transformedInput = validateAndTransformRecipe(data, false)
    const newRecipe = await createRecipe(transformedInput, locals.user?.id)
    return json(newRecipe)
  } catch (err) {
    error(400, { message: err instanceof Error ? err.message : 'Validation failed' })
  }
} 