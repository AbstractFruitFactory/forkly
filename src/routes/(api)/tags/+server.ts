import { json } from '@sveltejs/kit'
import { searchTags, getPopularTags } from '$lib/server/db/tags'

export type TagSearchResponse = {
  tags: Array<{
    name: string
    count: number
  }>
  query: string
}

export const GET = async ({ url }) => {
  const query = url.searchParams.get('q') || ''
  const limit = 5

  // If query is empty, get most popular tags
  if (!query.trim()) {
    const popularTags = await getPopularTags(limit)
    return json({
      tags: popularTags,
      query: ''
    } satisfies TagSearchResponse)
  }

  // Search for tags that match the query
  const tagResults = await searchTags(query, limit)

  return json({
    tags: tagResults,
    query
  } satisfies TagSearchResponse)
} 