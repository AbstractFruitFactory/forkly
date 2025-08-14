import { db } from '.'
import { ingredient } from './schema'
import { eq, ilike } from 'drizzle-orm'
import { generateId } from '$lib/server/id'
import stringSimilarity from 'string-similarity'

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

export async function addIngredient(name: string) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) {
    throw new Error('Ingredient name cannot be empty')
  }

  // Exact match in DB first
  const exact = await db
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)
    .where(eq(ingredient.name, normalized))
    .limit(1)
  if (exact.length) {
    return exact[0]
  }

  // Narrow candidate set using ILIKE, then fuzzy match in app
  const candidates = await db
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)
    .where(ilike(ingredient.name, `%${normalized}%`))
    .limit(50)

  if (candidates.length > 0) {
    const { bestMatch } = stringSimilarity.findBestMatch(normalized, candidates.map(i => i.name))
    if (bestMatch.rating > 0.85) {
      const matched = candidates.find(i => i.name === bestMatch.target)
      if (matched) {
        return matched
      }
    }
  }

  // Create new ingredient
  const newIngredient = await db.insert(ingredient).values({
    id: generateId(),
    name: normalized
  }).returning()
  return newIngredient[0]
} 