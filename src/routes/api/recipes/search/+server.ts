import { json } from '@sveltejs/kit'
import { getRecipes, type DetailedRecipe, type RecipeFilter } from '$lib/server/db/recipe'

export type RecipesSearchResponse = {
  results: DetailedRecipe[]
  query: string
  filters: {
    tags: string[]
    ingredients: string[]
    excludedIngredients: string[]
  }
}

export const GET = async ({ url }) => {
  const query = url.searchParams.get('q') || ''
  const limit = parseInt(url.searchParams.get('limit') || '18', 10)
  const page = parseInt(url.searchParams.get('page') || '0', 10)

  // Parse tags from query params (comma-separated list)
  const tagsParam = url.searchParams.get('tags') || ''
  const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : []

  // Parse ingredients from query params (comma-separated list)
  const ingredientsParam = url.searchParams.get('ingredients') || ''
  const ingredients = ingredientsParam ? ingredientsParam.split(',').filter(Boolean) : []

  // Parse excluded ingredients from query params (comma-separated list)
  const excludedIngredientsParam = url.searchParams.get('excludedIngredients') || ''
  const excludedIngredients = excludedIngredientsParam ? excludedIngredientsParam.split(',').filter(Boolean) : []

  const filters: RecipeFilter = {
    query,
    tags,
    ingredients,
    excludedIngredients,
    limit,
    page,
    detailed: true
  }

  const results = await getRecipes(filters)

  const response = {
    results,
    query,
    filters: {
      tags,
      ingredients,
      excludedIngredients
    }
  } satisfies RecipesSearchResponse

  return json(response)
} 