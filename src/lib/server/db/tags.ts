import { db } from '.'
import { recipeTag, tag } from './schema'
import { sql, ilike, desc, eq } from 'drizzle-orm'

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
      count: sql<number>`count(${recipeTag.recipeId})::int`
    })
    .from(tag)
    .leftJoin(recipeTag, eq(tag.id, recipeTag.tagId))
    .where(ilike(tag.name, `%${query}%`))
    .groupBy(tag.id)
    .orderBy(desc(sql`count(${recipeTag.recipeId})`), tag.name)
    .limit(limit)

  return results.map(row => ({ name: row.name, count: Number(row.count) }))
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
      count: sql<number>`count(${recipeTag.recipeId})::int`
    })
    .from(tag)
    .leftJoin(recipeTag, eq(tag.id, recipeTag.tagId))
    .groupBy(tag.id)
    .orderBy(desc(sql`count(${recipeTag.recipeId})`), tag.name)
    .limit(limit)

  return results.map(row => ({ name: row.name, count: Number(row.count) }))
}
