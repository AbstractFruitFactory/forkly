import { db } from '.'
import { ingredient } from './schema'
import { eq, ilike } from 'drizzle-orm'
import { generateId } from '$lib/server/id'
import stringSimilarity from 'string-similarity'
import { normalizeIngredientName } from '$lib/server/utils/normalize-ingredient'

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
  const normalized = normalizeIngredientName(name)
  const cleaned = normalized.trim().toLowerCase()
  if (!cleaned) {
    throw new Error('Ingredient name cannot be empty')
  }

  // 1) Exact normalized match
  const exact = await db
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)
    .where(eq(ingredient.name, cleaned))
    .limit(1)
  if (exact.length) return exact[0]

  // 2) Fuzzy match on normalized candidates (fallback to broad prefix when no token overlap)
  const prefix = cleaned.slice(0, Math.max(2, Math.min(4, cleaned.length)))
  const likeQuery = `%${prefix}%`
  const candidates = await db
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)
    .where(ilike(ingredient.name, likeQuery))
    .limit(100)

  if (candidates.length > 0) {
    const candidateNames = candidates.map((i) => i.name)
    const { bestMatch } = stringSimilarity.findBestMatch(cleaned, candidateNames)
    if (bestMatch.rating > 0.85) {
      const matched = candidates.find((i) => i.name === bestMatch.target)
      if (matched) return matched
    }
  }

  // 3) Insert normalized
  const newIngredient = await db
    .insert(ingredient)
    .values({ id: generateId(), name: cleaned })
    .returning()
  return newIngredient[0]
}