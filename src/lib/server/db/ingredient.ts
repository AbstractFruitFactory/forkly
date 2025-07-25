import { db } from '.'
import { ingredient } from './schema'
import { ilike } from 'drizzle-orm'
import { generateId } from '$lib/server/id'
import { normalizeIngredientName } from '$lib/server/utils/normalize-ingredient'
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
  const normalizedInput = normalizeIngredientName(name)
  if (!normalizedInput) {
    throw new Error('Ingredient name cannot be empty')
  }
  const existingIngredients = await db
    .select({ id: ingredient.id, name: ingredient.name })
    .from(ingredient)

  // Step 1: Exact match
  const exact = existingIngredients.find(i => i.name === normalizedInput)
  if (exact) {
    return exact
  }

  // Step 2: Fuzzy match
  if (existingIngredients.length > 0) {
    const { bestMatch } = stringSimilarity.findBestMatch(normalizedInput, existingIngredients.map(i => i.name))
    if (bestMatch.rating > 0.85) {
      const matched = existingIngredients.find(i => i.name === bestMatch.target)
      if (matched) {
        return matched
      }
    }
  }
  // Step 3: Create new ingredient
  const newIngredient = await db.insert(ingredient).values({
    id: generateId(),
    name: normalizedInput
  }).returning()
  return newIngredient[0]
} 