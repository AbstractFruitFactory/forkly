import { db } from '.'
import { recipe } from './schema'
import { sql } from 'drizzle-orm'

/**
 * Search for tags that match a query string
 * @param query The search query
 * @param limit The maximum number of results to return
 * @returns An array of tags with their usage counts
 */
export async function searchTags(query: string, limit: number = 10) {
  // We need to unnest the tags array from each recipe, then count occurrences
  // and filter by the search query
  const results = await db.execute<{ name: string, count: number }>(sql`
    WITH tag_counts AS (
      SELECT 
        tag AS name,
        COUNT(*) AS count
      FROM recipe, 
        jsonb_array_elements_text(tags) AS tag
      WHERE tag ILIKE ${`%${query}%`}
      GROUP BY tag
      ORDER BY count DESC, tag ASC
      LIMIT ${limit}
    )
    SELECT * FROM tag_counts
  `)
  
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
  // Get the most frequently used tags
  const results = await db.execute<{ name: string, count: number }>(sql`
    WITH tag_counts AS (
      SELECT 
        tag AS name,
        COUNT(*) AS count
      FROM recipe, 
        jsonb_array_elements_text(tags) AS tag
      GROUP BY tag
      ORDER BY count DESC, tag ASC
      LIMIT ${limit}
    )
    SELECT * FROM tag_counts
  `)
  
  return results.map(row => ({
    name: row.name,
    count: Number(row.count)
  }))
} 