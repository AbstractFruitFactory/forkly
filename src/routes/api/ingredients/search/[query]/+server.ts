import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import * as v from 'valibot'
import { searchIngredients } from '$lib/server/db/ingredient'

const searchSchema = v.pipe(
  v.string(),
  v.minLength(2)
)

export const GET: RequestHandler = async ({ params }) => {
  const input = v.parse(searchSchema, params.query)

  const suggestions = await searchIngredients(input, 5)
  return json(suggestions)
}