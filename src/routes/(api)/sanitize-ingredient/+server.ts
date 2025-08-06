import { json } from '@sveltejs/kit'
import type { RequestHandler } from '@sveltejs/kit'
import { sanitizeIngredientQueue } from '$lib/server/queue'
import { db } from '$lib/server/db'
import { ingredient, recipeIngredient } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request, locals }) => {
  // Require authentication
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 })
  }

  let data
  try {
    data = await request.json()
  } catch (e) {
    return json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { recipeId } = data

  if (!recipeId || typeof recipeId !== 'string') {
    return json({ error: 'Recipe ID is required' }, { status: 400 })
  }

  try {
    // Verify the recipe exists and has ingredients
    const recipeIngredients = await db
      .select({
        ingredientId: recipeIngredient.ingredientId,
        ingredientName: ingredient.name
      })
      .from(recipeIngredient)
      .innerJoin(ingredient, eq(recipeIngredient.ingredientId, ingredient.id))
      .where(eq(recipeIngredient.recipeId, recipeId))

    if (recipeIngredients.length === 0) {
      return json({ error: 'No ingredients found for this recipe' }, { status: 404 })
    }

    // Add job to queue
    const job = await sanitizeIngredientQueue.add('sanitize', {
      recipeId
    })

    return json({
      success: true,
      jobId: job.id,
      message: `Started sanitizing ${recipeIngredients.length} ingredients`
    })
  } catch (error) {
    console.error('Error starting ingredient sanitization:', error)
    return json({ error: 'Failed to start ingredient sanitization' }, { status: 500 })
  }
} 