import { db } from '.'
import { recipe } from './schema'
import { eq, ilike, or, and, desc, sql } from 'drizzle-orm'

/**
 * Search for recipes by title
 * @param query The search query
 * @param limit The maximum number of results to return
 * @returns An array of recipes matching the search query
 */
export async function searchRecipesByTitle(query: string, limit: number = 5) {
  if (!query.trim()) {
    return []
  }

  // Create search terms by splitting the query and adding wildcards
  const searchTerms = query.trim().split(/\s+/).map(term => `%${term}%`)

  // Build the search condition
  const searchConditions = searchTerms.map(term => ilike(recipe.title, term))

  try {
    const results = await db
      .select({
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        diets: recipe.diets
      })
      .from(recipe)
      .where(or(...searchConditions))
      .orderBy(desc(recipe.createdAt))
      .limit(limit)

    return results
  } catch (error) {
    console.error('Error searching recipes:', error)
    return []
  }
}

/**
 * Get a recipe by ID
 * @param id The recipe ID
 * @returns The recipe or null if not found
 */
export async function getRecipeById(id: string) {
  try {
    const results = await db
      .select()
      .from(recipe)
      .where(eq(recipe.id, id))
      .limit(1)

    return results[0] || null
  } catch (error) {
    console.error('Error getting recipe by ID:', error)
    return null
  }
} 