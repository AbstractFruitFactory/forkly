import { db } from '.'
import { tag, recipeTag } from './schema'
import { sql, eq, ilike } from 'drizzle-orm'

/**
 * Search for tags that match a query string
 * @param query The search query
 * @param limit The maximum number of results to return
 * @returns An array of tags with their usage counts
 */
export async function searchTags(query: string, limit: number = 10) {
  const results = await db
    .select({
      name: tag.name,
      count: sql<number>`count(${recipeTag.recipeId})`
    })
    .from(tag)
    .innerJoin(recipeTag, eq(tag.name, recipeTag.tagName))
    .where(ilike(tag.name, `%${query}%`))
    .groupBy(tag.name)
    .orderBy(sql`count(${recipeTag.recipeId}) DESC`, tag.name)
    .limit(limit)
  
  return results.map(row => ({
    name: row.name,
    count: Number(row.count)
  }))
}

/**
 * Get the most popular tags
 * @param limit The maximum number of results to return
 * @returns An array of the most used tags with their usage counts
 */
export async function getPopularTags(limit: number = 10) {
  const results = await db
    .select({
      name: tag.name,
      count: sql<number>`count(${recipeTag.recipeId})`
    })
    .from(tag)
    .innerJoin(recipeTag, eq(tag.name, recipeTag.tagName))
    .groupBy(tag.name)
    .orderBy(sql`count(${recipeTag.recipeId}) DESC`, tag.name)
    .limit(limit)
  
  return results.map(row => ({
    name: row.name,
    count: Number(row.count)
  }))
} 