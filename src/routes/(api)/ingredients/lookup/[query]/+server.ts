import { json } from '@sveltejs/kit'
import { searchIngredients } from '$lib/server/db/ingredient'
import type { RequestHandler } from './$types'

export type IngredientLookupResult = {
  id: string
  name: string
}[]

export const GET: RequestHandler = async ({ url, params }) => {
  const query = params.query
  const limit = parseInt(url.searchParams.get('limit') || '5', 10)

  const results = await searchIngredients(query, limit)

  return json(results) 
}