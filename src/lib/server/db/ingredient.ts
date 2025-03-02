import { db } from '.'
import { ingredient } from './schema'
import { ilike } from 'drizzle-orm'

/**
 * Get all ingredients for autocomplete
 * @returns An array of ingredient names
 */
export async function getAllIngredients() {
  const results = await db
    .select({
      id: ingredient.id,
      name: ingredient.name
    })
    .from(ingredient)
    .orderBy(ingredient.name)

  return results
}

/**
 * Search ingredients by name for autocomplete
 * @param query The search query
 * @param limit The maximum number of results to return
 * @returns An array of ingredients matching the search query
 */
export async function searchIngredients(query: string, limit: number = 10) {
  if (!query.trim()) {
    return []
  }

  const results = await db
    .select({
      id: ingredient.id,
      name: ingredient.name
    })
    .from(ingredient)
    .where(ilike(ingredient.name, `%${query}%`))
    .orderBy(ingredient.name)
    .limit(limit)

  return results
} 