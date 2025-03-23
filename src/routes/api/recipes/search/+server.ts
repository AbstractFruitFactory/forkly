import { json } from '@sveltejs/kit'
import { getRecipes, type DetailedRecipe, type RecipeFilter } from '$lib/server/db/recipe'
import type { DietType } from '$lib/types'

export type RecipesSearchResponse = {
  results: DetailedRecipe[]
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

  const filters: RecipeFilter = {
    query,
    diets,
    ingredients,
    limit,
    detailed: true
  }

  const results = await getRecipes(filters)

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