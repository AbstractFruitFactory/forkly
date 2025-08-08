import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { searchTags, getPopularTags } from '$lib/server/db/tags'

export type TagSearchResponse = {
  tags: Array<{
    name: string
    count: number
  }>
  query: string
}

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('q') || ''
  const limit = 5

  if (!query.trim()) {
    const popularTags = await getPopularTags(limit)
    return json({
      tags: popularTags,
      query: ''
    } satisfies TagSearchResponse)
  }

  const tagResults = await searchTags(query, limit)

  return json({
    tags: tagResults,
    query
  } satisfies TagSearchResponse)
} 