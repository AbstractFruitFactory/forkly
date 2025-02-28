import { json } from '@sveltejs/kit'
import { searchRecipesByTitle } from '$lib/server/db/recipe'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('q') || ''
  const limit = parseInt(url.searchParams.get('limit') || '5', 10)
  
  const results = await searchRecipesByTitle(query, limit)
  
  return json({
    results,
    query
  })
} 