import type { RequestHandler } from '@sveltejs/kit'
import { api } from '$lib/server/food-api'

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { ingredients, instructions, servings } = await request.json()
    const result = await api('getRecipeInfo')(ingredients, instructions, servings)
    if (!result.isOk()) {
      return new Response(JSON.stringify({ error: 'Failed to estimate nutrition' }), { status: 500 })
    }
    const { calories, protein, carbs, fat } = result.value
    const mult = Number.isFinite(Number(servings)) && Number(servings) > 0 ? Number(servings) : 1
    return new Response(
      JSON.stringify({
        calories: calories * mult,
        protein: protein * mult,
        carbs: carbs * mult,
        fat: fat * mult
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 })
  }
} 