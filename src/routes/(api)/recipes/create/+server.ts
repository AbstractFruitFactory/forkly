import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { createRecipe } from '$lib/server/db/recipe-create'
import { validateAndTransformRecipe } from '$lib/server/db/recipe-validation'
import { sanitizeIngredientQueue } from '$lib/server/queue'

export const POST: RequestHandler = async ({ request, locals }) => {
  const data = await request.json()
  
  try {
    const transformedInput = validateAndTransformRecipe(data, false)
    const newRecipe = await createRecipe(transformedInput, locals.user?.id)
    
    // Trigger background ingredient sanitization
    try {
      const job = await sanitizeIngredientQueue.add('sanitize', {
        recipeId: newRecipe.id
      })
      console.log(`Queued ingredient sanitization job ${job.id} for recipe ${newRecipe.id}`)
    } catch (sanitizeError) {
      console.error('Failed to queue ingredient sanitization:', sanitizeError)
      // Don't fail the recipe creation if sanitization fails
    }
    
    return json(newRecipe)
  } catch (err) {
    error(400, { message: err instanceof Error ? err.message : 'Validation failed' })
  }
} 