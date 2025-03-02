import { json } from '@sveltejs/kit'
import { searchRecipes } from '$lib/server/db/recipe'
import type { RequestHandler } from './$types'
import type { DietType } from '$lib/types'

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('q') || ''
  const limit = parseInt(url.searchParams.get('limit') || '5', 10)
  
  // Parse diets from query params (comma-separated list)
  const dietsParam = url.searchParams.get('diets') || ''
  const diets = dietsParam ? dietsParam.split(',') as DietType[] : []
  
  // Parse ingredients from query params (comma-separated list)
  const ingredientsParam = url.searchParams.get('ingredients') || ''
  const ingredients = ingredientsParam ? ingredientsParam.split(',') : []
  
  const results = await searchRecipes(query, diets, ingredients, limit)
  
  return json({
    results,
    query,
    filters: {
      diets,
      ingredients
    }
  })
} 