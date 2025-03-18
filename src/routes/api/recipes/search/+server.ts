import { json } from '@sveltejs/kit'
import { searchRecipes } from '$lib/server/db/recipe'
import type { DietType } from '$lib/types'

export type RecipesSearchResponse = {
  results: Awaited<ReturnType<typeof searchRecipes>>
  query: string
  filters: {
    diets: DietType[]
    ingredients: string[]
  }
}

export const GET = async ({ url }) => {
  const query = url.searchParams.get('q') || ''
  const limit = parseInt(url.searchParams.get('limit') || '5', 10)

  // Parse diets from query params (comma-separated list)
  const dietsParam = url.searchParams.get('diets') || ''
  const diets = dietsParam ? dietsParam.split(',') as DietType[] : []

  // Parse ingredients from query params (comma-separated list)
  const ingredientsParam = url.searchParams.get('ingredients') || ''
  const ingredients = ingredientsParam ? ingredientsParam.split(',') : []

  const results = await searchRecipes(query, diets, ingredients, limit)

  const response = {
    results,
    query,
    filters: {
      diets,
      ingredients
    }
  } satisfies RecipesSearchResponse

  return json(response)
} 