import { json } from '@sveltejs/kit'
import { getRecipes, type DetailedRecipe, type RecipeFilter } from '$lib/server/db/recipe'

export type RecipesSearchResponse = {
  results: DetailedRecipe[]
  query: string
  filters: {
    tags: string[]
    ingredients: string[]
  }
}

export const GET = async ({ url }) => {
  const query = url.searchParams.get('q') || ''
  const limit = parseInt(url.searchParams.get('limit') || '5', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)

  // Parse tags from query params (comma-separated list)
  const tagsParam = url.searchParams.get('tags') || ''
  const tags = tagsParam ? tagsParam.split(',') : []

  // Parse ingredients from query params (comma-separated list)
  const ingredientsParam = url.searchParams.get('ingredients') || ''
  const ingredients = ingredientsParam ? ingredientsParam.split(',') : []

  const filters: RecipeFilter = {
    query,
    tags,
    ingredients,
    limit,
    offset,
    detailed: true
  }

  const results = await getRecipes(filters)

  const response = {
    results,
    query,
    filters: {
      tags,
      ingredients
    }
  } satisfies RecipesSearchResponse

  return json(response)
} 