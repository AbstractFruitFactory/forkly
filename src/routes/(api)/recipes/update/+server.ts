import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { updateRecipe } from '$lib/server/db/recipe'
import { validateAndTransformRecipe } from '$lib/server/db/recipe-validation'



export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const data = await request.json()
  
  try {
    const transformedInput = validateAndTransformRecipe(data, true) as any
    const success = await updateRecipe(transformedInput.id, locals.user.id, {
      title: transformedInput.title,
      description: transformedInput.description,
      servings: transformedInput.servings,
      instructions: transformedInput.instructions.map((instruction: any) => ({
        ...instruction,
        ingredients: instruction.ingredients?.map((ingredient: any) => ({
          name: ingredient.name,
          quantity: ingredient.quantity?.text,
          measurement: ingredient.measurement,
          displayName: ingredient.displayName
        }))
      })),
      nutrition: transformedInput.nutrition,
      tags: transformedInput.tags,
      imageUrl: transformedInput.imageUrl
    })

    if (!success) {
      error(404, { message: 'Recipe not found or you do not have permission to update it' })
    }

    return json({ success: true })
  } catch (err) {
    error(400, { message: err instanceof Error ? err.message : 'Validation failed' })
  }
} 