import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import * as v from 'valibot'
import { ingredientCache } from '$lib/server/redis'
import { apiWithCache } from '$lib/server/utils/api-with-cache'

const searchSchema = v.pipe(
  v.string(),
  v.minLength(2)
)

export const GET: RequestHandler = async ({ params }) => {
  const input = v.parse(searchSchema, params.query)

  const exactMatch = await ingredientCache.get(input)
  if (exactMatch) return json([exactMatch])

  const result = await apiWithCache('findIngredients')(input)

  if (result.isErr()) error(500, result.error)

  const suggestions = result.value

  suggestions.forEach(suggestion => {
    ingredientCache.set(suggestion.name, suggestion)
  })

  return json(suggestions)
}